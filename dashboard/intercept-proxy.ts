// Minimal intercepting proxy to capture SDK request
import http from 'http';
import https from 'https';
import fs from 'fs';

const TARGET_HOST = 'kunnewapi.net';
const LISTEN_PORT = 19876;

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => body += chunk);
  req.on('end', () => {
    // Log request details
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: req.headers,
      bodySize: body.length,
      bodyKB: (body.length / 1024).toFixed(1),
    };

    console.log('\n=== REQUEST ===');
    console.log('URL:', req.url);
    console.log('Body size:', logEntry.bodyKB, 'KB');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    // Parse and analyze the body
    try {
      const parsed = JSON.parse(body);
      console.log('Model:', parsed.model);
      console.log('Max tokens:', parsed.max_tokens);
      console.log('Stream:', parsed.stream);
      console.log('Thinking:', JSON.stringify(parsed.thinking));
      console.log('Tools count:', parsed.tools?.length || 0);
      console.log('System type:', typeof parsed.system === 'string' ? 'string' : Array.isArray(parsed.system) ? 'array[' + parsed.system.length + ']' : typeof parsed.system);
      console.log('Messages count:', parsed.messages?.length || 0);

      // Log tool names
      if (parsed.tools?.length > 0) {
        console.log('Tool names:', parsed.tools.map((t: any) => t.name).join(', '));
      }

      // Check for unusual fields
      const knownFields = ['model', 'max_tokens', 'stream', 'thinking', 'system', 'tools', 'messages', 'temperature', 'top_p', 'top_k', 'metadata', 'stop_sequences', 'tool_choice'];
      const extraFields = Object.keys(parsed).filter(k => !knownFields.includes(k));
      if (extraFields.length > 0) {
        console.log('EXTRA FIELDS:', extraFields);
        extraFields.forEach(f => console.log(`  ${f}:`, JSON.stringify(parsed[f]).slice(0, 200)));
      }

      // Save full body
      fs.writeFileSync('/tmp/sdk-request.json', body);
      console.log('Full body saved to /tmp/sdk-request.json');
    } catch (e) {
      console.log('Body is not JSON');
    }

    // Forward to real API
    const proxyReq = https.request({
      hostname: TARGET_HOST,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: TARGET_HOST,
      },
    }, (proxyRes) => {
      console.log('\n=== RESPONSE ===');
      console.log('Status:', proxyRes.statusCode);

      res.writeHead(proxyRes.statusCode!, proxyRes.headers);

      let respBody = '';
      proxyRes.on('data', (chunk) => {
        respBody += chunk;
        res.write(chunk);
      });
      proxyRes.on('end', () => {
        if (proxyRes.statusCode !== 200) {
          console.log('Error response:', respBody.slice(0, 500));
        }
        res.end();
      });
    });

    proxyReq.on('error', (e) => {
      console.error('Proxy error:', e.message);
      res.writeHead(502);
      res.end('Proxy error');
    });

    proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(LISTEN_PORT, () => {
  console.log(`Intercepting proxy running on http://localhost:${LISTEN_PORT}`);
  console.log(`Forwarding to https://${TARGET_HOST}`);
});
