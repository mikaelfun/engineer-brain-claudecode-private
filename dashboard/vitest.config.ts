import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      include: [
        'src/agent/case-session-manager.ts',
        'src/services/todo-writer.ts',
        'src/routes/case-routes.ts',
      ],
    },
  },
})
