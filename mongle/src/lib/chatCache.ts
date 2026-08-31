import type { ChatMessage, ReportStatus } from '../types/report'

const CACHE_PREFIX = 'mongle:ai-chat:v1'
export const CHAT_CACHE_TTL_MS = 3 * 60 * 60 * 1000
const MAX_CACHED_MESSAGES = 40

type ChatCachePayload = {
  expiresAt: number
  messages: ChatMessage[]
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false
  const message = value as Record<string, unknown>
  return typeof message.id === 'string'
    && (message.role === 'ai' || message.role === 'user')
    && typeof message.content === 'string'
}

export function createChatCacheKey(
  userId: string,
  reportStatus: ReportStatus,
  reportId?: string,
) {
  return `${CACHE_PREFIX}:${encodeURIComponent(userId)}:${reportStatus}:${encodeURIComponent(reportId ?? 'none')}`
}

export function readChatCache(key: string, now = Date.now()) {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(key)
    if (!stored) return []
    const payload = JSON.parse(stored) as Partial<ChatCachePayload>
    if (
      typeof payload.expiresAt !== 'number'
      || payload.expiresAt <= now
      || !Array.isArray(payload.messages)
    ) {
      localStorage.removeItem(key)
      return []
    }
    return payload.messages.filter(isChatMessage).slice(-MAX_CACHED_MESSAGES)
  } catch {
    localStorage.removeItem(key)
    return []
  }
}

export function writeChatCache(key: string, messages: ChatMessage[], now = Date.now()) {
  if (typeof window === 'undefined') return

  try {
    if (messages.length === 0) {
      localStorage.removeItem(key)
      return
    }
    const payload: ChatCachePayload = {
      expiresAt: now + CHAT_CACHE_TTL_MS,
      messages: messages.slice(-MAX_CACHED_MESSAGES),
    }
    localStorage.setItem(key, JSON.stringify(payload))
  } catch {
    // Chat still works in memory when browser storage is unavailable.
  }
}

export function removeExpiredChatCaches(now = Date.now()) {
  if (typeof window === 'undefined') return

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index)
    if (!key?.startsWith(CACHE_PREFIX)) continue
    try {
      const payload = JSON.parse(localStorage.getItem(key) ?? '') as Partial<ChatCachePayload>
      if (typeof payload.expiresAt !== 'number' || payload.expiresAt <= now) {
        localStorage.removeItem(key)
      }
    } catch {
      localStorage.removeItem(key)
    }
  }
}
