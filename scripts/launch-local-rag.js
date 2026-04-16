#!/usr/bin/env node
/**
 * launch-local-rag.js — Dynamic launcher for local-rag MCP server
 *
 * Reads config.json → dataRoot to resolve BASE_DIR and DB_PATH,
 * so .mcp.json doesn't need hardcoded absolute paths.
 */
const { readFileSync, existsSync } = require('fs')
const { join, resolve, dirname, isAbsolute } = require('path')
const { spawn } = require('child_process')

function findProjectRoot() {
  let dir = __dirname
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'config.json'))) return dir
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  // fallback: scripts/ is one level below project root
  return resolve(__dirname, '..')
}

const projectRoot = findProjectRoot()
const configPath = join(projectRoot, 'config.json')

let dataRoot
try {
  const config = JSON.parse(readFileSync(configPath, 'utf-8'))
  const raw = config.dataRoot || '../data'
  dataRoot = isAbsolute(raw) ? raw : resolve(projectRoot, raw)
} catch {
  dataRoot = resolve(projectRoot, '..', 'data')
  console.error(`[launch-local-rag] config.json not found, using fallback dataRoot: ${dataRoot}`)
}

// Resolve local-rag entry point: ~/.claude/mcp-servers/local-rag/dist/index.js
const userHome = process.env.USERPROFILE || process.env.HOME
const localRagIndex = join(userHome, '.claude', 'mcp-servers', 'local-rag', 'dist', 'index.js')

if (!existsSync(localRagIndex)) {
  console.error(`[launch-local-rag] local-rag not found at: ${localRagIndex}`)
  console.error('Run: cd ~/.claude/mcp-servers/local-rag && npm install && npm run build')
  process.exit(1)
}

// Merge env: inherit .mcp.json env vars, add dynamic paths
const env = {
  ...process.env,
  BASE_DIR: process.env.BASE_DIR || join(dataRoot, 'OneNote Export'),
  DB_PATH: process.env.DB_PATH || join(dataRoot, 'lancedb'),
}

const child = spawn(process.execPath, [localRagIndex], {
  env,
  stdio: 'inherit',
})

child.on('close', (code) => process.exit(code ?? 1))
