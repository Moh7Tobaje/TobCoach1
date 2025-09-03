"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Mic, Paperclip, MoreVertical, ArrowLeft, Zap, Target, Apple, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "workout" | "nutrition" | "progress"
}

export default function ChatPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check authentication and load messages
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
      return
    }

    if (isLoaded && user) {
      // Load conversation history
      fetch('/api/chat', { method: 'GET' })
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to load messages: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          if (data.messages && data.messages.length > 0) {
            const formattedMessages: Message[] = data.messages.map((msg: any) => ({
              id: `msg-${msg.id || Date.now()}-${Math.random()}`,
              content: msg.content,
              sender: msg.role === 'user' ? 'user' : 'ai',
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            }))
            setMessages(formattedMessages)
          } else {
            // Add welcome message for new users
            setMessages([{
              id: "welcome-msg",
              content: "Hey there! I'm your AI fitness coach. I'm here to help you crush your fitness goals! What would you like to work on today?",
              sender: "ai",
              timestamp: new Date(),
            }])
          }
        })
        .catch(error => {
          console.error('Error loading messages:', error)
          // Add welcome message as fallback
          setMessages([{
            id: "welcome-msg",
            content: "Hey there! I'm your AI fitness coach. I'm here to help you crush your fitness goals! What would you like to work on today?",
            sender: "ai",
            timestamp: new Date(),
          }])
        })
    }
  }, [isLoaded, user, router])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(`Failed to send message: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }

      const data = await response.json()
      
      const aiResponse: Message = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: data.response,
        sender: "ai",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorResponse: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Remove the generateAIResponse function as it's no longer needed

  const handleQuickAction = (action: string) => {
    if (!user) return
    setInputValue(action)
  }

  const quickActions = [
    { icon: Zap, text: "Generate a workout plan", action: "Can you create a workout plan for me?" },
    { icon: Apple, text: "Meal suggestions", action: "What should I eat today?" },
    { icon: Target, text: "Set fitness goals", action: "Help me set some fitness goals" },
    { icon: TrendingUp, text: "Track my progress", action: "How can I track my progress?" },
  ]

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#091110] text-white circuit-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#e3372e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#091110] text-white circuit-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please sign in to access the AI Coach</p>
          <Link href="/sign-in">
            <Button className="gradient-red-silver glow-red">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#091110] text-white circuit-pattern">
      {/* Header */}
      <div className="border-b border-[#2d2e2e]/30 bg-[#091110]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-3 md:p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-[#e3372e]/20 text-[#e3372e] border border-[#e3372e]/30 hover:border-[#e3372e]/50 transition-all duration-300 w-8 h-8 md:w-10 md:h-10"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative logo-container">
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="AI Coach"
                  width={48}
                  height={48}
                  className="rounded-xl border-2 border-[#e3372e]/50 logo-header shadow-lg md:w-14 md:h-14"
                  priority
                />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-[#e3372e] rounded-full border-2 border-[#091110] animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-base md:text-lg bg-gradient-to-r from-[#e3372e] to-white bg-clip-text text-transparent">
                  AI Fitness Coach
                </h1>
                <p className="text-xs md:text-sm text-[#2d2e2e]">Online • Ready to help</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-[#2d2e2e] hidden md:block">Welcome, {user.firstName || user.username || 'User'}</span>
            <Button variant="ghost" size="icon" className="hover:bg-[#e3372e]/20 text-white w-8 h-8 md:w-10 md:h-10">
              <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 max-w-4xl mx-auto pb-20 md:pb-4">
        <div className="space-y-4 md:space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 md:gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "ai" && (
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="AI Coach"
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-[#e3372e]/40 flex-shrink-0 logo-message shadow-md md:w-10 md:h-10"
                />
              )}

              <div className={`max-w-[85%] md:max-w-[70%] ${message.sender === "user" ? "order-first" : ""}`}>
                <Card
                  className={`p-3 md:p-4 border-0 ${
                    message.sender === "user"
                      ? "bg-[#e3372e] text-white ml-auto glow-red"
                      : "bg-[#2d2e2e]/80 border-[#2d2e2e]/50 text-white backdrop-blur-sm"
                  }`}
                >
                  <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                </Card>
                <p className={`text-xs text-[#2d2e2e] mt-1 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {message.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#2d2e2e]/80 flex items-center justify-center flex-shrink-0 border border-[#e3372e]/30">
                  <span className="text-xs font-medium text-white">You</span>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Image
                src="/images/top-coach-logo.svg"
                alt="AI Coach"
                width={40}
                height={40}
                className="rounded-full border-2 border-[#e3372e]/40 flex-shrink-0 logo-message shadow-md"
              />
              <Card className="p-4 bg-[#2d2e2e]/80 border-[#2d2e2e]/50 backdrop-blur-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#e3372e] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#e3372e] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#e3372e] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </Card>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="p-3 md:p-4 max-w-4xl mx-auto pb-20 md:pb-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-[#e3372e] mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start gap-2 h-auto p-3 text-left hover:bg-[#e3372e]/20 border-[#2d2e2e]/50 bg-[#2d2e2e]/30 text-white backdrop-blur-sm hover:border-[#e3372e]/50 transition-all duration-300"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <action.icon className="h-4 w-4 text-[#e3372e]" />
                  <span className="text-sm">{action.text}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-[#2d2e2e]/30 bg-[#091110]/90 backdrop-blur-sm p-3 md:p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="absolute left-1 top-1 h-6 w-6 md:h-8 md:w-8 bg-[#e3372e] hover:bg-[#e3372e]/80 text-white z-10"
                disabled={!inputValue.trim()}
              >
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about fitness..."
                className="pl-8 md:pl-12 bg-[#2d2e2e]/50 border-[#2d2e2e]/50 focus:border-[#e3372e]/50 text-white placeholder:text-[#2d2e2e] backdrop-blur-sm text-sm md:text-base h-10 md:h-12"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
            </div>
          </div>

          <div className="flex items-center justify-center mt-2">
            <Badge variant="secondary" className="text-xs bg-[#2d2e2e]/50 text-white border-[#e3372e]/30">
              AI-powered fitness coaching • Secure & Private
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
