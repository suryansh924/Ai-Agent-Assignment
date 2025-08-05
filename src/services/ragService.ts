import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { similarity } from 'ml-distance';
import { LLMService } from './llmService';

const DATA_DIR = path.join(__dirname, '../../src/data');
const EMBEDDINGS_CACHE_FILE = path.join(DATA_DIR, 'embeddings_cache.json');

const llm = new LLMService();

export interface Chunk {
  id: string;
  content: string;
  embedding: number[];
  source: string;
  context?: string; // Add header/section context
  metadata?: {
    headings: string[];
    section: string;
  };
}

function hashContent(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

export async function buildChunkStore(): Promise<Chunk[]> {
  console.log('Building chunk store...');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let cachedEmbeddings: Record<string, { embedding: number[] }> = {};
  if (fs.existsSync(EMBEDDINGS_CACHE_FILE)) {
    try {
      cachedEmbeddings = JSON.parse(fs.readFileSync(EMBEDDINGS_CACHE_FILE, 'utf8'));
      console.log(`Loaded cache: ${Object.keys(cachedEmbeddings).length} items`);
    } catch (err) {
      console.warn('Failed to load embeddings cache:', err);
    }
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.md') || f.endsWith('.txt'));
  const chunks: Chunk[] = [];
  let newEmbeddings = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Use semantic chunking instead of crude splitting
    const semanticChunks = createSemanticChunks(content, file);
    
    for (const chunk of semanticChunks) {
      const chunkKey = `${file}_${hashContent(chunk.content)}`;

      let embedding: number[];
      if (cachedEmbeddings[chunkKey]) {
        embedding = cachedEmbeddings[chunkKey].embedding;
      } else {
        try {
          embedding = await llm.generateEmbedding(chunk.content);
          cachedEmbeddings[chunkKey] = { embedding };
          newEmbeddings++;
          console.log(`Generated embedding for: ${chunkKey}`);
        } catch (error) {
          console.error(`Error generating embedding for chunk in ${file}:`, error);
          continue;
        }
      }

      chunks.push({
        id: chunkKey,
        content: chunk.content,
        embedding,
        source: file,
        context: chunk.context,
        metadata: chunk.metadata
      });
    }
  }

  if (newEmbeddings > 0) {
    try {
      fs.writeFileSync(EMBEDDINGS_CACHE_FILE, JSON.stringify(cachedEmbeddings, null, 2));
      console.log(`💾 Saved ${newEmbeddings} new embeddings to cache`);
    } catch (error) {
      console.warn('Failed to save embeddings cache:', error);
    }
  }

  console.log(`Done. Total chunks: ${chunks.length}`);
  return chunks;
}

export function calculateSimilarity(embeddingA: number[], embeddingB: number[]): number {
  try {
    return similarity.cosine(embeddingA, embeddingB);
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return 0;
  }
}

export async function getRelevantChunks(query: string, chunks: Chunk[], topN = 3): Promise<Chunk[]> {
  try {
    const queryEmbedding = await llm.generateEmbedding(query);

    const queryWords = query.toLowerCase().split(/\s+/);

    const scoredChunks = chunks.map(chunk => {
      const semanticScore = calculateSimilarity(queryEmbedding, chunk.embedding);
      const keywordMatches = queryWords.filter(w => w.length > 2 && chunk.content.toLowerCase().includes(w)).length;
      const keywordBoost = keywordMatches * 0.1;

      return {
        ...chunk,
        score: semanticScore + keywordBoost,
        semanticScore,
        keywordMatches,
      };
    });

    // Filter by threshold and return empty if no relevant chunks
    const filteredChunks = scoredChunks.filter(chunk => chunk.score > 0.4);

    return filteredChunks.length > 0
      ? filteredChunks.sort((a, b) => b.score - a.score).slice(0, topN)
      : [];
  } catch (error) {
    console.error('Error in getRelevantChunks:', error);
    return [];
  }
}


// Function to create semantic chunks from content
// This function splits content into meaningful chunks while preserving context || need to read more about it
function createSemanticChunks(content: string, filename: string): Array<{content: string, context?: string, metadata?: {headings: string[], section: string}}> {
  const chunks: Array<{content: string, context?: string, metadata?: {headings: string[], section: string}}> = [];
  
  // Split by major headers (# and ##) to preserve topic boundaries
  const sections = content.split(/\n(?=#{1,2}\s+)/);
  
  for (const section of sections) {
    const lines = section.split('\n');
    const header = lines[0] || '';
    
    // Group related paragraphs with their header context
    let currentChunk = header + '\n\n';
    let chunkSize = header.length + 2;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // If adding this line would exceed limit, save current chunk
      if (chunkSize + line.length > 800 && currentChunk.trim() !== header.trim()) {
        if (currentChunk.trim().length > 50) {
          chunks.push({ 
            content: currentChunk.trim(),
            context: header.trim(),
            metadata: {
              headings: [header.trim()],
              section: filename
            }
          });
        }
        currentChunk = header + '\n\n' + line + '\n';
        chunkSize = header.length + line.length + 3;
      } else {
        currentChunk += line + '\n';
        chunkSize += line.length + 1;
      }
    }
    
    // Add final chunk if it has substantial content
    if (currentChunk.trim().length > 50) {
      chunks.push({ content: currentChunk.trim() });
    }
  }
  
  return chunks;
}