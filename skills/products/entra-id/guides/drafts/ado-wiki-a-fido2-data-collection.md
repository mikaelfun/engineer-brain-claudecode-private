---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/FIDO2/FIDO2: Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/FIDO2/FIDO2%3A%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/586125&Instance=586125&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/586125&Instance=586125&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides guidelines on how to collect data for troubleshooting issues related to Windows Authentication, Hybrid Identity, and related scenarios. It includes instructions on what data to collect, where to collect it, and how to collect it effectively.

[[_TOC_]]

## What data to collect?
- On the client: authorization script or TSSv2.
- On the Domain Controller (DC): authorization script or TSSv2, output of all FIDO2 Kerberos-related objects, and metadata of krbtgt_AzureAD.
- On AADConnect: output of the `Get-AzureADKerberosServer` command.

---

## Where to collect data?
- On the client device.
- On the DC: From the impacted client device, you can run `nltest /dsgetdc:<dc name> /keylist /kdc` or look into the kerberos.etl to find the IP address of the DC, then collect data on that one. Open the kerberos.etl file, localize the call of `LsaApLogonUserEx3` for the impacted user, then the FIDO2 request (McTicket), and find the IP address of the DC.
- From AADConnect server or a device with the [Azure AD Hybrid Authentication Management module](https://www.powershellgallery.com/packages/AzureADHybridAuthenticationManagement/2.1.1.0).

---

## How to collect data

### Client device and DC simultaneously
We have a common approach for simplified data collection:
- [ADDS: Security: WHFB: Tools: Scripts for collecting data when investigating Windows Authentication, Hybrid Identity, and related scenarios](https://internal.evergreen.microsoft.com/topic/4487175)
- [Windows ADS TSSv2](https://internal.evergreen.microsoft.com/en-us/topic/a22d8100-3f02-3972-0e0d-760cafc1843a)

### Additional data from the DC
Kerberos objects linked to FIDO2:
- `Ldifde -d "CN=AzureADKerberos,OU=Domain Controllers,DC=domain,DC=com" -l * -p subtree -f AADkerberos.txt`
- `Ldifde -d "CN=krbtgt_AzureAD,CN=Users,DC=adforest1,DC=com" -l * -p subtree -f AADkrbtgt.txt`
- `Ldifde -d "CN=900274c4-b7d2-43c8-90ee-00a9f650e335,CN=AzureAD,CN=System,DC=adforest1,DC=com" -l * -p subtree -f scp.txt`
- `repadmin /showobjmeta . "CN=krbtgt_AzureAD,CN=Users,DC=xxx,DC=com"`

### Kerberos objects from AAD and AD
You can run the PowerShell command from the AADConnect server or from the device with the dedicated PowerShell module. See [Install the Azure AD Kerberos PowerShell module](https://learn.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-security-key-on-premises#install-the-azure-ad-kerberos-powershell-module) and [View and verify the Azure AD Kerberos Server](https://learn.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-security-key-on-premises#view-and-verify-the-azure-ad-kerberos-server).

On the Azure AD Connect Server, open PowerShell and navigate to `C:\Program Files\Microsoft Azure Active Directory Connect\AzureADKerberos\`. Run the following PowerShell commands to view the Azure AD Kerberos Server from both Azure AD and on-premises AD. **Note**: Replace "contoso.corp.com" with the name of your on-premises Active Directory domain.

```powershell
Import-Module ".\AzureAdKerberos.psd1"
# Specify the on-premises Active Directory domain.
$domain = "contoso.corp.com"
# Enter an Azure Active Directory Global Admin username and password.
$cloudCred = Get-Credential
# Enter a Domain Admin username and password.
$domainCred = Get-Credential
# Get the Azure AD Kerberos Server Object
Get-AzureADKerberosServer -Domain $domain -CloudCredential $cloudCred -DomainCredential $domainCred
```

### Authorization script
- Launch an elevated (admin) PowerShell prompt and change into the folder where scripts are located.
- Start tracing via `.\Start-auth.ps1 -v -acceptEULA`.
- Reproduce the issue.
- Once the issue is reproduced, launch `.\stop-auth.ps1` to stop tracing from the elevated PowerShell session.
- Wait for all tracing to stop completely.
- Zip and upload the authlogs folder content to the DTM workspace associated with the support case.

### TSS
- Open PowerShell as admin and browse to the location where the TSS script has been extracted.
- Run:
  ```powershell
  Unblock-File -Path C:\stagetools\TSSv2\*
  .\TSSv2.ps1 -Start -Scenario ADS_AUTH
  ```
   ![TSS scenario selection](/.attachments/image-08bc2dc0-1819-4a65-bdc2-0d40888f65bd.png)
- Accept:  
  ![Accept the terms](/.attachments/image-652aa565-bc28-4054-9f0d-53c12b93b74c.png)
- Enter "Y":  
   ![Confirm the action](/.attachments/image-0ccf9954-5b03-459c-ba74-710947a2ae09.png)
- Reproduce the issue and then enter "Y":  
   ![Reproduce and confirm](/.attachments/image-a1b727a0-baaa-42d1-b11c-75f801a9a637.png)