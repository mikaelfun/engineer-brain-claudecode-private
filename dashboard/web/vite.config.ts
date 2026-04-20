import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read port config from project config.json
function readPortConfig() {
  try {
    const configPath = resolve(__dirname, '..', '..', 'config.json')
    const raw = JSON.parse(readFileSync(configPath, 'utf-8'))
    return {
      serverPort: raw.dashboard?.serverPort ?? 3010,
      webPort: raw.dashboard?.webPort ?? 5173,
    }
  } catch {
    return { serverPort: 3010, webPort: 5173 }
  }
}

const ports = readPortConfig()

export default defineConfig({
  plugins: [react()],
  server: {
    port: ports.webPort,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: `http://localhost:${ports.serverPort}`,
        changeOrigin: true,
        // Ensure SSE responses are streamed without buffering
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const contentType = proxyRes.headers['content-type'] || ''
            if (contentType.includes('text/event-stream')) {
              // Disable proxy buffering for SSE streams
              proxyRes.headers['x-accel-buffering'] = 'no'
              proxyRes.headers['cache-control'] = 'no-cache, no-transform'
            }
          })
        },
      },
    },
  },
})
