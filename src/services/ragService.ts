import fs from 'fs';
import path from 'path';
import { LLMService } from './llmService';

const DATA_DIR = path.join(__dirname, '../data');
const llm = new LLMService();

export interface Chunk {
  id: string;
  content: string;
  embedding: number[];
  source: string;
}

// Load and chunk all .md/.txt files in data/ (MVP: chunk by paragraph)
export async function buildChunkStore(): Promise<Chunk[]> {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
  const chunks: Chunk[] = [];
  let chunkId = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
    const paragraphs = content.split(/\n\s*\n/).filter(Boolean);
    for (const para of paragraphs) {
      const embedding = await llm.generateEmbedding(para);
      chunks.push({
        id: `chunk_${chunkId++}`,
        content: para,
        embedding,
        source: file
      });
    }
  }
  return chunks;
}

// Cosine similarity (MVP, no external lib)
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-8);
}

// Retrieve top N relevant chunks for a query
export async function getRelevantChunks(query: string, chunks: Chunk[], topN = 3): Promise<Chunk[]> {
  const queryEmbedding = await llm.generateEmbedding(query);
  return chunks
    .map(chunk => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
