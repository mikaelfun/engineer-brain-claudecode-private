# 其他杂项 — Troubleshooting Workflow

**Scenario Count**: 14
**Generated**: 2026-04-18

---

## Scenario 1: Windows 10 EVD multi-session images (19h2-evd, 20h2-evd) fai...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Fixed per ICM 255528022. Workaround: run slmgr.vbs /ipk NPPR9-FWDCX-D2C8J-H872K-2YT43 then slmgr.vbs /ato to manually activate. Or use O365 image variants which activate correctly

**Root Cause**: Platform bug on specific AVD multi-session images in Mooncake (ICM 255528022). The non-O365 EVD images lacked proper KMS activation configuration for Mooncake environment

## Scenario 2: Windows 365 Boot sign-in fails after 2-minute transition/int...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Known platform limitation — VMs put in inactive state for resource management need startup time exceeding the transition screen timeout. Windows 365 and AVD App teams are aware. Kusto: query WindowsCoreEvents with CorrelationId, look for CPCStateChanged showing oldState/newState stuck at Connecting.

**Root Cause**: Cloud PCs in inactive state (unused for a while) require 2-3 minutes to start. The transition screen has a fixed 2-minute timeout which expires before the VM is ready, resulting in a 30-second error screen followed by return to sign-in.

## Scenario 3: AVD preview API versions being deprecated (tracking ID: PKYM...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1
- Check the deprecation tracking page: portal.azure.cn → Azure Health → PKYM-DVG
- 2
- Verify your automation/scripts do not use the deprecated preview API versions
- 3
- Azure CLI (2.75.0+) uses 2021-07-12 and is safe
- 4
- Portal operations are unaffected
- 5
- Migrate any custom ARM/REST calls to a supported GA API version.

**Root Cause**: Microsoft retiring preview API versions for Azure Virtual Desktop. Only specific preview versions on the published deprecation list are affected.

## Scenario 4: Clipboard redirection fails or window cannot be resized afte...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Allow-list rdpclipcdv.exe and rdpinputcdv.exe from C:\Program Files\Microsoft RDInfra subfolders

**Root Cause**: rdpclipcdv.exe and rdpinputcdv.exe blocked by AppLocker/SRP/endpoint protection

## Scenario 5: User connects but no feed/icons displayed in AVD
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Check Get-AzRoleAssignment; clear cache; use security groups

**Root Cause**: Not assigned to app groups, cached creds, or distribution group instead of security group

## Scenario 6: Windows 7 WVD host pool deployment succeeds but VMs do not a...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Before adding Windows 7 VMs to WVD host pool: 1) Install RDP 8 update (KB2592687), 2) Ensure .NET Framework >= 4.7.2, 3) Enable RDP 8.0 policy (Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Remote Session Environment > Remote Desktop Protocol 8.0), 4) Reboot VM, 5) Reinstall WVD Agent and Agent Manager with proper Registration Key. Note: Windows 7 is out of support.

**Root Cause**: Windows 7 ships with RDP 7.1 which is incompatible with WVD. Deployment without upgrading to RDP 8 and .NET Framework 4.7.2 causes VM registration failure.

## Scenario 7: Error message when navigating to AVD Per-User Access Pricing...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- Ensure the user has RBAC permissions to manage Azure resources within the subscription (e.g., Owner or Contributor role on the subscription)

**Root Cause**: Insufficient RBAC permissions to manage Azure resources within the subscription — user lacks permission to view or change enrollment status

## Scenario 8: Customer enrolled an Azure subscription in AVD per-user acce...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- Advise customer to wait up to 1 hour after initiating enrollment, then refresh the Azure portal page to see the updated enrollment status

**Root Cause**: Enrollment can take up to 1 hour after user clicks Enroll before status changes to Enrolled; no notification is sent when enrollment completes

## Scenario 9: AVD auto scaling setup script CreateOrUpdateAzAutoAccount.ps...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Replace the AADTenantId placeholder with actual Azure AD tenant ID in GUID format. Find tenant ID via Azure Portal > Azure Active Directory > Properties.

**Root Cause**: AADTenantId parameter contains placeholder value instead of actual Azure AD tenant GUID.

## Scenario 10: AD DS group membership for VM not working for Azure Files au...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Restart the VM after adding it to the AD DS group

**Root Cause**: VM needs to be restarted to activate new AD DS group membership

## Scenario 11: User assignments not visible after moving subscription betwe...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Reassign users to application groups in new tenant

**Root Cause**: Old assignments tied to previous tenant

## Scenario 12: User loses feed after subscription moved between Entra tenan...
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Reassign users; re-register DesktopVirtualization RP for CSP

**Root Cause**: Assignments tied to old tenant or CSP transfer

## Scenario 13: WebAuthn redirection not working - no Windows Hello or secur...
> Source: MS Learn | Applicable: ❓

### Troubleshooting Steps
- Enable FIDO2 in Entra ID; use Sign in with Windows Hello option; verify supported OS

**Root Cause**: FIDO2 method not enabled in Entra ID, or user signed in single-factor, or unsupported OS

## Scenario 14: Azure region not visible when selecting AVD service object l...
> Source: MS Learn | Applicable: ❓

### Troubleshooting Steps
- Re-register Microsoft.DesktopVirtualization resource provider

**Root Cause**: Microsoft.DesktopVirtualization resource provider needs re-registration
