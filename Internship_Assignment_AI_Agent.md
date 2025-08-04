# 🧪 Internship Assignment — Backend AI Agent + Plugin System + Hosted Deployment

Thank you for applying. To move forward, you are required to complete the following **1-day technical challenge**. This task is designed to assess your backend engineering depth, LLM tooling experience, vibe coding fluency, and most importantly—your ownership and ability to deliver under pressure.

---

## 🚀 Task: Build a Pluggable AI Agent Server (with RAG + Memory)

You must build a backend system in **TypeScript (Node.js)** that does the following:

---

## 🧱 System Requirements

### 🧠 Agent Core (LLM-based)

- Expose an endpoint:  
  `POST /agent/message`  
  Accepts a `message` and a `session_id`, returns the AI's reply
- Use **OpenAI** (or Claude or local) to generate the response
- Use **memory per session** (store prior messages for each session_id)

### 📚 Contextual RAG (Retrieval-Augmented Generation)

- Store at least 5 markdown/text files (e.g. tech docs, blog posts, etc.)
- On each message:
  - Embed the message
  - Retrieve top 3 relevant chunks from your store
  - Feed them into the LLM prompt as system context

### 🔌 Plugin Execution System (Basic)

- Support the agent triggering simple plugins based on intent  
  Example: if user says "search weather in Bangalore", the agent should:
  - Parse that intent
  - Call a plugin like `weatherPlugin(query)`
  - Inject the result into the final LLM response
- Implement at least **two plugins**:
  1. Weather (use any public weather API or mock it)
  2. Math evaluator (`2 + 2 * 5 = 12`)

### 🧠 Prompt Engineering

- You **must write your own system prompts**.
- Prompt must include:
  - System instructions for the agent
  - Memory summary (last 2 messages)
  - Retrieved chunks from vector DB
  - Plugin outputs if used

---

## ⚙️ Tech Stack

- Language: **TypeScript** (mandatory)
- Framework: Express/Fastify/NestJS (your choice)
- Vector DB: You may **not** use FAISS (not available in TS).  
  Instead, choose one of:
  - ChromaDB (via REST)
  - Pinecone or Weaviate (hosted)
  - `ml-distance`, `vectorious`, or custom cosine similarity in TypeScript (recommended)
  - ✅ You may also **build your own vector search logic** using JSON and math
- LLM: OpenAI GPT‑4 or Claude (or local if you prefer)
- Hosting: Render, Railway, Vercel, or Replit (must be live)
- Cursor/ChatGPT allowed for support, but you must **clearly mark what’s AI-generated**

---

## 📂 Submission Requirements

1. GitHub repo with clean, typed code
2. `README.md`:
   - Setup steps
   - Sample curl/Postman commands
   - Agent architecture and flow
3. `NOTES.md`:
   - What was AI-generated and what wasn’t
   - What bugs you faced and how you solved them
   - How your agent routes plugin calls + embeds memory + context
4. **Live deployed URL** with working endpoints

---

## ✅ Evaluation Criteria

| Area                  | What We’re Looking For                                        |
| --------------------- | ------------------------------------------------------------- |
| **Code Quality**      | Typed, modular, scalable, no mess                             |
| **Prompt Design**     | Custom system prompts with memory, plugin & context injection |
| **Plugin Logic**      | Clear agent → plugin → LLM loop                               |
| **RAG Workflow**      | Solid retrieval setup (chunking, embedding, query flow)       |
| **Vibe Coding Depth** | Knowing when to guide AI vs when to override                  |
| **Ownership**         | Speed, clarity, docs, and full working app                    |

---

## ⏰ Deadline: 24 hours from now

Final cutoff for submission: **[8th August: 4 days from assignment sent]**

We’re looking for **builders**—not just coders. If you ace this, we’ll know you can contribute to real systems fast.
