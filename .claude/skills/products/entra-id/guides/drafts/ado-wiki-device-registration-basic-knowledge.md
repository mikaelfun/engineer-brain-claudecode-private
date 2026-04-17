---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Device registration basic knowledge"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/Device%20registration%20basic%20knowledge"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Registration Basic Knowledge

## Device Registration Overview

There are three different types of device registrations:

1. **Hybrid Azure AD Join** - Registering enterprise owned, on-premises AD joined devices with Azure AD. Windows 10/Windows Server 2016 (DJ++) and Windows 8.1/7 and other downlevel versions (via Autoworkplace.MSI) support Hybrid Azure AD join.
2. **Azure AD Join** - Joining enterprise owned devices directly to Azure AD. For customers who do not have on-premises AD or want to move away from on-premises AD. All Windows 11 and Windows 10 (except Home editions) and Windows Server 2019 VMs in Azure (Server Core not supported).
3. **Azure AD Registered** - BYOD devices registering with Azure AD. Windows 10, Windows 8.1, iOS, Android and MacOS clients. Windows 7, 8 and corresponding Server versions do not support this.

## Updates

### Breaking Change to Device Registration Policy API Format (Sept 2023)

A rollout beginning September 25, 2023 introduces a breaking change to the API format of the Device Registration Policy:

1. `multiFactorAuthConfiguration` changes from integer string to string value: `"0"` → `"notRequired"`, `"1"` → `"required"`
2. `appliesTo`, `allowedUsers`, `allowedGroups` replaced by `allowedToJoin`/`allowedToRegister` with `@odata.type` discriminator:
   - `#microsoft.graph.allDeviceRegistrationMembership` — all users
   - `#microsoft.graph.noDeviceRegistrationMembership` — no users
   - `#microsoft.graph.enumeratedDeviceRegistrationMembership` — selected users/groups

**Workarounds during rollout:** Detect format via GET before PUT, or send redundant properties (both old and new) in PUT request body.

## Registration Process

Three main stages:

1. **Discovery** — Client determines tenant, authentication endpoint, and resource. Depends on registration type:
   - Azure AD Join / Azure AD Register: based on user's UPN suffix
   - Hybrid Azure AD Join (domain-joined): based on Service Connection Point (SCP) in AD forest

2. **Authentication & Authorization at ADRS** — Client presents a token with required claims or proves identity via synced computer object. Common failure points:
   - AD FS rules missing/incorrect order/duplicates
   - 3rd party STS misconfiguration
   - Managed domain without Seamless SSO (for downlevel)

3. **Registration at ADRS** — Cryptographic identity establishment:
   - Client generates key pair → sends public key in CSR with token → ADRS signs CSR → signed certificate stored in computer's MY store (AADJ/HAADJ) or user's MY store (BYOD/downlevel)

## What Can Go Wrong?

### SCP Issues
- **Managed domains**: SCP should point to `contoso.onmicrosoft.com`. Windows 7 requires Seamless SSO.
- **Federated domains**: SCP should point to `contoso.com`. Exception: Windows 10 only + 3rd party STS + AAD Connect syncing → SCP can use `contoso.onmicrosoft.com`.

### Authentication Issues
- **Proxy**: System context proxy discovery is tricky for Hybrid AADJ. Need WPAD or computer-scoped GPO proxy settings. Proxy authentication must support computer accounts.
- **Downlevel (WIA/Passive Auth)**: Hidden browser control doing passive auth — requires WIA enabled, intranet zone URLs configured. Fails with MFA prompts, HRD pages. Seamless SSO needs specific URLs in intranet zone + script status bar interaction. Doesn't work with Enhanced Protected Mode or Enhanced Security Configuration in IE.

### Registration Issues
- Token from AD FS may lack necessary claims
- Device quota can prevent registration (rare; Hybrid AADJ is exempt from device quota)

## Case Handling

Determine scenario:
1. **Setting up Hybrid Azure AD Join** — Devices not appearing in Azure AD portal → Troubleshooting guides by OS version
2. **Device administration** — Admin access control on AADJ devices, duplicate device records → Device management guide
3. **Conditional access failure** — Resource protected by device-based CA policy:
   - Check if device thinks it is registered
   - If not → investigate why and register
   - If yes → check matching device record with same device ID in AAD
   - If missing → investigate removal, then re-register
   - Check server-side device state matches policy requirements

## Product Group Engagement

For Device PG engagement: Use templates from [CID CRI Template List](https://microsoft.sharepoint.com/teams/CloudIdentityPOD/SitePages/CID%20CRI%20Template%20List.aspx) AND mail DevicesInAADCore@microsoft.com

## Support Boundaries

| Scenario | Support Team | Notes |
|----------|-------------|-------|
| BitLocker key recovery | Windows Security → BitLocker | AADJ devices → BitLocker keys in AAD; HAADJ → may be in on-prem AD/MBAM |
| Enterprise License E3/E5 | Windows Licensing & Activation | Needs AADJ for activation |
| Enterprise State Roaming | Windows → ESR queue | AAD can determine device registration status |
| MDM enrollment | Office Products → MDM for O365 | Device must be registered before Intune enrollment |
| Autopilot | Intune Enrollment → Autopilot | AADJ step 1 (env config) and step 4 (registration troubleshooting) |
| Teams devices | Teams → Teams Devices/MTR SAP | Cross-team collaboration needed |
| Windows 10/11 SE Education | Intune + Windows | AAD checks registration state only |
| Windows 365 AADJ Cloud PC | Intune entirely | Separate support |
| Surface Hub | Surface Hub queue | Hybrid Azure AD join NOT supported |

## Scoping Questions

### Hybrid Azure AD Join
1. Trying to set up Hybrid Azure AD Join?
2. Used AAD Connect for setup?
3. All or some domain-joined devices failing?
4. Which client OS versions?
5. Using on-prem AD FS or 3rd party STS?
6. Using sysprepped images?
7. Outbound proxy?
8. Which documentation followed?

### Azure AD Join
1. All or some devices failing?
2. All or some users affected?
3. Managed by Intune or 3rd party MDM?
4. Federated or managed domain?
5. Trouble signing in on AADJ device?

### Device Administration
1. Unable to find device in portal?
2. Unable to delete/disable device?
3. Multiple instances of same device name?
4. BitLocker key recovery?
5. Windows activation trouble?
6. Windows Hello issues?

## Troubleshooting References

- [Troubleshooting Windows 10 Automatic Device Registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184298)
- [Troubleshooting Windows 10 Azure AD Join](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184167)
- [Troubleshooting Windows 10 Add Work/School Account](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184297)
- [Troubleshooting Windows 7 Automatic Device Registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184299)
- [Troubleshooting Device Management](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184296)
- [Device Registration on Android](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/389593)
- [Device Registration Flowchart](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184225)
- [WAM Troubleshooting Guide](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537)

## ASC Tools

| Tool | Description |
|------|------------|
| Graph Explorer | Adhoc MSGraph queries for device filtering |
| Device → Search for Cloud Device | Search by ObjectID, DisplayName, DeviceID, or BitLocker Recovery Key ID |
| Device → Settings | View Device Registration policy (quota, MFA requirement) |
