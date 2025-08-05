# AI Agent with RAG + Plugin System

A TypeScript-based AI agent server featuring Retrieval-Augmented Generation (RAG), plugin execution, and session-based memory management.

## 🚀 Features

- **RAG System**: Semantic document retrieval with embedding-based search
- **Plugin Architecture**: Weather and math evaluation plugins with intent detection
- **Memory Management**: Session-based conversation history
- **Custom Chunking**: Header-aware semantic text chunking
- **Embedding Cache**: Persistent caching for improved performance

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **LLM**: HF Mistral-7B-Instruct-v0.3
- **Vector Search**: Custom implementation with `ml-distance` (cosine similarity)
- **Storage**: JSON-based embedding cache + in-memory session storage

## 📋 Prerequisites

- Node.js 18+
- Hugging Face API key/token

## 🚀 Setup

### 1. Clone & Install
```bash
git clone <your-repo>
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Add your OpenAI API key to .env
HF_TOKEN=your_api_key_here
```

### 3. Add Documents
Place your markdown/text files in `src/data/` directory:
```
src/data/
  ├── document1.md
  ├── document2.md
  └── ...
```

### 4. Build & Run
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## 🔗 API Endpoints

### Chat with Agent
```bash
POST /agent/message
Content-Type: application/json

{
  "message": "What is the weather in London?",
  "session_id": "user_123"
}
```

**Response:**
```json
{
  "reply": "The weather in London is 15°C, Rainy, with 80% humidity.",
  "memory": [...],
  "context": [...],
  "plugin": {
    "used": "weather",
    "result": "Weather in London: 15°C, Rainy, Humidity: 80%",
    "confidence": "0.85"
  }
}
```

## 📚 Sample Commands

### Weather Query
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How hot is it in Bangkok today?",
    "session_id": "weather_test"
  }'
```

### Math Query
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate 25 * 42 + 100",
    "session_id": "math_test"
  }'
```

### Knowledge Query
```bash
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How can I improve LLM performance with markdown?",
    "session_id": "knowledge_test"
  }'
```

### Conversation with Memory
```bash
# First message
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My name is John",
    "session_id": "memory_test"
  }'

# Follow-up (will remember name)
curl -X POST http://localhost:3000/agent/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What was my name again?",
    "session_id": "memory_test"
  }'
```

## 🏗️ Architecture

### System Flow
```
User Query → Intent Detection → Plugin Execution (if needed)
     ↓
Query Embedding → Vector Search → Context Retrieval
     ↓
Memory Retrieval → Prompt Assembly → LLM Generation
     ↓
Response + Memory Update
```

### Plugin System
```typescript
// Intent Detection
const detection = detectPluginIntent(query);

// Confidence Thresholding  
if (detection.confidence > 0.3) {
  const result = await executePlugin(query);
}

// Supported Plugins:
// - Weather: "weather in [location]", "how hot is it in [location]"
// - Math: "calculate [expression]", "solve [expression]"
```

### RAG Workflow
```typescript
// 1. Semantic Chunking (header-aware)
const chunks = createSemanticChunks(content, filename);

// 2. Embedding Generation + Caching
const embedding = await llm.generateEmbedding(chunk.content);

// 3. Similarity Search
const score = cosine_similarity(query_embedding, chunk_embedding) + keyword_boost;

// 4. Relevance Filtering (threshold > 0.4)
const relevantChunks = chunks.filter(c => c.score > 0.4);
```

### Memory Management
```typescript
// Session-based storage
const sessionMemory = conversationMemory.get(sessionId) || [];

// Limited to last 5 messages
const recentMemory = sessionMemory.slice(-5);
```

## 🔧 Configuration

### Embedding Cache
- Location: `src/data/embeddings_cache.json`
- Automatic caching based on content hash
- Persistent across server restarts

### Chunking Parameters
- **Chunk Size**: 50-800 characters
- **Strategy**: Header-aware semantic chunking
- **Context**: Preserves section headers

### Plugin Confidence Thresholds
- **Minimum**: 0.3 (30% confidence required)
- **Weather**: Uses location extraction patterns
- **Math**: Validates mathematical expressions

## 📁 Project Structure
```
src/
├── services/
│   ├── llmService.ts      # OpenAI integration
│   └── ragService.ts      # RAG + chunking logic
├── plugins/
│   └── index.ts           # Weather + Math plugins
├── data/
│   ├── *.md              # Knowledge base documents
│   └── embeddings_cache.json
├── server.ts             # Express server + routes
└── types.ts              # TypeScript interfaces
```

## 🌐 Deployed URL

**Live API**: https://ai-agent-assignment.onrender.com

**Health Check**: `GET /health`

## 🐛 Known Issues

1. **Memory**: Currently in-memory only (use Redis for production)
2. **Weather**: Mock data (replace with real weather API)
3. **Scaling**: Single-instance vector storage (consider distributed DB)

## 🔮 Future Enhancements

- [ ] Redis-based session management
- [ ] Real weather API integration
- [ ] Advanced math expression parsing
- [ ] Document upload endpoint
- [ ] Plugin marketplace system
- [ ] Conversation export/import