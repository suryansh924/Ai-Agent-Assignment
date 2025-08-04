import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { Router } from 'express';


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

// --- MVP /agent/message endpoint ---
import { LLMService } from './services/llmService';
import { addMessageToSession, getLastMessages } from './services/sessionMemory';
import { buildChunkStore, getRelevantChunks } from './services/ragService';
import { detectPluginIntent, weatherPlugin, mathPlugin } from './plugins';

let chunksCache: any[] = [];
buildChunkStore().then(chunks => { chunksCache = chunks; });

app.post('/agent/message', async (req, res) => {
    const { message, session_id } = req.body;
    if (!message || !session_id) return res.status(400).json({ error: 'Missing message or session_id' });

    addMessageToSession(session_id, 'user', message);
    const memory = getLastMessages(session_id, 2);
    const relevantChunks = await getRelevantChunks(message, chunksCache, 3);

    // Plugin detection and execution
    let pluginResult = '';
    const intent = detectPluginIntent(message);
    if (intent === 'weather') pluginResult = await weatherPlugin(message);
    if (intent === 'math') pluginResult = await mathPlugin(message);

    // Minimal prompt engineering
    const prompt = `System: You are a helpful AI agent.\n\nRecent memory:\n${memory.map(m => m.role+': '+m.content).join('\n')}\n\nContext:\n${relevantChunks.map(c => c.content).join('\n---\n')}\n\nPlugin output:\n${pluginResult}\n\nUser: ${message}\nAssistant:`;

    const llm = new LLMService();
    const reply = await llm.generateResponse(prompt);
    addMessageToSession(session_id, 'assistant', reply);
    res.json({ reply, memory, context: relevantChunks.map(c => c.content), plugin: pluginResult });
});


app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});



app.listen(PORT, ()=>{
    console.log("Server is running on port " + PORT);
});

