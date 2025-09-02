import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if Clerk auth is working
    const { userId: clerkUserId } = getAuth(request)
    
    if (!clerkUserId) {
      return NextResponse.json({ 
        error: 'Unauthorized - No Clerk user ID found',
        test: 'clerk_auth_failed'
      }, { status: 401 })
    }

    // Test 2: Check if Supabase can be imported
    let supabaseStatus = 'unknown'
    try {
      const { supabase } = await import('@/lib/supabase')
      supabaseStatus = 'imported_successfully'
    } catch (error) {
      supabaseStatus = `import_failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Test 3: Check if database functions can be imported
    let databaseStatus = 'unknown'
    try {
      const { getOrCreateUser } = await import('@/lib/database')
      databaseStatus = 'imported_successfully'
    } catch (error) {
      databaseStatus = `import_failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Test 4: Check if GLM API can be imported
    let glmStatus = 'unknown'
    try {
      const { getGLMAnswer } = await import('@/lib/glm-api')
      glmStatus = 'imported_successfully'
    } catch (error) {
      glmStatus = `import_failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    return NextResponse.json({
      status: 'test_completed',
      clerk_user_id: clerkUserId,
      supabase_status: supabaseStatus,
      database_status: databaseStatus,
      glm_status: glmStatus,
      message: 'This test endpoint is working. Check the status fields above.'
    })

  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      test: 'general_failure'
    }, { status: 500 })
  }
}
