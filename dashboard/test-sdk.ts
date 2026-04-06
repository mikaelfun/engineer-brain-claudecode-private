import { query } from '@anthropic-ai/claude-agent-sdk';

(async () => {
  console.log('Starting SDK query...');
  const start = Date.now();
  try {
    for await (const msg of query({
      prompt: 'What project is this? Read CLAUDE.md and tell me the project name briefly.',
      options: {
        cwd: process.cwd(),
        settingSources: ['user', 'project'] as any,
        systemPrompt: { type: 'preset' as const, preset: 'claude_code' as const, append: 'Be brief.' },
        tools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Agent'],
        allowedTools: ['Read', 'Write', 'Bash', 'Glob', 'Grep', 'Agent'],
        permissionMode: 'bypassPermissions' as any,
        allowDangerouslySkipPermissions: true,
        maxTurns: 3,
        mcpServers: {} as any,
        stderr: (data: string) => {
          const elapsed = ((Date.now() - start) / 1000).toFixed(1);
          console.error(`[STDERR ${elapsed}s]`, data.trim());
        },
      },
    })) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      if (msg.type === 'system' && (msg as any).subtype === 'init') {
        const initData = msg as any;
        console.log(`MSG [${elapsed}s]: system/init tools=${JSON.stringify(initData.tools)}`);
        console.log(`MSG [${elapsed}s]: system/init mcp_servers=${JSON.stringify(initData.mcp_servers || 'N/A')}`);
      } else if (msg.type === 'result') {
        const r = msg as any;
        console.log(`MSG [${elapsed}s]: result is_error=${r.is_error} tokens=${r.usage?.input_tokens} cost=$${r.total_cost_usd}`);
        console.log(`MSG [${elapsed}s]: result text: ${r.result?.slice(0, 500)}`);
      } else {
        const s = JSON.stringify(msg).slice(0, 300);
        console.log(`MSG [${elapsed}s]: ${msg.type} ${s}`);
      }
    }
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`Done in ${elapsed}s`);
  } catch (e: any) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`ERROR after ${elapsed}s:`, e.message || e);
  }
})();
