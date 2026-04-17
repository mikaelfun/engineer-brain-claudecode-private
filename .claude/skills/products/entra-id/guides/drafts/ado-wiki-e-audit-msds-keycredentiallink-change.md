---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking for known solutions | tips/Generic solutions/MSDS-Keycredentiallink/Audit change of msds-keycredentiallink attribute"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20for%20known%20solutions%20%7C%20tips%2FGeneric%20solutions%2FMSDS-Keycredentiallink%2FAudit%20change%20of%20msds-keycredentiallink%20attribute"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/467066&Instance=467066&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/467066&Instance=467066&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides a step-by-step guide to enable directory service changes on domain controllers (DCs), including auditing directory service (DS) objects, updating group policies, and running synchronization cycles.

[[_TOC_]]

# Enable directory service changes on DC

_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._

1. **Enable audit of directory service objects on DCs using the default domain controllers policy.**
   
   ![Screenshot of enabling audit of DS objects on DCs using the default domain controllers policy](/.attachments/image-58835c92-c3e0-4756-b5c9-1f17e23c9b43.png)
   
   ![Screenshot of the policy settings](/.attachments/image-70e6d88c-a814-4480-bec6-052c1409d511.png)

2. **Run Gpupdate /force.**

3. **On the user's properties in Active Directory Users and Computers (ADUC):**
   - Navigate to Security > Advanced > Audit.
   - Add everyone with full control for all descendant Msds-Keycredential objects.
   
     ![Screenshot of user properties in ADUC](/.attachments/image-e77843df-e4c1-4901-8d28-6a96bd3f74b1.png)

4. **Search for Event ID 5136.**
   - This indicates that a directory service object was modified.
   - Example details:
     ```
     A directory service object was modified.
     Subject:
       Security ID: Relecloud\administrator
       Account Name: Administrator
       Account Domain: Relecloud
       Logon ID: 0xB3780
     Directory Service:
       Name: Relecloud.com
       Type: Active Directory Domain Services
     Object:
       DN: CN=Aline Dupuy,OU=Accounts,DC=Relecloud,DC=com
       GUID: CN=Aline Dupuy,OU=Accounts,DC=Relecloud,DC=com
       Class: user
       Attribute:
         LDAP Display Name: msDS-KeyCredentialLink
         Syntax (OID): 2.5.5.7
         Value: B:854:<Binary>:CN=Aline Dupuy,OU=Accounts,DC=Relecloud,DC=com
     Operation:
       Type: Value Deleted
     Correlation ID: {ad2d52af-9cb0-4100-b6f3-b853ec81a8b3}
     Application Correlation ID: -
     ```

5. **Run adsync delta sync cycle.**

6. **Search for Event ID 5136 again.**
   - This indicates that a directory service object was modified.
   - Example details:
     ```
     A directory service object was modified.
     Subject:
       Security ID: Relecloud\MSOL_xxxx
       Account Name: MSOL_xxxx
       Account Domain: Relecloud
       Logon ID: 0x4Dxxxxx
     Directory Service:
       Name: Relecloud.com
       Type: Active Directory Domain Services
     Object:
       DN: CN=Aline Dupuy,OU=Accounts,DC=Relecloud,DC=com
       GUID: CN=Aline Dupuy,OU=Accounts,DC=Relecloud,DC=com
       Class: user
       Attribute:
         LDAP Display Name: msDS-KeyCredentialLink
         Syntax (OID): 2.5.5.7
         Value: B:854:<Binary>:CN=Aline Dupuy,OU=Accounts,DC=Relecloud,DC=com
     Operation:
       Type: Value Added
     Correlation ID: {2f90...
     ```
