/**
 * TodoView — 每日 Todo 页
 *
 * Data source: useTodoAll() — aggregates latest todo from each case's todo/ directory
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, AlertTriangle, Play } from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { Badge, PriorityBadge } from '../components/common/Badge'
import { Loading, EmptyState } from '../components/common/Loading'
import { useTodoAll, useTogglePerCaseTodo, useExecuteTodoAction } from '../api/hooks'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TodoView() {
  const navigate = useNavigate()
  const { data: todoAllData, isLoading } = useTodoAll()

  if (isLoading) return <Loading text="Loading todos..." />

  // Per-case todos from useTodoAll
  const perCaseTodos = todoAllData?.todos || []

  if (perCaseTodos.length > 0) {
    return <PerCaseTodoView todos={perCaseTodos} navigate={navigate} />
  }

  return <EmptyState icon="📝" title="No todo files found" description="Run /casework or /patrol to generate todos" />
}

// ============ Per-Case Todo View (primary) ============

/** Parse per-case todo markdown into structured sections */
interface TodoItem {
  text: string
  checked: boolean
  lineNumber: number  // 1-based
  isActionable: boolean  // 🟡 items that can be executed via API
  actionType?: string    // 'note' | 'labor' | 'sap'
}

interface TodoSection {
  type: 'red' | 'yellow' | 'green'
  emoji: string
  title: string
  items: TodoItem[]
}

function parseTodoContent(content: string): TodoSection[] {
  const lines = content.split('\n')
  const sections: TodoSection[] = []
  let currentSection: TodoSection | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1  // 1-based

    // Section headers: ## 🔴 / ## 🟡 / ## ✅
    if (line.startsWith('## ')) {
      if (line.includes('🔴')) {
        currentSection = { type: 'red', emoji: '🔴', title: line.replace(/^##\s*/, ''), items: [] }
        sections.push(currentSection)
      } else if (line.includes('🟡')) {
        currentSection = { type: 'yellow', emoji: '🟡', title: line.replace(/^##\s*/, ''), items: [] }
        sections.push(currentSection)
      } else if (line.includes('✅')) {
        currentSection = { type: 'green', emoji: '✅', title: line.replace(/^##\s*/, ''), items: [] }
        sections.push(currentSection)
      }
      continue
    }

    // Todo items: - [ ] or - [x]
    const checkboxMatch = line.match(/^- \[([ x])\]\s*(.*)/)
    if (checkboxMatch && currentSection) {
      const checked = checkboxMatch[1] === 'x'
      const text = checkboxMatch[2]

      // Detect actionable 🟡 items
      let isActionable = false
      let actionType: string | undefined
      if (currentSection.type === 'yellow') {
        if (/添加 Note[:：]/i.test(text) || /Add Note[:：]/i.test(text)) {
          isActionable = true
          actionType = 'note'
        } else if (/记录 Labor[:：]/i.test(text) || /Record Labor[:：]/i.test(text)) {
          isActionable = true
          actionType = 'labor'
        } else if (/修改 SAP[:：]/i.test(text) || /Update SAP[:：]/i.test(text)) {
          isActionable = true
          actionType = 'sap'
        }
      }

      currentSection.items.push({ text, checked, lineNumber, isActionable, actionType })
    }
  }

  return sections
}

function PerCaseTodoView({ todos, navigate }: { todos: any[]; navigate: any }) {
  const toggleTodo = useTogglePerCaseTodo()
  const executeTodoAction = useExecuteTodoAction()

  // Aggregate stats across all cases
  const allSections = todos.map(t => ({ caseNumber: t.caseNumber, sections: parseTodoContent(t.content || '') }))
  const totalRed = allSections.reduce((sum, c) => sum + c.sections.filter(s => s.type === 'red').reduce((s2, sec) => s2 + sec.items.filter(i => !i.checked).length, 0), 0)
  const totalYellow = allSections.reduce((sum, c) => sum + c.sections.filter(s => s.type === 'yellow').reduce((s2, sec) => s2 + sec.items.filter(i => !i.checked).length, 0), 0)
  const totalGreen = allSections.reduce((sum, c) => sum + c.sections.filter(s => s.type === 'green').reduce((s2, sec) => s2 + sec.items.length, 0), 0)
  const totalItems = totalRed + totalYellow + totalGreen
  const totalChecked = allSections.reduce((sum, c) => sum + c.sections.reduce((s2, sec) => s2 + sec.items.filter(i => i.checked).length, 0), 0)
  const actionableTotal = totalRed + totalYellow
  const progress = actionableTotal > 0 ? Math.round((totalChecked / actionableTotal) * 100) : 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Todo</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {todos.length} cases with active todos
        </p>
      </div>

      {/* Overall Progress */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
          <div className="flex items-center gap-3">
            {totalRed > 0 && <Badge variant="danger" size="xs">🔴 {totalRed}</Badge>}
            {totalYellow > 0 && <Badge variant="warning" size="xs">🟡 {totalYellow}</Badge>}
            {totalGreen > 0 && <Badge variant="success" size="xs">✅ {totalGreen}</Badge>}
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{totalChecked}/{actionableTotal} ({progress}%)</span>
          </div>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-active)' }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${progress}%`, background: 'var(--accent-blue)' }}
          />
        </div>
      </Card>

      {todos.map((todo: any) => (
        <CaseTodoCard
          key={todo.caseNumber}
          todo={todo}
          navigate={navigate}
          toggleTodo={toggleTodo}
          executeTodoAction={executeTodoAction}
        />
      ))}
    </div>
  )
}

function CaseTodoCard({ todo, navigate, toggleTodo, executeTodoAction }: {
  todo: any
  navigate: any
  toggleTodo: any
  executeTodoAction: any
}) {
  const [expanded, setExpanded] = useState(true)
  const sections = parseTodoContent(todo.content || '')

  // Determine priority from sections
  const hasUrgent = sections.some(s => s.type === 'red' && s.items.some(i => !i.checked))
  const hasPending = sections.some(s => s.type === 'yellow' && s.items.some(i => !i.checked))
  const borderLeftColor = hasUrgent ? 'var(--accent-red)' : hasPending ? 'var(--accent-amber)' : 'var(--accent-green)'

  const handleToggle = (lineNumber: number, currentChecked: boolean) => {
    toggleTodo.mutate({
      caseNumber: todo.caseNumber,
      lineNumber,
      checked: !currentChecked,
      filename: todo.filename,
    })
  }

  const handleExecute = (item: TodoItem) => {
    if (!item.actionType) return
    executeTodoAction.mutate({
      caseId: todo.caseNumber,
      action: item.actionType,
      params: { text: item.text },
    })
  }

  return (
    <Card className="border-l-4" style={{ borderLeftColor }}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            : <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          }
          <span
            className="font-mono text-sm hover:underline cursor-pointer"
            style={{ color: 'var(--accent-blue)' }}
            onClick={(e) => { e.stopPropagation(); navigate(`/case/${todo.caseNumber}`) }}
          >
            Case {todo.caseNumber}
          </span>
          {/* Section badges */}
          {sections.map(s => {
            const unchecked = s.items.filter(i => !i.checked).length
            if (s.type === 'green') return <Badge key={s.type} variant="success" size="xs">{s.emoji} {s.items.length}</Badge>
            if (unchecked === 0) return null
            return <Badge key={s.type} variant={s.type === 'red' ? 'danger' : 'warning'} size="xs">{s.emoji} {unchecked}</Badge>
          })}
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{todo.filename}</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {new Date(todo.updatedAt).toLocaleString()}
        </span>
      </div>

      {expanded && sections.length > 0 && (
        <div className="mt-3 pt-3 border-t space-y-4" style={{ borderColor: 'var(--border-subtle)' }}>
          {sections.map((section, si) => (
            <div key={si}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="flex items-start gap-2 p-2 rounded-lg"
                    style={{
                      background: section.type === 'green' ? 'var(--accent-green-dim)' :
                        item.checked ? 'var(--bg-inset)' : undefined
                    }}
                  >
                    {section.type === 'green' ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-green)' }} />
                    ) : (
                      <button
                        onClick={() => handleToggle(item.lineNumber, item.checked)}
                        className="flex-shrink-0 mt-0.5"
                        disabled={toggleTodo.isPending}
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                        ) : (
                          <Circle className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                        )}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          item.checked || section.type === 'green' ? 'line-through' : ''
                        }`}
                        style={{
                          color: item.checked || section.type === 'green'
                            ? 'var(--text-tertiary)'
                            : 'var(--text-primary)'
                        }}
                      >
                        {section.type === 'red' && !item.checked && (
                          <AlertTriangle className="w-3.5 h-3.5 inline mr-1" style={{ color: 'var(--accent-red)' }} />
                        )}
                        {item.text}
                      </p>
                    </div>
                    {item.isActionable && !item.checked && (
                      <button
                        onClick={() => handleExecute(item)}
                        className="flex-shrink-0 px-2 py-1 text-xs rounded flex items-center gap-1"
                        style={{ background: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' }}
                        disabled={executeTodoAction.isPending}
                        title={`Execute: ${item.actionType}`}
                      >
                        <Play className="w-3 h-3" />
                        Execute
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fallback: show raw markdown if no sections parsed */}
      {expanded && sections.length === 0 && todo.content && (
        <div className="mt-3 pt-3 border-t prose prose-sm max-w-none" style={{ borderColor: 'var(--border-subtle)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {todo.content}
          </ReactMarkdown>
        </div>
      )}
    </Card>
  )
}
