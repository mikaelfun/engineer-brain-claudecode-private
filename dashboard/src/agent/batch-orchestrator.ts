/**
 * batch-orchestrator.ts — Parallel batch execution via single SDK query session
 *
 * Pattern: TypeScript pre-checks → single SDK query → Claude spawns parallel Agent() subagents
 * Used by: labor-estimate /all, note-gap /check-all
 */
import { query, type Options } from '@anthropic-ai/claude-agent-sdk'
import { loadAgentDefinitions } from './case-session-manager.js'
import { config } from '../config.js'
import { sseManager } from '../watcher/sse-manager.js'
import { sdkRegistry } from './sdk-session-registry.js'

export interface BatchTask {
  caseNumber: string
  caseDir: string
  prompt: string        // per-case prompt for subagent
  subagentType?: string // e.g. 'note-gap-checker', undefined = general-purpose
}

/**
 * Execute batch tasks in parallel using a single SDK query session.
 * Claude receives a prompt listing all tasks and spawns Agent(run_in_background: true) for each.
 *
 * @param taskName - e.g. 'labor-estimate', 'note-gap' (used for SSE event type)
 * @param tasks - list of per-case tasks with prompts
 */
export async function batchParallelQuery(
  taskName: string,
  tasks: BatchTask[],
): Promise<void> {
  if (tasks.length === 0) return

  const subagentType = tasks[0].subagentType
  const agentTypeInstruction = subagentType
    ? `Use subagent_type: "${subagentType}" for each agent.`
    : ''

  // Build per-case task list for prompt
  const taskLines = tasks.map((t, i) =>
    `${i + 1}. Case ${t.caseNumber} (caseDir: ${t.caseDir}): ${t.prompt}`
  ).join('\n')

  const batchPrompt = `Execute ${taskName} for ${tasks.length} cases in parallel.

For EACH case below, spawn an Agent with run_in_background: true.
Send ALL Agent calls in a SINGLE message to maximize parallelism — do NOT wait between them.
${agentTypeInstruction}

Tasks:
${taskLines}

After all agents complete, report a brief summary of results (which cases succeeded, which had issues).`

  // SSE broadcast start
  sseManager.broadcast(`${taskName}-batch-progress` as any, {
    status: 'started',
    total: tasks.length,
  })

  // Single SDK query — Claude orchestrates parallel agents
  const registryHandle = sdkRegistry.register({ source: 'batch', context: taskName, intent: `Batch ${taskName} for ${tasks.length} cases` })
  try {
    for await (const _msg of query({
      prompt: batchPrompt,
      options: {
        cwd: config.projectRoot,
        settingSources: ['user'] as Options['settingSources'],
        agents: loadAgentDefinitions(),
        systemPrompt: {
          type: 'preset' as const,
          preset: 'claude_code' as const,
        },
        tools: ['Bash', 'Read', 'Write', 'Agent', 'Glob', 'Grep'],
        allowedTools: ['Bash', 'Read', 'Write', 'Agent', 'Glob', 'Grep'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: Math.max(tasks.length * 2 + 10, 30),
      },
    })) {
      registryHandle.onMessage(_msg)
    }
    registryHandle.complete()
  } catch (err) {
    registryHandle.fail((err as Error)?.message || 'unknown error')
    throw err
  }

  // SSE broadcast completion
  sseManager.broadcast(`${taskName}-batch-progress` as any, {
    status: 'completed',
    total: tasks.length,
  })
}
