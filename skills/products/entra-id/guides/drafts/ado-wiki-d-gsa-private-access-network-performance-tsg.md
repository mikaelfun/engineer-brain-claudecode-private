---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/Global Secure Access - Troubleshooting network performance issues for Private Access"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FInternal%20Docs%2FGlobal%20Secure%20Access%20-%20Troubleshooting%20network%20performance%20issues%20for%20Private%20Access"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Overview**
------------

Network performance issues can arise from many sources: network latency, application design, client-side or server-side configuration, or cloud service behavior. Due to the variety of potential root causes, troubleshooting may become complex and often requires systematic investigation.
When engaging with customers, it is essential to set **clear expectations**:
*   Access through **Global Secure Access (GSA) - Private Access** should _not_ be directly compared to access over a local LAN.
*   Comparisons with traditional VPN solutions may also be misleading, as performance depends heavily on the specific network path.
*   Troubleshooting performance problems may take more time than functional issues.
Despite these differences, GSA typically provides **stable and efficient** access to corporate resources. For most scenarios, it enables productive work. Nevertheless, there may be specialized or edge cases where another solution could be more appropriate.

* * *

**Audience**
============

This guide provides **baseline troubleshooting steps**. Support engineers must have a good understanding of:
*   Global Secure Access architecture
*   Private Access components
*   Core troubleshooting concepts

* * *

**Expectation**
============

This guide provides the basic troubleshooting steps and outlines the required data collection aligned with the expectations of the CxE Care Team and engineering. However, following this guide does not guarantee that the issue will be resolved, and additional data or further investigation may still be required.

* * *

**Troubleshooting Steps**
=========================

**1) Understand the Issue**
---------------------------

### **a) Gather a precise and evidence-based problem description**

Join a live meeting with the customer whenever possible. This enables real-time demonstration and a much clearer scope. Focus on **productive, user-impacting scenarios**, not theoretical edge cases.
Ensure you collect:
*   Screenshots
*   Logs
*   Short video recordings (if applicable)
*   Exact timestamps
*   Names of affected apps and hosts
Clarify the following:
1.  **Which application is affected?**
    What is its purpose and business importance?

2.  **What network requirements does it have?**
    (ports, protocols, FQDNs, server names - any documentation?)
    *   Is the destination hosted in the Microsoft/ non-Microsoft cloud (i.e Azure File Shares)? In what region?
    *   Is the destination hosted on more servers behind a load balancer?

3.  **Business impact**
    *   How many users are affected?
    *   How is their work interrupted?
4.  **Is this a new implementation or a regression?**
    *   Has this workload functioned before?
    *   Were recent changes deployed?
5.  **Network Access app configured for the app**
    *   App ID?
6. **Is any 1st or 3rd party software like VPN client, Security Software involved?**
    *   What is the name of the component? What is its version?
7. **What is the download and upload metrics for the Internet connection provided by ISP?**
    *   Is this dedicated for one user?

A well-defined problem statement significantly accelerates root-cause analysis.

* * *

### **b) Validate Antivirus / EDR configuration**

Ensure the customer has configured their Antivirus/EDR tools according to Microsoft guidance:
 [**EDR and antivirus coexistence with Global Secure Access client**](https://learn.microsoft.com/en-us/entra/global-secure-access/concept-edr-antivirus-coexistence#configuration-overview)

* * *

### **c) Coexistence with 1st or 3rd party software like VPN client, Security Software**

Ensure to follow the articles below:

[**Microsoft's SASE partner ecosystem overview**](https://learn.microsoft.com/en-us/entra/global-secure-access/partner-ecosystems-overview)
[**GSA Client guidance on coexistence issues**](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1861024/GSA-Client-guidance-on-coexistence-issues)

### **d) Determine if the issue occurs on the corporate network**

Ask the customer:

> Does the performance issue occur when the user is connected directly to the internal corporate network where the target resource is located?

*   **If YES -> go to Step 3**
*   **If NO -> continue with Step 2**

* * *

**2) Accessing Internal Resources from an External Network**
------------------------------------------------------------

These steps apply when the user is remote and reaches resources through GSA Private Access.

### **a) Test on all Private Access connector servers**

Try reproducing the issue directly on **each server hosting a Private Network connector**.
*   If the issue appears on these servers, the problem lies **inside the customer's internal environment**.
     The customer or responsible internal team must fix this **before** GSA troubleshooting can continue.

* * *

### **b) If the destination is accessible directly over the Internet**

i.e. Azure File Shares

Try reproducing the issue with disabling Global Secure Access on the client.
*   How is the performance?
*   In what region is the destination server hosted?

* * *

### **c) Ensure GSA components are on the latest versions**

Update both the **GSA Client** and the **Private Network Access Connectors**, then re-test.
**Client release notes:**
*   Windows: https://learn.microsoft.com/en-us/entra/global-secure-access/reference-windows-client-release-history
*   macOS: https://learn.microsoft.com/en-us/entra/global-secure-access/reference-macos-client-release-history
**Connector release notes:**
https://learn.microsoft.com/en-us/entra/global-secure-access/reference-version-history

* * *

### **d) Check geolocation alignment**

Identify:
*   Where the user is physically located
*   Where the connector servers are located
*   Where the target application server is located
Ensure the connector group is assigned to the **closest geographic region**:
 [**MultiGeo for Microsoft Entra Private Access**](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-enable-multi-geo)

* * *

### **e) Collect GSATracert output on the computer hosting the GSA client**

From the client machine:

    gsatracert --host <IP:PORT> -n 3 --speedtest

or

    gsatracert --host <FQDN:PORT> -n 3 --speedtest

Executed from:

    C:\Program Files\Global Secure Access Client\GSATracert\

Replace `<IP:PORT>` or `<FQDN:PORT>` accordingly.

* * *

### **f) Collect outbound network path without GSA on the computer hosting the GSA client**

Disable the GSA client and run:

    tracert -4 <TenantID>.private.client.globalsecureaccess.microsoft.com

Replace `<TenantID>` with the customer's tenant ID.

**Remark:** If ICMP protocol is disabled on the customer's network this test won't provide any useful information.

* * *

### **g) Proceed to Step 4**

After collecting the above, continue with **Data Collection**.

* * *

**3) Connected to the Corporate Network; Accessing Internal Resources**
-----------------------------------------------------------------------

These steps apply when the device is physically or logically inside the corporate network.

### **a) Update GSA Client to the latest version**

_**(Links same as Step 2c)**_
Re-test after updating.

* * *

### **b) Validate Intelligent Local Access (ILA) configuration**

If Private Access is unnecessarily routing internal traffic through GSA, ILA may resolve it.
 [**Enable Intelligent Local Network (ILA)**](https://learn.microsoft.com/en-us/entra/global-secure-access/enable-intelligent-local-access)

* * *

**4) Data Collection**
----------------------

Follow the detailed plan in:
 [**GSA Private Access - Data Collection Guide for accessing application issues**](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1707836/GSA-Private-Access-Data-Collection-guide-for-accessing-application-issues?anchor=**action-plan)

* * *

**5) Data Analysis**
--------------------

Once data is collected, escalate appropriately:
*   Local SME
*   Technical Advisor
*   Partner Technical Advisor
*   **[AVA channel - Global Secure Access (ZTNA)](https://teams.microsoft.com/l/channel/19%3A3b8ba43678fb47a9bf82e03512c34423%40thread.skype/Global%20Secure%20Access%20(ZTNA)?groupId=0f0f4ddf-6429-4dfe-83d2-1a28cb88fadd&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)**

* * *

**6) Additional Information for troubleshooting**
-----------------------------

The following resource is useful for analyzing GSA performance metrics:

 [**GSA PA Performance CRI TSG**](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/81680/GSA-PA-Performance-CRI-TSG)

- For access please check: [IdentityWiki Summary](https://identitydivision.visualstudio.com/IdentityWiki)


[**Slow SMB files transfer speed - Windows Server**](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/slow-smb-file-transfer)

[**TCP/IP performance known issues - Windows Server**](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/tcpip-performance-known-issues)
