"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
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

export default function Home() {
  // Initialize sound system on component mount
  useEffect(() => {
    SoundManager.init()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines z-10 opacity-10"></div>

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[150px] opacity-20"></div>
      <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[150px] opacity-20"></div>

      <div className="text-center z-20 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 mb-6 pixel-font">
          TRUTH DETECTOR
        </h1>
        <div className="border-2 border-pink-500 p-6 rounded-lg bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(236,72,153,0.5)] mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-4 pixel-font">MISSION BRIEFING</h2>
          <p className="text-gray-200 mb-6 leading-relaxed">
            Your mission: Navigate the treacherous world of digital misinformation. Can you identify fake news, spot
            phishing attempts, detect manipulated images, and analyze suspicious URLs? Test your digital literacy skills
            in this retro-themed challenge!
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-900/50 p-3 rounded border border-indigo-500">
              <h3 className="text-indigo-300 font-bold mb-1">FACT CHECK</h3>
              <p className="text-gray-300 text-sm">Separate truth from fiction</p>
            </div>
            <div className="bg-purple-900/50 p-3 rounded border border-purple-500">
              <h3 className="text-purple-300 font-bold mb-1">PHISHING ALERT</h3>
              <p className="text-gray-300 text-sm">Identify malicious emails</p>
            </div>
            <div className="bg-pink-900/50 p-3 rounded border border-pink-500">
              <h3 className="text-pink-300 font-bold mb-1">IMAGE ANALYSIS</h3>
              <p className="text-gray-300 text-sm">Identify Deep Fake traits</p>
            </div>
            <div className="bg-cyan-900/50 p-3 rounded border border-cyan-500">
              <h3 className="text-cyan-300 font-bold mb-1">URL DETECTIVE</h3>
              <p className="text-gray-300 text-sm">Analyze suspicious links</p>
            </div>
          </div>
        </div>

        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(219,39,119,0.5)] transition-all hover:shadow-[0_0_25px_rgba(219,39,119,0.7)] text-xl"
          onClick={() => SoundManager.play("/sounds/start.mp3")}
        >
          START CHALLENGE <ArrowRight className="w-5 h-5" />
        </Link>

        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/leaderboard"
            className="text-cyan-300 hover:text-cyan-100 border-b-2 border-cyan-500 hover:border-cyan-300 transition-colors"
            onClick={() => SoundManager.play("/sounds/click.mp3")}
          >
            LEADERBOARD
          </Link>
          <Link
            href="/about"
            className="text-cyan-300 hover:text-cyan-100 border-b-2 border-cyan-500 hover:border-cyan-300 transition-colors"
            onClick={() => SoundManager.play("/sounds/click.mp3")}
          >
            ABOUT
          </Link>
        </div>
      </div>
    </div>
  )
}

