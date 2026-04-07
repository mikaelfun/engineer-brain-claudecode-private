# AVD AVD Intune 管理 - Issue Details

**Entries**: 5 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. User Settings local admin policy not applied - user is not local admin on Cloud PC despite User Sett...
- **ID**: `avd-ado-wiki-073`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: CustomScriptExtension failed to download or execute the local admin PS1 script. Common causes: blocked URL (saprod.infra.windows365.microsoft.com), conflicting dual policies with opposite local admin settings, networking issues preventing .settings file delivery, or PowerShell execution restrictions
- **Solution**: 1) Check C:\Packages\Plugins\Microsoft.Compute.CustomScriptExtension\1.10.15\RuntimeSettings for .settings file containing localadmin PS1 URL. 2) Check matching .status file in Status folder for execution result. 3) If .status shows error: fix underlying issue (unblock URL/resolve policy conflict), delete .status file (NOT .settings), open admin cmd, cd to extension folder, run resetState.cmd then enable.cmd. 4) If no .settings/.status files exist after hours: networking issue on customer side.
- **Tags**: user-settings, local-admin, custom-script-extension, troubleshooting

### 2. Drive redirection cannot be disabled when using Context Based Redirection authentication context in ...
- **ID**: `avd-ado-wiki-226`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Known product limitation - drive redirection is not yet controllable via authentication context claims. Hotfix is pending
- **Solution**: Wait for hotfix from product team. As a workaround, use other methods (e.g., Intune policy, GPO) to disable drive redirection
- **Tags**: context-based-redirection, drive-redirection, known-limitation, hotfix-pending

### 3. The Office Apps were not deploying from the Intune Portal.
- **ID**: `avd-contentidea-kb-080`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: The Co-Management configuration was not referencing Intune for the App Package deployment.
- **Solution**: The SCCM co-management setting was directed to the Intune portal for Office applications. The machine was refreshed and a current SCCM configuration profile, which correctly referenced the Intune portal, was pulled down along with the associated apps. The primary challenge was that the co-management portion of SCCM was not linked to Intune for the deployment of the Office application.
- **Tags**: contentidea-kb

### 4. There were no group policy or Intune policies were blocking the Audio redirection. Also, in AVD's RD...
- **ID**: `avd-contentidea-kb-100`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: We
noticed below service was disabled by image hardening.  
 
  
  UmRdpService&nbsp;- Remote
  Desktop Services UserMode Port Redirector&nbsp; 
  
  
  Stopped (Disabled) (localSystem) 
  
   Tested disabling this service in Lab as well &amp; got same symptoms that audio will show as redirected but won't play.
- **Solution**: Enabled &amp; started service:&nbsp;Remote Desktop Services UserMode Port Redirector that fixed the issue.
- **Tags**: contentidea-kb

### 5. SharePoint site auto-sync configured via Intune policy takes 8+ hours to appear on Cloud PC
- **ID**: `avd-ado-wiki-a-r1-003`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: OneDrive sync timing behavior (not a Windows 365 issue) - the Timerautomount registry key needs to be set to trigger faster sync
- **Solution**: Set registry key HKCU\Software\Microsoft\OneDrive\Accounts\Business1\Timerautomount (QWORD=1), then close and reopen OneDrive app. Key is removed after sync completes; use Intune remediation script for persistence.
- **Tags**: sharepoint, onedrive, intune
