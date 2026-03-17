/**
 * copilot-client.ts — GitHub Copilot API 调用
 */

const COPILOT_API_BASE = process.env.COPILOT_API_BASE || 'https://api.enterprise.githubcopilot.com'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

interface ChatChoice {
  message: {
    content: string | null
    tool_calls?: ToolCall[]
  }
  finish_reason: 'stop' | 'tool_calls' | 'length' | string
}

interface ChatResponse {
  choices: ChatChoice[]
}

export interface CopilotToolResponse {
  content: string | null
  toolCalls: ToolCall[] | null
  finishReason: string
}

export async function callCopilotChat(
  messages: ChatMessage[],
  token: string,
  model = process.env.COPILOT_MODEL || 'claude-sonnet-4'
): Promise<string> {
  if (!token) {
    throw new Error('GitHub Copilot token not configured')
  }

  const response = await fetch(`${COPILOT_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Editor-Version': 'engineer-brain/1.0',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Copilot API error ${response.status}: ${text}`)
  }

  const data = (await response.json()) as ChatResponse
  return data.choices[0]?.message?.content || ''
}

export function buildCaseAnalysisPrompt(caseData: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are an Azure support engineer assistant. Analyze the case data and provide:
1. Current status assessment (health level: 🔴 urgent / 🟡 needs attention / ✅ normal)
2. Key risks or issues
3. Recommended next actions (prioritized)
4. SLA status summary

Be concise and actionable. Use Chinese for main text but keep technical terms in English.`,
    },
    {
      role: 'user',
      content: `请分析以下 Case 数据并给出状态评估和建议：\n\n${caseData}`,
    },
  ]
}

export function buildAllCasesAnalysisPrompt(casesData: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are an Azure support engineer assistant. Analyze the overview of all active cases and provide:
1. Overall workload assessment
2. Priority ranking (which cases need immediate attention)
3. Risk alerts (SLA breaches, long-pending cases, etc.)
4. Suggested daily plan

Be concise and actionable. Use Chinese for main text but keep technical terms in English.`,
    },
    {
      role: 'user',
      content: `请分析以下所有活跃 Case 概览并给出工作建议：\n\n${casesData}`,
    },
  ]
}

/**
 * Call Copilot API with tool definitions — supports tool_calls response
 */
export async function callCopilotWithTools(
  messages: ChatMessage[],
  tools: Array<{ type: 'function'; function: { name: string; description: string; parameters: any } }>,
  token: string,
  model = process.env.COPILOT_MODEL || 'claude-sonnet-4'
): Promise<CopilotToolResponse> {
  if (!token) {
    throw new Error('GitHub Copilot token not configured')
  }

  const body: Record<string, any> = {
    model,
    messages,
    max_tokens: 4096,
    temperature: 0.3,
  }

  if (tools.length > 0) {
    body.tools = tools
    body.tool_choice = 'auto'
  }

  const response = await fetch(`${COPILOT_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Editor-Version': 'engineer-brain/1.0',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Copilot API error ${response.status}: ${text}`)
  }

  const data = (await response.json()) as ChatResponse

  // Copilot proxy (e.g. copilot-proxy) may split content and tool_calls across
  // multiple choices. Merge them: collect content from the first choice that has
  // it, and tool_calls from any choice that contains them.
  let content: string | null = null
  let toolCalls: ToolCall[] | null = null
  let finishReason = 'stop'

  for (const choice of data.choices) {
    if (choice.message?.content && !content) {
      content = choice.message.content
    }
    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
      toolCalls = choice.message.tool_calls
      finishReason = choice.finish_reason || 'tool_calls'
    }
    if (!toolCalls && choice.finish_reason) {
      finishReason = choice.finish_reason
    }
  }

  return { content, toolCalls, finishReason }
}

export type { ChatMessage, ToolCall }
