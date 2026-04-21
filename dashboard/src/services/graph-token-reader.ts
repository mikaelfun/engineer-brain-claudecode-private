/**
 * graph-token-reader.ts — Read Graph API token cached by Token Daemon
 *
 * Cache file: $TEMP/graph-api-token.json
 * Format: { secret: string, expiresOn: string, fetchedAt: string }
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const TEMP = process.env.TEMP || process.env.TMP || '/tmp'
const GRAPH_TOKEN_FILE = join(TEMP, 'graph-api-token.json')
const TOKEN_MARGIN_SECONDS = 120 // consider expired 2 min early

export interface GraphToken {
  secret: string
  expiresOn: number
  isValid: boolean
  remainSeconds: number
}

/**
 * Read the Graph API token from Token Daemon's cache file.
 * Returns null if file doesn't exist or is unparseable.
 */
export function readGraphToken(): GraphToken | null {
  if (!existsSync(GRAPH_TOKEN_FILE)) return null
  try {
    const raw = JSON.parse(readFileSync(GRAPH_TOKEN_FILE, 'utf-8'))
    const secret: string = raw.secret || ''
    const expiresOn = parseInt(raw.expiresOn || '0', 10)
    const now = Math.floor(Date.now() / 1000)
    const remainSeconds = expiresOn - now
    const isValid = secret.length > 100 && remainSeconds > TOKEN_MARGIN_SECONDS
    return { secret, expiresOn, isValid, remainSeconds }
  } catch {
    return null
  }
}
