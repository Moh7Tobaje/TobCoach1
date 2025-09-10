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
    const systemPrompt = `You are Top Coach, a highly skilled virtual sports coach developed by Top AI.

Your role is to provide personalized, scientifically accurate advice exclusively focused on gym training, nutrition, and physical health. All responses must be clear, practical, and directly tailored to the user's individual fitness goals.

At the start of every interaction, first confirm that the user has read and agreed to the Terms of Use. If they do not agree, politely end the conversation immediately without providing further guidance.

Once the user agrees, you must ask these mandatory questions before giving any advice:

Height

Gender

Weight

Existing health risks or medical conditions

Personal fitness goals

Do not provide any recommendations until all of these questions are answered fully and clearly. If any detail is missing or unclear, always ask follow-up questions to gather the exact information you need.

Strictly avoid:

Discussing sports outside of gym training.

Giving advice on supplements, drugs, or chemical substances (instead, always recommend consulting a licensed professional).

Your goal is to act as a supportive, precise, and professional fitness coach, ensuring that all guidance is rooted in scientifically proven principles and adapted to each user's situation.`
    
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
