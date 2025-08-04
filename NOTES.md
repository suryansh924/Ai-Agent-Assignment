# AI Agent Development Notes

## What was AI-generated vs Hand-written

### AI-Generated Code:
- [ ] Initial project structure
- [ ] TypeScript configurations
- [ ] Basic Express server setup

### Hand-written Code:
- [ ] Custom business logic
- [ ] Plugin implementations
- [ ] Prompt engineering

## Bugs Faced and Solutions

### Setup Issues:
- None yet

### Development Issues:
- Will update as development progresses

## Architecture Decisions

### Vector Database Choice:
- **Chosen**: Custom vector search with ml-distance
- **Reason**: Simplicity and full control over TypeScript implementation

### Memory Strategy:
- **Chosen**: In-memory session storage (for MVP)
- **Future**: Could migrate to Redis or PostgreSQL

### Plugin Architecture:
- **Pattern**: Simple function-based plugins with keyword matching
- **Future**: Could expand to more sophisticated intent detection

## Agent Flow

1. **Message Reception**: POST /agent/message
2. **Memory Retrieval**: Get last 2 messages from session
3. **RAG Context**: Embed query → retrieve top 3 chunks
4. **Plugin Detection**: Check for plugin keywords/intents
5. **Plugin Execution**: If detected, execute relevant plugins
6. **Prompt Assembly**: Combine system prompt + memory + context + plugin results
7. **LLM Call**: Send to OpenAI with assembled prompt
8. **Response**: Return agent response and update session memory

## Development Timeline

- **Start**: [Current timestamp]
- **Target Completion**: 24 hours