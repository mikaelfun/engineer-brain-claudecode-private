/**
 * CaseAIPanel — Case 详情页 AI 面板
 *
 * 功能：
 * - 一键按钮：完整处理 / 排查 / 写邮件
 * - 实时日志流
 * - 交互式对话框 + session lifecycle 控制
 */
import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Search, Mail, Play, X, Send,
  CheckCircle2, Loader2, MessageSquare
} from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { apiPost, apiDelete } from '../api/client'
import { useWorkflowStore, type LiveSession } from '../stores/workflowStore'

interface CaseAIPanelProps {
  caseNumber: string
}

type AIAction = 'process' | 'troubleshoot' | 'draft-email'

export default function CaseAIPanel({ caseNumber }: CaseAIPanelProps) {
  const [activeAction, setActiveAction] = useState<AIAction | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const liveSession = useWorkflowStore((s) => s.liveSession)
  const isLiveRunning = liveSession?.status === 'running'

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  const handleAction = async (action: AIAction) => {
    setActiveAction(action)
    setIsProcessing(true)
    setError(null)
    setChatMessages([])

    try {
      let intent = ''
      switch (action) {
        case 'process':
          intent = 'Full casework processing'
          break
        case 'troubleshoot':
          intent = 'Technical troubleshooting'
          break
        case 'draft-email':
          intent = 'Draft email response'
          break
      }

      const result = await apiPost<{ status: string; caseNumber: string }>(
        `/case/${caseNumber}/process`,
        { intent }
      )
      setChatMessages(prev => [...prev, {
        role: 'system',
        content: `Started ${action} for case ${caseNumber}`
      }])
    } catch (err: any) {
      setError(err?.message || 'Failed to start action')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChat = async () => {
    if (!chatInput.trim() || !sessionId) return

    const message = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: message }])

    try {
      await apiPost(`/case/${caseNumber}/chat`, {
        sessionId,
        message,
      })
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        role: 'error',
        content: err?.message || 'Failed to send message'
      }])
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) return
    try {
      await apiDelete(`/case/${caseNumber}/session`, { sessionId })
      setSessionId(null)
      setActiveAction(null)
      setChatMessages([])
    } catch {
      // ignore
    }
  }

  const actions = [
    {
      id: 'process' as AIAction,
      label: 'Full Process',
      icon: <Play className="w-3.5 h-3.5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Data refresh + compliance check + troubleshoot + email + inspection',
    },
    {
      id: 'troubleshoot' as AIAction,
      label: 'Troubleshoot',
      icon: <Search className="w-3.5 h-3.5" />,
      color: 'bg-amber-600 hover:bg-amber-700',
      description: 'Technical analysis with Kusto, ADO, and docs',
    },
    {
      id: 'draft-email' as AIAction,
      label: 'Draft Email',
      icon: <Mail className="w-3.5 h-3.5" />,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Write email draft with humanizer',
    },
  ]

  return (
    <Card className="border-purple-200">
      <CardHeader
        title="AI Assistant"
        icon={<Sparkles className="w-4 h-4 text-purple-500" />}
        action={
          sessionId ? (
            <button
              onClick={handleEndSession}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> End Session
            </button>
          ) : undefined
        }
      />

      {/* Action Buttons */}
      {!activeAction && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              disabled={isProcessing || isLiveRunning}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.color}`}
              title={action.description}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Active Session Info */}
      {activeAction && (
        <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-purple-50 rounded-lg">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          <span className="text-xs text-purple-700 font-medium">
            {activeAction === 'process' ? 'Full Processing' :
             activeAction === 'troubleshoot' ? 'Troubleshooting' :
             'Drafting Email'}
          </span>
          {sessionId && (
            <span className="text-xs text-purple-400 ml-auto font-mono">
              {sessionId.slice(0, 12)}...
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-3 p-2 bg-red-50 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Chat Messages */}
      {chatMessages.length > 0 && (
        <div className="max-h-60 overflow-y-auto mb-3 space-y-2">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`text-xs p-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-50 text-blue-800 ml-8'
                  : msg.role === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-50 text-gray-700 mr-8'
              }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      {/* Chat Input */}
      {sessionId && (
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            placeholder="Send feedback..."
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button
            onClick={handleChat}
            disabled={!chatInput.trim()}
            className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Actions */}
      {sessionId && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleEndSession}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" /> Satisfied
          </button>
          <button
            onClick={() => handleAction(activeAction || 'process')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Loader2 className="w-3 h-3" /> Regenerate
          </button>
          <button
            onClick={handleEndSession}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            <X className="w-3 h-3" /> Dismiss
          </button>
        </div>
      )}
    </Card>
  )
}
