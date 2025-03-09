"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { questions } from "@/lib/questions"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, Heart } from "lucide-react"

const SoundManager = {
  soundsEnabled: false,
  init: function () {
    if (typeof window !== "undefined" && typeof Audio !== "undefined") {
      this.soundsEnabled = true
      this.preloadSounds()
    }
  },
  preloadSounds: function () {
    const soundUrls = ["/sounds/click.mp3", "/sounds/correct.mp3", "/sounds/wrong.mp3", "/sounds/success.mp3"]
    soundUrls.forEach((url) => {
      try {
        const audio = new Audio()
        audio.preload = "auto"
        audio.addEventListener("error", () => {
          console.log(`Optional sound ${url} not available`)
          this.soundsEnabled = false
        })
        audio.src = url
      } catch (err) {
        this.soundsEnabled = false
      }
    })
  },
  play: function (src: string, volume = 0.3) {
    if (!this.soundsEnabled) return
    try {
      const audio = new Audio(src)
      audio.volume = volume
      audio.addEventListener("error", () => {
        console.log(`Optional sound ${src} not available`)
      })
      audio.addEventListener("canplaythrough", () => {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay might be blocked
          })
        }
      })
    } catch (err) {
      // Fail silently
    }
  },
}

export default function QuizPage() {
  const router = useRouter()
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameOver, setGameOver] = useState(false)

  // Refs to hold timer IDs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const hasEndedRef = useRef(false)
  const startTimeRef = useRef(Date.now())

  // Initialize quiz and sound system
  useEffect(() => {
    startTimeRef.current = Date.now()
    SoundManager.init()
    const shuffled = [...questions].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 10)
    const preparedQuestions = selected.map((q) => {
      const options = [...q.options].sort(() => 0.5 - Math.random())
      return { ...q, options }
    })
    setQuizQuestions(preparedQuestions)
  }, [])

  // Timer countdown effect
  useEffect(() => {
    if (gameOver || isAnswerCorrect !== null) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentQuestionIndex, isAnswerCorrect, gameOver])

  const clearQuestionTimeout = () => {
    if (questionTimeoutRef.current) {
      clearTimeout(questionTimeoutRef.current)
      questionTimeoutRef.current = null
    }
  }

  const handleTimeout = () => {
    if (isAnswerCorrect !== null) return

    // Clear the interval to prevent further ticks
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    SoundManager.play("/sounds/wrong.mp3")
    setIsAnswerCorrect(false)
    setLives((prevLives) => {
      const newLives = prevLives - 1
      if (newLives <= 0) {
        endGame()
      } else {
        // Schedule next question only if lives remain
        questionTimeoutRef.current = setTimeout(() => {
          nextQuestion()
          clearQuestionTimeout()
        }, 2000)
      }
      return newLives
    })
  }

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerCorrect !== null) return

    // Clear the countdown timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setSelectedAnswer(answer)
    const currentQuestion = quizQuestions[currentQuestionIndex]
    const correct = answer === currentQuestion.correctAnswer
    setIsAnswerCorrect(correct)

    if (correct) {
      SoundManager.play("/sounds/correct.mp3")
      setScore((prev) => prev + calculatePoints())
      // Schedule next question after 2 seconds
      questionTimeoutRef.current = setTimeout(() => {
        nextQuestion()
        clearQuestionTimeout()
      }, 2000)
    } else {
      SoundManager.play("/sounds/wrong.mp3")
      setLives((prevLives) => {
        const newLives = prevLives - 1
        if (newLives <= 0) {
          endGame()
        } else {
          // Schedule next question after 2 seconds if lives remain
          questionTimeoutRef.current = setTimeout(() => {
            nextQuestion()
            clearQuestionTimeout()
          }, 2000)
        }
        return newLives
      })
    }
  }

  const calculatePoints = () => {
    return Math.max(10, Math.floor(30 - (30 - timeLeft) * 0.5))
  }

  const nextQuestion = () => {
    if (gameOver) return

    // Avoid calling nextQuestion if we're at the end or out of lives
    if (currentQuestionIndex >= quizQuestions.length - 1 || lives <= 0) {
      endGame()
      return
    }

    setCurrentQuestionIndex((prev) => prev + 1)
    setSelectedAnswer(null)
    setIsAnswerCorrect(null)
    setTimeLeft(30)
  }

  const endGame = () => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true

    // Clear any pending timeouts/intervals
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    clearQuestionTimeout()

    setGameOver(true)

    const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000)

    const existingScores = JSON.parse(localStorage.getItem("quizScores") || "[]")
    const newScore = {
      score,
      date: new Date().toISOString(),
      timeSpent: elapsedTime,
      questionsAnswered: currentQuestionIndex + 1,
    }
    localStorage.setItem("quizScores", JSON.stringify([...existingScores, newScore]))
    setTimeout(() => {
      router.push(`/results?score=${score}&time=${elapsedTime}&questions=${currentQuestionIndex + 1}`)
    }, 2000)
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-4xl text-cyan-300 font-bold pixel-font animate-pulse">LOADING...</div>
      </div>
    )
  }

  const currentQuestion = quizQuestions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines z-10 opacity-10"></div>
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[150px] opacity-20"></div>
      <div className="w-full max-w-3xl z-20">
        {/* Header with score and lives */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
            <div className="text-pink-500 font-bold">SCORE</div>
            <div className="text-2xl text-white font-bold">{score}</div>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} className={`w-8 h-8 ${i < lives ? "text-red-500 fill-red-500" : "text-gray-700"}`} />
            ))}
          </div>
          <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center gap-2">
            <Clock className="text-cyan-500" />
            <div className="text-2xl text-white font-bold">{timeLeft}</div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={(currentQuestionIndex / quizQuestions.length) * 100} className="h-2 bg-gray-800">
            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
          </Progress>
          <div className="text-right text-gray-300 text-sm mt-1">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </div>
        </div>
        {/* Category badge */}
        <Badge className="mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none">
          {currentQuestion.category}
        </Badge>
        {/* Question */}
        <div className="bg-black/50 backdrop-blur-sm p-6 rounded-lg border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] mb-6">
          <h2 className="text-2xl text-white font-bold mb-4">{currentQuestion.question}</h2>
          {currentQuestion.imageUrl && (
            <div className="mb-4 border-2 border-gray-700 rounded-lg overflow-hidden">
              <img
                src={currentQuestion.imageUrl || "/placeholder.svg"}
                alt="Question visual"
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
        {/* Answer options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option: string, index: number) => (
            <Button
              key={index}
              className={`w-full h-auto p-4 text-left justify-start border-2 ${
                selectedAnswer === option
                  ? isAnswerCorrect
                    ? "bg-green-600 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                    : "bg-red-600 border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.5)]"
                  : "bg-gray-900 hover:bg-gray-800 border-gray-700 hover:border-indigo-500"
              }`}
              onClick={() => handleAnswerSelect(option)}
              disabled={isAnswerCorrect !== null}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="bg-indigo-900 text-indigo-300 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold">
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm sm:text-base whitespace-normal break-words">{option}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
        {/* Feedback message */}
        {isAnswerCorrect !== null && (
          <div
            className={`mt-6 p-4 rounded-lg text-center text-white font-bold ${
              isAnswerCorrect ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {isAnswerCorrect
              ? `Correct! +${calculatePoints()} points`
              : `Wrong! The correct answer is: ${currentQuestion.correctAnswer}`}
          </div>
        )}
      </div>
    </div>
  )
}
