import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Debug API is working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG API START ===')
    
    // Test 1: Basic request parsing
    const body = await request.json()
    console.log('Request body:', body)
    
    // Test 2: Check if we can return a response
    const response = {
      status: 'success',
      message: 'Debug API received your message',
      receivedMessage: body.message || 'No message provided',
      timestamp: new Date().toISOString()
    }
    
    console.log('Sending response:', response)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Debug API Error:', error)
    return NextResponse.json({
      error: 'Debug API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
