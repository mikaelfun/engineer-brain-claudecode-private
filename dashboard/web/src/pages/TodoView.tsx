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
        <h2 className="text-2xl font-bold text-gray-900">Todo</h2>
        <p className="text-gray-500 text-sm mt-1">
          {todos.length} cases with active todos
        </p>
      </div>

      {/* Overall Progress */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <div className="flex items-center gap-3">
            {totalRed > 0 && <Badge variant="danger" size="xs">🔴 {totalRed}</Badge>}
            {totalYellow > 0 && <Badge variant="warning" size="xs">🟡 {totalYellow}</Badge>}
            {totalGreen > 0 && <Badge variant="success" size="xs">✅ {totalGreen}</Badge>}
            <span className="text-sm font-medium text-gray-900">{totalChecked}/{actionableTotal} ({progress}%)</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
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
  const borderColor = hasUrgent ? 'border-l-red-500' : hasPending ? 'border-l-yellow-500' : 'border-l-green-500'

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
    <Card className={`border-l-4 ${borderColor}`}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <span
            className="font-mono text-sm text-primary hover:underline cursor-pointer"
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
          <span className="text-xs text-gray-400">{todo.filename}</span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(todo.updatedAt).toLocaleString()}
        </span>
      </div>

      {expanded && sections.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">
          {sections.map((section, si) => (
            <div key={si}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item, ii) => (
                  <div
                    key={ii}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      section.type === 'green' ? 'bg-green-50' :
                      item.checked ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {section.type === 'green' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <button
                        onClick={() => handleToggle(item.lineNumber, item.checked)}
                        className="flex-shrink-0 mt-0.5"
                        disabled={toggleTodo.isPending}
                      >
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 hover:text-primary" />
                        )}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        item.checked || section.type === 'green'
                          ? 'text-gray-400 line-through'
                          : 'text-gray-900'
                      }`}>
                        {section.type === 'red' && !item.checked && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline mr-1" />
                        )}
                        {item.text}
                      </p>
                    </div>
                    {item.isActionable && !item.checked && (
                      <button
                        onClick={() => handleExecute(item)}
                        className="flex-shrink-0 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center gap-1"
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
        <div className="mt-3 pt-3 border-t border-gray-100 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {todo.content}
          </ReactMarkdown>
        </div>
      )}
    </Card>
  )
}
