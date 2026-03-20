/**
 * todo-reader.ts — DEPRECATED
 *
 * Legacy global todo parsing has been removed.
 * All todo data now comes from per-case directories: cases/active/<id>/todo/
 *
 * @see routes/todos.ts for the unified per-case todo API
 * @see routes/cases.ts for per-case todo routes
 */

// This module is intentionally empty.
// Legacy exports (parseTodoFile, getLatestTodoFile, getTodoByDate) have been removed.
// All consumers now use the per-case todo model via /api/todos/all.
