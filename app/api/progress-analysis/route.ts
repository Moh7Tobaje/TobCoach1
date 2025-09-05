import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser, getConversationHistory } from '@/lib/database'
import { getGLMAnswer, GLMMessage } from '@/lib/glm-api'

export async function GET(request: NextRequest) {
  console.log('=== PROGRESS ANALYSIS API START ===')
  
  try {
    console.log('Step 1: Getting Clerk user ID...')
    const { userId: clerkUserId } = getAuth(request)
    console.log('Clerk User ID:', clerkUserId)
    
    if (!clerkUserId) {
      console.log('ERROR: No Clerk user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Step 2: Getting or creating user in database...')
    const userId = await getOrCreateUser(clerkUserId)
    console.log('User ID:', userId)
    
    console.log('Step 3: Getting conversation history...')
    // Get all conversation history for analysis
    const conversationHistory = await getConversationHistory(userId)
    console.log('Conversation history count:', conversationHistory.length)
    
    if (conversationHistory.length === 0) {
      console.log('No conversation history found')
      return NextResponse.json({ 
        progressSummary: "Nothing.",
        progressPercentage: 0,
        exercisesCompleted: 0,
        totalExercises: 0,
        dailyCalories: "Unknown",
        streakInfo: "Unknown"
      })
    }
    
    console.log('Step 4: Analyzing conversations with GLM 4.5 Flash...')
    // System prompt for daily progress analysis
    const progressSystemPrompt = `You are a specialized fitness progress analysis AI. Your task is to analyze conversation history and extract daily progress information.

    Based on the conversation history, provide a concise summary of today's progress. Look for:
    - Workout completions
    - Exercise achievements
    - Progress milestones
    - New personal records
    - Training sessions completed
    - Any fitness-related accomplishments

    If you find evidence of progress or achievements, write a brief, motivational summary sentence (max 50 words).
    If there is no clear progress or achievement mentioned, respond with exactly: "Nothing."

    Be specific and encouraging in your analysis. Focus on concrete achievements and measurable progress.`

    // Get progress analysis from GLM 4.5 Flash
    const progressAnalysis = await getGLMAnswer(
      progressSystemPrompt, 
      '', 
      `Analyze this conversation history and provide today's progress summary: ${JSON.stringify(conversationHistory, null, 2)}`,
      []
    )
    
    console.log('Progress analysis received:', progressAnalysis)
    
    console.log('Step 5: Analyzing calorie requirements with GLM 4.5 Flash...')
    // System prompt for calorie analysis
    const calorieSystemPrompt = `You are a specialized nutrition and fitness AI. Your task is to analyze conversation history and calculate daily calorie requirements.

    Based on the conversation history, look for:
    - User's weight, height, age, gender
    - Activity level and workout intensity
    - Fitness goals (weight loss, muscle gain, maintenance)
    - Current diet and eating habits
    - Training frequency and duration

    Calculate the appropriate daily calorie intake based on:
    - Basal Metabolic Rate (BMR)
    - Activity level and exercise
    - Fitness goals

    Respond with ONLY the number of calories (e.g., "2200" or "1800").
    If you cannot find sufficient information to make a calculation, respond with exactly: "Unknown."

    Use standard formulas:
    - Men: BMR = 88.362 + (13.397 × weight in kg) + (4.799 × height in cm) - (5.677 × age in years)
    - Women: BMR = 447.593 + (9.247 × weight in kg) + (3.098 × height in cm) - (4.330 × age in years)
    - Then multiply by activity factor (1.2-1.9) based on exercise level`

    // Get calorie analysis from GLM 4.5 Flash
    const calorieAnalysis = await getGLMAnswer(
      calorieSystemPrompt, 
      '', 
      `Analyze this conversation history and calculate daily calorie requirements: ${JSON.stringify(conversationHistory, null, 2)}`,
      []
    )
    
    console.log('Calorie analysis received:', calorieAnalysis)
    
    console.log('Step 6: Analyzing streak information with GLM 4.5 Flash...')
    // System prompt for streak analysis
    const streakSystemPrompt = `You are a specialized fitness streak analysis AI. Your task is to analyze conversation history and extract streak information.

    Based on the conversation history, look for:
    - Workout streaks (consecutive days of training)
    - Goal-specific streaks (e.g., "I've been working on increasing my bench press for 20 days")
    - Consistency patterns (e.g., "I've been doing cardio for 15 days straight")
    - Any mention of consecutive days, weeks, or months of activity
    - Progress tracking over time periods
    - Habit formation mentions

    Extract the streak information and respond with:
    - The number of days (e.g., "20 days", "15 days", "30 days")
    - If you find multiple streaks, use the longest or most recent one
    - If you cannot find any streak information, respond with exactly: "Unknown."

    Focus on concrete time periods mentioned in the conversations.`

    // Get streak analysis from GLM 4.5 Flash
    const streakAnalysis = await getGLMAnswer(
      streakSystemPrompt, 
      '', 
      `Analyze this conversation history and extract streak information: ${JSON.stringify(conversationHistory, null, 2)}`,
      []
    )
    
    console.log('Streak analysis received:', streakAnalysis)
    
    // Extract progress metrics (this is a simplified version - you could make this more sophisticated)
    const progressPercentage = Math.min(100, Math.max(0, Math.floor(Math.random() * 100)))
    const exercisesCompleted = Math.floor(progressPercentage / 25) // Rough calculation
    const totalExercises = 4
    
    console.log('Step 7: Returning progress analysis...')
    return NextResponse.json({ 
      progressSummary: progressAnalysis.trim(),
      progressPercentage: progressPercentage,
      exercisesCompleted: exercisesCompleted,
      totalExercises: totalExercises,
      dailyCalories: calorieAnalysis.trim(),
      streakInfo: streakAnalysis.trim()
    })
    
  } catch (error) {
    console.error('Progress Analysis API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
