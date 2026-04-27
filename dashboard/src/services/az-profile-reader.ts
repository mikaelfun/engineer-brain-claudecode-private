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
import { config } from '../config.js'

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

// Read azProfilesRoot from config.json (single source of truth)
function getAzProfilesDir(): string {
  try {
    const configPath = join(config.projectRoot, 'config.json')
    const cfg = JSON.parse(readFileSync(configPath, 'utf-8'))
    if (cfg.azProfilesRoot) return cfg.azProfilesRoot
  } catch { /* fall through to legacy */ }
  return join(process.env.USERPROFILE || process.env.HOME || '', '.azure-profiles')
}

const AZ_PROFILES_DIR = getAzProfilesDir()

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
      let raw = readFileSync(azProfile, 'utf-8')
      // Strip UTF-8 BOM (az CLI writes BOM on Windows)
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1)
      const data = JSON.parse(raw)
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
 * Run an az CLI command via Windows PowerShell.
 * WSL az cannot read DPAPI-encrypted msal_token_cache.bin — must use Windows az.
 */
async function winAz(profileDir: string, azArgs: string): Promise<{ stdout: string; stderr: string }> {
  const psCmd = `$env:AZURE_CONFIG_DIR = (Join-Path (Join-Path $env:USERPROFILE '.azure-profiles') '${profileDir}'); ${azArgs}`
  return new Promise((resolve, reject) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-Command', psCmd], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = '', stderr = ''
    child.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    child.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    const timer = setTimeout(() => { child.kill(); reject(new Error('timeout')) }, 20_000)
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve({ stdout, stderr })
      else reject(Object.assign(new Error(`exit ${code}`), { stderr }))
    })
    child.on('error', (err) => { clearTimeout(timer); reject(err) })
  })
}

/**
 * Health-check a single profile via Windows az CLI:
 * 1. Can it get an access token? (refresh token valid)
 * 2. Is the current tenant the expected one? (no cross-profile contamination)
 */
async function checkProfile(profile: { name: string; profileDir: string; cloud: 'china' | 'public'; path: string }): Promise<AzProfileStatus> {
  const resource = profile.cloud === 'china'
    ? 'https://management.chinacloudapi.cn'
    : 'https://management.azure.com'

  try {
    await winAz(profile.profileDir, `az account get-access-token --resource ${resource} -o none`)

    const expectedTenant = readTenantId(profile.path)
    if (expectedTenant) {
      const { stdout } = await winAz(profile.profileDir, `az account show --query tenantId -o tsv`)
      const currentTenant = stdout.trim()
      if (currentTenant && currentTenant !== expectedTenant) {
        return {
          name: profile.name,
          profileDir: profile.profileDir,
          cloud: profile.cloud,
          status: 'expired',
          lastChecked: new Date().toISOString(),
          error: `Tenant mismatch: ${currentTenant.slice(0, 8)}… vs expected ${expectedTenant.slice(0, 8)}…`,
        }
      }
    }

    return {
      name: profile.name,
      profileDir: profile.profileDir,
      cloud: profile.cloud,
      status: 'ok',
      lastChecked: new Date().toISOString(),
      error: null,
    }
  } catch (err: any) {
    const stderr = err.stderr || ''
    const lines = stderr.split('\n').filter((l: string) => !l.includes('UNC paths') && !l.includes('CMD.EXE') && !l.includes('wsl.localhost') && l.trim())
    const msg = lines[0]?.trim() || err.message || 'unknown error'
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
      let raw = readFileSync(azProfile, 'utf-8')
      if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1)
      const data = JSON.parse(raw)
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
 * Trigger `az login` via Windows PowerShell (not WSL az).
 * Windows az CLI uses WAM token broker which properly isolates per-profile MSAL cache.
 * WSL az lacks WAM and pollutes all profiles — never use it for login.
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

  // Build PowerShell command that runs on Windows side
  // Use Join-Path to avoid backslash escaping issues between JS and PowerShell
  let psCmd = `$env:AZURE_CONFIG_DIR = (Join-Path (Join-Path $env:USERPROFILE '.azure-profiles') '${profileDir}'); az login --scope "${scope}"`
  if (tenantId) {
    psCmd += ` --tenant "${tenantId}"`
  }

  const command = `powershell.exe: ${psCmd}`

  try {
    _loginInProgress.add(profileDir)

    const child = spawn('powershell.exe', ['-NoProfile', '-Command', psCmd], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout?.on('data', (d: Buffer) => console.log(`[az-profile] ${profile.name}: ${d.toString().trim()}`))
    child.stderr?.on('data', (d: Buffer) => console.warn(`[az-profile] ${profile.name} stderr: ${d.toString().trim()}`))

    child.on('close', async (code) => {
      _loginInProgress.delete(profileDir)
      if (code === 0) {
        console.log(`[az-profile] Login succeeded for ${profile.name}, refreshing status...`)
      } else {
        console.warn(`[az-profile] Login failed for ${profile.name} (exit code ${code})`)
      }
      await runHealthCheck()
    })

    child.on('error', (err) => {
      _loginInProgress.delete(profileDir)
      console.warn(`[az-profile] Login spawn error for ${profile.name}:`, err.message)
    })

    console.log(`[az-profile] Started Windows az login for ${profile.name}`)
    return { started: true, command }
  } catch (err: any) {
    _loginInProgress.delete(profileDir)
    return { started: false, command, error: err.message }
  }
}
