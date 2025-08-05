// Enhanced Plugin System with NLP-based Intent Detection

export interface PluginResult {
  pluginUsed: string;
  result: string;
  confidence: number;
}

export interface IntentDetectionResult {
  intent: string;
  confidence: number;
  entities: { [key: string]: string };
}

// Enhanced intent detection using pattern matching and entity extraction
export function detectPluginIntent(query: string): IntentDetectionResult {
  const lowerQuery = query.toLowerCase();

  // Weather intent patterns with improved location extraction
  const weatherPatterns = [
    /weather.*(?:in|for|at)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/,
    /what.*weather.*(?:in|for|at)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/,
    /temperature.*(?:in|for|at)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/,
    /(?:hot|cold|warm).*(?:in|at)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/,
    /forecast.*(?:for|in|at)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/,
    /climate.*(?:in|for|at)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/,
    /(?:rain|snow|sunny|cloudy).*(?:in|at)\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/,
    /weather\s+([a-zA-Z\s]+?)(?:\s+(?:today|tomorrow|now|these\s+days)|\?|$)/
  ];

  // Math intent patterns with better expression detection
  const mathPatterns = [
    /(?:calculate|compute|solve|what\s+is)\s+((?:[0-9\+\-\*\/\.\s\(\)]|plus|minus|times|divided\s+by)+)/,
    /([0-9\+\-\*\/\.\s\(\)]+)\s*=?\s*(?:\?|$)/,
    /(?:add|sum)\s+([0-9\s\+]+)/,
    /(?:subtract|minus)\s+([0-9\s\-]+)/,
    /(?:multiply|times)\s+([0-9\s\*]+)/,
    /(?:divide|divided\s+by)\s+([0-9\s\/]+)/,
    /math.*(?:problem|calculation).*?([0-9\+\-\*\/\.\s\(\)]+)/,
    /arithmetic.*([0-9\+\-\*\/\.\s\(\)]+)/
  ];

  // Enhanced keyword lists
  const weatherKeywords = [
    'weather', 'temperature', 'forecast', 'rain', 'snow', 'sunny', 'cloudy',
    'humid', 'wind', 'climate', 'hot', 'cold', 'warm', 'cool', 'degrees',
    'celsius', 'fahrenheit', 'precipitation', 'humidity', 'conditions'
  ];

  const mathKeywords = [
    'calculate', 'solve', 'compute', 'add', 'subtract', 'multiply', 'divide',
    'math', 'arithmetic', 'equation', 'sum', 'product', 'difference', 'quotient',
    'plus', 'minus', 'times', 'equals', 'result', 'answer'
  ];

  // Check weather patterns
  for (const pattern of weatherPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const location = match[1]?.trim() || 'unknown';
      const keywordScore = weatherKeywords.reduce((score, keyword) =>
        lowerQuery.includes(keyword) ? score + 0.1 : score, 0
      );
      return {
        intent: 'weather',
        confidence: Math.min(0.8 + keywordScore, 1.0),
        entities: { location }
      };
    }
  }

  // Check math patterns
  for (const pattern of mathPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const expression = match[1]?.trim() || query.trim();
      const keywordScore = mathKeywords.reduce((score, keyword) =>
        lowerQuery.includes(keyword) ? score + 0.1 : score, 0
      );
      return {
        intent: 'math',
        confidence: Math.min(0.8 + keywordScore, 1.0),
        entities: { expression }
      };
    }
  }

  // Fallback: keyword-based detection with lower confidence
  const weatherScore = weatherKeywords.reduce((score, keyword) =>
    lowerQuery.includes(keyword) ? score + 0.15 : score, 0
  );

  const mathScore = mathKeywords.reduce((score, keyword) =>
    lowerQuery.includes(keyword) ? score + 0.15 : score, 0
  );

  // Check for mathematical expressions (numbers and operators)
  const mathExpressionScore = /[0-9]+[\+\-\*\/][0-9]+/.test(lowerQuery) ? 0.3 : 0;

  if (weatherScore > 0.2) {
    // Try to extract location from context
    const locationMatch = lowerQuery.match(/(?:in|for|at)\s+([a-zA-Z\s]+)/);
    const location = locationMatch?.[1]?.trim() || 'current location';

    return {
      intent: 'weather',
      confidence: Math.min(weatherScore, 0.7),
      entities: { location }
    };
  }

  if (mathScore > 0.2 || mathExpressionScore > 0) {
    return {
      intent: 'math',
      confidence: Math.min(mathScore + mathExpressionScore, 0.7),
      entities: { expression: query }
    };
  }

  return {
    intent: 'general',
    confidence: 0.0,
    entities: {}
  };
}

// Enhanced weather plugin with better location extraction
export async function weatherPlugin(location: string): Promise<string> {
  // Simulate API call with realistic response
  const cleanLocation = location.replace(/[^a-zA-Z\s]/g, '').trim() || 'current location';

  // Mock weather data based on common locations
  const mockWeatherData: { [key: string]: any } = {
    'new york': { temp: 22, condition: 'Partly cloudy', humidity: 65 },
    'london': { temp: 15, condition: 'Rainy', humidity: 80 },
    'tokyo': { temp: 28, condition: 'Sunny', humidity: 70 },
    'paris': { temp: 18, condition: 'Overcast', humidity: 75 },
    'bangalore': { temp: 26, condition: 'Partly cloudy', humidity: 68 },
    'current location': { temp: 25, condition: 'Clear', humidity: 60 }
  };

  const locationKey = cleanLocation.toLowerCase();
  const weather = mockWeatherData[locationKey] || mockWeatherData['current location'];

  return `Weather in ${cleanLocation}: ${weather.temp}°C, ${weather.condition}, Humidity: ${weather.humidity}%. This is simulated weather data.`;
}

// Enhanced math plugin with better expression parsing
export async function mathPlugin(expression: string): Promise<string> {
  try {
    // Clean and validate the expression
    const cleanExpr = expression
      .replace(/[^0-9\+\-\*\/\.\(\)\s]/g, '') // Only allow math characters
      .replace(/\s+/g, ''); // Remove spaces

    if (!cleanExpr) {
      return "I couldn't find a valid mathematical expression to calculate.";
    }

    // Basic validation for security
    if (/[a-zA-Z]/.test(cleanExpr) || cleanExpr.includes('..')) {
      return "Invalid mathematical expression. Please use only numbers and basic operators (+, -, *, /, parentheses).";
    }

    // Evaluate the expression safely
    const result = Function(`"use strict"; return (${cleanExpr})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      return "The calculation resulted in an invalid number.";
    }

    return `${cleanExpr} = ${result}`;
  } catch (error) {
    return `Error calculating "${expression}": Please check your mathematical expression.`;
  }
}

// Main plugin execution with confidence thresholding
export async function executePlugin(query: string): Promise<PluginResult | null> {
  const detection = detectPluginIntent(query);

  // Only execute plugin if confidence is above threshold
  if (detection.confidence < 0.3) {
    return null;
  }

  try {
    let result: string;

    switch (detection.intent) {
      case 'weather':
        result = await weatherPlugin(detection.entities.location || 'current location');
        break;
      case 'math':
        result = await mathPlugin(detection.entities.expression || query);
        break;
      default:
        return null;
    }

    return {
      pluginUsed: detection.intent,
      result,
      confidence: detection.confidence
    };
  } catch (error) {
    console.error(`Plugin execution error for ${detection.intent}:`, error);
    return {
      pluginUsed: detection.intent,
      result: `Sorry, there was an error executing the ${detection.intent} plugin.`,
      confidence: detection.confidence
    };
  }
}

// Export for debugging and testing
export { detectPluginIntent as _detectPluginIntent };
