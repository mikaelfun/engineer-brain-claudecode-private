---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/FIDO2/FIDO2: Looking at logs"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/FIDO2/FIDO2%3A%20Looking%20at%20logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/586148&Instance=586148&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/586148&Instance=586148&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides an overview of the most useful log files and important functions to follow when troubleshooting authentication issues. It includes explanations of specific logs and functions related to token requests and Kerberos authentication.

[[_TOC_]]

# What are the most useful log files?

You need to look at the following log files:

- `Credprovauthui.etl`, `kerberos.etl`, and `WebAuth.etl` from a client.
- `KDC.etl` from a Domain Controller (DC).

- `Credprovauthui.etl` will help to localize the error thrown at the logon screen (`logonui`).
- `WebAuth.etl` will help to see if the user gets an Azure Active Directory (AAD) Ticket Granting Ticket (TGT).
- `kerberos.etl` will help to determine if the DC has issued an Active Directory (AD) TGT.
- `KDC.etl` will help to find the error on the DC.

# Most important functions to follow

**webauthN**: `oauthresponse` // `FidoGrantTokenRequest`: Functions linked to token requests (commonly [access token, refresh token, ID tokens](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols) and/or [Primary Refresh Token (PRT)](https://docs.microsoft.com/en-us/azure/active-directory/devices/concept-primary-refresh-token)) using OAuth protocol against Azure AD. Here, as it's regarding Fast Identity Online (FIDO), we follow `FidoGrantTokenRequest`.

**Kerberos**: `KerbILogonUserEx3` // `LsaApLogonUserEx3` // `KerbGetTicketGrantingTicketFromAsRepCallback` // `KerbGetTgsTicket`

**KDC**: `KdcNormalize` // `KdcCheckTicket` // `H`