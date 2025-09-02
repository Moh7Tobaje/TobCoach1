# Top Coach Chat Integration Setup

This document explains how to set up the integrated chat system with Clerk authentication and Supabase database.

## Features

- **Clerk Authentication**: Secure user authentication and management
- **Supabase Database**: Persistent storage for messages and user data
- **GLM AI Integration**: Real AI responses using the GLM-4 model
- **Conversation History**: Load and save conversation history
- **User Profiles**: Personalized experience for each user
- **Auto-summarization**: Automatic fitness profile updates every 4 messages

## Prerequisites

1. **Clerk Account**: Set up authentication
2. **Supabase Project**: Database for storing messages and user data
3. **GLM API Key**: For AI responses

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `database-schema.sql`
4. This will create the necessary tables and security policies

### 3. Environment Variables

Create a `.env.local` file in your project root:

```env
SUPABASE_URL=https://gqyntmtuaylixkexpnbr.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxeW50bXR1YXlsaXhrZXhwbmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk5ODk3NCwiZXhwIjoyMDcwNTc0OTc0fQ.VN4kwBki0pKI_yp5xISmW5UrxUgletZHVrdflpFUFqQ
GLM_API_KEY=a54685e27a454d7daae357dde1202681.FwhlKmDwaJVrJM6m
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### 4. Database Schema

The system uses three main tables:

- **users**: Stores user information linked to Clerk IDs
- **messages**: Stores all chat messages
- **conversations**: Stores conversation summaries and important info

### 5. API Endpoints

- `POST /api/chat`: Send a message and get AI response
- `GET /api/chat`: Retrieve conversation history

### 6. Running the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000/chat` to access the chat interface.

## How It Works

### Authentication Flow
1. User signs in via Clerk
2. System creates/retrieves user record in Supabase
3. User can access personalized chat

### Message Flow
1. User sends message
2. Message saved to database
3. GLM API generates response
4. Response saved to database
5. Every 4 messages, conversation is summarized

### Data Persistence
- All messages are stored in Supabase
- Conversation history is loaded on page refresh
- User profiles are maintained across sessions

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Clerk Authentication**: Secure user management
- **API Key Protection**: GLM API key stored securely

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify Supabase URL and key
   - Check if tables exist in database

2. **Authentication Issues**
   - Ensure Clerk is properly configured
   - Check user permissions

3. **GLM API Errors**
   - Verify API key is valid
   - Check API endpoint availability

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG=true
```

## API Response Format

```json
{
  "response": "AI generated response",
  "messageCount": 5
}
```

## Database Queries

### Get User Messages
```sql
SELECT * FROM messages 
WHERE user_id = 'user-uuid' 
ORDER BY timestamp DESC;
```

### Get Conversation Summary
```sql
SELECT important_info FROM conversations 
WHERE user_id = 'user-uuid' 
ORDER BY date DESC 
LIMIT 1;
```

## Performance Considerations

- Messages are paginated for large conversations
- Summaries are generated every 4 messages to reduce API calls
- Database indexes optimize query performance

## Future Enhancements

- Voice input/output
- File attachments
- Real-time typing indicators
- Message reactions
- Conversation export
- Advanced analytics
