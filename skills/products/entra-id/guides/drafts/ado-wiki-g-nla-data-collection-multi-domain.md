---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: NLA/Kerberos: NLA: Data Collection for multi domain or forest scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20NLA/Kerberos%3A%20NLA%3A%20Data%20Collection%20for%20multi%20domain%20or%20forest%20scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699754&Instance=1699754&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1699754&Instance=1699754&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary**:   
This article provides guidelines for client-side, server-side, and domain controller-side data collection, emphasizing the importance of capturing data from the correct site domain controllers. It also introduces a TSS script designed to gather various logs.

[[_TOC_]]


Contents  
Client-side data collection  
Server-side data collection  
Domain controller-side data collection  
Log collection TSS Script  


# Scenario - 

User Child\Herbert is currently on the client machine Mem2.child.contoso.com and is attempting to establish an RDP connection with the Contmem1.contoso.com server.


# Environment details 
The following is a sample diagram that illustrates the relationship between the parent and child domains.

1. User domain - Child.contoso.com
1. Resource domain - Contoso.com
1. NLA enabled Server- Contmem1.contoso.com (IP- 192.168.2.113)
1. Client machine- Mem2.child.contoso.com (IP-192.168.2.109)
1. Username - Child\Herbert

![image.png](/.attachments/image-8d23ef3f-37b1-40c8-ade6-726ec70c2b1d.png)



# Client-side data collection:

1. Network Trace
1. Kerberos ETL
1. Kerberos operational event logs

# Server-side data collection:

1. Network trace
1. Kerberos ETL
1. Kerberos operational event logs
1. Security event logs


# Domain controller side data collection for both User domain and Resource domain:

Keep in mind that the client machine will connect to its respective site's Domain Controllers (DCs), and the server will also link to the DCs of its own site. Therefore, it's important to ensure data is captured from the correct site DCs.

1. Network Trace
1. KDC ETL
1. Security event logs


---
# Note: 
The TSS script provided is designed to gather all the required logs such as Network trace, Kerberos ETL, and KDC ETL. You can utilize this script to collect logs from all necessary machines. Please note, it does not include Security event logs, which will need to be collected manually.

Download the TSS script from **https://aka.ms/getTSS.**

 <SPAN style="background-color: lightGray"> **Command:**
  .\TSS.ps1 -Start -Scenario ADS_Auth