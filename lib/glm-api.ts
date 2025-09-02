const GLM_API_KEY = 'a54685e27a454d7daae357dde1202681.FwhlKmDwaJVrJM6m'
const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

export interface GLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GLMResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

// Main GLM model for responses
export async function getGLMAnswer(
  systemPrompt: string, 
  context: string, 
  userQuestion: string,
  contextMessages: GLMMessage[] = []
): Promise<string> {
  const headers = {
    "Authorization": `Bearer ${GLM_API_KEY}`,
    "Content-Type": "application/json"
  }
  
  // Build messages with system prompt, context, and user question
  const messages: GLMMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "system", content: `Important Information: ${context}` }
  ]
  
  // Add the last two conversations
  messages.push(...contextMessages)
  
  // Add current user question
  messages.push({ role: "user", content: userQuestion })
  
  const payload = {
    model: "glm-4",
    messages: messages,
    stream: false
  }
  
  try {
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: GLMResponse = await response.json()
    return result.choices[0].message.content.trim()
    
  } catch (error) {
    console.error('GLM API Error:', error)
    return `Error making API request: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Summarization model (smaller, dedicated)
export async function getSummary(conversationHistory: GLMMessage[]): Promise<string> {
  const headers = {
    "Authorization": `Bearer ${GLM_API_KEY}`,
    "Content-Type": "application/json"
  }
  
  const summarizationPrompt = `
    You are a specialized fitness data extraction model. Analyze the conversation and extract the following critical information for bodybuilders:
    
    1. Progress over time (historical development)
    2. Player's weight and its progression
    3. Gender
    4. Problems during training
    5. Equipment availability
    6. Player's height
    7. Injury history (dates and types of injuries)
    8. Player's level and progress (linked to dates)
    9. Health issues
    10. Available training times
    11. Dietary habits and lifestyle
    12. Psychological motivation and commitment
    
    Format your response as a structured JSON with these keys. If information is not available, use "N/A".
  `
  
  const messages: GLMMessage[] = [
    { role: "system", content: summarizationPrompt },
    { role: "user", content: `Conversation history: ${JSON.stringify(conversationHistory, null, 2)}` }
  ]
  
  const payload = {
    model: "glm-4-air",  // Using a smaller model for summarization
    messages: messages,
    stream: false
  }
  
  try {
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result: GLMResponse = await response.json()
    return result.choices[0].message.content.trim()
    
  } catch (error) {
    console.error('GLM Summarization Error:', error)
    return `Error making API request: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}
