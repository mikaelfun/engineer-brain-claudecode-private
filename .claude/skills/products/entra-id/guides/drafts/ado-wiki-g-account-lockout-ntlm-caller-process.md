---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Another way to identify the caller process - NTLM scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FAnother%20way%20to%20identify%20the%20caller%20process%20-%20NTLM%20scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179901&Instance=1179901&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179901&Instance=1179901&Feedback=2)

___
<div id='cssfeedback-end'></div>

This article provides a step-by-step troubleshooting flow for account lockout issues, focusing on the NTLM (NT LAN Manager) scenario. For Kerberos-related troubleshooting, a separate link is provided.

# Common troubleshooting flow for account lockout issues

1. Enable audit and Netlogon debug log on all domain controllers (DCs) and wait for the next occurrence.
    - Enlarge the security event log maximum size if needed.
2. After re-occurrence, find event 4740 containing the concerned username on all DCs.
3. Filter out event 4771/4776 containing the concerned username on all DCs.
    - Kerberos or NTLM?
    - 4771 for NTLM, and 4776 for Kerberos.

This page discusses the troubleshooting methodology for the NTLM scenario. For Kerberos, please refer to [Another way to identify the caller process - Kerberos scenario](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1179903).

# NTLM

1. Identify the server from netlogon.log of the DC where event 4771 is logged.

   ![Description of the picture](/.attachments/image-dff3f023-0b7d-4edb-a649-96157722ce0f.png)

2. Enable audit of logon events and capture Process Monitor log for network activities on that server.
3. Wait for event 4625 containing the concerned username on that server. Get client hostname, IP address, and source port.

   ![Description of the picture](/.attachments/image-71c7d3d9-94ac-4e58-a0cc-329a5a99882d.png)

4. Use source IP and port to filter out events in the Process Monitor log, and then get the server port. With the server port, the listening process can be determined.

   ![Description of the picture](/.attachments/image-e9e12f77-52b6-41f9-9574-e92b9164f9b5.png)

5. If needed, capture Process Monitor log on the client to identify the process.