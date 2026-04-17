---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Digital Markets Act SSO Sign In Prompt"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FDigital%20Markets%20Act%20SSO%20Sign%20In%20Prompt"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Digital Markets Act SSO Sign In Prompt

## Feature Overview

Microsoft has been working to ensure compliance with the Digital Markets Act (DMA) in the European Economic Area (EEA). Starting early 2024, after users with a Windows region set to an EEA country sign in to Windows, the first application the user accesses will show a new notice asking if they would like to sign in with the same credentials used for Windows.

### User Experience
- Notice appears first time a user uses an app that enables sign-in with MSA or Entra ID after Windows sign-in
- If user clicks **Continue**: notice won't appear again (stored in PRT)
- If user clicks **Don't sign in**: they can use the app unauthenticated; prompt reappears next time
- PRT-based users: 1 notice total per account per device
- WIA-based users: 1 notice per app

### Timeline
- Server-side enablement reached 100% for EEA in **April 2024**
- Client-side enablement rolling out **June - November 2025** across Win10 22H2, Win11 23H2, Win11 24H2

## When Notice Will / Won't Appear

### Will appear:
- Win 10 and Win 11 from Jan 2024 forward
- Both MSA and Entra ID for non-Windows apps (Office, Teams, Xbox)
- Only MSA for Windows integrated features (Widgets, News)
- Continues until user clicks Continue

### Won't appear:
- Windows Server SKUs
- Lock screen sign-in
- Browser-only sign-in not adding account to Windows
- 3rd party SSO or LOB app scenarios
- Per-app Entra ID account ("No, sign in to this app only")
- Intune MAM/MAM CA scenarios

## How User Choice is Stored
- Stored in the PRT (Primary Refresh Token)
- PRT is opaque, non-human-readable
- Renewed every 90 days; if PRT expires, user re-prompted
- Non-persistent VMs: prompt each time new PRT issued

## Important Rules
- **This is a legal requirement** - cannot endorse bypassing
- **Never recommend disabling WAM**
- **Never recommend falling back to ADAL** (deprecated, not DMA compliant)

## Known Issues

### CBA Users Repeated Prompt
WinLogon from CBA does not carry over DMA accept bit during PRT refresh (every 4 hours). Bug 50237170. Fix in progress.

### SIF (Sign-In Frequency) Repeated Prompt
Fixed. Bug 2914828, deployment completed 2024/05/22.

### TypeError Dialog
WebView stack bug (51735640, won't fix). Fix: ensure machine timezone matches geographic region.

### VDI Issues
Multiple reports. Not all VDI issues are known bugs - apply normal debugging.

### Username Collection Required
On fresh profiles with DMA, some non-CPS apps require username first. Noticeable in NP-VDI environments. Affected apps: Office, Teams.

## Customer-Controlled KIR (Known Issue Rollback)

For **S500** customers with **SevA** case:
- Requirements: S500 + SevA + supported Windows versions + written acknowledgement
- KIR download links available for Win10 22H2, Win11 23H2, Win11 24H2/25H2
- KIR removes DMA prompt for Entra users (MSA still prompted)
- Must leverage auto-accept feature within one monthly update of its release

### Registry Keys (Direct Application)
- **Win11 24H2/25H2**: `[HKLM\SYSTEM\CurrentControlSet\Policies\Microsoft\FeatureManagement\Overrides] "1405209743"=dword:00000000`
- **Win11 23H2**: `"3473499788"=dword:00000000`
- **Win10 22H2**: `"1091004044"=dword:00000000`

## Troubleshooting

### AADSTS9002341: User is required to permit SSO
- By design - not a root cause on its own
- May expose other WAM UI issues (AV blocking, ADAL fallback)
- Check x-ms-SsoFlags header for SsoRestr
- Check PermitSso:PermitSso call in ASC for acceptance status

### AADSTS9002342: User denied SSO permission
- User clicked "don't sign in" - choice not saved, will be re-prompted

### Unexpected/Too Frequent Prompts
- Ensure PRT is being used
- Check for CBA bug, SIF policy, VDI configuration

## Countries in Scope
All EU countries + Iceland, Liechtenstein, Norway, Switzerland

## Case Handling
- Supported by M365 Identity and AAD Authentication communities
- Windows client OS issues: Windows Directory Services team (SAP: Windows/TokenBroker WAM)
- ICM escalation for Identity: use aka.ms/wamhot
- Non-identity engineers: create collaboration case first

## Customer Feedback
Customers can reach: sso-info@microsoft.com
