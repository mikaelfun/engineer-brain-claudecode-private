# AVD AVD 域加入 (Part 1) - Quick Reference

**Entries**: 15 | **21V**: partial
**Keywords**: aadj, app-sharing, authentication, azure-ad-joined, basic-auth, blank-screen, citrix, citrix-hdx-plus
**Last updated**: 2026-04-07

> Note: avd-ado-wiki-199 and avd-mslearn-024 have context-dependent differences (21v_conflict)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Windows 365 web portal (windows365.microsoft.com) displays wrong language for Hy... | For Hybrid user scenarios, the M365 display language is determined by the prefer... | Admin sets preferredLanguage attribute in the DC user object: 1) Open Users and ... | 🟢 8.0 | ADO Wiki |
| 2 📋 | AVD session host VM reports Unavailable status due to domain trust health check ... | Domain trust between the session host VM and the domain controller is lost, caus... | Use TestDCName.exe diagnostic tool on the affected VM to simulate the API call a... | 🟢 8.0 | ADO Wiki |
| 3 📋 | Azure AD joined VM shows unavailable in host pool after successful deployment | Host pool is not set to validation environment. AADJ VMs require validation ring... | Set the host pool to validation environment. The VM should show available after ... | 🟢 8.0 | ADO Wiki |
| 4 📋 | Connection to Azure AD joined VM fails with error 'We couldn't connect to the re... | Missing RDP property targetisaadjoined:i:1 on host pool AND/OR user not assigned... | 1) Add RDP property targetisaadjoined:i:1 to host pool custom RDP properties. 2)... | 🟢 8.0 | ADO Wiki |
| 5 📋 | Unable to connect to Azure AD-joined VMs in AVD from non-Windows devices, non-AA... | Custom RDP property required for non-AAD-joined/non-Windows device connections t... | Add the custom RDP property to allow non-AAD/non-Windows clients per: https://do... | 🟢 8.0 | ADO Wiki |
| 6 📋 | Not able to connect to AVD session host using AVD HTML Client. | Customer had added Azure AD extension targetisaadjoined:i:1 to RDP advanced prop... | Fix the issue by removing the extension targetisaadjoined:i:1 as customer was us... | 🔵 7.5 | KB |
| 7 📋 | Cloud PC DeviceModel changed to 'Virtual Machine' in Intune. Devices fall out of... | Third-party app (e.g., Carbon Black) blocks the SetDeviceModel scheduled task, o... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemInformation\SystemProd... | 🔵 7.5 | ADO Wiki |
| 8 📋 | DeviceLock policy (Max Inactivity Time Device Lock) not working on Windows 365 C... | Citrix VDA overrides the display-required state, preventing Windows from trigger... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACHINE\SOFTWARE\Citrix\... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Citrix app sharing session freezes for other participants when presenter is on V... | Bug in Teams Slimcore VDI 2.0 on Citrix with VDA 2402 + CWA 2309.1+: freeze when... | Immediate workaround: stop and reshare the window. Permanent fix: upgrade to new... | 🔵 7.5 | ADO Wiki |
| 10 📋 | Blank screen shows in Teams meeting window instead of video feed when user opens... | Known Teams Slimcore VDI 2.0 behavior: opening Start menu on VM disrupts video r... | Known limitation - no fix currently available. Avoid opening Start menu during a... | 🔵 7.5 | ADO Wiki |
| 11 📋 | Cannot connect CPC from AADJ/HAADJ device; logon attempt failed; web works | P2P Server app in Azure AD disabled; PKU2U auth fails | Enable P2P Server service principal in Azure AD | 🔵 7.5 | ADO Wiki |
| 12 📋 | Sign in failed; Okta federated domain; Event 4625 Sub Status 0xC00484C1 | UPN mismatch or Okta blocks basic auth or not configured for HAADJ | Open ticket with Okta; enable legacy auth; ensure WS-Trust | 🔵 7.5 | ADO Wiki |
| 13 📋 | Cannot connect; X224SecFilterFailedActivate in Kusto; DNS suffix wrong | Primary DNS Suffix configured with multiple comma-separated values | Use Intune Settings Catalog to fix Primary DNS Suffix; restart CPC | 🔵 7.5 | ADO Wiki |
| 14 📋 | Issue:  AVD session hosts are in Unavailable Health state. Domain join and domai... | The error message suggests that there's a naming conflict related to the hostnam... | Please verify that there is a stale Device ID (as below) in EntraID Tenant&gt;De... | 🔵 6.5 | KB |
| 15 📋 | Entra joined VM: 'Your account is configured to prevent you from using this devi... | User account not assigned Virtual Machine User Login RBAC role on the VM | Assign Virtual Machine User Login role to user on the VM or resource group | 🔵 5.5 | MS Learn |

## Quick Triage Path

1. Check: For Hybrid user scenarios, the M365 display langua `[Source: ADO Wiki]`
2. Check: Domain trust between the session host VM and the d `[Source: ADO Wiki]`
3. Check: Host pool is not set to validation environment. AA `[Source: ADO Wiki]`
4. Check: Missing RDP property targetisaadjoined:i:1 on host `[Source: ADO Wiki]`
5. Check: Custom RDP property required for non-AAD-joined/no `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-domain-join-1.md#troubleshooting-flow)
