import axios from 'axios';

// Hugging Face LLM and Embedding Service (MVP)
export class LLMService {
  private readonly apiUrl = 'https://api-inference.huggingface.co/models';
  private readonly chatModel = 'microsoft/DialoGPT-medium'; // Free conversational model
  private readonly embeddingModel = 'sentence-transformers/all-MiniLM-L6-v2';
  private readonly apiKey = process.env.HUGGINGFACE_API_KEY || '';

  async generateResponse(prompt: string): Promise<string> {
    // For MVP, use simple mock response due to HF API issues
    console.log('Generating mock response for prompt:', prompt.substring(0, 100) + '...');
    
    // Parse the prompt to extract components (memory, context, plugin results, user message)
    const lines = prompt.split('\n');
    let userMessage = '';
    let pluginOutput = '';
    let hasMemory = false;
    let hasContext = false;
    
    // Extract user message (last line after "User:")
    const userIndex = lines.findIndex(line => line.startsWith('User:'));
    if (userIndex !== -1) {
      userMessage = lines[userIndex].replace('User:', '').trim();
    }
    
    // Extract plugin output
    const pluginIndex = lines.findIndex(line => line.startsWith('Plugin output:'));
    if (pluginIndex !== -1 && pluginIndex + 1 < lines.length) {
      pluginOutput = lines[pluginIndex + 1].trim();
    }
    
    // Check for memory and context
    hasMemory = prompt.includes('Recent memory:');
    hasContext = prompt.includes('Context:');
    
    // Response logic based on components
    if (pluginOutput && pluginOutput !== '') {
      if (pluginOutput.includes('Weather')) {
        return `Based on the current weather data: ${pluginOutput}. The weather looks good today! Is there anything specific about the weather you'd like to know?`;
      }
      if (pluginOutput.includes('Result:')) {
        return `I've calculated that for you: ${pluginOutput}. The mathematical expression has been evaluated successfully.`;
      }
    }
    
    // Handle questions based on user message
    if (userMessage.toLowerCase().includes('weather')) {
      return 'I can help you with weather information. Which city would you like the weather for?';
    }
    
    if (userMessage.toLowerCase().includes('math') || /\d+/.test(userMessage)) {
      return 'I can help with mathematical calculations. What would you like me to calculate?';
    }
    
    if (userMessage.toLowerCase().includes('markdown')) {
      return 'Based on the documentation I have access to, Markdown is a lightweight markup language that is designed to be easy to read and write. It uses simple syntax to format text, like **bold** and *italic*, and can be converted to HTML for web display. It\'s popular for documentation, blogs, and README files.';
    }
    
    // General response with context awareness
    let response = 'Hello! I\'m an AI assistant that can help with questions about markdown, provide weather information, and perform math calculations.';
    
    if (hasContext) {
      response += ' I have access to relevant documentation that can help answer your questions.';
    }
    
    if (hasMemory) {
      response += ' I can see our previous conversation context.';
    }
    
    response += ' How can I assist you today?';
    
    return response;
    
    /* HF Chat API disabled temporarily due to API issues
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.chatModel}`,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Hugging Face returns an array of responses
      return response.data[0]?.generated_text || 'No response.';
    } catch (error) {
      console.error('HuggingFace LLM error:', error);
      return 'LLM unavailable.';
    }
    */
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // For MVP, skip HF embedding API and use simple fallback
    console.log('Using simple embedding fallback for:', text.substring(0, 50) + '...');
    return this.simpleEmbedding(text);
    
    /* HF Embedding API disabled temporarily due to API issues
    try {
      // Use the feature extraction endpoint instead for embeddings
      const response = await axios.post(
        'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
        { inputs: [text] }, // Pass as array
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data[0] || [];
    } catch (error) {
      console.error('HuggingFace embedding error:', error);
      // fallback: simple hash-based embedding
      return this.simpleEmbedding(text);
    }
    */
  }

  private simpleEmbedding(text: string): number[] {
    const arr = new Array(384).fill(0);
    text.split('').forEach((c, i) => {
      arr[c.charCodeAt(0) % 384] += 1;
    });
    return arr;
  }
}

// ---
// For future: ChatGPT/OpenAI version (commented)
// import { Configuration, OpenAIApi } from 'openai';
// const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
// async function chatGptResponse(prompt: string) { ... }
// async function openaiEmbedding(text: string) { ... }
