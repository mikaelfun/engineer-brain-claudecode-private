# Windows Auto-Start Deployment

How to make the claude-to-im bridge start automatically on login and survive reboots on Windows.

## Methods (pick one)

| Method | Complexity | Reliability | Recommended |
|--------|-----------|-------------|-------------|
| **Scheduled Task** (below) | Low | High | Yes — no extra software needed |
| **Windows Service via WinSW/NSSM** | Medium | Highest | For production servers |
| **Startup folder shortcut** | Low | Low | Not recommended — no restart on crash |

## Method 1: Scheduled Task (Recommended)

### One-click deploy via CLI

Tell your Claude Code / Codex agent:

```
/claude-to-im install-autostart
```

This creates a Windows Scheduled Task that launches the bridge at login with automatic restart on failure.

### Manual setup

#### Step 1: Create the autostart script

Create `~/.claude-to-im/runtime/autostart.ps1`:

```powershell
# ClaudeToIM Bridge Auto-Start Wrapper
$ErrorActionPreference = 'Continue'
$configPath = Join-Path $env:USERPROFILE '.claude-to-im\config.env'
$logFile = Join-Path $env:USERPROFILE '.claude-to-im\logs\bridge.log'

# Resolve SKILL_DIR — adjust if your skill is installed elsewhere
$skillDir = Join-Path $env:USERPROFILE '.claude\skills\claude-to-im'
if (-not (Test-Path $skillDir)) {
    $skillDir = Join-Path $env:USERPROFILE '.codex\skills\claude-to-im'
}
$daemonPath = Join-Path $skillDir 'dist\daemon.mjs'

# Load config.env into process environment
if (Test-Path $configPath) {
    Get-Content $configPath | ForEach-Object {
        if ($_ -match '^([^#=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), 'Process')
        }
    }
}

# ┌─────────────────────────────────────────────────────────────────┐
# │ CRITICAL: Do NOT pipe node output to bridge.log here.          │
# │                                                                │
# │ The daemon has its own logger (src/logger.ts) that writes to   │
# │ bridge.log with createWriteStream(). If this wrapper ALSO      │
# │ pipes to bridge.log via Out-File, Windows file locking causes  │
# │ EBUSY errors and the daemon enters a crash-loop.               │
# │                                                                │
# │ Use Write-Host (goes to hidden console) or a SEPARATE log file │
# │ for wrapper-level messages only.                               │
# └─────────────────────────────────────────────────────────────────┘
$wrapperLog = Join-Path $env:USERPROFILE '.claude-to-im\logs\autostart-wrapper.log'

# Restart loop
while ($true) {
    $timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ss'
    "[$timestamp] Starting bridge..." | Out-File -Append $wrapperLog
    & node $daemonPath
    $exitCode = $LASTEXITCODE
    "[$timestamp] Bridge exited (code: $exitCode). Restarting in 10s..." | Out-File -Append $wrapperLog
    Start-Sleep -Seconds 10
}
```

#### Step 2: Register the Scheduled Task

Run in an **elevated PowerShell** (Admin):

```powershell
$scriptPath = "$env:USERPROFILE\.claude-to-im\runtime\autostart.ps1"
$action = New-ScheduledTaskAction `
    -Execute 'pwsh.exe' `
    -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Days 365) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -MultipleInstances IgnoreNew

Register-ScheduledTask `
    -TaskName 'ClaudeToIMBridge' `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description 'Claude-to-IM Bridge auto-start with restart loop' `
    -RunLevel Limited
```

#### Step 3: Verify

```powershell
# Test run
Start-ScheduledTask -TaskName 'ClaudeToIMBridge'
Start-Sleep -Seconds 10

# Check status
Get-ScheduledTask -TaskName 'ClaudeToIMBridge' | Select-Object State
Get-Content "$env:USERPROFILE\.claude-to-im\runtime\status.json"
Get-Content "$env:USERPROFILE\.claude-to-im\logs\bridge.log" -Tail 10
```

### Uninstall

```powershell
# Stop and remove
Stop-ScheduledTask -TaskName 'ClaudeToIMBridge' -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName 'ClaudeToIMBridge' -Confirm:$false
```

## Method 2: Windows Service (WinSW/NSSM)

See `scripts/supervisor-windows.ps1`:

```
pwsh -File SKILL_DIR/scripts/supervisor-windows.ps1 install-service
```

Requires [WinSW](https://github.com/winsw/winsw/releases) or [NSSM](https://nssm.cc/download) in PATH.

## Known Pitfalls

### EBUSY crash-loop (Windows only)

**Symptom**: Bridge starts, immediately crashes with `EBUSY: resource busy or locked, open bridge.log`, restarts every 10 seconds in an infinite loop.

**Root cause**: The autostart wrapper pipes `node` output to `bridge.log` via `Out-File -Append`, while the daemon's internal logger (`src/logger.ts`) also opens `bridge.log` with `fs.createWriteStream()`. Windows enforces exclusive file locks — two writers on the same file = EBUSY.

**This does NOT happen on Linux/macOS** because POSIX allows multiple writers to the same file.

**Fix**: The autostart wrapper must NOT write to `bridge.log`. Use `Write-Host` (hidden console) or a separate file like `autostart-wrapper.log` for wrapper-level messages. The daemon handles all logging internally with rotation and secret masking.

**Bad** (causes crash-loop):
```powershell
& node $daemonPath 2>&1 | Out-File -Append $logFile   # ← EBUSY!
```

**Good**:
```powershell
& node $daemonPath   # daemon writes its own logs via logger.ts
```

### Double-restart mechanism

The Scheduled Task has its own `RestartCount` / `RestartInterval` (Task Scheduler level), AND the `autostart.ps1` script has a `while ($true)` restart loop (script level). These two layers overlap:

- If node crashes, the **script loop** restarts it in 10 seconds
- If pwsh.exe itself crashes, the **Task Scheduler** restarts it up to 3 times (1 min apart)

This is intentional — the script loop handles transient node failures, while Task Scheduler handles the rare case of PowerShell itself dying. But be aware that disabling one layer doesn't stop restarts entirely.

### SIGHUP on terminal close

If the daemon is started from a terminal (not via Scheduled Task), closing the terminal sends SIGHUP and kills the daemon. Use `supervisor-windows.ps1 start` (which uses `Start-Process -WindowStyle Hidden`) or the Scheduled Task method to avoid this.

### supervisor-windows.ps1 vs autostart.ps1

| Aspect | `supervisor-windows.ps1` | `autostart.ps1` |
|--------|--------------------------|------------------|
| Location | `SKILL_DIR/scripts/` (source-controlled) | `~/.claude-to-im/runtime/` (generated, not tracked) |
| Log handling | `Start-Process -RedirectStandardOutput` (separate stdout/stderr files) | Wrapper loop (must NOT pipe to bridge.log) |
| Process model | `Start-Process` spawns detached node.exe, pwsh exits | `while ($true)` keeps pwsh alive as parent |
| Restart | No built-in restart (relies on Task Scheduler) | Script-level restart loop + Task Scheduler |
| Use case | Interactive `start` / `stop` / `status` | Scheduled Task auto-start |
