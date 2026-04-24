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
import { exec, spawn } from 'child_process'
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

// ── Interactive login ──

/**
 * Read tenant ID from profile's azureProfile.json
 */
function readTenantId(profilePath: string): string | null {
  try {
    const azProfile = join(profilePath, 'azureProfile.json')
    if (existsSync(azProfile)) {
      const data = JSON.parse(readFileSync(azProfile, 'utf-8'))
      const subs = data.subscriptions || []
      if (subs.length > 0 && subs[0].tenantId) return subs[0].tenantId
    }
  } catch { /* fall through */ }
  return null
}

/** Track in-progress login per profile */
const _loginInProgress = new Set<string>()

export function isLoginInProgress(profileDir: string): boolean {
  return _loginInProgress.has(profileDir)
}

/**
 * Trigger interactive `az login` for a specific profile.
 * Opens the system browser for auth. Returns immediately after spawning.
 * When the az login process exits, automatically runs health check to update cache.
 */
export async function loginAzProfile(profileDir: string): Promise<{ started: boolean; command: string; error?: string }> {
  if (_loginInProgress.has(profileDir)) {
    return { started: false, command: '', error: 'Login already in progress for this profile' }
  }

  const profiles = discoverProfiles()
  const profile = profiles.find(p => p.profileDir === profileDir)
  if (!profile) {
    return { started: false, command: '', error: `Profile "${profileDir}" not found` }
  }

  const tenantId = readTenantId(profile.path)
  const scope = profile.cloud === 'china'
    ? 'https://management.chinacloudapi.cn/.default'
    : 'https://management.azure.com/.default'

  const args = ['login', '--scope', scope]
  if (tenantId) {
    args.push('--tenant', tenantId)
  }
  // China Cloud: browser flow often fails silently on Windows (WAM intercept),
  // use device-code flow which always works and shows URL in stdout
  if (profile.cloud === 'china') {
    args.push('--use-device-code')
  }

  const command = `az ${args.join(' ')}`

  try {
    _loginInProgress.add(profileDir)

    // For device-code flow (china), capture stdout to get the device code URL.
    // For browser flow (global), use ignore (browser opens system-level).
    const useDeviceCode = profile.cloud === 'china'
    const child = spawn('az', args, {
      env: { ...process.env, AZURE_CONFIG_DIR: profile.path },
      stdio: useDeviceCode ? ['ignore', 'pipe', 'pipe'] : 'ignore',
      shell: true,
    })

    // Capture device code output for logging (and potential frontend display)
    let deviceCodeOutput = ''
    if (useDeviceCode && child.stdout) {
      child.stdout.on('data', (data: Buffer) => {
        const line = data.toString()
        deviceCodeOutput += line
        console.log(`[az-profile] ${profile.name}: ${line.trim()}`)
      })
    }
    if (useDeviceCode && child.stderr) {
      child.stderr.on('data', (data: Buffer) => {
        console.warn(`[az-profile] ${profile.name} stderr: ${data.toString().trim()}`)
      })
    }

    child.on('close', async (code) => {
      _loginInProgress.delete(profileDir)
      if (code === 0) {
        console.log(`[az-profile] ✅ Login succeeded for ${profile.name}, refreshing status...`)
        await runHealthCheck()
      } else {
        console.warn(`[az-profile] ❌ Login failed for ${profile.name} (exit code ${code})`)
        // Still refresh to update the error message
        await runHealthCheck()
      }
    })

    child.on('error', (err) => {
      _loginInProgress.delete(profileDir)
      console.warn(`[az-profile] Login spawn error for ${profile.name}:`, err.message)
    })

    console.log(`[az-profile] Started interactive login for ${profile.name}: ${command}`)
    return { started: true, command }
  } catch (err: any) {
    _loginInProgress.delete(profileDir)
    return { started: false, command, error: err.message }
  }
}
