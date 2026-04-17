---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Security Enhancements & Changes/Kerberos: 11B.21 - Kerberos PAC hardening changes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Security%20Enhancements%20%26%20Changes/Kerberos%3A%2011B.21%20-%20Kerberos%20PAC%20hardening%20changes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1428215&Instance=1428215&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1428215&Instance=1428215&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides an overview of the Kerberos PAC hardening changes introduced in the 11B.21 patch cycle, including registry key information, auditing events, enforcement phases, known call generators, and known issues.

[[_TOC_]]

# Introduction

For this wiki entry, we will cover the Kerberos changes introduced in the 11B.21 patch cycle (Windows Updates released on November 9, 2021). While this update introduced Active Directory and Kerberos hardening changes around the protection of objects and attributes stored in Active Directory, we will focus specifically on the changes related to Kerberos.

# Contributors

@<36551311-A2A8-6A29-9D6F-7FA077FFC30F>

# Keyword in DFM Knowledge

"11B.21" or "Servicing: 11B.21"

# Email Alias

There is a distribution list (DL) created specifically to discuss 11B.21 related topics not covered already by existing articles: adhardeningin11b21@microsoft.com (Alias no longer valid)

# Public Articles

Kerberos PAC hardening changes: KB5008380Authentication updates (CVE-2021-42287) - Microsoft Support

# Internal Articles

Servicing: 11B.21: Summary of Active Directory and Kerberos hardening changes in November 9, 2021 and newer Windows Updates (microsoft.com)

## About the New Hardening

This fix addresses a vulnerability that affects the Kerberos Privilege Attribute Certificate (PAC) and allows potential attackers to impersonate domain controllers. The fix includes an improved authentication process in which new information about the original requestor is added to the PACs of Kerberos Ticket-Granting Tickets (TGT). Later, when a Kerberos service ticket is generated for an account, the new authentication process will verify that the account that requested the TGT is the same account referenced in the service ticket. PACs will also be added to the TGT of all domain accounts, even those that choose to decline PACs.

# Registry Key Information

- **Registry subkey**: `HKEY_LOCAL_MACHINE\System\CurrentControlSet\Services\Kdc`
- **Value**: `PacRequestorEnforcement`
- **Data type**: `REG_DWORD`
- **Data**:
  - 1: Deployment phase: Adds the new PAC to tickets. When authenticating, if the user has the new PAC it will be validated, but authentication with the older PAC is still allowed.
  - 2: Enforcement phase: Adds the new PAC to tickets. When authenticating, users without the new PAC will be denied.
  - 0: Disables the registry key (not recommended).

Default: 1 (when registry key is not set)  
Is a restart required? _No_

# Auditing Events

- **PAC without attributes**:  
  The Key Distribution Center (KDC) encounters a TGT without the PAC Attribute buffer. It is likely that the other KDC in the logs does not contain the update or is in Disabled mode.  
  - **Event Log**: System
  - **Event Type**: Warning
  - **Event Source**: Microsoft-Windows-Kerberos-Key-Distribution-Center
  - **Event ID**: 35
  - **Event Text**: The Key Distribution Center (KDC) encountered a ticket-granting-ticket (TGT) from another KDC ("<KDC Name>") that did not contain a PAC attributes field.

- **Ticket without a PAC**:  
  The KDC encounters a TGT or other evidence ticket without a PAC. This prevents the KDC from enforcing security checks on the ticket.  
  - **Event Log**: System
  - **Event Type**: Warning during Deployment Phase, Error during Enforcement Phase
  - **Event Source**: Microsoft-Windows-Kerberos-Key-Distribution-Center
  - **Event ID**: 36
  - **Event Text**: The Key Distribution Center (KDC) encountered a ticket that did not contain a PAC while processing a request for another ticket. This prevented security checks from running and could open security vulnerabilities.  
    Client: <Domain Name>\<User Name>  
    Ticket for: <Service Name>

- **Ticket without Requestor**:  
  The KDC encounters a TGT or other evidence ticket without the PAC Requestor buffer. It is likely that the KDC that constructed the PAC does not contain the update or is in Disabled mode.  
  - **Event Log**: System
  - **Event Type**: Warning during Deployment Phase, Error during Enforcement Phase
  - **Event Source**: Microsoft-Windows-Kerberos-Key-Distribution-Center
  - **Event ID**: 37
  - **Event Text**: The Key Distribution Center (KDC) encountered a ticket that did not contain information about the account that requested the ticket while processing a request for another ticket. This prevented security checks from running and could open security vulnerabilities.  
    Ticket PAC constructed by: <KDC Name>  
    Client: <Domain Name>\<Client Name>  
    Ticket for: <Service Name>

- **Requestor Mismatch**:  
  The KDC encounters a TGT or other evidence ticket, and the account that requested the TGT or evidence ticket does not match the account that the service ticket is built for.  
  - **Event Log**: System
  - **Event Type**: Error
  - **Event Source**: Microsoft-Windows-Kerberos-Key-Distribution-Center
  - **Event ID**: 38
  - **Event Text**: The Key Distribution Center (KDC) encountered a ticket that contained inconsistent information about the account that requested the ticket. This could mean that the account has been renamed since the ticket was issued, which may have been part of an attempted exploit.  
    Ticket PAC constructed by: <Kdc Name>  
    Client: <Domain Name>\<User Name>  
    Ticket for: <Service Name>  
    Requesting Account SID from Active Directory: <SID>  
    Requesting Account SID from Ticket: <SID>

 **Note**: Customers should look for the newly added events in the System event log after deploying 11B to identify potential compatibility issues prior to manual or programmatic enforcement.

## Scenarios with Failure of Signature Validation after Installing 2021 11B Updates

Scenarios where Kerberos Tickets acquired via S4u2self and used as evidence tickets for protocol transition to delegate to backend services will fail signature validation after installing 2021 11B updates on W2K8, W2K8 R2, WS 2012, WS 2012 R2, WS 2016, and WS 2019 domain controllers.

- ICM [271547888](https://portal.microsofticm.com/imp/v3/incidents/details/271547888/home): KB5007206: 11B patch breaks Azure AD Application Proxy IWA (KCD) SSO
- Internal KB [5008611](https://internal.evergreen.microsoft.com/topic/abfce717-8598-f6a4-2ee8-0af9eab68046): Kerberos authentication fails if ticket acquired via S4u2self used as evidence ticket after DCs install November 9 WU (ICM 271547888)
- Internal KB [5008693](https://dev.azure.com/ContentIdea/ContentIdea/_workitems/edit/158769): Servicing: 11B.21: Remote EFS encryption fails after installing November 11, 2021 Windows Updates
- Internal KB [5008695](https://internal.evergreen.microsoft.com/topic/b94b0e48-ef92-3eea-8721-025265ca6347): Servicing: 11B.21: CEP/CES (Web Enrollment Services) fails with error Ox303d0013 (-2143485933 WSE_ENDPOINT_FAULT_RECEIVED) after installing November 9, 2021 updates

## Enforcement Phase

The October 11, 2022 release will transition all Active Directory domain controllers into the Enforcement phase. The Enforcement phase deprecates the PacRequestorEnforcement key and no longer reads it.

As a result, Windows domain controllers that have installed the October 11, 2022 update will no longer be compatible with:

- Domain controllers that did not install the November 9, 2021 or later updates.
- Domain controllers that installed the November 9, 2021 or later updates but have not yet installed the July 12, 2022 update and who have a PacRequestorEnforcement registry value of 0.

However, Windows domain controllers that have installed the October 11, 2022 update will remain compatible with:
- Windows domain controllers that have installed the October 11, 2022 or later updates
- Windows domain controllers that have installed the November 9, 2021 or later updates and have a PacRequestorEnforcement value of either 1 or 2

## Known Call Generators

- Azure Active Directory (AAD) Application Proxy Integrated Windows Authentication (IWA) using Kerberos Constrained Delegation (KCD)
- Web Application Proxy (WAP) Integrated Windows Authentication (IWA) Single Sign-On (SSO)
- Active Directory Federated Services (ADFS)
- CEP/CES (Web Enrollment Services)
- Internet Information Services (IIS) use Integrated Windows Authentication (IWA)
- Microsoft SQL Server
- Remote EFS Encryption (encrypted files are stored on a remote file server that must be trusted for delegation)
- Intermediate devices including Load Balancers performing delegated authentication

## Known Issues

[Servicing: 11B.21: Authentication fails if Kerberos ticket acquired via S4u2self used as evidence ticket after DCs install November 9 WU (ICM 271547888) (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/abfce717-8598-f6a4-2ee8-0af9eab68046)

[Servicing: 11B.21: PAC hardening changes affect certain password change operations such as cluster CNO/VCO password changes (ICM 283154839) (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/ef2c069b-8590-20e0-af2a-f9d1a41ab391)

[4B.24 PAC Validation changes](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1474115/Kerberos-4B.24-PAC-Validation-changes