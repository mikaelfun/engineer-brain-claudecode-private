# AVD AVD 域加入 (Part 1) - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 3 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-b-domain-join-failure.md, ado-wiki-create-w365-enterprise-haadj-lab.md, ado-wiki-secure-channel-domain-trust-failed.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Windows 365 web portal (windows365.microsoft.com) displays w... | For Hybrid user scenarios, the M365 display language is dete... | Admin sets preferredLanguage attribute in the DC user object... |
| AVD session host VM reports Unavailable status due to domain... | Domain trust between the session host VM and the domain cont... | Use TestDCName.exe diagnostic tool on the affected VM to sim... |
| Azure AD joined VM shows unavailable in host pool after succ... | Host pool is not set to validation environment. AADJ VMs req... | Set the host pool to validation environment. The VM should s... |
| Connection to Azure AD joined VM fails with error 'We couldn... | Missing RDP property targetisaadjoined:i:1 on host pool AND/... | 1) Add RDP property targetisaadjoined:i:1 to host pool custo... |
| Unable to connect to Azure AD-joined VMs in AVD from non-Win... | Custom RDP property required for non-AAD-joined/non-Windows ... | Add the custom RDP property to allow non-AAD/non-Windows cli... |
| Not able to connect to AVD session host using AVD HTML Clien... | Customer had added Azure AD extension targetisaadjoined:i:1 ... | Fix the issue by removing the extension targetisaadjoined:i:... |
| Cloud PC DeviceModel changed to 'Virtual Machine' in Intune.... | Third-party app (e.g., Carbon Black) blocks the SetDeviceMod... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemIn... |
| DeviceLock policy (Max Inactivity Time Device Lock) not work... | Citrix VDA overrides the display-required state, preventing ... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACH... |

### Phase 2: Detailed Investigation

#### Most common reasons for domain join failures
> Source: [ado-wiki-b-domain-join-failure.md](guides/drafts/ado-wiki-b-domain-join-failure.md)

- Account does not have permissions to join domain

#### Create Windows 365 Enterprise HAADJ Lab Environment
> Source: [ado-wiki-create-w365-enterprise-haadj-lab.md](guides/drafts/ado-wiki-create-w365-enterprise-haadj-lab.md)

Step-by-step guide for setting up a Hybrid Azure AD Joined (HAADJ) Windows 365 Enterprise lab.

#### Secure Channel Issues - Windows 365
> Source: [ado-wiki-secure-channel-domain-trust-failed.md](guides/drafts/ado-wiki-secure-channel-domain-trust-failed.md)

Windows secure channels enable encrypted communication between Cloud PCs and domain controllers. These channels are established by the NetLogon service when a device joins a domain, creating a machine

### Conflict Notes

- **avd-ado-wiki-199** vs **avd-mslearn-024** (21v_conflict): Both valid. Annotate with 21V applicability conditions

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | Windows 365 web portal (windows365.microsoft.com) displays wrong language for Hy... | For Hybrid user scenarios, the M365 display language is determined by the prefer... | Admin sets preferredLanguage attribute in the DC user object: 1) Open Users and ... | 🟢 8.0 | ADO Wiki |
| 2 | AVD session host VM reports Unavailable status due to domain trust health check ... | Domain trust between the session host VM and the domain controller is lost, caus... | Use TestDCName.exe diagnostic tool on the affected VM to simulate the API call a... | 🟢 8.0 | ADO Wiki |
| 3 | Azure AD joined VM shows unavailable in host pool after successful deployment | Host pool is not set to validation environment. AADJ VMs require validation ring... | Set the host pool to validation environment. The VM should show available after ... | 🟢 8.0 | ADO Wiki |
| 4 | Connection to Azure AD joined VM fails with error 'We couldn't connect to the re... | Missing RDP property targetisaadjoined:i:1 on host pool AND/OR user not assigned... | 1) Add RDP property targetisaadjoined:i:1 to host pool custom RDP properties. 2)... | 🟢 8.0 | ADO Wiki |
| 5 | Unable to connect to Azure AD-joined VMs in AVD from non-Windows devices, non-AA... | Custom RDP property required for non-AAD-joined/non-Windows device connections t... | Add the custom RDP property to allow non-AAD/non-Windows clients per: https://do... | 🟢 8.0 | ADO Wiki |
| 6 | Not able to connect to AVD session host using AVD HTML Client. | Customer had added Azure AD extension targetisaadjoined:i:1 to RDP advanced prop... | Fix the issue by removing the extension targetisaadjoined:i:1 as customer was us... | 🔵 7.5 | KB |
| 7 | Cloud PC DeviceModel changed to 'Virtual Machine' in Intune. Devices fall out of... | Third-party app (e.g., Carbon Black) blocks the SetDeviceModel scheduled task, o... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemInformation\SystemProd... | 🔵 7.5 | ADO Wiki |
| 8 | DeviceLock policy (Max Inactivity Time Device Lock) not working on Windows 365 C... | Citrix VDA overrides the display-required state, preventing Windows from trigger... | Add registry key on the Cloud PC and reboot: HKEY_LOCAL_MACHINE\SOFTWARE\Citrix\... | 🔵 7.5 | ADO Wiki |
| 9 | Citrix app sharing session freezes for other participants when presenter is on V... | Bug in Teams Slimcore VDI 2.0 on Citrix with VDA 2402 + CWA 2309.1+: freeze when... | Immediate workaround: stop and reshare the window. Permanent fix: upgrade to new... | 🔵 7.5 | ADO Wiki |
| 10 | Blank screen shows in Teams meeting window instead of video feed when user opens... | Known Teams Slimcore VDI 2.0 behavior: opening Start menu on VM disrupts video r... | Known limitation - no fix currently available. Avoid opening Start menu during a... | 🔵 7.5 | ADO Wiki |
| 11 | Cannot connect CPC from AADJ/HAADJ device; logon attempt failed; web works | P2P Server app in Azure AD disabled; PKU2U auth fails | Enable P2P Server service principal in Azure AD | 🔵 7.5 | ADO Wiki |
| 12 | Sign in failed; Okta federated domain; Event 4625 Sub Status 0xC00484C1 | UPN mismatch or Okta blocks basic auth or not configured for HAADJ | Open ticket with Okta; enable legacy auth; ensure WS-Trust | 🔵 7.5 | ADO Wiki |
| 13 | Cannot connect; X224SecFilterFailedActivate in Kusto; DNS suffix wrong | Primary DNS Suffix configured with multiple comma-separated values | Use Intune Settings Catalog to fix Primary DNS Suffix; restart CPC | 🔵 7.5 | ADO Wiki |
| 14 | Issue:  AVD session hosts are in Unavailable Health state. Domain join and domai... | The error message suggests that there's a naming conflict related to the hostnam... | Please verify that there is a stale Device ID (as below) in EntraID Tenant&gt;De... | 🔵 6.5 | KB |
| 15 | Entra joined VM: 'Your account is configured to prevent you from using this devi... | User account not assigned Virtual Machine User Login RBAC role on the VM | Assign Virtual Machine User Login role to user on the VM or resource group | 🔵 5.5 | MS Learn |
