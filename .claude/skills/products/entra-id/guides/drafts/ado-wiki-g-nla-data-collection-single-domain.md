---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: NLA/Kerberos: NLA: Data Collection for single domain scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20NLA/Kerberos%3A%20NLA%3A%20Data%20Collection%20for%20single%20domain%20scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699756&Instance=1699756&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699756&Instance=1699756&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides guidelines for client-side, server-side, and domain controller-side data collection, emphasizing the importance of capturing data from the correct site domain controllers. It also introduces a TSS script designed to gather various logs.

[[_TOC_]]

# Client-side data collection

1. Network trace
2. Kerberos Event Trace Log (ETL)
3. Kerberos operational event logs

# Server-side data collection

1. Network trace
2. Kerberos ETL
3. Kerberos operational event logs
4. Security event logs

# Domain controller-side data collection

Keep in mind that the client machine will connect to its respective site's domain controllers (DCs), and the server will also link to the DCs of its own site. Therefore, it's important to ensure data is captured from the correct site DCs.

1. Network trace
2. Key Distribution Center (KDC) ETL
3. Security event logs

---

# Log collection TSS Script

The TSS script provided is designed to gather all the required logs, such as network trace, Kerberos ETL, and KDC ETL. You can utilize this script to collect logs from all necessary machines. Please note, it does not include security event logs, which will need to be collected manually.

Download the TSS script from **https://aka.ms/getTSS**.

```plaintext

General Log Collection:
Command: .\TSS.ps1 -Start -Scenario ADS_Auth

During Boot Time Log Collection:
Command: .\TSS.ps1 -StartAutoLogger -Scenario ADS_Auth 


```