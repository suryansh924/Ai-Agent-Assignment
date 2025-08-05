# AI Agent Development Notes

## What was AI-generated vs Hand-written

### AI-Generated Code:
- Initial project structure
- TypeScript configurations
- Basic Express server setup
- Mock Weather and Math regex patterns and plugin
- RAG Service   
- RAG & LLM Fallbacks

### Hand-written Code:
- LLM Service 
- Session memory
- message endpoints
- Prompt engineering

## Bugs Faced and Solutions

### Setup Issues:
- None yet

### Development Issues:
- Hugging Face Inference API issues for JS
- Plugins character detection issues, regex patterns
- LLM response quality issues, formatting, token limit
- Issues with Specific context related responses => Improved with contecxtual semantics chunking

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

### LLM & Embedding Service:
- **Chosen**: Hugging Face Inference API => Mistral-7B-Instruct-v0.3 | MiniLM-L6-v2
- **Reason**: Free tier, good performance, and easy to use

## Agent Flow

1. **Message Reception**: POST /agent/message
2. **Memory Retrieval**: Get last 2 messages from session
3. **RAG Context**: Embed query → retrieve top 3 chunks
4. **Plugin Detection**: Check for plugin keywords/intents
5. **Plugin Execution**: If detected, execute relevant plugins
6. **Prompt Assembly**: Combine system prompt + memory + context + plugin results
7. **LLM Call**: Send to LLM with assembled prompt
8. **Response**: Return agent response and update session memory