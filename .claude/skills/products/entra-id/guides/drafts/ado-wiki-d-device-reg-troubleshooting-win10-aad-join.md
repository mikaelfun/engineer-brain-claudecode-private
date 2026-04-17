---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Device registration_Troubleshooting Windows 10 Azure AD Join"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FDevice%20registration_Troubleshooting%20Windows%2010%20Azure%20AD%20Join"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Windows 10 Azure AD Join

> First read public FAQ: https://docs.microsoft.com/en-us/azure/active-directory/devices/faq#azure-ad-join-faq

> ⚠️ **Amazon WorkSpaces Integration**: On August 20, 2024, Amazon launched v1 integration using Autopilot (user-driven mode) to provision Amazon WorkSpaces with Entra join + Intune enrollment. See [Amazon WorkSpaces + Microsoft integration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1632635/).

---

## Common Known Issues

1. The user that AADJs the machine is added to local admin group automatically — no workaround before RS2. Remove manually from local users and groups management console.
2. Starting RS3 (Win10 1709): to add another AAD account to local admin, use Settings → Other Users → Add a Work or School account, or via CMD: `net localgroup administrators AzureAD\user@contoso.com /add`
3. Windows Hello is enabled by default on AADJ devices. To disable: use Intune/MDM to set "Configure Windows Hello for Business" = disabled, or via local policy.
4. For federated tenants with ADFS (as of RS2): Azure AD Join is NOT possible if SAML protocol is configured between IDP and AAD — must use WS-Fed.
5. For password-based logon with ADFS: ADFS UsernameMixed endpoint (WS-Trust) must be enabled. For smart card: ADFS certificate endpoint (WS-Trust) must be enabled.
6. Built-in administrator account cannot perform AADJ (as of RS2) — cannot launch modern apps.
7. No portal UI shows all AADJ PCs in one place. Use: `Get-EntraDevice -All` to list.
8. Unresolved SIDs in local administrators group = Company Administrator ROLE and Device Administrator ROLE.
9. If Microsoft Intune Auto enrollment is configured, ensure Terms of Use URL is populated correctly with MDM Scope.
10. If workgroup name equals the on-prem domain NetBIOS name, device hangs after AADJ. Rename device before joining.

---

## Logon Error Reference

| Error | Resolution |
|-------|-----------|
| **AADSTS70002 / AADSTS50097** — "Device is not authenticated" | Device was disabled or deleted from AAD directory. ESTS cannot load device object from DPX. User must re-CDJ (re-perform Azure AD Join). |
| **0xC00484B2** — "Device is not cloud domain joined" | AAD CloudAP plugin cannot find AAD device certificate on the machine. Registration failed. Join device to AAD to resolve. |
| **Status 0xC000006A** — ESTS error: "AADSTS50126: Invalid username or password" | Wrong password entered. Check ESTS error in AAD Operational logs. Use Correlation ID to pull server-side logs. |
| **TPM errors: 0x80090016 (NTE_BAD_KEYSET), 0x8009002D (NTE_INTERNAL_ERROR), 0x80090030 (NTE_DEVICE_NOT_READY)** | TPM cannot sign device or NGC keys. Reset TPM → re-join device. Escalate 0x8009xxxx to Crypto team (Directory Services). |

---

## Device Registration Error Reference

| Error Code | Description | Resolution |
|-----------|-------------|-----------|
| DSREG_E_DEVICE_AUTHORIZATION_ERROR (-2145648637 / 0x801C0003) | User is not authorized to enroll | Check Devices → Device Settings → "Users may Azure AD join devices"; ensure user/group is allowed |
| DSREG_E_DEVICE_INTERNALSERVICE_ERROR (-2145648634 / 0x801C0006) | Internal service error | Retry; contact admin if persists |
| DSREG_E_DEVICE_REGISTRATION_QUOTA_EXCEEDED (-2145648626 / 0x801C000E) | Registration quota reached | Unjoin/delete other devices registered under same account, or increase quota in Device Settings |

---

## DeviceRegTroubleshooter Tool

Download: **https://aka.ms/DSRegTool**

Performs 30+ tests for all join types (HAADJ, AADJ, Azure AD Registered). Identifies and fixes common registration issues.

For feedback: mozmaili@microsoft.com

---

## Log Collection from External Customers (OOBE Scenario)

1. Download auth scripts: https://aka.ms/authscripts → unzip to impacted PC
2. At first page of OOBE: Shift+F10 → CMD window
3. Type `powershell` → change to extracted folder
4. Run: `.\Start-auth.ps1 -vauth -acceptEULA`
5. Reproduce the issue
6. Run: `.\stop-auth.ps1`; wait for all tracing to stop
7. Zip authlogs folder → upload to DTM workspace associated with support case

For Settings-based AADJ: open elevated PowerShell and follow step 4 above.

---

## Connecting to Remote AADJ PC

Reference: https://docs.microsoft.com/en-us/windows/client-management/connect-to-remote-aadj-pc

---

## Fairfax — Government Tenants

Only allow-listed tenants have AADJ capability enabled. Error without allow-listing:
> "Microsoft Azure Government tenant 'yyy...' is blocked in Public cloud"

Submit allow-list request in the Teams Device Registration channel.

---

## Scoping Questions

- What type of registration? (HAADJ / AADJ / AAD Registered)
- Is environment managed or federated?
- HAADJ: using AAD Connect? All/some devices failing? OS versions? AD FS or 3rd party STS? Sysprepped images? Outbound proxy?
- AADJ: All/some devices? All/some users? MDM? Federated or managed?
- Device admin issues: can't find device? can't delete/disable? multiple instances? BitLocker? Windows Hello?

---

## Troubleshooting Links

- [Troubleshooting Windows 10 Automatic Device Registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184298)
- [Troubleshooting Windows 10 Add Work or School Account](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184297)
- [Troubleshooting Windows 7 Automatic Device Registration](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184299)
- [Troubleshooting Device Management](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184296)
- [Device Registration flowchart](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184225)
- [WAM Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/614537/Troubleshooting-WAM-related-SSO-issues)
