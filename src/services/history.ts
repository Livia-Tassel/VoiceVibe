export interface HistoryEntry {
  id: string
  timestamp: number
  rawTranscript: string
  refinedPrompt: string
}

const STORAGE_KEY = 'voicevibe-history'
const MAX_ENTRIES = 100

export function getHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore parsing errors
  }
  return []
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): HistoryEntry {
  const history = getHistory()
  const newEntry: HistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...entry,
  }
  history.unshift(newEntry)
  if (history.length > MAX_ENTRIES) {
    history.length = MAX_ENTRIES
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  return newEntry
}

export function deleteHistoryEntry(id: string): void {
  const history = getHistory().filter(e => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
