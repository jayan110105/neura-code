# WhatsApp Agent Test Messages

These 20 messages are designed to test conversation context, memory, and tool functionality. Send them in sequence to test how well your agent maintains context across multiple interactions.

## Test Messages

### 1. Initial Greeting & Context Setup
```
Hi Neura! I'm planning a trip to Japan next month. Can you help me organize my travel plans?
```

### 2. Todo Creation (should remember Japan trip context)
```
I need to book my flights to Tokyo
```

### 3. Reminder Creation (should use "remind" keyword)
```
Remind me to check visa requirements tomorrow at 2 PM
```

### 4. Note Creation
```
Take a note: Japan uses 100V electrical outlets, need to bring adapter
```

### 5. Bookmark Creation
```
Save this useful site: https://www.japan-guide.com/e/e2164.html - Complete guide to Tokyo attractions
```

### 6. Context Continuation Test
```
What was that website you just saved for me?
```

### 7. Daily Log Entry
```
Today I researched Tokyo neighborhoods and found Shibuya looks perfect for shopping
```

### 8. Todo with Due Date
```
Add a todo to pack my suitcase by March 15th
```

### 9. Context Memory Test
```
What am I planning for next month?
```

### 10. Multiple Tasks
```
I also need to book a hotel in Shibuya and get travel insurance
```

### 11. Reminder with Specific Time
```
Remind me to call the bank about international card usage on March 10th at 10 AM
```

### 12. Note with Details
```
Note: Must try authentic ramen in Tokyo - heard Ichiran and Ippudo are excellent chains
```

### 13. Context Reference Test
```
Add those ramen places to my todo list
```

### 14. Bookmark with Context
```
https://www.timeout.com/tokyo/restaurants/best-ramen-in-tokyo bookmark this as Tokyo ramen guide
```

### 15. Conversational Context Test
```
How many things do I have to do for my trip so far?
```

### 16. New Topic Introduction
```
Actually, I'm also planning a presentation for work about AI trends
```

### 17. Todo for New Topic
```
Research latest AI developments for my presentation
```

### 18. Context Switching Test
```
Back to my Japan trip - what was that electrical outlet thing I noted?
```

### 19. Complex Request
```
Create a reminder for March 5th at 9 AM to start packing, and also note that I should bring comfortable walking shoes
```

### 20. Final Context Test
```
Can you summarize everything I've planned so far?
```

## Expected Behaviors to Test

### Context Continuity
- Agent should remember the Japan trip throughout the conversation
- Should reference previously mentioned details (Tokyo, Shibuya, ramen places)
- Should maintain context even when switching topics

### Tool Usage
- **Todos**: Should create actionable items with appropriate due dates
- **Reminders**: Should only trigger when "remind" keyword is used
- **Notes**: Should capture information for later reference
- **Bookmarks**: Should save URLs with descriptive titles
- **Daily Logs**: Should create special notes for the current day

### Memory Testing
- Should remember previously saved information
- Should be able to reference past todos, notes, and bookmarks
- Should maintain context across multiple tool calls

### Conversation Flow
- Should provide natural, conversational responses
- Should ask clarifying questions when needed
- Should acknowledge completed actions

## Testing Tips

1. **Send messages with delays** to simulate real conversation
2. **Test context limits** by sending more than 10 messages to see if early context is lost
3. **Mix tool usage** with casual conversation
4. **Test error handling** by sending malformed URLs or unclear requests
5. **Verify database storage** by checking your messages table after each interaction

## Success Criteria

✅ Agent maintains context across all 20 messages
✅ Correctly identifies and uses appropriate tools
✅ References previous information accurately
✅ Provides conversational, helpful responses
✅ Stores all messages in database correctly
✅ Handles topic switching gracefully 