import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import FloatingChatButton from "@/components/floating-chat-button"
import Providers from "@/components/providers"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "600", "700"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "Top Coach - AI-Powered Fitness Coaching",
  description:
    "Transform your fitness journey with AI-powered coaching, personalized workouts, and smart nutrition planning.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} antialiased`}>
      <head>
        <style>{`
html {
  font-family: ${dmSans.style.fontFamily};
  --font-heading: ${spaceGrotesk.variable};
  --font-body: ${dmSans.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen bg-background text-foreground circuit-pattern">
        <Providers>
          {children}
          <FloatingChatButton />
        </Providers>
      </body>
    </html>
  )
}
