import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import type {
  AnalysisResponse,
  ChatRequest,
  ChatResponse,
  ClassificationResponse,
  HealthResponse,
} from '../types/api'

// The app API (FastAPI) listens on 8000. Port 11434 is the LLM provider (Ollama)
// that the *backend* talks to — the browser must never call it directly.
const DEFAULT_BASE_URL = 'http://localhost:8000'

const baseURL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '')

export const apiBaseUrl = baseURL

interface RequestOptions {
  retries?: number
  delayMs?: number
  timeoutMs?: number
}

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function isRetryable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (!error.response) return true
  const status = error.response.status
  return status === 408 || status === 425 || status === 429 || status >= 500
}

function readDetail(data: unknown): string | undefined {
  if (typeof data === 'string') {
    const text = data.trim()
    if (!text) return undefined
    if (/<(!doctype|html)/i.test(text)) {
      return 'The backend returned an HTML page instead of JSON. It may be waking up — please retry in a few seconds.'
    }
    return text.slice(0, 240)
  }

  if (!data || typeof data !== 'object') return undefined

  const record = data as Record<string, unknown>
  const detail = record.detail ?? record.message ?? record.error

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as Record<string, unknown>).msg)
        }
        return String(item)
      })
      .filter(Boolean)
    if (messages.length > 0) return messages.join('; ')
  }

  return undefined
}

function messageFromError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
  }

  const axiosError = error as AxiosError
  const detail = readDetail(axiosError.response?.data)
  if (detail) return detail

  if (axiosError.code === 'ERR_NETWORK') {
    return `Cannot reach the backend at ${baseURL}. Make sure it is running, then try again.`
  }

  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    return 'The backend took too long to respond. Please try again.'
  }

  if (axiosError.response) {
    if (axiosError.response.status === 404) {
      return 'The backend endpoint was not found. Check VITE_API_BASE_URL and the backend routes.'
    }
    return `The backend returned ${axiosError.response.status}. Please try again.`
  }

  return 'Something went wrong while talking to the backend.'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return messageFromError(error)
}

class ApiService {
  private client = axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
    },
  })

  private async request<T>(config: AxiosRequestConfig, options: RequestOptions = {}): Promise<T> {
    const { retries = 2, delayMs = 3500, timeoutMs = 90000 } = options
    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await this.client.request<T>({ ...config, timeout: timeoutMs })
        return response.data
      } catch (error) {
        lastError = error
        if (attempt === retries || !isRetryable(error)) break
        await sleep(delayMs * (attempt + 1))
      }
    }

    if (axios.isAxiosError(lastError)) {
      throw new ApiError(messageFromError(lastError), lastError.response?.status)
    }

    if (lastError instanceof Error) throw lastError
    throw new ApiError('Something went wrong while talking to the backend.')
  }

  checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>(
      { method: 'GET', url: '/api/health' },
      { retries: 0, timeoutMs: 8000 },
    )
  }

  classifyDocument(file: File): Promise<ClassificationResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<ClassificationResponse>(
      { method: 'POST', url: '/classify/', data: formData },
      { retries: 2, delayMs: 4000, timeoutMs: 120000 },
    )
  }

  analyzeResume(resumeFile: File, jdFile: File): Promise<AnalysisResponse> {
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('jd', jdFile)

    return this.request<AnalysisResponse>(
      { method: 'POST', url: '/analyze/', data: formData },
      { retries: 2, delayMs: 4000, timeoutMs: 150000 },
    )
  }

  sendChatMessage(
    message: string,
    useWebSearch = false,
    sessionId?: string,
  ): Promise<ChatResponse> {
    const payload: ChatRequest = { message, use_web_search: useWebSearch }
    // Sent only when a conversation is already open, so the first turn stays
    // anonymous and lets the backend mint the id.
    if (sessionId) payload.session_id = sessionId

    return this.request<ChatResponse>(
      { method: 'POST', url: '/api/chat', data: payload },
      // Chat turns are never retried: a retried POST would append the same
      // exchange to the conversation a second time.
      { retries: 0, timeoutMs: 90000 },
    )
  }

  async clearChat(sessionId?: string): Promise<void> {
    try {
      await this.request<void>(
        {
          method: 'POST',
          url: '/api/chat/clear',
          data: sessionId ? { session_id: sessionId } : {},
        },
        { retries: 0, timeoutMs: 10000 },
      )
    } catch (error) {
      // The transcript is already reset locally, so a failure here only means
      // the backend kept its copy. Log the reason (status or safe message) and
      // never the session id itself, which acts as a bearer token.
      console.warn('clearChat: backend could not clear the conversation:', getErrorMessage(error))
    }
  }
}

export const apiService = new ApiService()

export const healthService = {
  checkHealth: () => apiService.checkHealth(),
}

export const documentService = {
  classify: (file: File) => apiService.classifyDocument(file),
  analyze: (resumeFile: File, jdFile: File) => apiService.analyzeResume(resumeFile, jdFile),
}

export const chatService = {
  sendMessage: (message: string, useWebSearch = false, sessionId?: string) =>
    apiService.sendChatMessage(message, useWebSearch, sessionId),
  clear: (sessionId?: string) => apiService.clearChat(sessionId),
}
