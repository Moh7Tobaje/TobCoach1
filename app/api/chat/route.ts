import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { getOrCreateUser, saveMessage, getConversationHistory, getUserMessageCount, saveConversation, getLatestImportantInfo } from '@/lib/database'
import { getGLMAnswer, getSummary, GLMMessage } from '@/lib/glm-api'

export async function POST(request: NextRequest) {
  console.log('=== CHAT API START ===')
  
  try {
    console.log('Step 1: Getting Clerk user ID...')
    const { userId: clerkUserId } = getAuth(request)
    console.log('Clerk User ID:', clerkUserId)
    
    if (!clerkUserId) {
      console.log('ERROR: No Clerk user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Step 2: Parsing request body...')
    const { message } = await request.json()
    console.log('Message received:', message)
    
    if (!message || typeof message !== 'string') {
      console.log('ERROR: Invalid message format')
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    console.log('Step 3: Getting or creating user in database...')
    // Get or create user in our database
    const userId = await getOrCreateUser(clerkUserId)
    console.log('User ID:', userId)
    
    console.log('Step 4: Saving user message...')
    // Save user message
    await saveMessage(userId, 'user', message)
    console.log('User message saved')
    
    console.log('Step 5: Getting message count...')
    // Get current message count
    const messageCount = await getUserMessageCount(userId)
    console.log('Message count:', messageCount)
    
    // Check if we need to generate a summary (every 4 user messages)
    if (messageCount % 4 === 0) {
      console.log('Step 6: Generating summary...')
      const conversationHistory = await getConversationHistory(userId)
      const summary = await getSummary(conversationHistory)
      
      // Save conversation with important info
      const conversationText = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')
      await saveConversation(userId, conversationText, summary)
      console.log('Summary generated and saved')
    }
    
    console.log('Step 7: Getting latest important info...')
    // Get latest important info
    const importantInfo = await getLatestImportantInfo(userId) || 'No previous information available.'
    console.log('Important info length:', importantInfo.length)
    
    console.log('Step 8: Getting conversation history...')
    // Get last two conversations (4 messages: 2 user + 2 assistant)
    const lastTwo = await getConversationHistory(userId, 4)
    console.log('Last two conversations count:', lastTwo.length)
    
    console.log('Step 9: Getting GLM answer...')
    // System prompt for the main model
    const systemPrompt = `You are a highly skilled virtual sports coach named "Top Coach," developed by Top Ai.
Your role is to provide personalized advice exclusively focused on gym training, nutrition, and physical health. Your answers must be based on scientifically proven principles and current knowledge. They should be clear, actionable, and tailored to support each individual's fitness goals.

Begin every interaction by confirming that the user has read and agreed to the terms of use. If they disagree, politely end the conversation without proceeding. Once they agree, ask the following mandatory questions: height, gender, weight, existing health risks or conditions, and personal fitness goals. Do not provide advice until all these questions are answered clearly.

Avoid discussing any sports other than gym training. Never provide advice on chemical substances or supplements; always recommend consulting a professional for such matters. Focus on being clear, precise, and supportive in your responses.`
    
    // Get answer from GLM
    const answer = await getGLMAnswer(systemPrompt, importantInfo, message, lastTwo)
    console.log('GLM answer received, length:', answer.length)
    
    console.log('Step 10: Saving assistant response...')
    // Save assistant response
    await saveMessage(userId, 'assistant', answer)
    console.log('Assistant response saved')
    
    console.log('Step 11: Returning response...')
    return NextResponse.json({ 
      response: answer,
      messageCount: messageCount + 1
    })
    
  } catch (error) {
    console.error('Chat API Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        step: 'error_occurred'
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = await getOrCreateUser(clerkUserId)
    const conversationHistory = await getConversationHistory(userId)
    
    return NextResponse.json({ 
      messages: conversationHistory 
    })
    
  } catch (error) {
    console.error('Get Messages API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
