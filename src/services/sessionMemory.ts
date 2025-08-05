// Simple in-memory session store for now
// sessionId -> [{ role, content, timestamp }]
export const sessionMemory: Record<string, Array<{ role: 'user' | 'assistant', content: string, timestamp: string }>> = {};

export function addMessageToSession(sessionId: string, role: 'user' | 'assistant', content: string) {
  if (!sessionMemory[sessionId]) sessionMemory[sessionId] = [];
  sessionMemory[sessionId].push({ role, content, timestamp: new Date().toISOString() });
  // Keeping only last 10 messages for now
  if (sessionMemory[sessionId].length > 10) sessionMemory[sessionId].shift();
}

export function getLastMessages(sessionId: string, n = 2) {
  return (sessionMemory[sessionId] || []).slice(-n);
}
