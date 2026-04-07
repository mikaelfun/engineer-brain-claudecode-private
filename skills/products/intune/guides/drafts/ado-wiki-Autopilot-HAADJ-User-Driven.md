---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Autopilot/User-Driven Hybrid Join"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot%2FUser-Driven%20Hybrid%20Join"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Autopilot User-Driven Hybrid Azure AD Join - Troubleshooting Guide

## Public Documentation
- https://docs.microsoft.com/en-us/mem/autopilot/windows-autopilot-hybrid
- https://docs.microsoft.com/en-us/mem/autopilot/user-driven#user-driven-mode-for-hybrid-azure-active-directory-join-with-vpn-support

## Summary

User-Driven Hybrid AzureAD Join Autopilot = User-Driven AzureAD-only Autopilot + on-premises domain join (producing Hybrid AADJ).

## Major Parts / Stages

1. Deployment Profiles
2. Devices (hardware hash import)
3. Autopilot Dynamic Device Group
4. Device Configuration - Domain Join Profile
5. Intune Connector (ODJ Connector) — both Updated and Legacy
6. ESP (Enrollment Status Page)
7. Apps

## Key Troubleshooting Tips

### Deployment Profiles
- Only ONE profile should be Assigned=Yes; AzureAD-only and Hybrid profiles must NOT be assigned to the same dynamic device group
- Cannot use Hybrid Profile with AzureAD-only join type and vice versa
- Only User-Driven mode available for HAADJ (not Self-Deploying)

### Domain Join Profile
- `nltest /dsgetdc:corp.contoso.com` must work (substituting exact domain); if it fails, Autopilot ODJ join will never succeed
- For "Skip AD Connectivity Check" option: connectivity still required after AP completes during Windows Logon (VPN needed for remote users)
- OU path syntax: must use `OU=` and `DC=`, NOT `CN=`
- Computer name: cannot use `%SERIAL%` or exceed 15 characters
- Non-Federated tenants with SkipUSEResp: "Fix your Account" message appears, takes 30-40 minutes for AADSyncScheduler to sync objects

### ODJ Connector (Updated)
- Requires WebView2 — setup auto-prompts install if missing
- Need Read/Write permission on `C:\Program Files\Microsoft Intune\ODJConnector\ODJConnectorEnrollmentWizard\ODJConnectorEnrollmentWizard.exe.webview2` folder
- Reinstall procedure: fully uninstall → delete MSA accounts → reinstall → close installer → run from install folder
- Logs: EventViewer > Applications and Services > Microsoft > Intune > ODJ Connector (Admin + Operational) + `ODJConnectorUI.txt`

### ODJ Connector (Legacy)
- GA account only needed temporarily at install time
- Multi-domain: connector service account must be able to create computer objects in ALL domains
- Service account needs: Log on as service, Domain user group, local Administrators group

### ESP
- Default 60-minute timeout may be insufficient for large apps (Office 1.8GB + others → consider 90-120 min)
- NEVER disable Device ESP; User ESP can be disabled if needed

### Apps
- NEVER mix LOB (MSI) and Win32 apps during Autopilot — documented in multiple public articles
- Recommended: limit required apps during ESP to essentials (Office, security/VPN)
- Troubleshooting: divide and conquer approach to identify problematic app

### Log Collection
1. `autopilot.cab`: at error/timeout, Shift+F10 → `MdmDiagnosticsTool.exe -area DeviceEnrollment;Autopilot;TPM;DeviceProvisioning -cab C:\temp\autopilot.cab`
2. Autopilot Diagnostics Timeline: `Get-AutopilotDiagnostics.ps1 -online`
3. Client: `%windir%\debug\netsetup.log`
4. ODJ Connector Server: EventViewer logs (within 2 hours of client logs)

### Clean Slate Testing Procedure
1. Wipe device from Endpoint.microsoft.com
2. Delete from Endpoint.microsoft.com
3. Delete from local AD Autopilot container (if HAADJ)
4. Delete serial number from Autopilot Devices Blade + Sync
5. Delete associated Azure AD device(s) from portal.azure.com
6. Re-import hardware hash CSV
7. Wait for Profile status = Assigned + run Sync

## Known Errors
- Error 80070774: "Assigned User" feature causes HAADJ Autopilot to fail
- "Timed Out waiting for ODJ blob": verify Domain Join profile group membership; try assigning to All Devices temporarily
- "Fix your Account": non-Federated tenant with SkipUSEResp, wait 30-40 min or re-authenticate

## Escalation
- Teams channel: Autopilot SME Discussion
- Contact: IntuneAutopilotSMEs@microsoft.com
