---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/troubleshoot-aad-connect-fails-to-install-upgraded-version
importDate: "2026-04-24"
type: guide-draft
---

# Troubleshoot Microsoft Entra Connect Upgrade Issues

Multi-scenario troubleshooting guide for AADC upgrade failures caused by stale/inconsistent Windows Installer product codes.

## Symptoms

- Setup wizard detects old installation: "Product Azure AD Sync Engine (version X) is installed, needs to be upgraded"
- Installation fails: "Service ADSync was not found on computer"
- Error 25019: Setup wizard cannot open registry key SYSTEM\CurrentControlSet\Services\ADSync\Parameters
- Stale product codes from previous uninstalled versions remain in Windows Installer database

## Diagnostic Steps

1. Start AADC wizard, wait for first page
2. Open %ProgramData%\AADConnect\ and examine latest installation trace log
3. Look for GetInstalledPackagesByUpgradeCode entries
4. Identify inconsistent or stale product codes (GUID format)

## Resolution Methods

### Method 1: Fix Windows Installer Issues
- Check if KB3139923 is installed (causes WI issues) - uninstall if present
- Install KB3072630 hotfix, restart

### Method 2: MsiExec Force Uninstall
1. Identify stale product code GUID from trace log
2. Run: SET productcode={GUID}
3. Run: MSIEXEC /x %productcode% /qn /norestart /l*v ... EXECUTE_UNINSTALL="1"
4. Restart, re-run setup wizard

### Method 3: Program Install/Uninstall Troubleshooter
- Run Microsoft Program Install and Uninstall troubleshooter tool
- Fixes corrupted registry keys automatically
- Last resort: reinstall Windows if Installer database is unrecoverable
