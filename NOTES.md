# AI Agent Development Notes

## What was AI-generated vs Hand-written

### AI-Generated Components:
- **Initial project structure** - Copilot suggested Express setup and TypeScript configurations
- **Basic embedding generation logic** - Used Copilot for OpenAI API integration patterns
- **Cosine similarity calculation** - Leveraged `ml-distance` library suggestions
- **Basic plugin detection patterns** - Regex patterns for weather/math intent detection
- **Server routing boilerplate** - Express middleware and error handling structures

### Hand-Written/Custom Logic:
- **Semantic chunking strategy** - Custom algorithm for preserving context with headers
- **RAG retrieval scoring** - Combined semantic + keyword matching with custom weights
- **Plugin execution flow** - Custom confidence thresholding and routing logic
- **Memory management** - Session-based conversation storage and retrieval
- **Prompt engineering** - All system prompts designed from scratch
- **Response formatting** - Clean output without meta-commentary

## Bugs Faced and Solutions

### 1. Context Irrelevance Issue
**Problem**: RAG system was retrieving irrelevant chunks (e.g., TypeScript content for weather queries)
**Solution**: 
- Increased similarity threshold from 0.3 to 0.4+
- Implemented better filtering to return empty context when no relevant chunks found
- Added keyword matching boost for better relevance scoring

### 2. Response Quality Problems
**Problem**: Responses included verbose meta-commentary about system reasoning
**Solution**:
- Redesigned prompt structure with clear sections and factual instructions
- Removed explanatory text about plugin usage and context filtering
- Implemented different prompt templates based on context availability

### 3. Location Parsing in Weather Plugin
**Problem**: User input "how hot is it in thailand these days" was passing "thailand these days" as location
**Solution**:
- Enhanced regex patterns to extract clean location names
- Added temporal keyword filtering ("today", "tomorrow", "these days", etc.)
- Improved location normalization logic

### 4. Memory Duplication Bug
**Problem**: Conversation history was being duplicated in memory storage
**Solution**: 
- Fixed session management to properly track unique conversation turns
- Implemented proper memory cleanup and deduplication

### 5. Chunking Specificity Issues
**Problem**: Paragraph-based chunking was losing semantic coherence
**Solution**:
- Implemented header-aware chunking that preserves topic boundaries
- Added context preservation (headers included in chunks)
- Set better size limits (50-800 chars) with semantic boundaries

## Agent Architecture & Flow

### RAG Workflow:
```
1. User Query → Embedding Generation
2. Vector Search (cosine similarity + keyword matching)
3. Threshold Filtering (score > 0.4)
4. Top-3 Chunk Selection
5. Context Injection into Prompt
```

### Plugin Routing:
```
1. Intent Detection (regex patterns + confidence scoring)
2. Confidence Thresholding (> 0.3)
3. Plugin Execution (weather/math)
4. Result Integration into LLM Prompt
5. Response Generation
```

### Memory Integration:
```
1. Session-based Storage (in-memory Map)
2. Last 5 messages per session
3. Memory injection into system prompt
4. Conversation context preservation
```

### System Prompt Structure:
```markdown
You are a helpful assistant with access to:
- conversation memory
- plugin results (weather, math)  
- relevant documents

Respond only with factual information.
Use plugin results if available.

---
Conversation History: [...]
---
Plugin Results: [...]
---
Relevant Context: [...]  
---
User Message: [...]
```

## Performance Optimizations

### Embedding Cache:
- Implemented persistent JSON cache for embeddings
- Reduces redundant API calls and improves response time
- Cache invalidation based on content hash

### Chunking Strategy:
- Header-aware semantic chunking preserves context
- Size optimization (50-800 chars) balances specificity vs performance
- Metadata preservation for better retrieval

### Memory Management:
- Limited to 5 messages per session to control prompt size
- Efficient in-memory storage with session cleanup

## Technical Decisions

### Vector Search Implementation:
- Chose `ml-distance` with cosine similarity over external vector DBs
- Custom scoring: `semantic_score + keyword_boost * 0.1 + technical_terms * 0.15`
- In-memory vector storage for simplicity and speed

### Plugin System Design:
- Confidence-based routing prevents false positives
- Extensible architecture for adding new plugins
- Clear separation between intent detection and execution

### Chunking Approach:
- Rejected simple paragraph splitting for semantic chunking
- Header preservation maintains document structure
- Context-aware chunking improves retrieval relevance

## Areas for Improvement

1. **Vector Storage**: Could migrate to persistent vector DB for larger datasets
2. **Plugin Expansion**: Add more sophisticated plugins (calculator, search, etc.)
3. **Caching**: Implement Redis for distributed memory management
4. **Monitoring**: Add logging and performance metrics
5. **Error Handling**: More robust error recovery and fallback strategies