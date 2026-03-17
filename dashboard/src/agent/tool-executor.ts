/**
 * tool-executor.ts — 通用 PowerShell 执行器
 *
 * spawn pwsh to run scripts, capture stdout/stderr, timeout control
 */
import { spawn } from 'child_process'
import { join } from 'path'
import { config } from '../config.js'
import { getToolByName, type ToolDefinition } from './tool-registry.js'

export interface ToolResult {
  success: boolean
  output: string
  error?: string
  durationMs: number
}

/**
 * Execute a registered tool by name with given arguments
 */
export async function executeTool(
  toolName: string,
  args: Record<string, string> = {}
): Promise<ToolResult> {
  const tool = getToolByName(toolName)
  if (!tool) {
    return {
      success: false,
      output: '',
      error: `Unknown tool: ${toolName}`,
      durationMs: 0,
    }
  }

  return executeScript(tool, args)
}

/**
 * Execute a PowerShell script with mapped parameters
 */
async function executeScript(
  tool: ToolDefinition,
  args: Record<string, string>
): Promise<ToolResult> {
  const scriptPath = join(config.scriptsDir, tool.script)
  const psArgs: string[] = ['-NoProfile', '-NonInteractive', '-File', scriptPath]

  // Map tool parameter names to PowerShell parameter names
  for (const [toolParam, value] of Object.entries(args)) {
    const psParam = tool.paramMap[toolParam]
    if (!psParam) continue

    if (value === 'true' && !toolParam.includes('Number') && !toolParam.includes('subject')) {
      // Switch parameter (boolean flags like -Force, -Replace)
      psArgs.push(`-${psParam}`)
    } else {
      psArgs.push(`-${psParam}`, value)
    }
  }

  // Auto-set OutputDir for tools that write to workspace
  if (tool.outputDirAuto) {
    psArgs.push('-OutputDir', config.activeCasesDir)
  }

  // For list_active_cases, always use JSON output
  if (tool.spec.function.name === 'list_active_cases') {
    psArgs.push('-OutputJson')
  }

  // For check_ir_status, always save meta
  if (tool.spec.function.name === 'check_ir_status') {
    psArgs.push('-SaveMeta')
    psArgs.push('-MetaDir', config.activeCasesDir)
  }

  const startTime = Date.now()

  return new Promise<ToolResult>((resolve) => {
    let stdout = ''
    let stderr = ''
    let killed = false

    const proc = spawn('pwsh', psArgs, {
      cwd: config.scriptsDir,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    // Timeout
    const timer = setTimeout(() => {
      killed = true
      proc.kill('SIGTERM')
      setTimeout(() => {
        if (!proc.killed) proc.kill('SIGKILL')
      }, 5000)
    }, tool.timeoutMs)

    proc.on('close', (code) => {
      clearTimeout(timer)
      const durationMs = Date.now() - startTime

      if (killed) {
        resolve({
          success: false,
          output: stdout.trim(),
          error: `Timeout after ${tool.timeoutMs}ms`,
          durationMs,
        })
        return
      }

      if (code !== 0) {
        resolve({
          success: false,
          output: stdout.trim(),
          error: stderr.trim() || `Process exited with code ${code}`,
          durationMs,
        })
        return
      }

      resolve({
        success: true,
        output: stdout.trim(),
        durationMs,
      })
    })

    proc.on('error', (err) => {
      clearTimeout(timer)
      resolve({
        success: false,
        output: '',
        error: `Failed to spawn pwsh: ${err.message}`,
        durationMs: Date.now() - startTime,
      })
    })
  })
}
