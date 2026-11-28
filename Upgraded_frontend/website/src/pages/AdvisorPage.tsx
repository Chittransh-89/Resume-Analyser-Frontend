import { useEffect, useMemo, useRef, useState } from 'react'
import { marked } from 'marked'
import PageShell from '../components/layout/PageShell'
import PageHeader from '../components/layout/PageHeader'
import { useBackendStatus } from '../components/BackendStatus'
import { ApiError, chatService, getErrorMessage } from '../services/api'
import type { ChatResponse } from '../types/api'
import { Chat, Search, Send, Trash } from '../components/icons'

interface ChatMeta {
  usedWebSearch?: boolean
  googleLinks?: string[]
  youtubeLinks?: string[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  meta?: ChatMeta
}

const SUGGESTIONS = [
  'How do I become a frontend developer?',
  'Give me an AI/ML career roadmap',
  'What skills are required for a backend role?',
  'Free resources to learn Python',
]

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  createdAt: new Date(),
  content: `I'm **CareerBuddy**, the career advisor for this workspace.

Ask me about:

- Career paths (frontend, backend, AI/ML, DevOps)
- Learning roadmaps and free resources
- Skills required for a role
- Interview preparation

Type your question below.`,
}

let messageCounter = 0

function nextMessageId() {
  messageCounter += 1
  return `msg-${Date.now()}-${messageCounter}`
}

function isHttpUrl(value: string) {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function isInvalidSessionError(error: unknown) {
  return error instanceof ApiError && error.status === 422
}

function sanitizeHtml(html: string) {
  if (typeof window === 'undefined') return ''

  const documentNode = new DOMParser().parseFromString(html, 'text/html')

  documentNode
    .querySelectorAll(
      'script, style, iframe, object, embed, link, meta, base, form, input, textarea, select, button, img, picture, svg, video, audio, source',
    )
    .forEach((node) => node.remove())

  documentNode.body.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()

      if (name.startsWith('on') || name === 'style') {
        element.removeAttribute(attribute.name)
      }

      if (
        (name === 'href' || name === 'src' || name === 'xlink:href') &&
        (value.startsWith('javascript:') || value.startsWith('data:text/html'))
      ) {
        element.removeAttribute(attribute.name)
      }
    })

    if (element.tagName === 'A') {
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    }
  })

  return documentNode.body.innerHTML
}

function MessageBody({ text }: { text: string }) {
  const html = useMemo(() => {
    try {
      return sanitizeHtml(marked.parse(text, { async: false }) as string)
    } catch {
      return escapeHtml(text)
    }
  }, [text])

  return <div className="chat-prose" dangerouslySetInnerHTML={{ __html: html }} />
}

function LinkList({ title, links }: { title: string; links?: string[] }) {
  const validLinks = (links ?? []).filter(isHttpUrl)
  if (validLinks.length === 0) return null

  return (
    <div className="mt-3 border-t border-line pt-3">
      <p className="meta-label">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {validLinks.map((link) => (
          <li key={link}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-xs text-cyan hover:underline"
              title={link}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

const AdvisorPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Conversation handle for the backend session API. A ref, not state, because
  // it never affects rendering; and deliberately not persisted anywhere, so a
  // refresh or a new tab starts a fresh conversation.
  const sessionIdRef = useRef<string | null>(null)
  const { status } = useBackendStatus()

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    if (messages.length <= 1 && !loading) return

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    container.scrollTo({
      top: container.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    const content = text.trim()
    if (!content || loading) return

    setMessages((previous) => [
      ...previous,
      { id: nextMessageId(), role: 'user', content, createdAt: new Date() },
    ])
    setInput('')
    setLoading(true)

    const requestTurn = () =>
      chatService.sendMessage(content, false, sessionIdRef.current ?? undefined)

    try {
      let data: ChatResponse

      try {
        data = await requestTurn()
      } catch (error) {
        // The backend rejects a malformed session id with 422 before it does any
        // work. Forgetting the id and retrying exactly once recovers the chat;
        // the retry only runs when an id was actually sent, so it cannot loop.
        if (!sessionIdRef.current || !isInvalidSessionError(error)) throw error
        sessionIdRef.current = null
        data = await requestTurn()
      }

      const response = typeof data.response === 'string' ? data.response.trim() : ''

      if (!response) {
        throw new Error(data.detail || data.error || 'The backend returned an empty response.')
      }

      // Only a completed turn adopts the returned id: a failed turn must never
      // replace a session id that is known to work.
      if (typeof data.session_id === 'string' && data.session_id) {
        sessionIdRef.current = data.session_id
      }

      setMessages((previous) => [
        ...previous,
        {
          id: nextMessageId(),
          role: 'assistant',
          content: response,
          createdAt: new Date(),
          meta: {
            usedWebSearch: data.used_web_search,
            googleLinks: data.google_links,
            youtubeLinks: data.youtube_links,
          },
        },
      ])
    } catch (err) {
      setMessages((previous) => [
        ...previous,
        {
          id: nextMessageId(),
          role: 'assistant',
          content: `**That request did not finish.** ${getErrorMessage(err)}`,
          createdAt: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    const sessionId = sessionIdRef.current
    // Forget the id first: even if the backend call fails, the next message must
    // start a new conversation instead of continuing the old one.
    sessionIdRef.current = null
    setMessages([WELCOME_MESSAGE])
    setInput('')
    void chatService.clear(sessionId ?? undefined)
  }

  const statusTone =
    status === 'online'
      ? 'bg-good'
      : status === 'warming'
        ? 'bg-warn'
        : status === 'checking'
          ? 'bg-muted-2'
          : 'bg-bad'

  const statusText =
    status === 'online'
      ? 'Online — ready'
      : status === 'warming'
        ? 'Models warming'
        : status === 'checking'
          ? 'Checking backend'
          : 'Offline'

  return (
    <PageShell>
      <PageHeader
        label="Career advisor"
        title="CareerBuddy"
        description="Career paths, roadmaps, required skills and learning resources. Answers come back as markdown with optional live sources."
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={clearChat}
            aria-label="Clear conversation"
          >
            <Trash size={16} />
            Clear
          </button>
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="panel flex h-[68dvh] min-h-[420px] max-h-[660px] flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan/10 text-cyan"
                aria-hidden="true"
              >
                <Chat size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">CareerBuddy</p>
                <p className="flex items-center gap-1.5 text-xs text-muted">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusTone}`} aria-hidden="true" />
                  {statusText}
                </p>
              </div>
            </div>
            <span className="tag">
              <Search size={11} />
              Web search available
            </span>
          </div>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((message) => {
              const isUser = message.role === 'user'
              return (
                <div key={message.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                      isUser ? 'bg-surface-3 text-ink' : 'bg-cyan/10 text-cyan'
                    }`}
                    aria-hidden="true"
                  >
                    {isUser ? 'You' : <Chat size={14} />}
                  </span>

                  <div
                    className={`min-w-0 max-w-[85%] rounded-card border px-3.5 py-2.5 ${
                      isUser
                        ? 'border-cyan/40 bg-cyan text-[#061021]'
                        : 'border-line bg-surface-2 text-ink-soft'
                    }`}
                  >
                    {!isUser && <p className="mb-1 text-xs font-semibold text-ink">CareerBuddy</p>}

                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <MessageBody text={message.content} />
                    )}

                    {message.meta?.usedWebSearch && (
                      <span className="tag tag-cyan mt-2">
                        <Search size={11} />
                        Live web search
                      </span>
                    )}

                    {!isUser && (
                      <>
                        <LinkList title="Search links" links={message.meta?.googleLinks} />
                        <LinkList title="Video tutorials" links={message.meta?.youtubeLinks} />
                      </>
                    )}

                    <p
                      className={`mt-1.5 stat-value text-[10px] ${
                        isUser ? 'text-[#061021]/60' : 'text-muted-2'
                      }`}
                    >
                      {message.createdAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            })}

            {loading && (
              <div className="flex gap-2.5" role="status" aria-label="CareerBuddy is typing">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan/10 text-cyan"
                  aria-hidden="true"
                >
                  <Chat size={14} />
                </span>
                <div className="flex items-center gap-1 rounded-card border border-line bg-surface-2 px-4 py-3">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && !loading && (
            <div className="border-t border-line px-4 py-3 sm:px-5">
              <p className="meta-label">Try asking</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="tag text-left transition-colors hover:border-cyan/40 hover:text-cyan"
                    onClick={() => void sendMessage(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            className="border-t border-line p-3 sm:p-4"
            onSubmit={(event) => {
              event.preventDefault()
              void sendMessage(input)
            }}
          >
            <div className="flex items-end gap-2">
              <label htmlFor="chat-input" className="sr-only">
                Message CareerBuddy
              </label>
              <input
                id="chat-input"
                type="text"
                className="field min-h-[44px] flex-1"
                placeholder="Ask about careers, skills, or roadmaps…"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn btn-primary h-11 w-11 shrink-0 p-0"
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Conversations are held in this tab only and are not saved.
            </p>
          </form>
        </div>
      </div>
    </PageShell>
  )
}

export default AdvisorPage
