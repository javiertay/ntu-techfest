import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Truth Detector - Misinformation Quiz Game",
  description:
    "Test your digital literacy skills with this retro-themed quiz game designed to help you identify misinformation, phishing attempts, fake images, and suspicious URLs.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Metadata is handled by Next.js automatically */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

