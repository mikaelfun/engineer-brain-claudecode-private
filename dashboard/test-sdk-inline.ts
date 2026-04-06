import { query } from '@anthropic-ai/claude-agent-sdk';
const start = Date.now();
console.log('Starting SDK query test...');
try {
  for await (const msg of query({
    prompt: 'Say hello and nothing else',
    options: {
      cwd: process.cwd(),
      settingSources: ['user', 'project'] as any,
      systemPrompt: { type: 'preset' as const, preset: 'claude_code' as const, append: 'Test only' },
      allowedTools: ['Read'],
      permissionMode: 'bypassPermissions' as any,
      allowDangerouslySkipPermissions: true,
      maxTurns: 2,
    }
  })) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`${elapsed}s: ${msg.type}`);
    if (msg.type === 'assistant') {
      const texts = ((msg as any).message?.content || []).filter((c:any) => c.type === 'text').map((c:any) => c.text?.substring(0, 100));
      if (texts.length) console.log('  text:', texts.join(' '));
    }
    if (msg.type === 'result') {
      console.log('  result:', JSON.stringify(msg).substring(0, 300));
      break;
    }
  }
  console.log(`Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
} catch (e: any) {
  console.log(`ERROR after ${((Date.now() - start) / 1000).toFixed(1)}s:`, e.message?.substring(0, 500));
}
