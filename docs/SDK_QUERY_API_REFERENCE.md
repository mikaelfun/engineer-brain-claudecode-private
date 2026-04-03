# Claude Agent SDK Query API — Complete Technical Reference

## SDK Import & Initialization

### Import Statement
```typescript
import { 
  query, 
  type Options, 
  type SDKMessage, 
  type CanUseTool, 
  type McpServerConfig, 
  type AgentDefinition 
} from '@anthropic-ai/claude-agent-sdk'
```

Package: @anthropic-ai/claude-agent-sdk

---

## Core API: The query() Function

### Function Signature
```typescript
function query(config: {
  prompt: string
  options?: Options
}): AsyncGenerator<SDKMessage>
```

Return Type: AsyncGenerator<SDKMessage>
- Yields messages as they arrive from the SDK
- Messages include: system, assistant, tool calls, results

---

## Query Configuration: Options Object

Key fields from case-session-manager.ts:

1. SESSION MANAGEMENT
   - abortController?: AbortController        // Cancel query
   - resume?: string                          // Resume by session_id

2. WORKING DIRECTORY & FILES
   - cwd?: string                             // Working directory

3. SETTINGS & CONFIGURATION
   - settingSources?: ('user' | 'project')[]  // Load settings
     Use ['user'] to skip .mcp.json (token limit)

4. MCP & AGENTS
   - mcpServers?: Record<string, McpServerConfig>     // MCP servers
   - agents?: Record<string, AgentDefinition>         // Custom agents

5. SYSTEM PROMPT
   systemPrompt: {
     type: 'preset' | 'custom'
     preset: 'claude_code'                   // Claude Code preset
     append: string                          // Append to prompt
   }

6. TOOLS & PERMISSIONS
   - tools?: string[]                         // Available: Bash, Read, Write, Edit, Glob, Grep, Agent
   - allowedTools?: string[]                  // Whitelist of allowed tools
   - permissionMode?: 'bypassPermissions'     // Skip permission checks
   - allowDangerouslySkipPermissions?: boolean

7. EXECUTION
   - maxTurns?: number                        // Max turns before stop
   - stderr?: (data: string) => void          // Stderr callback

8. TOOL PERMISSION CALLBACK
   - canUseTool?: (tool) => boolean | Promise<boolean>

---

## AbortController Pattern for Cancellation

```typescript
const abortController = new AbortController()
const timeoutHandle = setTimeout(() => {
  abortController.abort()  // Cancel the query
}, 120_000)  // 120 seconds

// Pass to query options
for await (const message of query({
  prompt: 'your prompt',
  options: {
    abortController,
    // ... other options
  }
})) {
  // Clear timeout on first message
  clearTimeout(timeoutHandle)
  // ... process message
}
```

---

## MCP Server Configuration

### Type: McpServerConfig
```typescript
interface McpServerConfig {
  command: string              // Executable path (e.g., agency.exe or node)
  args?: string[]              // CLI arguments
  env?: Record<string, string> // Environment variables
}
```

### Examples from .mcp.json
- ICM: command: "agency.exe", args: ["mcp", "icm"]
- Teams: command: "agency.exe", args: ["mcp", "teams"]
- Kusto: command: "agency.exe", args: ["mcp", "kusto", "--service-uri", "...", "--database", "..."]
- Local-RAG: command: "node", args: ["path/to/mcp-servers/local-rag/dist/index.js"]

---

## Agent Definitions: From .claude/agents/*.md

### AgentDefinition Type
```typescript
interface AgentDefinition {
  description: string              // Agent purpose
  prompt: string                   // Agent system prompt (markdown body)
  tools?: string[]                 // Allowed tools
  model?: string                   // Override model (e.g., claude-3-5-sonnet)
  maxTurns?: number                // Override max turns
  mcpServers?: AgentMcpServerSpec[]// MCP servers to expose
}
```

### File Format: .claude/agents/teams-search.md
```markdown
---
name: teams-search
description: Search Teams messages for the case
tools: Bash, Agent, Read
model: claude-3-5-sonnet
mcpServers:
  - teams
---

# Teams Search Agent

You are specialized in searching Teams messages...
```

### Loading Agents (case-session-manager.ts)
1. Read all .md files from .claude/agents/
2. Parse YAML frontmatter (name, description, tools, model, mcpServers)
3. Use markdown body as prompt
4. Convert to AgentDefinition objects
5. Inject via query options: agents: loadAgentDefinitions()

---

## Message Types and Streaming

### Message Iteration Pattern
```typescript
for await (const message of query({...})) {
  if (message.type === 'system' && message.subtype === 'init') {
    const sessionId = message.session_id  // Extract SDK session ID
  }
  
  if (message.type === 'assistant') {
    // Claude's response
  }
  
  if (message.type === 'tool') {
    // Tool call from Claude (Bash, Read, etc.)
  }
  
  if (message.type === 'result') {
    // Tool execution result
  }
}
```

### Session ID Extraction
```typescript
function extractSessionId(message: any): string | undefined {
  // Pattern 1: system init message
  if (message.type === 'system' && message.subtype === 'init' && message.session_id) {
    return message.session_id
  }
  
  // Pattern 2: result message
  if (message.type === 'result' && message.session_id) {
    return message.session_id
  }
  
  // Pattern 3: assistant message
  if (message.type === 'assistant' && message.session_id) {
    return message.session_id
  }
  
  return undefined
}
```

---

## Complete Usage: Create New Session

```typescript
import { query, type Options } from '@anthropic-ai/claude-agent-sdk'

let sdkSessionId: string | undefined

const abortController = new AbortController()
const timeoutHandle = setTimeout(() => abortController.abort(), 120_000)
let firstMessageReceived = false

try {
  for await (const message of query({
    prompt: 'Case C-123: Investigate issue',
    options: {
      abortController,
      cwd: '/path/to/project',
      settingSources: ['user'],  // Skip project settings to avoid MCP overflow
      mcpServers: {
        'icm': { command: 'agency.exe', args: ['mcp', 'icm'] },
        'teams': { command: 'agency.exe', args: ['mcp', 'teams'] }
      },
      agents: loadAgentDefinitions(),  // Load from .claude/agents/
      systemPrompt: {
        type: 'preset',
        preset: 'claude_code',
        append: 'You are processing Case C-123...'
      },
      tools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'],
      allowedTools: ['Bash', 'Read', 'Write'],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 100,
      stderr: (data) => console.error(`[SDK stderr] ${data}`),
    },
  })) {
    // Clear timeout on first message
    if (!firstMessageReceived) {
      firstMessageReceived = true
      clearTimeout(timeoutHandle)
    }
    
    // Capture session ID from first message
    if (!sdkSessionId) {
      const msgSessionId = extractSessionId(message)
      if (msgSessionId) {
        sdkSessionId = msgSessionId
        console.log(`Session created: ${sdkSessionId}`)
      }
    }
    
    // Process message
    yield message
  }
  
  console.log(`Query completed. Session: ${sdkSessionId}`)
} catch (err) {
  console.error(`Query failed:`, err)
  throw err
} finally {
  clearTimeout(timeoutHandle)
}
```

---

## Resume Existing Session

```typescript
// Resume by session_id (pass in options.resume)
const existingSessionId = 'the-sdk-session-id'
const userMessage = 'Continue with next step...'

const abortController = new AbortController()
const timeoutHandle = setTimeout(() => abortController.abort(), 6_000)  // Shorter timeout
let firstMessageReceived = false

try {
  for await (const message of query({
    prompt: userMessage,  // New message
    options: {
      abortController,
      resume: existingSessionId,  // KEY: Resume this session
      cwd: '/path/to/project',
      permissionMode: 
