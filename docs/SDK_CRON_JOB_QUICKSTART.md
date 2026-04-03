# SDK Query() for Cron Jobs — Quick Start Guide

Goal: Replace CLI claude -p with SDK query() for session-based cron jobs.

---

## Minimal Example

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk'

async function runPromptViaSdk(prompt: string): Promise<string> {
  let output = ''
  
  const abortController = new AbortController()
  const timeout = setTimeout(() => abortController.abort(), 60000)
  
  try {
    for await (const message of query({
      prompt,
      options: {
        abortController,
        cwd: process.cwd(),
        tools: ['Bash', 'Read', 'Write'],
        allowedTools: ['Bash', 'Read', 'Write'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 10,
      },
    })) {
      if (message.type === 'assistant' && message.content) {
        output += message.content + '\n'
      }
    }
    return output.trim()
  } finally {
    clearTimeout(timeout)
  }
}
```

---

## Cron Job Pattern

```typescript
import cron from 'node-cron'
import { query } from '@anthropic-ai/claude-agent-sdk'

cron.schedule('0 2 * * *', async () => {
  console.log('[Cron] Starting task...')
  
  const abortController = new AbortController()
  const timeout = setTimeout(() => abortController.abort(), 300000)
  
  try {
    for await (const message of query({
      prompt: 'Execute /patrol skill',
      options: {
        abortController,
        cwd: '/path/to/project',
        mcpServers: {
          'icm': { command: 'agency.exe', args: ['mcp', 'icm'] }
        },
        tools: ['Bash', 'Read'],
        allowedTools: ['Bash', 'Read'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 100,
      },
    })) {
      if (message.type === 'assistant') {
        console.log('[Task]', message.content?.substring(0, 100))
      }
    }
    console.log('[Cron] Completed')
  } catch (err) {
    console.error('[Cron] Failed:', err)
  } finally {
    clearTimeout(timeout)
  }
})
```

---

## Message Types in Loop

```typescript
for await (const message of query({...})) {
  message.type === 'system'     // Setup info
  message.type === 'assistant'  // Claude's responses
  message.type === 'tool'       // Tool call from Claude
  message.type === 'result'     // Tool execution result
  
  // Common fields
  message.content     // Text (on assistant)
  message.error       // Error (on result)
  message.status      // success/error (on result)
  message.tool_name   // Tool name (on tool/result)
}
```

---

## Session Resumption (Multi-Step Jobs)

```typescript
let sessionId: string | undefined

// Step 1
for await (const message of query({
  prompt: 'Step 1: Fetch data',
  options: { abortController: new AbortController(), cwd: '/path', ... },
})) {
  if (!sessionId && message.session_id) {
    sessionId = message.session_id
  }
}

// Step 2: Resume same session
if (sessionId) {
  for await (const message of query({
    prompt: 'Step 2: Analyze data',
    options: {
      abortController: new AbortController(),
      resume: sessionId,  // KEY: Resume this session
      cwd: '/path',
    },
  })) {
    // Runs in same session context
  }
}
```

---

## Timeout Pattern

```typescript
const abortController = new AbortController()
const timeoutHandle = setTimeout(() => {
  abortController.abort()
}, 120000)  // 120 seconds

let firstMessageReceived = false

try {
  for await (const message of query({
    prompt,
    options: {
      abortController,
      ...
    },
  })) {
    // Clear timeout on first message
    if (!firstMessageReceived) {
      firstMessageReceived = true
      clearTimeout(timeoutHandle)
    }
  }
} finally {
  clearTimeout(timeoutHandle)
}
```

Timeouts:
- New session: 120s (MCP init)
- Resume: 6s (no MCP init)

---

## MCP Server Config

```typescript
const mcpServers = {
  'icm': {
    command: 'C:\Users\...\agency.exe',
    args: ['mcp', 'icm']
  },
  'teams': {
    command: 'C:\Users\...\agency.exe',
    args: ['mcp', 'teams']
  },
  'local-rag': {
    command: 'node',
    args: ['C:\path\to\mcp\index.js'],
    env: {
      'BASE_DIR': 'C:\path\to\data',
      'OPENAI_API_KEY': '...',
    }
  }
}

for await (const message of query({
  prompt,
  options: {
    mcpServers,  // Pass filtered MCPs here
    ...
  },
})) {
  // Use MCP tools
}
```

---

## Key Differences

CLI claude -p:
- One-shot execution
- No session persistence
- Auto timeout handling

SDK query():
- Streaming iterator
- Can resume sessions
- Manual timeout setup required
- Must collect output from loop

Best for: Cron jobs, production, multi-step workflows

