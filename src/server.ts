import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();
const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json());



app.get('/health', (req, res) => {
    res.status(200).json({
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// --- Enhanced /agent/message endpoint ---
import { LLMService } from './services/llmService';
import { addMessageToSession, getLastMessages } from './services/sessionMemory';
import { buildChunkStore, getRelevantChunks } from './services/ragService';
import { executePlugin } from './plugins';

let chunksCache: any[] = [];
buildChunkStore().then(chunks => {
    chunksCache = chunks;
    console.log(`Loaded ${chunks.length} chunks into cache`);
}).catch(error => {
    console.error('Error building chunk store:', error);
});

app.post('/agent/message', async (req, res) => {
    try {
        const { message, session_id } = req.body;
        if (!message || !session_id) {
            return res.status(400).json({ error: 'Missing message or session_id' });
        }

        console.log(`Processing message for session ${session_id}: "${message}"`);

        // Add user message to memory
        addMessageToSession(session_id, 'user', message);
        const memory = getLastMessages(session_id, 4); // Increased context

        // Get relevant context from RAG
        const relevantChunks = await getRelevantChunks(message, chunksCache, 3);
        console.log(`Found ${relevantChunks.length} relevant chunks`);

        // Execute plugins with enhanced detection
        const pluginResult = await executePlugin(message);
        const pluginOutput = pluginResult ?
            `[${pluginResult.pluginUsed.toUpperCase()} PLUGIN (confidence: ${pluginResult.confidence.toFixed(2)})]: ${pluginResult.result}` :
            '';

        // Enhanced prompt engineering with structured format
        const conversationHistory = memory.map(m => `${m.role}: ${m.content}`).join('\n');

        const relevantContext = relevantChunks.length > 0 ?
            relevantChunks.map((c, i) => `- Chunk ${i + 1}: ${c.content.substring(0, 200)}...`).join('\n') :
            'No relevant context found.';

        const pluginResults = pluginResult ?
            `[${pluginResult.pluginUsed.toUpperCase()} PLUGIN]: ${pluginResult.result}` :
            'No plugin results.';

        // Use different prompts based on context availability
        const prompt = relevantChunks.length > 0 ?
            `You are a helpful assistant with access to:
- conversation memory
- plugin results (weather, math)
- relevant documents

Respond only with factual information.
Use the plugin results if available. Do not invent plugin names.

---
Conversation History:
${conversationHistory}
---

Plugin Results:
${pluginResults}

Relevant Context:
${relevantContext}
---
User Message: ${message}` :
            `You are a helpful assistant with access to:
- conversation memory
- plugin results (weather, math)

Respond naturally and directly.

---
Conversation History:
${conversationHistory}
---

Plugin Results:
${pluginResults}
---
User Message: ${message}`;

        const llm = new LLMService();
        const reply = await llm.generateResponse(prompt);
        addMessageToSession(session_id, 'assistant', reply);

        res.json({
            reply,
            memory: memory.map(m => ({ role: m.role, content: m.content })),
            context: relevantChunks.map(c => ({
                content: c.content.substring(0, 300),
                source: c.source,
                score: (c as any).score?.toFixed(3) || 'N/A'
            })),
            plugin: pluginResult ? {
                used: pluginResult.pluginUsed,
                result: pluginResult.result,
                confidence: pluginResult.confidence.toFixed(2)
            } : null
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});



app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});

