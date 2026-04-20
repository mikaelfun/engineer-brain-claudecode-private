# AVD 其他杂项 - Comprehensive Troubleshooting Guide

**Entries**: 14 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Windows 10 EVD multi-session images (19h2-evd, 20h2-evd) fail to activ... | Platform bug on specific AVD multi-session images in Mooncake (ICM 255... | Fixed per ICM 255528022. Workaround: run slmgr.vbs /ipk NPPR9-FWDCX-D2... |
| Windows 365 Boot sign-in fails after 2-minute transition/interstitial ... | Cloud PCs in inactive state (unused for a while) require 2-3 minutes t... | Known platform limitation — VMs put in inactive state for resource man... |
| AVD preview API versions being deprecated (tracking ID: PKYM-DVG). Onl... | Microsoft retiring preview API versions for Azure Virtual Desktop. Onl... | 1. Check the deprecation tracking page: portal.azure.cn → Azure Health... |
| Clipboard redirection fails or window cannot be resized after SxS Netw... | rdpclipcdv.exe and rdpinputcdv.exe blocked by AppLocker/SRP/endpoint p... | Allow-list rdpclipcdv.exe and rdpinputcdv.exe from C:\Program Files\Mi... |
| User connects but no feed/icons displayed in AVD | Not assigned to app groups, cached creds, or distribution group instea... | Check Get-AzRoleAssignment; clear cache; use security groups |
| Windows 7 WVD host pool deployment succeeds but VMs do not appear in h... | Windows 7 ships with RDP 7.1 which is incompatible with WVD. Deploymen... | Before adding Windows 7 VMs to WVD host pool: 1) Install RDP 8 update ... |
| Error message when navigating to AVD Per-User Access Pricing page in A... | Insufficient RBAC permissions to manage Azure resources within the sub... | Ensure the user has RBAC permissions to manage Azure resources within ... |
| Customer enrolled an Azure subscription in AVD per-user access pricing... | Enrollment can take up to 1 hour after user clicks Enroll before statu... | Advise customer to wait up to 1 hour after initiating enrollment, then... |
| AVD auto scaling setup script CreateOrUpdateAzAutoAccount.ps1 fails wi... | AADTenantId parameter contains placeholder value instead of actual Azu... | Replace the AADTenantId placeholder with actual Azure AD tenant ID in ... |
| AD DS group membership for VM not working for Azure Files authenticati... | VM needs to be restarted to activate new AD DS group membership | Restart the VM after adding it to the AD DS group |
| User assignments not visible after moving subscription between Entra t... | Old assignments tied to previous tenant | Reassign users to application groups in new tenant |
| User loses feed after subscription moved between Entra tenants | Assignments tied to old tenant or CSP transfer | Reassign users; re-register DesktopVirtualization RP for CSP |
| WebAuthn redirection not working - no Windows Hello or security key op... | FIDO2 method not enabled in Entra ID, or user signed in single-factor,... | Enable FIDO2 in Entra ID; use Sign in with Windows Hello option; verif... |
| Azure region not visible when selecting AVD service object location | Microsoft.DesktopVirtualization resource provider needs re-registratio... | Re-register Microsoft.DesktopVirtualization resource provider |

### Phase 2: Detailed Investigation

#### Entry 1: Windows 10 EVD multi-session images (19h2-evd, 20h2-evd) fai...
> Source: OneNote | ID: avd-onenote-007 | Score: 8.5

**Symptom**: Windows 10 EVD multi-session images (19h2-evd, 20h2-evd) fail to activate in Azure Mooncake with Windows cannot activate error. O365 variants (19h2-evd-o365pp, 20h2-evd-o365) are not affected

**Root Cause**: Platform bug on specific AVD multi-session images in Mooncake (ICM 255528022). The non-O365 EVD images lacked proper KMS activation configuration for Mooncake environment

**Solution**: Fixed per ICM 255528022. Workaround: run slmgr.vbs /ipk NPPR9-FWDCX-D2C8J-H872K-2YT43 then slmgr.vbs /ato to manually activate. Or use O365 image variants which activate correctly

> 21V Mooncake: Applicable

#### Entry 2: Windows 365 Boot sign-in fails after 2-minute transition/int...
> Source: ADO Wiki | ID: avd-ado-wiki-079 | Score: 8.0

**Symptom**: Windows 365 Boot sign-in fails after 2-minute transition/interstitial screen timeout. User sees transition screen, W365 App launches but Cloud PC connection never completes before the screen times out.

**Root Cause**: Cloud PCs in inactive state (unused for a while) require 2-3 minutes to start. The transition screen has a fixed 2-minute timeout which expires before the VM is ready, resulting in a 30-second error screen followed by return to sign-in.

**Solution**: Known platform limitation — VMs put in inactive state for resource management need startup time exceeding the transition screen timeout. Windows 365 and AVD App teams are aware. Kusto: query WindowsCoreEvents with CorrelationId, look for CPCStateChanged showing oldState/newState stuck at Connecting.

> 21V Mooncake: Applicable

#### Entry 3: AVD preview API versions being deprecated (tracking ID: PKYM...
> Source: OneNote | ID: avd-onenote-106 | Score: 8.0

**Symptom**: AVD preview API versions being deprecated (tracking ID: PKYM-DVG). Only preview API versions on the published list are impacted. Azure CLI 2.75.0 uses API version 2021-07-12 which is NOT impacted. Portal operations are NOT impacted.

**Root Cause**: Microsoft retiring preview API versions for Azure Virtual Desktop. Only specific preview versions on the published deprecation list are affected.

**Solution**: 1. Check the deprecation tracking page: portal.azure.cn → Azure Health → PKYM-DVG. 2. Verify your automation/scripts do not use the deprecated preview API versions. 3. Azure CLI (2.75.0+) uses 2021-07-12 and is safe. 4. Portal operations are unaffected. 5. Migrate any custom ARM/REST calls to a supported GA API version.

> 21V Mooncake: Applicable

#### Entry 4: Clipboard redirection fails or window cannot be resized afte...
> Source: MS Learn | ID: avd-mslearn-037 | Score: 7.0

**Symptom**: Clipboard redirection fails or window cannot be resized after SxS Network Stack update 1.0.2501.05600+

**Root Cause**: rdpclipcdv.exe and rdpinputcdv.exe blocked by AppLocker/SRP/endpoint protection

**Solution**: Allow-list rdpclipcdv.exe and rdpinputcdv.exe from C:\Program Files\Microsoft RDInfra subfolders

> 21V Mooncake: Applicable

#### Entry 5: User connects but no feed/icons displayed in AVD
> Source: MS Learn | ID: avd-mslearn-051 | Score: 7.0

**Symptom**: User connects but no feed/icons displayed in AVD

**Root Cause**: Not assigned to app groups, cached creds, or distribution group instead of security group

**Solution**: Check Get-AzRoleAssignment; clear cache; use security groups

> 21V Mooncake: Applicable

#### Entry 6: Windows 7 WVD host pool deployment succeeds but VMs do not a...
> Source: ADO Wiki | ID: avd-ado-wiki-148 | Score: 7.0

**Symptom**: Windows 7 WVD host pool deployment succeeds but VMs do not appear in host pool; RDP into VM fails with LogonUI.exe System Error: api-ms-win-core-winrt-error-l1-1-0.dll is missing from your computer

**Root Cause**: Windows 7 ships with RDP 7.1 which is incompatible with WVD. Deployment without upgrading to RDP 8 and .NET Framework 4.7.2 causes VM registration failure.

**Solution**: Before adding Windows 7 VMs to WVD host pool: 1) Install RDP 8 update (KB2592687), 2) Ensure .NET Framework >= 4.7.2, 3) Enable RDP 8.0 policy (Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Remote Session Environment > Remote Desktop Protocol 8.0), 4) Reboot VM, 5) Reinstall WVD Agent and Agent Manager with proper Registration Key. Note: Windows 7 is out of support.

> 21V Mooncake: Applicable

#### Entry 7: Error message when navigating to AVD Per-User Access Pricing...
> Source: ADO Wiki | ID: avd-ado-wiki-0861 | Score: 6.5

**Symptom**: Error message when navigating to AVD Per-User Access Pricing page in Azure portal, or after trying to enroll a subscription in per-user access pricing

**Root Cause**: Insufficient RBAC permissions to manage Azure resources within the subscription — user lacks permission to view or change enrollment status

**Solution**: Ensure the user has RBAC permissions to manage Azure resources within the subscription (e.g., Owner or Contributor role on the subscription)

> 21V Mooncake: Not verified

#### Entry 8: Customer enrolled an Azure subscription in AVD per-user acce...
> Source: ADO Wiki | ID: avd-ado-wiki-0862 | Score: 6.5

**Symptom**: Customer enrolled an Azure subscription in AVD per-user access pricing but the Azure portal still shows 'Enrolling' state

**Root Cause**: Enrollment can take up to 1 hour after user clicks Enroll before status changes to Enrolled; no notification is sent when enrollment completes

**Solution**: Advise customer to wait up to 1 hour after initiating enrollment, then refresh the Azure portal page to see the updated enrollment status

> 21V Mooncake: Not verified

#### Entry 9: AVD auto scaling setup script CreateOrUpdateAzAutoAccount.ps...
> Source: OneNote | ID: avd-onenote-066 | Score: 6.5

**Symptom**: AVD auto scaling setup script CreateOrUpdateAzAutoAccount.ps1 fails with 'Unable to acquire token for tenant' and 'Set-AzContext: Please provide a valid tenant or a valid subscription' error.

**Root Cause**: AADTenantId parameter contains placeholder value instead of actual Azure AD tenant GUID.

**Solution**: Replace the AADTenantId placeholder with actual Azure AD tenant ID in GUID format. Find tenant ID via Azure Portal > Azure Active Directory > Properties.

> 21V Mooncake: Applicable

#### Entry 10: AD DS group membership for VM not working for Azure Files au...
> Source: MS Learn | ID: avd-mslearn-019 | Score: 6.0

**Symptom**: AD DS group membership for VM not working for Azure Files authentication

**Root Cause**: VM needs to be restarted to activate new AD DS group membership

**Solution**: Restart the VM after adding it to the AD DS group

> 21V Mooncake: Applicable

#### Entry 11: User assignments not visible after moving subscription betwe...
> Source: MS Learn | ID: avd-mslearn-040 | Score: 6.0

**Symptom**: User assignments not visible after moving subscription between Entra tenants

**Root Cause**: Old assignments tied to previous tenant

**Solution**: Reassign users to application groups in new tenant

> 21V Mooncake: Applicable

#### Entry 12: User loses feed after subscription moved between Entra tenan...
> Source: MS Learn | ID: avd-mslearn-052 | Score: 6.0

**Symptom**: User loses feed after subscription moved between Entra tenants

**Root Cause**: Assignments tied to old tenant or CSP transfer

**Solution**: Reassign users; re-register DesktopVirtualization RP for CSP

> 21V Mooncake: Applicable

#### Entry 13: WebAuthn redirection not working - no Windows Hello or secur...
> Source: MS Learn | ID: avd-mslearn-036 | Score: 4.5

**Symptom**: WebAuthn redirection not working - no Windows Hello or security key option in AVD session

**Root Cause**: FIDO2 method not enabled in Entra ID, or user signed in single-factor, or unsupported OS

**Solution**: Enable FIDO2 in Entra ID; use Sign in with Windows Hello option; verify supported OS

> 21V Mooncake: Not verified

#### Entry 14: Azure region not visible when selecting AVD service object l...
> Source: MS Learn | ID: avd-mslearn-041 | Score: 4.5

**Symptom**: Azure region not visible when selecting AVD service object location

**Root Cause**: Microsoft.DesktopVirtualization resource provider needs re-registration

**Solution**: Re-register Microsoft.DesktopVirtualization resource provider

> 21V Mooncake: Not verified

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
