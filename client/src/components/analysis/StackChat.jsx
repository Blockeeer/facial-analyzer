import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles, RotateCcw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { sendStackMessage } from '../../services/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `Hey! I'm your PepsLab stack advisor. I'll ask you a few questions to build a personalized peptide protocol using products from **pepslab.ca**.\n\nLet's start — **what are your main goals?** For example:\n- Anti-aging / skin rejuvenation\n- Muscle growth & recovery\n- Fat loss\n- Healing & injury recovery\n- Sleep & wellness\n- Hair growth\n\nYou can pick one or more!`,
}

export default function StackChat() {
  const { accessToken } = useAuth()
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage = { role: 'user', content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendStackMessage(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        accessToken
      )

      setMessages(prev => [...prev, { role: 'assistant', content: response.message }])

      if (response.isComplete) {
        setIsComplete(true)
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE])
    setInput('')
    setIsComplete(false)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[60vh] min-h-[400px]">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-700'
                  : 'bg-dark-600'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-dark-300" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-dark-700/70 text-dark-200 rounded-tl-md'
                  : 'bg-primary-600/20 text-white border border-primary-500/20 rounded-tr-md'
              }`}
            >
              <div
                className="prose prose-invert prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ul]:ml-4 [&>ul>li]:text-dark-300 [&>h3]:text-white [&>h3]:text-base [&>h3]:mt-3 [&>h3]:mb-1 [&>strong]:text-white [&>h2]:text-white [&>h2]:text-lg [&>h2]:mt-4 [&>h2]:mb-2"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
              />
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-dark-700/70 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex items-center gap-2 text-dark-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-3 border-t border-dark-700/50">
        {isComplete ? (
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 shadow-glow hover:shadow-glow-lg transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Consultation
          </button>
        ) : (
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-dark-700/50 border border-dark-600 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/25 resize-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-40 disabled:shadow-none flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple markdown to HTML formatter
function formatMarkdown(text) {
  if (!text) return ''

  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Numbered lists
    .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    // Line breaks (double newline = paragraph)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph
    .replace(/^(.+)/, '<p>$1</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[23]>)/g, '$1')
    .replace(/(<\/h[23]>)<\/p>/g, '$1')
    .replace(/<p>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<\/p>/g, '$1')
}
