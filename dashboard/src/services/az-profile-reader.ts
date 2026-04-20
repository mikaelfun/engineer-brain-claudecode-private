/**
 * az-profile-reader.ts — Azure CLI Profile 健康检查
 *
 * 核心逻辑：调用 `az account get-access-token`，成功 = refresh token 有效，
 * 失败 = 需要交互式 `az login`。不再监控 access token 剩余时间（无意义，
 * 因为 MSAL 会自动用 refresh token 续期）。
 *
 * 行为：
 * - 后端启动 10s 后首次并行检查所有 profile
 * - 每 15 分钟后台重新检查
 * - 前端 API 调用命中缓存，不触发 az CLI
 * - 状态变化时 console.warn
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// ── Types ──

export interface AzProfileStatus {
  name: string
  profileDir: string
  cloud: 'china' | 'public'
  /** ok = get-access-token succeeded (refresh token valid), expired = failed (need az login) */
  status: 'ok' | 'expired' | 'unknown'
  /** Last successful health check timestamp */
  lastChecked: string | null
  /** Error message if status is expired */
  error: string | null
}

// ── Config ──

const AZ_PROFILES_DIR = join(
  process.env.USERPROFILE || process.env.HOME || '',
  '.azure-profiles'
)

/** Display name overrides — unmatched dirs use titleCase of dir name */
const DISPLAY_NAMES: Record<string, string> = {
  'cme-fangkun': 'CME',
  'microsoft-fangkun': 'Microsoft',
  'mcpod-fangkun': 'MCPod',
  'kunlabext-fangkun': 'KunLabExt',
}

/**
 * Detect cloud type from profile's azureProfile.json.
 */
function detectCloud(profileDir: string, profilePath: string): 'china' | 'public' {
  try {
    const azProfile = join(profilePath, 'azureProfile.json')
    if (existsSync(azProfile)) {
      const data = JSON.parse(readFileSync(azProfile, 'utf-8'))
      const subs = data.subscriptions || []
      if (subs.some((s: any) => s.environmentName === 'AzureChinaCloud')) return 'china'
      if (subs.length > 0) return 'public'
    }
  } catch { /* fall through */ }

  const lower = profileDir.toLowerCase()
  if (lower.includes('cme') || lower.includes('mcpod') || lower.includes('mooncake') || lower.includes('21v')) {
    return 'china'
  }
  return 'public'
}

/** Convert dir name to display name */
function toDisplayName(dirName: string): string {
  if (DISPLAY_NAMES[dirName]) return DISPLAY_NAMES[dirName]
  return dirName
    .replace(/-fangkun$/, '')
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

/**
 * Dynamically discover all profiles under ~/.azure-profiles/
 */
function discoverProfiles(): Array<{ name: string; profileDir: string; cloud: 'china' | 'public'; path: string }> {
  if (!existsSync(AZ_PROFILES_DIR)) return []

  return readdirSync(AZ_PROFILES_DIR)
    .filter(dir => {
      const full = join(AZ_PROFILES_DIR, dir)
      return statSync(full).isDirectory()
    })
    .map(dir => {
      const full = join(AZ_PROFILES_DIR, dir)
      return {
        name: toDisplayName(dir),
        profileDir: dir,
        cloud: detectCloud(dir, full),
        path: full,
      }
    })
}

// ── Cache ──

let _cache: { profiles: AzProfileStatus[]; fetchedAt: number } | null = null

// ── Core: health check ──

/**
 * Health-check a single profile: can it silently get an access token?
 * Success = refresh token still valid. Failure = need interactive az login.
 */
async function checkProfile(profile: { name: string; profileDir: string; cloud: 'china' | 'public'; path: string }): Promise<AzProfileStatus> {
  const resource = profile.cloud === 'china'
    ? 'https://management.chinacloudapi.cn'
    : 'https://management.azure.com'

  try {
    await execAsync(
      `az account get-access-token --resource ${resource} -o none`,
      {
        encoding: 'utf-8',
        timeout: 15_000,
        env: { ...process.env, AZURE_CONFIG_DIR: profile.path },
      }
    )
    return {
      name: profile.name,
      profileDir: profile.profileDir,
      cloud: profile.cloud,
      status: 'ok',
      lastChecked: new Date().toISOString(),
      error: null,
    }
  } catch (err: any) {
    const msg = err.stderr?.trim().split('\n')[0] || err.message || 'unknown error'
    return {
      name: profile.name,
      profileDir: profile.profileDir,
      cloud: profile.cloud,
      status: 'expired',
      lastChecked: new Date().toISOString(),
      error: msg,
    }
  }
}

// ── Public API ──

/**
 * 读取所有 Azure CLI profile 的健康状态（命中缓存直接返回）
 */
export async function readAzProfileStatus(): Promise<AzProfileStatus[]> {
  // Return cache if available (background monitor keeps it fresh)
  if (_cache) {
    return _cache.profiles
  }
  // First call — do a full check
  return runHealthCheck()
}

/**
 * 强制重新检查所有 profile（清缓存）
 */
export async function refreshAzProfileTokens(): Promise<AzProfileStatus[]> {
  return runHealthCheck()
}

/**
 * Run parallel health check on all profiles and update cache.
 */
async function runHealthCheck(): Promise<AzProfileStatus[]> {
  const profiles = discoverProfiles()
  const results = await Promise.all(profiles.map(checkProfile))
  _cache = { profiles: results, fetchedAt: Date.now() }
  return results
}

// ── Background monitor ──

let _bgTimer: ReturnType<typeof setInterval> | null = null
let _onStatusChange: ((profiles: AzProfileStatus[]) => void) | null = null

/**
 * Start background health monitor.
 * Checks all profiles every 15 min. Calls onChange on status transitions.
 */
export function startAzProfileMonitor(onChange?: (profiles: AzProfileStatus[]) => void) {
  _onStatusChange = onChange ?? null
  if (_bgTimer) return

  const INTERVAL_MS = 15 * 60_000

  // Initial check 10s after startup
  setTimeout(async () => {
    try {
      const profiles = await runHealthCheck()
      const ok = profiles.filter(p => p.status === 'ok').length
      console.log(`[az-profile] Health check: ${ok}/${profiles.length} profiles ok`)
      if (ok < profiles.length) {
        const bad = profiles.filter(p => p.status !== 'ok')
        console.warn(`[az-profile] ⚠️ Need az login: ${bad.map(p => p.name).join(', ')}`)
      }
    } catch { /* non-fatal */ }
  }, 10_000)

  _bgTimer = setInterval(async () => {
    const oldStatuses = _cache?.profiles.map(p => `${p.profileDir}:${p.status}`) ?? []
    try {
      const profiles = await runHealthCheck()
      const newStatuses = profiles.map(p => `${p.profileDir}:${p.status}`)
      if (oldStatuses.length > 0 && oldStatuses.join(',') !== newStatuses.join(',')) {
        console.log('[az-profile] Status changed')
        _onStatusChange?.(profiles)
      }
    } catch (err) {
      console.warn('[az-profile] Background check failed:', err)
    }
  }, INTERVAL_MS)
}

export function stopAzProfileMonitor() {
  if (_bgTimer) {
    clearInterval(_bgTimer)
    _bgTimer = null
  }
}
