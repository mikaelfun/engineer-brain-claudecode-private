---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/Authentication and Access/SSOFirstParty"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/M365%20Identity/Authentication%20and%20Access/SSOFirstParty"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Single Sign-on (SSO) for first party apps.**

**Introduction**

Single signon (SSO) in Microsoft Entra ID enables one signin to be
trusted across Microsoft 365 and connected applications.

This article explains the possible kind of SSO that a first party
application can use in the Entra ID perspective in Windows 10 and 11. It
also talks about general troubleshooting guidance and common issues
related to SSO.

**Authentication methods**

For a better understanding of this article, please familiarize yourself
with the possible authentication methods (PTA, PHS, Federated) described
in the following article - [Authentication for Microsoft Entra hybrid
identity solutions](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/choose-ad-authn)

**Determine the type of SSO that can be used.**

| **Domain type** | **Device join state** | **Effective SSO mechanism** |
|----|----|----|
| **Federated** | **Domain Joined only** | **Windows Integrated Authentication** |
| **Managed** | **Domain Joined only** | **Seamless SSO** |
| **Managed** | **Hybrid / Entra Joined** | **PRT (Primary Refresh Token)** |
| **Federated** | **Hybrid / Entra Joined** | **PRT (Primary Refresh Token)** |

**General SSO Troubleshooting questions.**

- What is the authentication option customer is using? Federated or Managed (PHS or PTA)?
- What SSO options are customers using? Seamless SSO, WIA or PRT?
- Is the pre-requisite configured in the customer environment for the SSO they are using?
- Is the customer in a supported environment? Especially if they are using VDI.
- Is the customer using AlternateID?
- If a customer is using an Entra ID joined, is there a PRT in the SSO State in Dsregcmd /status output?

**General tools used in troubleshooting SSO for first party apps.**

- MSOID logs - [Use MSOAID for Authentication Issues](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/activation/use-msoaid-for-authentication-issues)
- Fiddler Trace - [Fiddler Trace on Windows](https://dev.azure.com/Supportability/Office/_wiki/wikis/Office/606528/Fiddler-Trace-on-Windows)
- ASC - Azure Support Center - https://azuresupportcentereu.azure.com/
- AuthScript - https://learn.microsoft.com/en-us/entra/identity/devices/troubleshoot-hybrid-join-windows-current#step-5-collect-logs-and-contact-microsoft-support
- Netsh trace for network errors (0xCAA70004, 0xCAA70007, 0xCAA3012C, 0xCAA80000)

**Basic General Guidance when troubleshooting SSO for first party apps.**

- Make sure you have a clear understanding of what authentication method is in use (Federated or Managed PTA/PHS).
- Verify what SSO method is being used (WIA, Seamless SSO or PRT based).
- Check the pre-requisite for the Authentication and SSO in use.
- For most cases you need MSOID logs. Check AADLogs folder for event viewer logs and Screenshots folder.
- Look for errors indicating WAM issues, OneAuth, EntraID, etc.
- Depending on scenario, Fiddler trace might be needed to check authentication flow.
- Check ASC for errors in sign-in logs. Use correlation ID from AADLogs.
- Consider specific scenario details: VDI, AlternateID, DMA, etc.

**Scenario 1: Windows Integrated (WIA) with Federation Authentication.**

Device: on-premise domain joined only. SSO based on Kerberos Authentication via ADFS.

How to troubleshoot WIA SSO:
- Ensure Enable Integrated Windows Authentication is enabled in Internet Options > Advanced.
- Ensure AD FS URL is in Local intranet zone (Internet Options > Security > Local intranet > Sites > Advanced).
- Ensure Automatic logon only in Intranet Zone is selected (Security > Local intranet > Custom level).

References:
- [AD FS Troubleshooting - IWA](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/troubleshooting/ad-fs-tshoot-iwa)
- [Configure browsers for WIA with AD FS](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/configure-ad-fs-browser-wia)

**Scenario 2: Seamless Single Sign-on.**

For managed domains with PHS or PTA. Used with on-premise domain joined only devices (not Entra/hybrid joined).

How to troubleshoot:
- Check if https://autologon.microsoftazuread-sso.com is added to intranet zone.
- Enable intranet zone policy: Site to Zone Assignment List with value https://autologon.microsoftazuread-sso.com = 1.
- Enable Allow updates to status bar via script.

Reference: [Troubleshoot Seamless SSO](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/tshoot-connect-sso)

**Scenario 3: SSO based on Primary Refresh Token (PRT).**

PRT is the recommended way for SSO. Works on Entra joined and hybrid joined devices.

How to troubleshoot:
- Collect dsregcmd /status in user context. Check SSO State for PRT availability and validity.
- If device has no PRT, troubleshoot Device registration first.
- Collect MSOID Logs and look for errors.

Reference: [Understanding PRT](https://learn.microsoft.com/en-us/entra/identity/devices/concept-primary-refresh-token)

**Components: WAM, OneAuth, Entra ID, WebView**

- WAM: Windows token broker responsible for OAuth token issuance, PRT-based SSO.
- OneAuth: Cross-platform auth SDK for 1st party apps, uses WAM as broker underneath.
- WebView: Embedded browser for interactive auth UX. Migrating from WebView1 (EdgeHTML) to WebView2 (Chromium).

**AlternateID**

Registry keys required for SSO with Alternate ID:
- HKCU\Software\Microsoft\AuthN: DomainHint = <verified custom domain>
- HKCU\Software\Microsoft\Office\16.0\Common\Identity: EnableAlternateIdSupport = 1
- HKCU\...\ZoneMap\Domains\<federation service>\sts = 1

Known Issue: Alternate ID silent SSO regression with OneAuth/MSAL - users need one interactive auth before silent SSO works. Track: Feature 3127468.

**VDI**

Non-persistent VDI: Do NOT roam authentication folders or registry keys.
Since May 2025: device-bound RTs blocked across machines (error 1000504).
Set BlockAADWorkplaceJoin=1 at HKLM\SOFTWARE\Policies\Microsoft\Windows\WorkplaceJoin.

**DMA (Digital Markets Act)**

EU region users see "Continue to sign in?" prompt (AADSTS9002341). Expected behavior per DMA regulation.

**Escalation Templates:**
- [ID] [M365] [WAM] - WAM related issues
- [ID] [M365] [OneAuth] - OneAuth related issues

**SAP:** Microsoft 365/Authentication and Access/Sign-In and Passwords
