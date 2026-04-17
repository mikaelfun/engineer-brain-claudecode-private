---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: The Three-Phase Ticketing - Deep Dive/Kerberos - From PAC to Token - Authentication and Authorization"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Protocol%20Flow/Kerberos%3A%20The%20Three-Phase%20Ticketing%20-%20Deep%20Dive/Kerberos%20-%20From%20PAC%20to%20Token%20-%20Authentication%20and%20Authorization"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1080714&Instance=1080714&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1080714&Instance=1080714&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**:   
This article explains the process of transitioning from Kerberos authentication to authorization, using Privilege Attribute Certificate (PAC) to create an access token, and then from access token to logon session.

[[_TOC_]]

# From PAC to token

This section describes the process from Kerberos authentication to authorization, using the example of workstation logon.

![Workstation logon process](/.attachments/image-93cb996d-6254-4ad6-880c-059dc7e41498.png)

The Ticket Granting Service (TGS) provides the HOST ticket to the Local Security Authority (LSA) on the workstation. This is only needed at the first user logon and is later cached on the Windows client in the Registry.

The LSA on the workstation receives the user's service ticket `{T}KS = {C,S, t, PAC, KC,S}KS`, decrypts the service ticket with the system key (KS) stored in its credentials cache, and then extracts the authorization data (Privilege Attribute Certificate // PAC).

The PAC is taken from the service ticket and used to create the user's access token.

The LSA then queries the local Security Account Manager (SAM) database to discover whether the user is a member of any security groups local to the computer, and whether memberships in those groups grant the user any special rights on the local computer. It adds any Security Identifiers (SIDs) returned by this query to the list taken from the ticket's authorization data, the PAC.

The entire list is then used to build an access token, and a handle to the access token is returned to the Winlogon process, along with an identifier for the user's logon session and confirmation that the logon information was valid.

# From token to session

Winlogon creates a window station and several desktop objects for the user, attaches the user's access token, and starts the shell process the user will use to interact with the computer. The user's access token is subsequently inherited by any application process that the user starts during the logon session.

![Logon session process](/.attachments/image-fafba26a-0ab3-43ac-a7a9-c2f3d36dd6f7.png)

When the user logs off, the credentials cache is flushed and all service tickets - as well as all session keys - are removed.
