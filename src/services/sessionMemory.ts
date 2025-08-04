// Simple in-memory session store for MVP
// sessionId -> [{ role, content, timestamp }]
export const sessionMemory: Record<string, Array<{ role: 'user' | 'assistant', content: string, timestamp: string }>> = {};

export function addMessageToSession(sessionId: string, role: 'user' | 'assistant', content: string) {
  if (!sessionMemory[sessionId]) sessionMemory[sessionId] = [];
  sessionMemory[sessionId].push({ role, content, timestamp: new Date().toISOString() });
  // Keep only last 10 messages for MVP
  if (sessionMemory[sessionId].length > 10) sessionMemory[sessionId].shift();
}

export function getLastMessages(sessionId: string, n = 2) {
  return (sessionMemory[sessionId] || []).slice(-n);
}
