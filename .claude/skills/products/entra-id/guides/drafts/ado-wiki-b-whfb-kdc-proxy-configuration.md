---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Tips & Hints/Whfb and "kdc proxy" feature"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Tips%20%26%20Hints%2FWhfb%20and%20%22kdc%20proxy%22%20feature"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/516648&Instance=516648&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/516648&Instance=516648&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article addresses an issue where Azure Active Directory (AAD) joined devices fail to access corporate websites requiring NTLM authentication. A Windows Hello for Business (WHFB) security popup appears, but access fails after authentication. The article provides an analysis of the problem and a guideline for configuring a Kerberos Key Distribution Center (KDC) proxy to resolve the issue.

[[_TOC_]]

# Issue
When an Azure Active Directory (AAD) joined device tries to access a corporate website that requires NTLM authentication, a Windows Hello for Business (WHFB) security popup window appears. The user enters a PIN or completes face authentication, but access fails without being asked for credentials again.

Deployment mode for the affected machines:
- Primarily Azure AD Joined, but some issues identified using Hybrid Azure AD joined.
- Key trust-based authentication is used (no Active Directory Federation Services (ADFS)).
- Affected machines are Windows 10 1909 and Windows 10 1903.
- The issue has been present since it was first identified in late 2019.
- All clients where the test is performed report the same problem.

# Analysis
In the AAD joined scenario:
- Microsoft Edge collects the WHFB key trust credentials and passes them to Local Security Authority (LSA) to obtain a credentials handle.
- Microsoft Edge will then pass the credential handle to LSA and request that authentication data is returned that can be used to present to the target server.
- Microsoft Edge will use the negotiate security package.

LSA will process the request and the negotiate security package will attempt to use Kerberos to process the request.
- Kerberos will parse the credentials to see if a domain name can be obtained.
- In a key trust scenario, Kerberos will be unable to determine the on-premises domain name from the credentials that were passed.
- Kerberos will also check to see if the device is a member of a domain.
- The device will not know the realm, and the workgroup name (WORKGROUP) will be used by Kerberos to try and locate a Domain Controller (DC) to send the request to.
- DC locator will fail to locate a DC based on the name WORKGROUP, and a status of **0xc000005e (STATUS_NO_LOGON_SERVERS)** will be returned to negotiate.
- Negotiate will fallback to NTLM based on the 0xc000005e STATUS_NO_LOGON_SERVERS status.
- NTLM will fail because the user's logon session does not have the secret (NTOWF) required to respond to the challenge response.
- Negotiate will pass a failure status of 0xc000005e (STATUS_NO_LOGON_SERVERS) back to the calling process (Edge/Internet Explorer).

Microsoft Edge uses WININET for accessing HTTP endpoints.
- WININET will not prompt for credentials again based on the failure status returned.

In order to avoid the error 0xc000005e STATUS_NO_LOGON_SERVERS, clients need to have a line of sight with the on-premises DC.
- If it is not possible for the clients to have a line of sight with the DC, we suggest evaluating the **KDC proxy**.

# Guideline for KDC Proxy Configuration

This is only a generic guideline and has to be tested and implemented according to your environment and specific needs. How it works is described in detail in [MS-KKDCP: Kerberos Key Distribution Center (KDC) Proxy Protocol](https://docs.microsoft.com/openspecs/windows_protocols/MS-KKDCP/5bcebb8d-b747-4ee5-9453-428aec1c5c38).

Please note that the CDP location for the KDCProxy certificate has to be reachable by the calling client PC.

## The Steps to Configure the KDCProxy Are Below
On the domain-joined member server that is supposed to become the KDCProxy:
1. From the services snap-in, configure the Kerberos KDC Proxy Service properties:
   - Under the logon tab, select Local system account and allow the service to interact with the desktop.  
   ![Kerberos KDC Proxy Service properties](/.attachments/image-d49e5097-49d1-4b36-95b2-541a5d2d3306.png)

2. Configure the service to start up automatically and start the service.   
   ![Service startup configuration](/.attachments/image-3bf0249a-264f-4aed-9972-a27cdf9c2374.png)

3. On the same machine, install the Remote Desktop Services (RDS) gateway role.
   - Server manager --> Manage --> Add Roles and Features --> Select server roles: Remote desktop services.
   ![Add Roles and Features](/.attachments/image-ee87f5ad-3fa9-43d3-a70c-19e971a0548f.png)
   - Select Role Services: Remote desktop gateway.   
   ![Select Role Services](/.attachments/image-43844be4-73ec-4cc4-9c58-ffbcf09a6aca.png)
   - It automatically selects "Network Policy Server" Service under Network Policy and Access services and Web Server role as well. Install these role services (default configuration proposed by the wizard is fine).   
   ![Network Policy and Access services](/.attachments/image-de52e3b1-9b91-4ac7-a2ec-c1bc6eb77057.png)

4. Enroll a new certificate and configure it for IIS binding as shown in the screenshot.
   - Please note: Failure to expose the CDP location will cause errors on the client PC.
   **CHECK FOR PICTURE HERE** ![IIS binding configuration](/.attachments/image-a33672b1-ea07-4b61-866d-c8ee911ea056.png)

5. Restart the IIS default website.

6. On the clients that will use the KDC proxy, configure the related group policy settings:
   - "Computer Configuration\Policies\Administrative Templates\System\Kerberos".
   - In the main part of the window, right-click "Specify KDC proxy servers for Kerberos clients".
     - Example of the parameters where:
       - site1.whfblab.ml is the FQDN of the target site that must be accessed by the client PC.
       - "https whfb-kdcproxy.whfblab.ml /" is the FQDN of the KDCProxy member server (please keep brackets, https, and /).
       - Force a group policy refresh on the client with `GPUpdate /force`.

Resulting registry entries are:
```plaintext
[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos]
"KdcProxyServer_Enabled"=dword:00000001

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\KdcProxy\ProxyServers]
REG_SZ
Value name=site1.whfblab.ml
Value=<https whfb-kdcproxy.whfblab.ml />
```
![Registry entries](/.attachments/image-1239f033-8892-419f-bf1d-994a84210885.png)

After this configuration your client PC should be able to access your website even without direct line of sight with the DC.
