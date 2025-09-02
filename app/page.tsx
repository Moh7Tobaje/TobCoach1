"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Play,
  Zap,
  Target,
  TrendingUp,
  Users,
  MessageCircle,
  Dumbbell,
  Apple,
  BarChart3,
  Star,
  Bot,
  Trophy,
  Award,
  Flame,
  Activity,
  Pin,
} from "lucide-react"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "text" | "action"
}

interface CommunityPost {
  id: string
  user: {
    name: string
    avatar: string
    level: number
    badge?: string
  }
  content: string
  image?: string
  timestamp: Date
  likes: number
  comments: number
  isLiked: boolean
  type: "achievement" | "workout" | "motivation" | "question"
}

interface ForumTopic {
  id: string
  title: string
  author: string
  avatar: string
  replies: number
  views: number
  lastActivity: Date
  category: string
  isPinned?: boolean
}

interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  points: number
  rank: number
  streak: number
  workouts: number
  badge?: string
}

export default function TopCoachApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [isVisible, setIsVisible] = useState(false)
  const [progressVisible, setProgressVisible] = useState(false)
  const [comingSoonVisible, setComingSoonVisible] = useState(false)
  const triggerComingSoon = () => {
    setComingSoonVisible(true)
  }
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      user: { name: "Sarah Chen", avatar: "/fit-woman-outdoors.png", level: 15, badge: "Consistency King" },
      content:
        "Just completed my 30-day workout streak! The AI coach really helped me stay motivated. Who else is on a streak?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      comments: 8,
      isLiked: false,
      type: "achievement",
    },
    {
      id: "2",
      user: { name: "Mike Rodriguez", avatar: "/professional-man.png", level: 12 },
      content:
        "Quick question - what's everyone's favorite post-workout meal? Looking for some new ideas to fuel my recovery!",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 15,
      comments: 12,
      isLiked: true,
      type: "question",
    },
    {
      id: "3",
      user: { name: "Emma Thompson", avatar: "/woman-runner.png", level: 18, badge: "Marathon Ready" },
      content: "Morning workout done! 5K run in 22 minutes - new personal best! The weather was perfect today.",
      image: "/morning-run-scenery.png",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 31,
      comments: 6,
      isLiked: false,
      type: "workout",
    },
    {
      id: "4",
      user: { name: "Alex Kim", avatar: "/fitness-enthusiast.png", level: 8 },
      content:
        "Remember: Progress isn't always linear. Some days are harder than others, but showing up is what matters most. Keep pushing!",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      likes: 42,
      comments: 15,
      isLiked: true,
      type: "motivation",
    },
  ])

  const [forumTopics] = useState<ForumTopic[]>([
    {
      id: "1",
      title: "Best exercises for building core strength?",
      author: "FitnessNewbie",
      avatar: "/beginner-avatar.png",
      replies: 23,
      views: 156,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      category: "Strength Training",
      isPinned: false,
    },
    {
      id: "2",
      title: "Weekly Challenge: 10,000 Steps Daily",
      author: "TopCoachTeam",
      avatar: "/images/top-coach-logo.svg",
      replies: 87,
      views: 432,
      lastActivity: new Date(Date.now() - 30 * 1000),
      category: "Challenges",
      isPinned: true,
    },
    {
      id: "3",
      title: "Meal prep ideas for busy professionals",
      author: "HealthyEater",
      avatar: "/nutrition-expert.png",
      replies: 34,
      views: 289,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: "Nutrition",
    },
    {
      id: "4",
      title: "How to stay motivated during winter months?",
      author: "WinterWarrior",
      avatar: "/winter-athlete.png",
      replies: 45,
      views: 201,
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000),
      category: "Motivation",
    },
  ])

  const [leaderboard] = useState<LeaderboardUser[]>([
    {
      id: "1",
      name: "Emma Thompson",
      avatar: "/woman-runner.png",
      points: 2840,
      rank: 1,
      streak: 28,
      workouts: 45,
      badge: "Marathon Ready",
    },
    {
      id: "2",
      name: "Sarah Chen",
      avatar: "/fit-woman-outdoors.png",
      points: 2650,
      rank: 2,
      streak: 30,
      workouts: 42,
      badge: "Consistency King",
    },
    {
      id: "3",
      name: "Mike Rodriguez",
      avatar: "/professional-man.png",
      points: 2420,
      rank: 3,
      streak: 15,
      workouts: 38,
    },
    {
      id: "4",
      name: "Alex Kim",
      avatar: "/fitness-enthusiast.png",
      points: 2180,
      rank: 4,
      streak: 12,
      workouts: 35,
    },
    {
      id: "5",
      name: "You",
      avatar: "/user-avatar.png",
      points: 1950,
      rank: 5,
      streak: 15,
      workouts: 32,
    },
  ])

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hey there! I'm your AI fitness coach. I'm here to help you crush your fitness goals! What would you like to work on today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (activeTab === "progress") {
      const timer = setTimeout(() => setProgressVisible(true), 300)
      return () => clearTimeout(timer)
    } else {
      setProgressVisible(false)
    }
  }, [activeTab])

  const toggleLike = (postId: string) => {
    setCommunityPosts((posts) =>
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const weeklyWorkoutData = [
    { day: "Mon", workouts: 2, calories: 450, duration: 45 },
    { day: "Tue", workouts: 1, calories: 320, duration: 30 },
    { day: "Wed", workouts: 3, calories: 680, duration: 65 },
    { day: "Thu", workouts: 2, calories: 520, duration: 50 },
    { day: "Fri", workouts: 1, calories: 380, duration: 35 },
    { day: "Sat", workouts: 2, calories: 590, duration: 55 },
    { day: "Sun", workouts: 1, calories: 290, duration: 25 },
  ]

  const monthlyProgressData = [
    { month: "Jan", weight: 180, bodyFat: 18, muscle: 145 },
    { month: "Feb", weight: 178, bodyFat: 17.2, muscle: 147 },
    { month: "Mar", weight: 176, bodyFat: 16.5, muscle: 149 },
    { month: "Apr", weight: 174, bodyFat: 15.8, muscle: 151 },
    { month: "May", weight: 172, bodyFat: 15.1, muscle: 153 },
    { month: "Jun", weight: 170, bodyFat: 14.5, muscle: 155 },
  ]

  const workoutTypeData = [
    { name: "Strength", value: 45, color: "hsl(var(--chart-1))" },
    { name: "Cardio", value: 30, color: "hsl(var(--chart-2))" },
    { name: "Flexibility", value: 15, color: "hsl(var(--chart-3))" },
    { name: "Sports", value: 10, color: "hsl(var(--chart-4))" },
  ]

  const achievements = [
    {
      id: 1,
      title: "First Week Complete",
      description: "Completed your first week of training",
      icon: Trophy,
      earned: true,
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Consistency King",
      description: "7 days workout streak",
      icon: Flame,
      earned: true,
      date: "2024-01-22",
    },
    {
      id: 3,
      title: "Calorie Crusher",
      description: "Burned 5000+ calories this month",
      icon: Target,
      earned: true,
      date: "2024-02-01",
    },
    {
      id: 4,
      title: "Strength Builder",
      description: "Increased max weight by 20%",
      icon: Dumbbell,
      earned: false,
      progress: 75,
    },
    {
      id: 5,
      title: "Marathon Ready",
      description: "Complete 100 cardio sessions",
      icon: Activity,
      earned: false,
      progress: 45,
    },
    {
      id: 6,
      title: "Perfect Month",
      description: "30 days without missing a workout",
      icon: Award,
      earned: false,
      progress: 20,
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setNewMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Great question! Based on your current fitness level, I'd recommend starting with a balanced approach. Would you like me to create a personalized workout plan?",
        "I can see you're making excellent progress! Let's adjust your routine to keep challenging you. What's your energy level today?",
        "Perfect timing! I've analyzed your recent workouts and I think we should focus on strength training today. Ready to get started?",
        "That's awesome motivation! I love your dedication. Let me suggest some exercises that align with your goals.",
      ]

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (action: string) => {
    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      content: action,
      sender: "user",
      timestamp: new Date(),
      type: "action",
    }

    setChatMessages((prev) => [...prev, actionMessage])
    setIsTyping(true)

    setTimeout(() => {
      let response = ""
      switch (action) {
        case "Generate Workout":
          response =
            "Perfect! I've created a personalized workout based on your goals and current fitness level. It includes 4 exercises focusing on strength and endurance. Would you like to start now?"
          break
        case "Adjust Intensity":
          response =
            "Got it! I can adjust your workout intensity. Are you feeling energetic today and want to increase the challenge, or would you prefer something lighter?"
          break
        case "Meal Suggestions":
          response =
            "Excellent! Based on your dietary preferences and fitness goals, I've prepared some nutritious meal options that will fuel your workouts perfectly."
          break
        case "Track Progress":
          response =
            "Let me pull up your progress data! You've been doing amazing - 85% workout completion rate this week and you're ahead of your calorie burn goals!"
          break
        default:
          response = "I'm here to help! What specific aspect of your fitness journey would you like to focus on?"
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1200)
  }

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fitness Enthusiast",
      content: "Top Coach's AI completely transformed my workout routine. I've never been more motivated!",
      rating: 5,
      avatar: "/fit-woman-outdoors.png",
    },
    {
      name: "Mike Rodriguez",
      role: "Busy Professional",
      content: "The personalized meal plans saved me hours of planning. Results speak for themselves.",
      rating: 5,
      avatar: "/professional-man.png",
    },
    {
      name: "Emma Thompson",
      role: "Marathon Runner",
      content: "The AI coach adapts to my training schedule perfectly. It's like having a personal trainer 24/7.",
      rating: 5,
      avatar: "/woman-runner.png",
    },
  ]

  const workoutPlan = [
    { exercise: "Push-ups", sets: 3, reps: 12, rest: 60, completed: true },
    { exercise: "Squats", sets: 4, reps: 15, rest: 90, completed: true },
    { exercise: "Plank", sets: 3, reps: "45s", rest: 60, completed: false },
    { exercise: "Burpees", sets: 3, reps: 8, rest: 120, completed: false },
  ]

  const mealPlan = [
    {
      meal: "Breakfast",
      name: "Protein Power Bowl",
      calories: 420,
      protein: 32,
      carbs: 28,
      fats: 18,
      image: "/healthy-breakfast-bowl.png",
    },
    {
      meal: "Lunch",
      name: "Grilled Chicken Salad",
      calories: 380,
      protein: 35,
      carbs: 15,
      fats: 22,
      image: "/grilled-chicken-salad.png",
    },
    {
      meal: "Dinner",
      name: "Salmon & Quinoa",
      calories: 520,
      protein: 38,
      carbs: 45,
      fats: 24,
      image: "/salmon-quinoa-dinner.png",
    },
  ]

  if (activeTab === "home") {
    return (
      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative logo-container">
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="Top Coach"
                  width={40}
                  height={40}
                  className="rounded-xl border-2 border-[#e3372e]/30 logo-header shadow-lg md:w-12 md:h-12"
                  priority
                />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-[#e3372e] rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <span className="text-lg md:text-xl font-bold font-[var(--font-heading)] bg-gradient-to-r from-[#e3372e] to-white bg-clip-text text-transparent">Top Coach</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <Button variant="ghost" onClick={triggerComingSoon}>
                Workout
              </Button>
              <Button variant="ghost" onClick={triggerComingSoon}>
                Nutrition
              </Button>
              <Button variant="ghost" onClick={triggerComingSoon}>
                Progress
              </Button>
              <Button variant="ghost" onClick={triggerComingSoon}>
                Community
              </Button>
            </div>
            <div className="hidden sm:block">
              <SignedOut>
                <Button asChild size="sm" className="gradient-red-silver glow-red">
                  <Link href="/sign-in">Start Free</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <SignOutButton>
                  <Button size="sm" className="gradient-red-silver glow-red">Log out</Button>
                </SignOutButton>
              </SignedIn>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4 relative overflow-hidden min-h-[80vh] flex items-center">
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src="https://my.spline.design/backlightbgeffect-OMYqWUmL3RYsKEfbabxMzhjU/"
              frameBorder="0"
              width="100%"
              height="100%"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

          <div className="container mx-auto text-center relative z-10">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <Badge className="mb-4 md:mb-6 gradient-red-silver text-white border-0 text-sm">
                <Zap className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                AI-Powered Fitness Revolution
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-[var(--font-heading)] mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg leading-tight">
                Transform Your Body with
                <span className="block text-primary drop-shadow-lg">AI Coaching</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 md:mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md px-4">
                Experience personalized workouts, smart nutrition planning, and 24/7 AI coaching that adapts to your
                goals and lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-4">
                <SignedOut>
                  <Button asChild size="lg" className="gradient-red-silver glow-red text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto">
                    <Link href="/sign-in">
                      <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Start Training Free
                    </Link>
                  </Button>
                </SignedOut>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 border-white/30 hover:glow-silver bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Demo Preview */}
            <div
              className={`transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <Card className="max-w-4xl mx-auto gradient-black-gray border-border glow-silver backdrop-blur-sm bg-black/60">
                <CardContent className="p-4 md:p-8">
                  <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="border-2 border-primary w-10 h-10 md:w-12 md:h-12">
                          <AvatarImage src="/images/top-coach-logo.svg" className="rounded-full" />
                          <AvatarFallback className="bg-gradient-to-br from-[#e3372e] to-[#c41e3a] text-white font-bold">TC</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm md:text-base">Your AI Coach</p>
                          <p className="text-xs md:text-sm text-muted-foreground">Online now</p>
                        </div>
                      </div>
                      <div className="bg-card p-3 md:p-4 rounded-lg border border-border">
                        <p className="text-xs md:text-sm">
                          "Based on your progress, I've adjusted your workout intensity by 15%. Ready for today's
                          challenge? 💪"
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleQuickAction("Generate Workout")} className="text-xs">
                          Generate Workout
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleQuickAction("Adjust Intensity")} className="text-xs">
                          Adjust Intensity
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-card p-3 md:p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm md:text-base">Today's Progress</span>
                          <span className="text-primary text-sm md:text-base">75%</span>
                        </div>
                        <Progress value={75} className="mb-2" />
                        <p className="text-xs md:text-sm text-muted-foreground">3 of 4 exercises completed</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-card p-2 md:p-3 rounded-lg border border-border text-center">
                          <Target className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1" />
                          <p className="text-xs md:text-sm font-semibold">Calories</p>
                          <p className="text-sm md:text-lg font-bold text-primary">420</p>
                        </div>
                        <div className="bg-card p-2 md:p-3 rounded-lg border border-border text-center">
                          <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1" />
                          <p className="text-xs md:text-sm font-semibold">Streak</p>
                          <p className="text-sm md:text-lg font-bold text-primary">12 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)] text-center mb-8 md:mb-12">
              Trusted by <span className="text-primary">10,000+</span> Fitness Enthusiasts
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="gradient-black-gray border-border hover:glow-silver transition-all duration-300"
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center space-x-1 mb-3 md:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-3 md:mb-4 text-sm md:text-base">"{testimonial.content}"</p>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8 md:w-10 md:h-10">
                        <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm md:text-base">{testimonial.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full bg-card/95 backdrop-blur-md border-t border-border md:hidden z-40">
          <div className="flex justify-around py-2 px-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="flex-col space-y-1 min-h-[60px]">
              <div className="relative">
                <Image
                  src="/images/top-coach-logo.svg"
                  alt="Home"
                  width={20}
                  height={20}
                  className="rounded-full border border-[#e3372e]/30 logo-message"
                />
                <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#e3372e] rounded-full border border-card animate-pulse"></div>
              </div>
              <span className="text-xs font-medium">Home</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={triggerComingSoon} className="flex-col space-y-1 min-h-[60px]">
              <Dumbbell className="w-4 h-4" />
              <span className="text-xs">Workout</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={triggerComingSoon} className="flex-col space-y-1 min-h-[60px]">
              <Apple className="w-4 h-4" />
              <span className="text-xs">Nutrition</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={triggerComingSoon} className="flex-col space-y-1 min-h-[60px]">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Progress</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={triggerComingSoon} className="flex-col space-y-1 min-h-[60px]">
              <Users className="w-4 h-4" />
              <span className="text-xs">Community</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveTab("chat")} className="flex-col space-y-1 min-h-[60px]">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">Chat</span>
            </Button>
          </div>
        </div>

        {/* Coming Soon Overlay */}
        {comingSoonVisible && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setComingSoonVisible(false)}
          >
            <div className="text-center px-6 py-8 rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm max-w-sm w-full">
              <span className="block text-2xl md:text-3xl font-bold mb-2 text-white">Coming Soon</span>
              <span className="text-sm text-white/80">Tap anywhere to dismiss</span>
            </div>
          </div>
        )}

        {/* Floating AI Coach Button - Hidden on mobile since we have bottom nav */}
        <Button
          className="fixed bottom-20 right-4 md:bottom-6 w-14 h-14 rounded-full gradient-red-silver glow-red shadow-lg hidden md:flex"
          onClick={() => setActiveTab("chat")}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  // Workout Dashboard Tab
  if (activeTab === "workout") {
    return (
      <div className="min-h-screen p-4 pt-20 pb-20 md:pb-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-heading)]">Today's Workout</h1>
              <p className="text-muted-foreground text-sm md:text-base">Upper Body Strength • 45 min</p>
            </div>
            <Button onClick={() => setActiveTab("home")} variant="outline" size="sm" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </div>

          <div className="grid gap-4 md:gap-6">
            {workoutPlan.map((exercise, index) => (
              <Card
                key={index}
                className={`gradient-black-gray border-border transition-all duration-300 ${exercise.completed ? "opacity-60" : "hover:glow-silver"}`}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${exercise.completed ? "bg-primary" : "bg-card border-2 border-border"}`}
                      >
                        {exercise.completed ? (
                          <span className="text-primary-foreground font-bold text-sm md:text-base">✓</span>
                        ) : (
                          <span className="font-bold text-sm md:text-base">{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold">{exercise.exercise}</h3>
                        <p className="text-muted-foreground text-sm md:text-base">
                          {exercise.sets} sets × {exercise.reps} reps • {exercise.rest}s rest
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Swap
                      </Button>
                      {!exercise.completed && <Button className="bg-white text-black hover:bg-gray-100 w-full sm:w-auto">Start</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 gradient-black-gray border-border">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Workout Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completion</span>
                  <span className="text-primary font-bold">50%</span>
                </div>
                <Progress value={50} />
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">2</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">2</p>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">22</p>
                    <p className="text-sm text-muted-foreground">Minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Nutrition Tab
  if (activeTab === "nutrition") {
    return (
      <div className="min-h-screen p-4 pt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-[var(--font-heading)]">Nutrition Plan</h1>
              <p className="text-muted-foreground">Balanced Meals for Optimal Performance</p>
            </div>
            <Button onClick={() => setActiveTab("home")} variant="outline">
              Back to Home
            </Button>
          </div>

          <div className="grid gap-6">
            {mealPlan.map((meal, index) => (
              <Card
                key={index}
                className="gradient-black-gray border-border transition-all duration-300 hover:glow-silver"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary">
                        <span className="text-primary-foreground font-bold">{meal.meal[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{meal.name}</h3>
                        <p className="text-muted-foreground">
                          {meal.calories} calories • {meal.protein}g protein • {meal.carbs}g carbs • {meal.fats}g fats
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Swap
                      </Button>
                      <Button className="gradient-red-silver">View Recipe</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Progress Tab
  if (activeTab === "progress") {
    return (
      <div className="min-h-screen p-4 pt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-[var(--font-heading)]">Your Progress</h1>
              <p className="text-muted-foreground">Track Your Journey and Achievements</p>
            </div>
            <Button onClick={() => setActiveTab("home")} variant="outline">
              Back to Home
            </Button>
          </div>

          {progressVisible && (
            <div className="grid gap-6">
              <Card className="gradient-black-gray border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Weekly Workout Summary</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyWorkoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Bar dataKey="workouts" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="gradient-black-gray border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Monthly Progress Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Line type="monotone" dataKey="weight" stroke="hsl(var(--chart-2))" />
                      <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--chart-3))" />
                      <Line type="monotone" dataKey="muscle" stroke="hsl(var(--chart-4))" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="gradient-black-gray border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Workout Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={workoutTypeData}
                        cx={200}
                        cy={200}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                      >
                        {workoutTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="gradient-black-gray border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Achievements</h3>
                  <div className="grid gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-4">
                        <achievement.icon className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Community Tab
  if (activeTab === "community") {
    return (
      <div className="min-h-screen p-4 pt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-[var(--font-heading)]">Community Forum</h1>
              <p className="text-muted-foreground">Connect with Other Fitness Enthusiasts</p>
            </div>
            <Button onClick={() => setActiveTab("home")} variant="outline">
              Back to Home
            </Button>
          </div>

          <div className="grid gap-6">
            {forumTopics.map((topic) => (
              <Card
                key={topic.id}
                className="gradient-black-gray border-border transition-all duration-300 hover:glow-silver"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={topic.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{topic.author[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {topic.author} • {topic.replies} replies • {topic.views} views
                        </p>
                      </div>
                    </div>
                    {topic.isPinned && (
                      <Badge className="gradient-red-silver text-white border-0">
                        <Pin className="w-4 h-4 mr-2" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{topic.lastActivity.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Chat Tab
  if (activeTab === "chat") {
    return (
      <div className="min-h-screen p-4 pt-20">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-[var(--font-heading)]">Chat with AI Coach</h1>
              <p className="text-muted-foreground">Get Personalized Advice and Support</p>
            </div>
            <Button onClick={() => setActiveTab("home")} variant="outline">
              Back to Home
            </Button>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <Card
                    className={`gradient-black-gray border-border ${message.sender === "user" ? "bg-primary text-white" : ""}`}
                  >
                    <CardContent className="p-4">
                      <p className="text-sm">{message.content}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="mt-4">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full mb-2"
              />
              <Button onClick={sendMessage} className="gradient-red-silver">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
