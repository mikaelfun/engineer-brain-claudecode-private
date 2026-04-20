# AVD 其他杂项 - Quick Reference

**Entries**: 14 | **21V**: mixed
**Keywords**: activation, ad-ds, api-deprecation, application-group, applocker, auto-scaling, automation-account, azure-files, azure-health, billing, clipboard, csp, deprecated, dll-missing, enrolling-state
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Windows 10 EVD multi-session images (19h2-evd, 20h2-evd) fail to activate in Azu... | Platform bug on specific AVD multi-session images in Mooncake (ICM 255528022). T... | Fixed per ICM 255528022. Workaround: run slmgr.vbs /ipk NPPR9-FWDCX-D2C8J-H872K-... | 🟢 8.5 | OneNote |
| 2 📋 | Windows 365 Boot sign-in fails after 2-minute transition/interstitial screen tim... | Cloud PCs in inactive state (unused for a while) require 2-3 minutes to start. T... | Known platform limitation — VMs put in inactive state for resource management ne... | 🟢 8.0 | ADO Wiki |
| 3 📋 | AVD preview API versions being deprecated (tracking ID: PKYM-DVG). Only preview ... | Microsoft retiring preview API versions for Azure Virtual Desktop. Only specific... | 1. Check the deprecation tracking page: portal.azure.cn → Azure Health → PKYM-DV... | 🟢 8.0 | OneNote |
| 4 📋 | Clipboard redirection fails or window cannot be resized after SxS Network Stack ... | rdpclipcdv.exe and rdpinputcdv.exe blocked by AppLocker/SRP/endpoint protection | Allow-list rdpclipcdv.exe and rdpinputcdv.exe from C:\Program Files\Microsoft RD... | 🔵 7.0 | MS Learn |
| 5 📋 | User connects but no feed/icons displayed in AVD | Not assigned to app groups, cached creds, or distribution group instead of secur... | Check Get-AzRoleAssignment; clear cache; use security groups | 🔵 7.0 | MS Learn |
| 6 📋 | Windows 7 WVD host pool deployment succeeds but VMs do not appear in host pool; ... | Windows 7 ships with RDP 7.1 which is incompatible with WVD. Deployment without ... | Before adding Windows 7 VMs to WVD host pool: 1) Install RDP 8 update (KB2592687... | 🔵 7.0 | ADO Wiki |
| 7 📋 | Error message when navigating to AVD Per-User Access Pricing page in Azure porta... | Insufficient RBAC permissions to manage Azure resources within the subscription ... | Ensure the user has RBAC permissions to manage Azure resources within the subscr... | 🔵 6.5 | ADO Wiki |
| 8 📋 | Customer enrolled an Azure subscription in AVD per-user access pricing but the A... | Enrollment can take up to 1 hour after user clicks Enroll before status changes ... | Advise customer to wait up to 1 hour after initiating enrollment, then refresh t... | 🔵 6.5 | ADO Wiki |
| 9 📋 | AVD auto scaling setup script CreateOrUpdateAzAutoAccount.ps1 fails with 'Unable... | AADTenantId parameter contains placeholder value instead of actual Azure AD tena... | Replace the AADTenantId placeholder with actual Azure AD tenant ID in GUID forma... | 🔵 6.5 | OneNote |
| 10 📋 | AD DS group membership for VM not working for Azure Files authentication | VM needs to be restarted to activate new AD DS group membership | Restart the VM after adding it to the AD DS group | 🔵 6.0 | MS Learn |
| 11 📋 | User assignments not visible after moving subscription between Entra tenants | Old assignments tied to previous tenant | Reassign users to application groups in new tenant | 🔵 6.0 | MS Learn |
| 12 📋 | User loses feed after subscription moved between Entra tenants | Assignments tied to old tenant or CSP transfer | Reassign users; re-register DesktopVirtualization RP for CSP | 🔵 6.0 | MS Learn |
| 13 📋 | WebAuthn redirection not working - no Windows Hello or security key option in AV... | FIDO2 method not enabled in Entra ID, or user signed in single-factor, or unsupp... | Enable FIDO2 in Entra ID; use Sign in with Windows Hello option; verify supporte... | 🟡 4.5 | MS Learn |
| 14 📋 | Azure region not visible when selecting AVD service object location | Microsoft.DesktopVirtualization resource provider needs re-registration | Re-register Microsoft.DesktopVirtualization resource provider | 🟡 4.5 | MS Learn |

## Quick Triage Path

1. Check: Platform bug on specific AVD multi-session images in Mooncak... `[Source: OneNote]`
2. Check: Cloud PCs in inactive state (unused for a while) require 2-3... `[Source: ADO Wiki]`
3. Check: Microsoft retiring preview API versions for Azure Virtual De... `[Source: OneNote]`
4. Check: rdpclipcdv.exe and rdpinputcdv.exe blocked by AppLocker/SRP/... `[Source: MS Learn]`
5. Check: Not assigned to app groups, cached creds, or distribution gr... `[Source: MS Learn]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/general-other.md#troubleshooting-flow)