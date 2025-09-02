import { supabase } from './supabase'
import { GLMMessage } from './glm-api'

// Get or create user
export async function getOrCreateUser(clerkUserId: string, username?: string): Promise<string> {
  try {
    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw fetchError
    }

    if (existingUser) {
      return existingUser.user_id
    }

    // Create new user if doesn't exist
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        clerk_user_id: clerkUserId,
        username: username || `User_${clerkUserId.slice(0, 8)}`
      })
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return newUser.user_id
  } catch (error) {
    console.error('Error in getOrCreateUser:', error)
    throw error
  }
}

// Save message to database
export async function saveMessage(userId: string, role: 'user' | 'assistant', content: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: userId,
        role: role,
        content: content
      })
      .select()

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error saving message:', error)
    return false
  }
}

// Get conversation history
export async function getConversationHistory(userId: string, limit?: number): Promise<GLMMessage[]> {
  try {
    let query = supabase
      .from("messages")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      const messages: GLMMessage[] = data.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // Return in chronological order
      if (limit) {
        return messages.reverse()
      }
      return messages
    }

    return []
  } catch (error) {
    console.error('Error getting conversation history:', error)
    return []
  }
}

// Get user message count
export async function getUserMessageCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("role", "user")

    if (error) {
      throw error
    }

    return count || 0
  } catch (error) {
    console.error('Error getting user message count:', error)
    return 0
  }
}

// Save conversation with important info
export async function saveConversation(userId: string, conversation: string, importantInfo: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        conversation: conversation,
        important_info: importantInfo
      })
      .select()

    if (error) {
      throw error
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Error saving conversation:', error)
    return false
  }
}

// Get latest important info
export async function getLatestImportantInfo(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("important_info")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null
      }
      throw error
    }

    return data?.important_info || null
  } catch (error) {
    console.error('Error getting latest important info:', error)
    return null
  }
}

// Get username from user ID
export async function getUsername(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("user_id", userId)
      .single()

    if (error) {
      throw error
    }

    return data?.username || "Unknown"
  } catch (error) {
    console.error('Error getting username:', error)
    return "Unknown"
  }
}
