---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/Health Check Failures/SxSStack/SxS Stack Agent Stuck on Upgrading"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWorkflows%2FHost%20or%20AVD%20Agent%2FHealth%20Check%20Failures%2FSxSStack%2FSxS%20Stack%20Agent%20Stuck%20on%20Upgrading"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SxS Stack Manual Reinstall Guide

> **Use this ONLY as a last resort**, if every other troubleshooting attempt failed. Discuss with an SME before proceeding.

## Prerequisites
- Check if DisableRegistryTools is blocking installation first (see known issue avd-ado-wiki-a-r5-004)
- See also: [Remove DisableRegistryTools](https://learn.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-agent#remove-disableregistrytools)

## Manual Reinstall Steps

1. Sign in to your session host VM as an administrator.

2. From an elevated PowerShell prompt run `qwinsta.exe` and make note of the version number next to `rdp-sxs` in the SESSIONNAME column.
   - If the STATE column for rdp-tcp and rdp-sxs entries is not `Listen`, or they are not listed at all, there is a stack issue.

3. Stop the RDAgentBootLoader service:
   ```powershell
   Stop-Service RDAgentBootLoader
   ```

4. Go to **Control Panel > Programs > Programs and Features** (or Settings App > Apps on Windows 11).

5. Uninstall the latest version of **Remote Desktop Services SxS Network Stack** or the version listed in Registry Editor at:
   `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations` under `ReverseConnectionListener`

6. Get the latest SxS Stack installer and install:
   ```powershell
   $sxsMsi = (Get-ChildItem "$env:SystemDrive\Program Files\Microsoft RDInfra\" | ? Name -like SxSStack*.msi | Sort-Object CreationTime -Descending | Select-Object -First 1).FullName
   $sxsMsi
   msiexec /i $sxsMsi
   ```

7. **Restart** the session host VM.

8. Run `qwinsta.exe` again and verify the STATE column for rdp-tcp and rdp-sxs entries is `Listen`.

9. If not listening, [re-register VM and reinstall agent component](https://learn.microsoft.com/en-us/azure/virtual-desktop/troubleshoot-agent#your-issue-isnt-listed-here-or-wasnt-resolved).
