/**
 * TodoView — 每日 Todo 页
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import { Card, CardHeader } from '../components/common/Card'
import { Badge, PriorityBadge } from '../components/common/Badge'
import { Loading, EmptyState, ErrorState } from '../components/common/Loading'
import { useTodoList, useLatestTodo, useTodoByDate, useToggleTodo } from '../api/hooks'
import { useNavigate } from 'react-router-dom'

export default function TodoView() {
  const navigate = useNavigate()
  const { data: todoList } = useTodoList()
  const { data: latestTodo } = useLatestTodo()
  const toggleTodo = useToggleTodo()

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { data: selectedTodo } = useTodoByDate(selectedDate || '')

  const todo = selectedDate ? selectedTodo : latestTodo
  const files = todoList?.files || []

  const currentIdx = files.findIndex((f: any) =>
    f.date === (selectedDate || latestTodo?.date)
  )

  const navigateDate = (dir: -1 | 1) => {
    const newIdx = currentIdx + dir
    if (newIdx >= 0 && newIdx < files.length) {
      setSelectedDate(files[newIdx].date)
    }
  }

  if (!todo && !latestTodo) return <Loading text="Loading todos..." />

  if (!todo) return <EmptyState icon="📝" title="No todo files found" />

  // Count items
  const allItems = todo.sections?.flatMap((s: any) => s.cases?.flatMap((c: any) => c.items || []) || []) || []
  const totalItems = allItems.filter((i: any) => i.priority !== 'done').length
  const checkedItems = allItems.filter((i: any) => i.checked && i.priority !== 'done').length
  const doneItems = allItems.filter((i: any) => i.priority === 'done').length
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  const handleToggle = (lineNumber: number, currentChecked: boolean) => {
    toggleTodo.mutate({
      date: todo.date,
      lineNumber,
      checked: !currentChecked,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Todo</h2>
          <p className="text-gray-500 text-sm mt-1">{todo.title}</p>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
        <button
          onClick={() => navigateDate(1)}
          disabled={currentIdx >= files.length - 1}
          className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <span className="font-semibold text-gray-900">
            {todo.date ? `${todo.date.slice(0, 4)}-${todo.date.slice(4, 6)}-${todo.date.slice(6, 8)}` : 'Latest'}
          </span>
          <p className="text-xs text-gray-500">{todo.patrolInfo}</p>
        </div>
        <button
          onClick={() => navigateDate(-1)}
          disabled={currentIdx <= 0}
          className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">{checkedItems}/{totalItems} ({progress}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {doneItems > 0 && (
          <p className="text-xs text-gray-400 mt-1">{doneItems} auto-completed items</p>
        )}
      </Card>

      {/* Sections */}
      {todo.sections?.map((section: any, si: number) => (
        <div key={si}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {section.type === 'carryover' ? '⏭️' : '🔄'} {section.title}
          </h3>

          {section.cases?.map((todoCase: any, ci: number) => (
            <Card
              key={ci}
              className={`mb-3 ${
                todoCase.priority === 'red' ? 'border-l-4 border-l-red-500' :
                todoCase.priority === 'yellow' ? 'border-l-4 border-l-yellow-500' :
                'border-l-4 border-l-green-500'
              }`}
            >
              {/* Case Header */}
              <div
                className="flex items-center gap-2 flex-wrap mb-3 cursor-pointer"
                onClick={() => navigate(`/case/${todoCase.caseNumber}`)}
              >
                <PriorityBadge priority={todoCase.priority} />
                <span className="font-mono text-sm text-gray-500">Case {todoCase.caseNumber}</span>
                {todoCase.customer && (
                  <span className="text-sm text-gray-700">({todoCase.customer})</span>
                )}
                {todoCase.severity && (
                  <Badge variant="secondary" size="xs">Sev {todoCase.severity}</Badge>
                )}
                {todoCase.status && (
                  <Badge variant="secondary" size="xs">{todoCase.status}</Badge>
                )}
              </div>

              {/* Description */}
              {todoCase.description && (
                <div className="text-xs text-gray-500 mb-3 whitespace-pre-wrap bg-gray-50 rounded p-2">
                  {todoCase.description}
                </div>
              )}

              {/* Todo Items */}
              <div className="space-y-2">
                {todoCase.items?.map((item: any, ii: number) => (
                  <div
                    key={ii}
                    className={`flex items-start gap-2 p-2 rounded-lg ${
                      item.priority === 'done' ? 'bg-green-50' :
                      item.checked ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {item.priority === 'done' ? (
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
                        item.checked || item.priority === 'done'
                          ? 'text-gray-400 line-through'
                          : 'text-gray-900'
                      }`}>
                        {item.priority === 'red' && !item.checked && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline mr-1" />
                        )}
                        {item.text}
                      </p>
                      {item.isCarryover && (
                        <span className="text-xs text-orange-500">Carryover from previous</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ))}

      {/* Summary */}
      {todo.summary && (
        <Card>
          <CardHeader title="Summary" icon={<span>📊</span>} />
          <div className="grid gap-3 md:grid-cols-2">
            {todo.summary.urgent?.length > 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <h5 className="font-medium text-red-700 text-sm mb-2">Urgent ({todo.summary.urgent.length})</h5>
                <ul className="text-xs text-red-600 space-y-1">
                  {todo.summary.urgent.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {todo.summary.pending?.length > 0 && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <h5 className="font-medium text-yellow-700 text-sm mb-2">Pending ({todo.summary.pending.length})</h5>
                <ul className="text-xs text-yellow-600 space-y-1">
                  {todo.summary.pending.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {todo.summary.carryover?.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-3">
                <h5 className="font-medium text-orange-700 text-sm mb-2">Carryover ({todo.summary.carryover.length})</h5>
                <ul className="text-xs text-orange-600 space-y-1">
                  {todo.summary.carryover.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {todo.summary.normal?.length > 0 && (
              <div className="bg-green-50 rounded-lg p-3">
                <h5 className="font-medium text-green-700 text-sm mb-2">Normal ({todo.summary.normal.length})</h5>
                <ul className="text-xs text-green-600 space-y-1">
                  {todo.summary.normal.map((item: string, i: number) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
