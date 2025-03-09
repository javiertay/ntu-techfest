"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, ArrowLeft } from "lucide-react"

// Sound management utility
const SoundManager = {
  // Track if sounds are available/enabled
  soundsEnabled: false,

  // Initialize sound system
  init: function () {
    // Check if we're in a browser environment with Audio support
    if (typeof window !== "undefined" && typeof Audio !== "undefined") {
      this.soundsEnabled = true

      // Try to preload sounds but don't fail if they don't exist
      this.preloadSounds()
    }
  },

  // Preload common sounds
  preloadSounds: function () {
    const soundUrls = ["/sounds/click.mp3", "/sounds/leaderboard.mp3"]

    soundUrls.forEach((url) => {
      try {
        const audio = new Audio()
        audio.preload = "auto"

        // Add event listeners before setting src to catch load errors
        audio.addEventListener("error", () => {
          console.log(`Optional sound ${url} not available`)
          // If any sound fails, we'll disable sounds to avoid console spam
          this.soundsEnabled = false
        })

        audio.src = url
      } catch (err) {
        // Silently fail - sounds are optional
        this.soundsEnabled = false
      }
    })
  },

  // Play a sound with graceful fallback
  play: function (src, volume = 0.3) {
    if (!this.soundsEnabled) return

    try {
      const audio = new Audio(src)
      audio.volume = volume

      // Handle errors without throwing exceptions
      audio.addEventListener("error", () => {
        console.log(`Optional sound ${src} not available`)
      })

      // Only try to play if the audio loaded
      audio.addEventListener("canplaythrough", () => {
        const playPromise = audio.play()

        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently fail - browser may have blocked autoplay
          })
        }
      })
    } catch (err) {
      // Silently fail - sounds are optional
    }
  },
}

type ScoreEntry = {
  score: number
  date: string
  timeSpent: number
  questionsAnswered: number
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([])

  useEffect(() => {
    // Initialize sound system
    SoundManager.init()

    // Play leaderboard sound
    SoundManager.play("/sounds/leaderboard.mp3")

    // Load scores from local storage
    const storedScores = JSON.parse(localStorage.getItem("quizScores") || "[]")

    // Sort by score (highest first)
    const sortedScores = storedScores.sort((a: ScoreEntry, b: ScoreEntry) => b.score - a.score)

    setScores(sortedScores)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center p-4 relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines z-10 opacity-10"></div>

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[150px] opacity-20"></div>

      <div className="z-20 max-w-4xl w-full pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 transition-colors"
            onClick={() => SoundManager.play("/sounds/click.mp3")}
          >
            <ArrowLeft className="w-5 h-5" /> BACK TO HOME
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 pixel-font">
            LEADERBOARD
          </h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <div className="border-2 border-indigo-500 rounded-lg bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] overflow-hidden">
          {scores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-indigo-900/70 text-left">
                    <th className="p-4 text-cyan-300 font-bold">RANK</th>
                    <th className="p-4 text-cyan-300 font-bold">SCORE</th>
                    <th className="p-4 text-cyan-300 font-bold">TIME</th>
                    <th className="p-4 text-cyan-300 font-bold">QUESTIONS</th>
                    <th className="p-4 text-cyan-300 font-bold">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((entry, index) => (
                    <tr
                      key={index}
                      className={`border-t border-indigo-800/50 ${
                        index < 3 ? "bg-indigo-900/30" : "hover:bg-indigo-900/20"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Medal className="w-5 h-5 text-yellow-400" />}
                          {index === 1 && <Medal className="w-5 h-5 text-gray-300" />}
                          {index === 2 && <Medal className="w-5 h-5 text-amber-700" />}
                          <span
                            className={`font-bold ${
                              index === 0
                                ? "text-yellow-400"
                                : index === 1
                                  ? "text-gray-300"
                                  : index === 2
                                    ? "text-amber-700"
                                    : "text-white"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-white">{entry.score}</td>
                      <td className="p-4 text-gray-300">{formatTime(entry.timeSpent)}</td>
                      <td className="p-4 text-gray-300">{entry.questionsAnswered}/10</td>
                      <td className="p-4 text-gray-300">{formatDate(entry.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-300 mb-4">
                No scores recorded yet. Take the quiz to be the first on the leaderboard!
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow-[0_0_10px_rgba(219,39,119,0.5)] transition-all hover:shadow-[0_0_15px_rgba(219,39,119,0.7)]"
                onClick={() => SoundManager.play("/sounds/click.mp3")}
              >
                <Trophy className="w-5 h-5" /> START QUIZ
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => {
              SoundManager.play("/sounds/click.mp3")
              localStorage.removeItem("quizScores")
              setScores([])
            }}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.7)]"
          >
            RESET LEADERBOARD
          </Button>
        </div>
      </div>
    </div>
  )
}

