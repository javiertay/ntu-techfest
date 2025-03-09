"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Brain, Eye, Link2 } from "lucide-react"
import { useEffect } from "react"

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
    const soundUrls = ["/sounds/click.mp3", "/sounds/start.mp3"]

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

export default function AboutPage() {
  // Initialize sound system on component mount
  useEffect(() => {
    SoundManager.init()
  }, [])

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
            ABOUT
          </h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>

        <div className="border-2 border-indigo-500 rounded-lg bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.5)] p-6 mb-8">
          <h2 className="text-2xl text-cyan-300 font-bold mb-4 pixel-font">MISSION BRIEFING</h2>
          <p className="text-gray-200 mb-6 leading-relaxed">
            Truth Detector is an interactive quiz game designed to improve digital literacy skills. In today's
            information-saturated world, the ability to identify misinformation, recognize phishing attempts, detect
            manipulated images, and analyze suspicious URLs is more important than ever.
          </p>

          <p className="text-gray-200 mb-6 leading-relaxed">
            This retro-themed challenge tests your ability to navigate the treacherous waters of digital misinformation
            while providing educational feedback to help you improve your skills.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-indigo-900/30 p-5 rounded-lg border border-indigo-600">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-indigo-300">Fact Checking</h3>
              </div>
              <p className="text-gray-300">
                Learn to separate fact from fiction by analyzing claims, identifying logical fallacies, and recognizing
                common misinformation tactics.
              </p>
            </div>

            <div className="bg-purple-900/30 p-5 rounded-lg border border-purple-600">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-purple-300">Phishing Detection</h3>
              </div>
              <p className="text-gray-300">
                Develop the skills to identify malicious emails, messages, and websites designed to steal your personal
                information or compromise your security.
              </p>
            </div>

            <div className="bg-pink-900/30 p-5 rounded-lg border border-pink-600">
              <div className="flex items-center gap-3 mb-3">
                <Eye className="w-6 h-6 text-pink-400" />
                <h3 className="text-xl font-bold text-pink-300">Image Analysis</h3>
              </div>
              <p className="text-gray-300">
                Learn how to identify common deep fake traits
              </p>
            </div>

            <div className="bg-cyan-900/30 p-5 rounded-lg border border-cyan-600">
              <div className="flex items-center gap-3 mb-3">
                <Link2 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-bold text-cyan-300">URL Analysis</h3>
              </div>
              <p className="text-gray-300">
                Learn to identify suspicious URLs and websites by recognizing common tactics used by scammers to mimic
                legitimate sites.
              </p>
            </div>
          </div>

          <h2 className="text-2xl text-cyan-300 font-bold mb-4 pixel-font">HOW TO PLAY</h2>
          <ol className="list-decimal list-inside text-gray-200 space-y-3 mb-6 pl-4">
            <li>Start the challenge from the home page</li>
            <li>Answer 10 randomly selected questions from our question pool</li>
            <li>Each question has four possible answers - choose wisely!</li>
            <li>You have 30 seconds to answer each question</li>
            <li>You start with 3 lives - each incorrect answer costs you one life</li>
            <li>Earn points based on correct answers and speed</li>
            <li>Complete the quiz to earn badges and see your rank</li>
            <li>Compare your scores on the leaderboard</li>
          </ol>

          <div className="bg-black/30 p-5 rounded-lg border border-pink-500 mb-6">
            <h3 className="text-xl font-bold text-pink-300 mb-2">Why This Matters</h3>
            <p className="text-gray-300">
              In an era of deepfakes, AI-generated content, and sophisticated phishing schemes, digital literacy is no
              longer optional—it's essential. By improving your ability to detect misinformation, you're not just
              protecting yourself, but also helping to create a more informed and resilient digital society.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/quiz">
            <Button
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(219,39,119,0.5)] transition-all hover:shadow-[0_0_25px_rgba(219,39,119,0.7)] text-xl"
              onClick={() => SoundManager.play("/sounds/start.mp3")}
            >
              START CHALLENGE
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

