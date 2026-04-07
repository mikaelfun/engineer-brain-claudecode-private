---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: NLA/Kerberos: NLA: NLA Kerberos Flow"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20NLA/Kerberos%3A%20NLA%3A%20NLA%20Kerberos%20Flow"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699750&Instance=1699750&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699750&Instance=1699750&Feedback=2)

___
<div id='cssfeedback-end'></div>

# NLA Kerberos flow for a single domain

This article outlines the steps involved in the Network Level Authentication (NLA) Kerberos flow for a single domain. It details the interactions between the client, Remote Desktop Protocol (RDP) server, and Key Distribution Center (KDC) to ensure successful authentication.

[[_TOC_]]

1. The client requests a Service Ticket for the resource (RDP server) without the **EncTktInSKey** flag.

2. The client sends the AP_REQ to the RDP server, and the RDP server denies with the response "Encrypt Ticket with Session Key from TGT" (The packets will be encrypted, so this response will not be visible in the network trace).

3. The client requests a Ticket Granting Service (TGS) from the KDC, now with the **ENC_TKT_IN_SKEY** flag and the user's Ticket Granting Ticket (TGT) in the Additional Tickets section. The KDC retrieves the TGS (Logon) Session Key from the TGT for encrypting the new TGS.

4. Once the client sends the AP Request to the RDP server, the server initiates the login request for the user again to the User Domain Controller (DC). Ensure there is sufficient connectivity between the RDP server and the User Domain DC for Kerberos authentication to succeed.

5. The server gets the TGT for the user and then also a Service Ticket for the **HOST SPN** of the RDP server.

6. Once the server successfully receives the Service Ticket, it allows the logon.

7. Without NLA, server-side authentication (Step 4) for the user would not occur.

