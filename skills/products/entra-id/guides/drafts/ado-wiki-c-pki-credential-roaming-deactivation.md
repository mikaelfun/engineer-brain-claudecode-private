---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Credential Roaming/Workflow: PKI Client: Credential Roaming Deactivation"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming%20Deactivation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753243&Instance=1753243&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753243&Instance=1753243&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a step-by-step guide on how to deactivate credential roaming by removing the roaming profile Group Policy Object (GPO) setting and Active Directory (AD) attributes. It includes detailed instructions, command lines, and verification steps.

[[_TOC_]]

# How to deactivate credential roaming?

Remove the roaming profile Group Policy Object (GPO) setting.

![Credential Roaming policy](/.attachments/image-d1ae1dce-18e2-42b9-b37e-0cd59c59c11f.png)

Remove the Active Directory (AD) attributes.

Create a file named `dimsdelete.ldf` with the following content (please replace DN with yours, and keep the space, return line, and mark **-**

```
dn: CN=test_user,CN=Users,DC=contoso,DC=com

changetype: modify

delete:msPKIAccountCredentials

-

delete:msPKIRoamingTimeStamp

-

delete:msPKIDPAPIMasterKeys

-
```

Perform the deletion operation with the following command line: 
```
ldifde.exe -i -f dimsdelete.ldf
```

![ldifde.exe command output](/.attachments/image-4d9a0de1-411d-438a-8742-31a852004a5c.png)

Verify the AD attributes have been deleted.

![Credential Roaming AD attributes](/.attachments/image-2862cc1d-0a7b-4e38-a212-3d771e6c56f1.png)

The result of the command line:
```
Repadmin /showobjmeta cont-dc CN=test_user,CN=Users,DC=contoso,DC=com
```

![Repadmin command output](/.attachments/image-c2ce72fa-01f5-483e-be12-df1165b0a0f0.png)

After AD replication, Group Policy Object (GPO), and user logon, the credential roaming attributes will be recreated. You can check using this command:
```
ldifde.exe -f dimsverify.ldf -r (cn=USERNAME) -l msPKIAccountCredentials,msPKIRoamingTimeStamp,msPKIDPAPIMasterKeys
```

:memo:**Note:** To remove absent entries faster, the following options could be considered:
- Consider lowering Time to Live (TTL)
- Consider setting `garbageCollPeriod=1`

The Active Directory database garbage collection process and calculation of allowed intervals.
