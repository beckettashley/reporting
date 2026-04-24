"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Sparkles, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { agentWelcome, agentConversation, agentQA, suggestedQuestions } from "@/lib/data"
import type { AgentMessage } from "@/lib/data"

function renderMarkdown(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
}

function findResponse(input: string): string {
  const q = input.toLowerCase()
  for (const qa of agentQA) {
    if (qa.triggers.some((t) => q.includes(t))) {
      return qa.response
    }
  }
  return `Great question! Based on your data for the last 30 days, I can see some interesting trends. Let me pull that up for you.

Your overall performance is trending positively — revenue is up 8.3% and orders increased 12.4% compared to the prior period. The **GlowSerum Pro + Daily Moisturizer** bundle continues to be your strongest combination.

Would you like me to dig deeper into any specific area?`
}

function MessageBubble({ message }: { message: AgentMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-amber-500 text-white rounded-2xl rounded-br-md px-4 py-2.5">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="text-sm leading-relaxed space-y-2.5">
          {message.content.split("\n\n").map((paragraph, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: renderMarkdown(paragraph) }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

// ─── Top-bar search trigger ─────────────────────────────────────────────────

export function AskVelocitySearchBar() {
  return (
    <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/50 cursor-not-allowed select-none">
      <Sparkles className="h-4 w-4 text-muted-foreground/50 shrink-0" />
      <span className="text-sm text-muted-foreground/70 truncate">Coming Soon: Your personal AI Agent. Ask questions, get answers.</span>
    </div>
  )
}

// ─── Full chat modal ───────────────────────────────────────────────────────

function AskVelocityModal({
  initialQuery,
  onClose,
}: {
  initialQuery: string | null
  onClose: () => void
}) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    { role: "agent", content: agentWelcome },
    ...agentConversation,
  ])
  const [input, setInput] = useState(initialQuery ?? "")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const handleSend = (text?: string) => {
    const msg = text || input.trim()
    if (!msg || typing) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: msg }])
    setTyping(true)

    const response = findResponse(msg)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [...prev, { role: "agent", content: response }])
    }, 1200)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={onClose} />
      <div className="fixed left-1/2 -translate-x-1/2 top-[10vh] z-[9999] w-[680px] max-w-[95vw] h-[70vh] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-sm">Ask Velocity</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {typing && <TypingIndicator />}
        </div>

        <div className="px-5 pb-2 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted transition-colors text-muted-foreground"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 pt-2 border-t shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your performance..."
              className="flex-1 text-sm bg-muted rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="p-2.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

// ─── Back-compat export ─────────────────────────────────────────────────────
// Kept so any lingering import of AgentChat won't break. Renders as the search bar.
export function AgentChat() {
  return null
}
