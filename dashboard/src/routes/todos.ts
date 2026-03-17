/**
 * todos.ts — Todo 读取/勾选路由
 */
import { Hono } from 'hono'
import { listTodoFiles } from '../services/workspace.js'
import { parseTodoFile, getLatestTodoFile, getTodoByDate } from '../services/todo-reader.js'
import { toggleTodoItem } from '../services/todo-writer.js'

const todos = new Hono()

// GET /api/todos — 可用 todo 日期列表
todos.get('/', (c) => {
  const files = listTodoFiles()
  return c.json({
    files: files.map(f => ({
      filename: f,
      date: f.match(/(\d{8})/)?.[1] || '',
    })),
    total: files.length,
  })
})

// GET /api/todos/latest — 最新 todo
todos.get('/latest', (c) => {
  const todo = getLatestTodoFile()
  if (!todo) {
    return c.json({ error: 'No todo files found' }, 404)
  }
  return c.json(todo)
})

// GET /api/todos/:date — 指定日期 todo
todos.get('/:date', (c) => {
  const date = c.req.param('date')

  // If date is a filename like "20260314.md", extract date
  const dateStr = date.replace('.md', '')

  // Try exact filename first
  const todo = parseTodoFile(`${dateStr}.md`) || parseTodoFile(date)
  if (!todo) {
    return c.json({ error: 'Todo not found' }, 404)
  }
  return c.json(todo)
})

// PATCH /api/todos/:date/items/:idx — 切换勾选状态
todos.patch('/:date/items/:idx', async (c) => {
  const date = c.req.param('date')
  const lineNumber = parseInt(c.req.param('idx'), 10)
  const { checked } = await c.req.json<{ checked: boolean }>()

  if (isNaN(lineNumber)) {
    return c.json({ error: 'Invalid line number' }, 400)
  }

  const success = toggleTodoItem(date, lineNumber, checked)
  if (!success) {
    return c.json({ error: 'Failed to toggle item' }, 400)
  }

  return c.json({ success: true })
})

export default todos
