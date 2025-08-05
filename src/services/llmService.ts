import { InferenceClient } from "@huggingface/inference";

// Hugging Face LLM and Embedding Service with proper Inference Client
export class LLMService {
  private client: InferenceClient;
  private readonly chatModel = "microsoft/DialoGPT-medium";
  private readonly embeddingModel = "sentence-transformers/all-MiniLM-L6-v2";

  constructor() {
    const apiKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      console.warn('No HF_TOKEN found in environment variables. Using fallback responses.');
      this.client = new InferenceClient(); // Will use fallback
    } else {
      this.client = new InferenceClient(apiKey);
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      console.log('Generating HF response for prompt:', prompt.substring(0, 100) + '...');

      // Parse the prompt to extract user message and context
      const lines = prompt.split('\n');
      const userIndex = lines.findIndex(line => line.startsWith('User:'));
      const userMessage = userIndex !== -1 ? lines[userIndex].replace('User:', '').trim() : prompt;

      // Extract memory for conversational context
      const memoryStart = prompt.indexOf('Recent memory:');
      const contextStart = prompt.indexOf('Context:');
      const pluginStart = prompt.indexOf('Plugin output:');

      let conversationHistory: Array<{ role: string, content: string }> = [];

      if (memoryStart !== -1) {
        const memorySection = prompt.substring(memoryStart, contextStart > 0 ? contextStart : pluginStart > 0 ? pluginStart : prompt.length);
        const memoryLines = memorySection.split('\n').slice(1); // Skip "Recent memory:" line

        for (const line of memoryLines) {
          if (line.trim() && !line.startsWith('Context:') && !line.startsWith('Plugin output:')) {
            if (line.startsWith('user:') || line.startsWith('assistant:')) {
              const [role, ...contentParts] = line.split(':');
              conversationHistory.push({
                role: role.trim(),
                content: contentParts.join(':').trim()
              });
            }
          }
        }
      }

      // Use chat completion for better conversational AI
      const messages = [
        {
          role: "system" as const,
          content: "You are a helpful AI assistant that can answer questions about markdown, provide weather information, and perform math calculations. Use the provided context and plugin results to give accurate responses."
        },
        ...conversationHistory.slice(-4).map(msg => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        {
          role: "user" as const,
          content: userMessage
        }
      ];

      const response = await this.client.chatCompletion({
        model: "mistralai/Mistral-7B-Instruct-v0.3", // Better than DialoGPT for chat completion
        messages,
        max_tokens: 1000,
        temperature: 0.7
      });

      const result = response.choices[0]?.message?.content;
      if (result && result.trim()) {
        console.log('✅ Successfully generated HF response');
        return result.trim();
      } else {
        throw new Error('Empty response from HF API');
      }
    } catch (error: any) {
      console.error('HuggingFace LLM error:', error.message || error);

      // Check for specific error types
      if (error.message?.includes('Invalid username or password') || error.message?.includes('401')) {
        console.warn('⚠️ Invalid HF API key - using fallback response');
      } else if (error.message?.includes('429') || error.httpResponse?.status === 429) {
        console.warn('⚠️ HF API rate limit exceeded - using fallback response');
      } else {
        console.warn('⚠️ HF API error - using fallback response');
      }

      // Fallback to simple responses
      return this.generateFallbackResponse(prompt);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      console.log('Generating HF embedding for:', text.substring(0, 50) + '...');

      const response = await this.client.featureExtraction({
        model: this.embeddingModel,
        inputs: text
      });

      // Handle different response formats
      if (Array.isArray(response) && response.length > 0) {
        if (Array.isArray(response[0])) {
          console.log('✅ Successfully generated HF embedding');
          return response[0] as number[];
        }
        console.log('✅ Successfully generated HF embedding');
        return response as number[];
      }

      throw new Error('Invalid embedding response format');
    } catch (error: any) {
      console.error('HuggingFace embedding error:', error.message || error);

      // Check for specific error types
      if (error.message?.includes('Invalid username or password') || error.message?.includes('401')) {
        console.warn('⚠️ Invalid HF API key - using fallback embedding');
      } else if (error.message?.includes('429') || error.httpResponse?.status === 429) {
        console.warn('⚠️ HF API rate limit exceeded - using fallback embedding');
      } else {
        console.warn('⚠️ HF API error - using fallback embedding');
      }

      // Fallback to simple embedding
      return this.simpleEmbedding(text);
    }
  }

  private generateFallbackResponse(prompt: string): string {
    const userMessage = prompt.split('User:').pop()?.trim() || prompt;
    const pluginOutput = prompt.match(/Plugin output:\s*(.+)/)?.[1]?.trim() || '';

    if (pluginOutput && pluginOutput !== '') {
      if (pluginOutput.includes('Weather')) {
        return `Based on the current weather data: ${pluginOutput}. Is there anything specific about the weather you'd like to know?`;
      }
      if (pluginOutput.includes('Result:')) {
        return `I've calculated that for you: ${pluginOutput}. The mathematical expression has been evaluated successfully.`;
      }
    }

    if (userMessage.toLowerCase().includes('weather')) {
      return 'I can help you with weather information. Which city would you like the weather for?';
    }

    if (userMessage.toLowerCase().includes('math') || /\d+/.test(userMessage)) {
      return 'I can help with mathematical calculations. What would you like me to calculate?';
    }

    if (userMessage.toLowerCase().includes('markdown')) {
      return 'Markdown is a lightweight markup language designed for easy reading and writing. It uses simple syntax for formatting text.';
    }

    return 'Hello! I\'m an AI assistant. How can I help you today?';
  }

  private simpleEmbedding(text: string): number[] {
    // Improved simple embedding with better distribution
    const embedding = new Array(384).fill(0);
    const words = text.toLowerCase().match(/\w+/g) || [];

    words.forEach((word, wordIndex) => {
      for (let i = 0; i < word.length; i++) {
        const charCode = word.charCodeAt(i);
        const index = (charCode + wordIndex * 37) % 384;
        embedding[index] += 1 / words.length;
      }
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }
}