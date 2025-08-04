// MVP plugin system: weather (mock) and math

export async function weatherPlugin(query: string): Promise<string> {
  // For MVP, just mock a response
  if (/bangalore/i.test(query)) return 'Weather in Bangalore: 28°C, partly cloudy.';
  return 'Weather data not available.';
}

export async function mathPlugin(query: string): Promise<string> {
  // Extract and evaluate simple math expressions
  try {
    const match = query.match(/([-+*/\d\s.]+)/);
    if (match) {
      // eslint-disable-next-line no-eval
      const result = eval(match[1]);
      return `Result: ${result}`;
    }
  } catch {}
  return 'Could not evaluate math expression.';
}

// Intent detection (MVP: keyword based)
export function detectPluginIntent(query: string): 'weather' | 'math' | null {
  if (/weather|temperature|rain|forecast/i.test(query)) return 'weather';
  if (/\d+\s*[-+*/]\s*\d+/.test(query)) return 'math';
  return null;
}
