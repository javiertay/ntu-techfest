"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, Clock, Award, BarChart3, Home, RotateCcw } from "lucide-react"
import confetti from "canvas-confetti"

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
    const soundUrls = ["/sounds/click.mp3", "/sounds/success.mp3"]

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
  play: function (src: string, volume = 0.3) {
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

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const score = Number.parseInt(searchParams.get("score") || "0")
  const time = Number.parseInt(searchParams.get("time") || "0")
  const questions = Number.parseInt(searchParams.get("questions") || "0")

  const [badges, setBadges] = useState<string[]>([])
  const [rank, setRank] = useState("")

  useEffect(() => {
    // Initialize sound system
    SoundManager.init()

    // Play success sound
    SoundManager.play("/sounds/success.mp3")

    // Trigger confetti for high scores
    if (score > 70) {
      const duration = 3 * 1000
      const end = Date.now() + duration
      ;(function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#9c5de4", "#f15bb5", "#00bbf9"],
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#9c5de4", "#f15bb5", "#00bbf9"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    }

    // Determine badges
    const earnedBadges = []

    if (score >= 90) earnedBadges.push("Truth Master")
    else if (score >= 70) earnedBadges.push("Fact Finder")
    else if (score >= 50) earnedBadges.push("Truth Seeker")

    if (time < 120 && questions >= 8) earnedBadges.push("Speed Demon")
    if (questions === 10) earnedBadges.push("Completionist")

    setBadges(earnedBadges)

    // Determine rank
    if (score >= 90) setRank("S")
    else if (score >= 80) setRank("A")
    else if (score >= 70) setRank("B")
    else if (score >= 50) setRank("C")
    else setRank("D")
  }, [score, time, questions])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines z-10 opacity-10"></div>

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[150px] opacity-20"></div>
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[150px] opacity-20"></div>

      <div className="text-center z-20 max-w-3xl w-full">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-6 pixel-font">
          MISSION COMPLETE
        </h1>

        <div className="border-2 border-pink-500 p-6 rounded-lg bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(236,72,153,0.5)] mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-full border-4 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center justify-center">
              <div className="text-7xl font-bold text-white pixel-font">{rank}</div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-pink-500">
                <Trophy className="w-6 h-6 text-pink-500" />
                <div className="flex-1">
                  <div className="text-gray-300 text-sm">Final Score</div>
                  <div className="text-2xl font-bold text-white">{score}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-cyan-500">
                <Clock className="w-6 h-6 text-cyan-500" />
                <div className="flex-1">
                  <div className="text-gray-300 text-sm">Time Spent</div>
                  <div className="text-2xl font-bold text-white">{formatTime(time)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-purple-500">
                <BarChart3 className="w-6 h-6 text-purple-500" />
                <div className="flex-1">
                  <div className="text-gray-300 text-sm">Questions Answered</div>
                  <div className="text-2xl font-bold text-white">{questions}/10</div>
                </div>
              </div>
            </div>
          </div>

          {badges.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl text-cyan-300 font-bold mb-3 pixel-font">BADGES EARNED</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <Award className="w-5 h-5 text-yellow-300" />
                    <span className="text-white font-bold">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-gray-200 mb-6">
            <h2 className="text-xl text-cyan-300 font-bold mb-3 pixel-font">MISSION DEBRIEF</h2>
            <p>
              {score >= 80
                ? "Excellent work, agent! Your digital literacy skills are top-notch. You've proven yourself to be a formidable defender against misinformation."
                : score >= 50
                  ? "Good job, agent! You've shown solid skills in detecting misinformation, but there's still room for improvement."
                  : "Mission completed, agent. Your training has just begun. With more practice, you'll become better at identifying misinformation."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => {
              SoundManager.play("/sounds/click.mp3")
              router.push("/quiz")
            }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> TRY AGAIN
          </Button>

          <Button
            onClick={() => {
              SoundManager.play("/sounds/click.mp3")
              router.push("/leaderboard")
            }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" /> LEADERBOARD
          </Button>

          <Button
            onClick={() => {
              SoundManager.play("/sounds/click.mp3")
              router.push("/")
            }}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all hover:shadow-[0_0_25px_rgba(236,72,153,0.7)] flex items-center gap-2"
          >
            <Home className="w-5 h-5" /> HOME
          </Button>
        </div>
      </div>
    </div>
  )
}

