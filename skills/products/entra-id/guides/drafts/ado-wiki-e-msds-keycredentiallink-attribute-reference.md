---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Looking for known solutions | tips/Generic solutions/MSDS-Keycredentiallink/MsDs-KeyCredentialslLink attribute"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Looking%20for%20known%20solutions%20%7C%20tips%2FGeneric%20solutions%2FMSDS-Keycredentiallink%2FMsDs-KeyCredentialslLink%20attribute"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/429678&Instance=429678&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/429678&Instance=429678&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This article provides detailed instructions on how to check the "msds-KeyCredentialLink" attribute, which is used with Windows Hello for Business. It includes background information, tools, and methods for troubleshooting and verifying the attribute.

[[_TOC_]]

<SPAN style="color:red">**_All domain names, tenant names, user account IDs, and associated GUIDs used in this document originated from Microsoft internal test domain names and do not contain PII from customer environments._**</SPAN>

# How to check the "msds-KeyCredentialLink" attribute

The following article is written to provide the existing ways to query and perform checks on the "msds-KeyCredentialLink" attribute used with Windows Hello for Business feature.

---
## Background  Technical insight

### What is this attribute and how is it used?
The process that drives populating and using this attribute is part of the Next Generation Credentials Technology (NGC). More about NGC and Microsoft Passport can be found here:
[Windows Hello for Business Overview](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-overview)

### [Passwordless strategy](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/passwordless-strategy)
There are multiple services and devices capable of NGC. An NGC key is a type of credential (Next Generation Credential Key) and can be used to authenticate against Active Directory Domain Services (AD DS) and Azure Active Directory (AAD). Each key is stored in a multi-valued attribute msDS-KeyCredentialLink on the object (typically a user or computer object) and is made up of multiple parts. Windows Hello for Business is one of the services that uses the passwordless authentication flow. Credential Guard is another.

For your reference, the following article provides an example of how the Windows Hello for Business flow works and how the value for msDS-KeyCredentialLink is processed:
[Windows Hello for Business Provisioning](https://docs.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-how-it-works-provisioning#hybrid-azure-ad-joined-provisioning-in-a-key-trust-deployment-in-a-managed-environment)

The msDS-KeyCredentialLink attribute is populated during Windows Hello for Business provisioning. This user attribute in Active Directory stores the asymmetric key (public part) needed for the user account identity in the authentication flow. The key stored under the msDS-KeyCredentialLink attribute is used to first identify the user on-premises and then authenticate them.

The searchableDeviceKey attribute associated with the user object in AAD is populated once the user has a linked device that can perform NGC. This attribute must have a value.
(Source: 4524961 How is msDS-KeyCredentialLink populated and written back to AD)

AADConnect sync rule gets the value from searchableDeviceKey to an attribute called DeviceKey (in the metaverse). The export rule takes the value from DeviceKey and exports it to msDS-KeyCredentialLink in AD. The msDS-KeyCredentialLink user attribute in Active Directory stores the asymmetric key (public part) needed for the user account identity in the authentication flow.

There are two msDS-KeyCredentialLink attributes, one on the user and one on the computer object (when device writeback is enabled). If your device is AADJ, to log in to the client or get the Primary Refresh Token (PRT), Windows does not need access to the msDS-KeyCredentialLink; you do not even have it if you do not have Windows Hello for Business.

Keys are created during the provisioning of Windows Hello for Business and stored on the object either in AD or AAD (depending on the method). AAD-created keys may also be synced into on-prem AD through AAD Connect. Looking at the msDS-KeyCredentialLink on-premises, you can see where the key was created:
- Keys created against AD have a bit set on them that says Source: 0x0 (AD).
- Keys created in AAD have Source: 0x1 (AAD).

The Last Logon Timestamp (LLTS) on the value will also tell you if it has been used in the last 14 days to log on (in addition to creation time, which tells you when it was created).
[KEYCREDENTIALLINK_ENTRY Identifiers](https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/a99409ea-4982-4f72-b7ef-8596013a36c7)  
![Example Image of msDS-KeyCredentialLink](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_4.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

(Source: H4Btalk@microsoft.com alias)

More details:  
[2.2.20 Key Credential Link Structures](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/de61eb56-b75f-4743-b8af-e9be154b47af)  
[2.3.3 ms-DS-Key-Credential-Link](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kpp/e6a6634c-f395-46a7-8100-1eb12dd2b8e3)

---
## Guidance

During the troubleshooting of Windows Hello for Business cases, you might need to check if this attribute is correctly populated, if there are no duplicate values, etc. You have multiple tools to achieve this. The purpose of this article is to describe how to use them.

### Azure support center
Where do I run them? On which device?  
On your machine, you can grab some details regarding the objects stored in AAD.  
https://azuresupportcenter.msftcloudes.com/ticketdetails  
Find the ObjectID of the user using the User tab, then paste it in the Directory object tab.  
![Azure Support Center Screenshot 1](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_4.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

Localize the searchableDeviceKey section:  
![Azure Support Center Screenshot 2](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_5.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

### PowerShell

Basic verification that shows if the attribute is empty or not.
Where do I run them?
The following commands must be used in the customers environment using an account with privileges to query AD objects.

On which device?
On a client device or on a domain controller where the ADDS RSAT has been installed
(Install-WindowsFeature -Name RSAT-AD-Tools)

```powershell
get-aduser -Identity pborg -Properties "msds-KeyCredentialLink"
```
_or_
```powershell
get-aduser -Identity pborg -properties *
```

Example:
```powershell
get-aduser -identity pborg -Properties "msds-KeyCredentialLink"
```

| Properties | Value |
|:--|:--|
| DistinguishedName | CN=Paul Borg,OU=Accounts,DC=adatum,DC=com |
| Enabled | True |
| GivenName | Paul |
| _msds-KeyCredentialLink_ | {B:854:00020000200001338B5396ED5C48020A71436E25FCF7F28C19A39D174BDAD3D030DE8FFC6744B92000022D924F602EE59B45515287D28A669Dxxxxxxxxx67AEC551F7D748:CN=Paul Borg,OU=Accounts,DC=adatum,DC=com} |
| Name | Paul Borg |
| ObjectClass | user |
| ObjectGUID | f09e255f-xxxxx |
| SamAccountName | paul |
| SID | S-1-5-21-498230862-xxxxx |
| Surname | Starr |
| UserPrincipalName | paulb@adatum.com |

---
### How to check which accounts have this attribute populated and retrieve the UPN and associated devices:

```powershell
$users = Get-ADUser -Filter { msDS-KeyCredentialLink -like '*' } -Properties "msDS-KeyCredentialLink"
foreach ($usr in $users) {
    $devs = ($usr."msDS-KeyCredentialLink").SubString(764, 16)
    foreach ($d in $devs) {
        $searchexp = ("*" + $d.Substring(0, 4) + "-" + $d.Substring(4, 12))
        Write-Host ("User: " + $usr.UserPrincipalName + " Device: " + (Get-ADObject -Filter { objectClass -eq 'msDS-Device' -and Name -like $searchexp } -Properties *).DisplayName)
    }
}
```

Output:
```
User : paul@adatum.com Device : WHFBVm1
User:  Ana@adatum.com Device : WHFBVm2
```

---
### External PowerShell modules

Where do I run them?
The following commands/modules must be used in the customers environment using an account with privileges to query AD objects.

On which device?
On a client device or on a domain controller where the module has been installed.

#### DSInternals

```powershell
Install-Module -Name DSInternals -RequiredVersion 4.1
```

Example:
```powershell
Get-ADUser -Identity paul | get-adobject -Properties msDS-KeyCredentialLink | select-object -ExpandProperty msDS-KeyCredentialLink | get-keycredential
```

Output:
| Usage  | Source  | Source  | DeviceId | Created | HolderDN |
|:-----:|:--:|:--:|:--:|:--:|:--:|
| NGC | AzureAD | None | b838f3be-xxx | 2020-05-13 | CN=Paul Borg,OU=Accounts,DC=adatum,DC=com |

---
#### WHfbTools PowerShell module

From PowerShellGallery.com. 

Can be used to query the date of Windows Hello for Business keys available in Azure AD and ADDS [https://aka.ms/WHfBTools](https://aka.ms/WHfBTools). 

Using WHfBTools PowerShell module for cleaning up orphaned Windows Hello for Business Keys
[Related article](https://support.microsoft.com/en-us/help/4533501/using-whfbtools-powershell-module-for-cleaning-up-orphaned-windows-hel)

```powershell
Install-Module WHfBTools
Install-Module -Name MSAL.PS -RequiredVersion 4.5.1.1
Install-WindowsFeature -Name RSAT-AD-Tools
```

Then import modules:
```powershell
Get-AzureADWHfBKeys -Logging -Report -Tenant xxx -All
```

Expected output:
```powershell
Get-AzureADWHfBKeys -Logging -Report -Tenant xxx -All
```

Total scanned: 18 - Batch contained 19 users. Total WHfB ROCA vulnerable keys: 0. Total orphaned WHfB keys: 0

| userPrincipalName | Result |
|:-----:|--|
| paul@adatum.com | Tenant: x<br/>DeviceId: d1<br/>Usage: NGC<br/>Id: i2a0-------<br/>CreationTime: 2020-02-26T08:08:33.9733864Z<br/>RocaVulnerable: False<br/>Orphaned: False |
| ana@adatum.com | Tenant: x<br/>DeviceId: d1<br/>Usage: NGC<br/>Id: 0f24v----<br/>CreationTime: 2021-03-24T13:18:24.8876651Z<br/>RocaVulnerable: False<br/>Orphaned: False |
| Katarina@adatum.com | Tenant: x<br/>DeviceId: d2<br/>Usage: NGC<br/>Id: LSiLQo-----<br/>CreationTime: 2019-10-10T14:29:56.5972187Z<br/>RocaVulnerable: False<br/>Orphaned: False |

Report of summary results:

| Users scanned | 18 |
|:-----:|--|
| Users with WHfB keys | 3 |
| Total WHfB Keys | 3 |
| Total ROCA vulnerable keys | 0 |
| Total orphaned keys | 0 |

---
### Ldp.exe

Where do I run them?
You must use this tool in the customers environment using an account with privileges to query AD objects.

On which device?
This tool has to be run either on a domain controller or on a client machine with RSAT tools installed.
(Install-WindowsFeature -Name RSAT-AD-Tools).

| Step | Description |
|:--|:--|
| Run ldp.exe, then Click on connection / connect / leave default values and OK | ![Ldp.exe Step 1](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_4.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master) |
| Click on bind / leave default values and OK | ![Ldp.exe Step 2](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_5.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master) |
| Click on View / Tree / select the domain partition (the first choice on the menu) / OK | ![Ldp.exe Step 3](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_6.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master) |
| Expand on the left and go to the OU where the user is stored, then double click on it: | ![Ldp.exe Step 4](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_6.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master) |

---
### "Reverse search": using the keyID

If you only have the keyID and wish to find the associated user, you can use this kind of filter. Replace the <SPAN style="color:green">value</SPAN> with the keyID and paste it in the filter field, then select subtree as scope and click run:
```plaintext
(&(msDS-KeyCredentialLink:1.2.840.113556.1.4.2253:=B:78:000200002000012<SPAN style="color:green">d288b4289e950ade43af04482348830cbc3894c1d6f757a297eba1ce4c3d38b</SPAN>)(|(objectClass=user)(objectClass=msDS-Device)))
```

or
```plaintext
ldifde -d "DC=adforest1,DC=com" -l * -p subtree -r "(&(msDS-KeyCredentialLink:1.2.840.113556.1.4.2253:=B:78:000200002000018b66b4fbbdf016f74f4a509075d5af2668333ccb0aabc1334fa9817a5a285146:)(|(objectClass=user)(objectClass=msDS-Device)))" -f output.txt
```

![image.png](/.attachments/image-923faf73-353d-4d77-9f77-57e1bbfcc859.png)

Result:

![image.png](/.attachments/image-97df72cc-14c3-4855-90ce-02071ef6cced.png)

---

### Graph Explorer

#### Where to run them?
You must use this tool in the customers environment using an account with privileges to query Active Directory (AD) objects.

#### On which device?
On a client device. Browse to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer).

1. Sign in with a global administrator of the Azure Active Directory (AAD) tenant.  
   ![Graph Explorer Sign-In](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_10.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)
   
2. Note: You must explicitly consent to each expected permission (see modify permissions).  
   ![Graph Explorer Permissions](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_11.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)
   
3. You can see the device key where it was originally created: in AAD.
   Query: `https://graph.microsoft.com/beta/users/paul@whfbHKT.contoso.com/devicekeys`
   Response:  
   ![Graph Explorer Response](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_12.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

---

### Convert the KeyID

The base64 key ID output from either Azure AD or AD DS can be converted and then matched to the keyID (bcrypt-sha256) in the authentication scripts output. The KeyID can be pulled from the cert_MPassportkey.txt or user-store.txt in the .zips folder (Certinfo_and_Certenroll). Look for the Key Id Hash (bcrypt-sha256) entry (provider will be Microsoft Passport Key Storage Provider).

 You must execute the auth script in the impacted user context, otherwise, the output of the user certificate store will not be for that impacted user, but for the user who started the data collection!

Example:
```
Microsoft Passport Key Storage Provider:
S-1-12-1-xxxx-xxxx-xxxx-xxxx51/7xxxx-xx-xxx-xx-xxab/login.windows.net/x9b-8x-4x-xxxf-xx53/Test@contoso.com
RSA Key Id Hash (bcrypt-sha256): 672c0acb40d7c5ea567a0f26cc34a664703a15d3ef59255490d5754f602a6996
```

Then convert that keyID using this [website](https://cryptii.com/pipes/base64-to-hex).
Once in ASC, copy the values into Notepad.

Example:
```json
{
    "usage": "NGC",
    "keyIdentifier": "dymhSc59sxX2/VeXhD9v+unZoG6XHX/GKoV44XZbBug=",
    "keyMaterial": "UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQABwpBAQduZTvxrCX/wxbhOwDQsK+dV9PEgEscHy/jhgMurbz6gVD5ot7vH53rvFjq8FkL+JcaRxyIhi9xMWKaLmi20CHXcGolL4AxkcISW1V/Ob5hiF/m9I+gFcJfV0VUg7qI5d4guo696uhu39h0ARctKJI9dE4gfDrME/JZcrwaoLmsg1mRh9uutIpXintK15S5gS2cdwU5NP0SAQjDzeYF5RNJTp2zoTtB/tL+Er6UiW7/uYDbS6cXw0w1U1K2f/b3jIXsQ3RwzCMTrx9Jt+nzhrnLgl2epjrYAjquXlo7kJAqLMrcLl4SI9y03WyAYQele/JCcXCFafiKxh/YvRQ==",
    "creationTime": "2020-04-07T09:45:28.085357Z",
    "deviceId": "208e8c15-16db-4f6a-9fb5-7f83f9e0ffff",
    "customKeyInformation": "AQAAAAACAAAAAAAAAAAA",
    "fidoAaGuid": null,
    "fidoAuthenticatorVersion": null,
    "fidoAttestationCertificates": []
},
{
    "usage": "NGC",
    "keyIdentifier": "nJKRbxFk9oqBPNMe2Uxuk35vuRMrfDz4A/FUKyc6Qk8=",
    "keyMaterial": "UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQAB0OQgJ4YAKObjw01ZZ/8gAf9wQcfFIP1s7MsDCfILctpNGg5qbcQcG+qpiE8horFwB3yPFDfGHOj9Pn+Dlxs3hE/8dEHT6zxvvqvXPTUXi5rX+HfVILtDMP23xfrDYLGLRZ4NyyQdwW/LTdIBt/dccibTMAPP5oBll6meoVfOUP8zoUPI0ttdoQBgaxIG7SF/qK/Vz8qrttLMNZZrPBX0Lh4PEx0pPUXVZVOFaobqXKAi3ck7CjZMRrOEr7RLBOntAfHhsXBrXXcAwhZPmHRf6ziCNgDVtDa/bHxcOP7QYf3B41a9wUZJIvWYBnyyg9yAKTLGbz9MgAn3twb1ZKYfGQ==",
    "creationTime": "2020-04-06T17:02:11.4553979Z",
    "deviceId": "7df6b5df-1e0f-4237-b1a3-8f4b57b89f5b",
    "customKeyInformation": "AQAAAAACAAAAAAAAAAAA",
    "fidoAaGuid": null,
    "fidoAuthenticatorVersion": null,
    "fidoAttestationCertificates": []
},
{
    "usage": "NGC",
    "keyIdentifier": "h8qHL2IAU4fzm/gpbnih9lQgasFXfU8/uQMFw1m1Nvk=",
    "keyMaterial": "UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQABs1JukJCowkV2X56rLBS52SlBEkhTkcmBYVW3ay26c5H+sJOxGdIEJcN48D1ePf/Z2EqrmHXb/3b4jQExjbq965dJ8AZKIE5WvunItOEbkY0n0UvFq+tY2efZ0lxDwMR2OTUXTjlHEvHDSUuiXPszuHsRKE2IiC2971BSrN+++NoY+Dx39spdFms6dobWGPGHujOO2ndmnHRaIbgQt6fqzefUt4a2ZOyVoZjGjPHF4LbFo0VvjfPA1E3OaGCitCThlWoctQAv2Whw3J/s4y5+ygoq0cT4n1nJ/GTvWjyv32wfXDnhDyl8HYq6sRbnPahiQTX71i4jYB6eA/nQit0/0Q==",
    "creationTime": "2020-04-06T13:11:01.7950693Z",
    "deviceId": "5fa27cb7-7771-43ba-aaeb-4684060f1725",
    "customKeyInformation": "AQAAAAACAAAAAAAAAAAA",
    "fidoAaGuid": null,
    "fidoAuthenticatorVersion": null,
    "fidoAttestationCertificates": []
}
```

#### Convert the keyIdentifier using the same [website](https://cryptii.com/pipes/base64-to-hex).
![Key Identifier Conversion](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_13.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

After converting, we can check if the credentials are synced or not:  
![Check Credentials Sync](https://supportability.visualstudio.com/d71be795-62a4-4613-9918-217237a648ba/_apis/git/repositories/7d4ee831-cd65-46bb-9527-bae6917085be/Items?path=%2FWindowsDirectoryServices%2F.attachments%2FWHfB%2FMsDs_KeyCredentialslLink_attribute_14.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=master)

### Convert the key material

Example query:
`https://graph.microsoft.com/beta/users/userHKT2@whfbHKT.jobesancmscloud1.com`

```json
"deviceKeys": [
    {
        "deviceId": "943e9f5a-b6f6-4ddd-b192-d042e6f7cc28",
        "keyMaterial": "UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQABnhvrZ2wpqCqXHFA4ZgsmxeD/w26/vBJ9R82RAI+34jcOW11bAqZ4Jy7YkLfCzxsp7NkLS2qfEqXldO+VI1qRmiCcaB06H6QV1DNrvBFekosbHmlDeaK/s4HqE1qKF9UvcLeOUNfByKH4aQKMH/ZX9g0IWV7aGl4heKmT1Ow4E/MW58JEij1JHNZk11ifgiz3W/4k5RJiAhbX7t0osnno9tIGtoX4S3p/VGcxU0jzkukrTSI5Krz4YgHGxIRjvUTFGt2FcLqiJrGrJuicN6KzYJdDBL2b9IpSoyANunOdrFlof5Qq4U/mB2Jr14wqSwJRxlX/R2NmlXx4yYLSv7WmAQ==",
        "keyType": "NGC"
    }
]
```

```plaintext
UlNBMQAIAAADAAAAAAEAAAAAAAAAAAAAAQABnhvrZ2wpqCqXHFA4ZgsmxeD/w26/vBJ9R82RAI+34jcOW11bAqZ4Jy7YkLfCzxsp7NkLS2qfEqXldO+VI1qRmiCcaB06H6QV1DNrvBFekosbHmlDeaK/s4HqE1qKF9UvcLeOUNfByKH4aQKMH/ZX9g0IWV7aGl4heKmT1Ow4E/MW58JEij1JHNZk11ifgiz3W/4k5RJiAhbX7t0osnno9tIGtoX4S3p/VGcxU0jzkukrTSI5Krz4YgHGxIRjvUTFGt2FcLqiJrGrJuicN6KzYJdDBL2b9IpSoyANunOdrFlof5Qq4U/mB2Jr14wqSwJRxlX/R2NmlXx4yYLSv7WmAQ==
```

Converted is [https://cryptii.com/pipes/base64-to-hex](https://cryptii.com/pipes/base64-to-hex)

```plaintext
52 53 41 31 00 08 00 00 03 00 00 00 00 01 00 00 00 00 00 00 00 00 00 00 01 00 01 9e 1b eb 67 6c 29 a8 2a 97 1c 50 38 66 0b 26 c5 e0 ff c3 6e bf bc 12 7d 47 cd 91 00 8f b7 e2 37 0e 5b 5d 5b 02 a6 78 27 2e d8 90 b7 c2 cf 1b 29 ec d9 0b 4b 6a 9f 12 a5 e5 74 ef 95 23 5a 91 9a 20 9c 68 1d 3a 1f a4 15 d4 33 6b bc 11 5e 92 8b 1b 1e 69 43 79 a2 bf b3 81 ea 13 5a 8a 17 d5 2f 70 b7 8e 50 d7 c1 c8 a1 f8 69 02 8c 1f f6 57 f6 0d 08 59 5e da 1a 5e 21 78 a9 93 d4 ec 38 13 f3 16 e7 c2 44 8a 3d 49 1c d6 64 d7 58 9f 82 2c f7 5b fe 24 e5 12 62 02 16 d7 ee dd 28 b2 79 e8 f6 d2 06 b6 85 f8 4b 7a 7f 54 67 31 53 48 f3 92 e9 2b 4d 22 39 2a bc f8 62 01 c6 c4 84 63 bd 44 c5 1a dd 85 70 ba a2 26 b1 ab 26 e8 9c 37 a2 b3 60 97 43 04 bd 9b f4 8a 52 a3 20 0d ba 73 9d ac 59 68 7f 94 2a e1 4f e6 07 62 6b d7 8c 2a 4b 02 51 c6 55 ff 47 63 66 95 7c 78 c9 82 d2 bf b5 a6 01
```

The portion that is interesting is:
```plaintext
9e 1b eb 67 6c 29 a8 2a 97 1c 50 38 66 0b 26 c5 e0 ff c3 6e bf bc 12 7d 47 cd 91 00 8f b7 e2 37 0e 5b 5d 5b 02 a6 78 27 2e d8 90 b7 c2 cf 1b 29 ec d9 0b 4b 6a 9f 12 a5 e5 74 ef 95 23 5a 91 9a 20 9c 68 1d 3a 1f a4 15 d4 33 6b bc 11 5e 92 8b 1b 1e 69 43 79 a2 bf b3 81 ea 13 5a 8a 17 d5 2f 70 b7 8e 50 d7 c1 c8 a1 f8 69 02 8c 1f f6 57 f6 0d 08 59 5e da 1a 5e 21 78 a9 93 d4 ec 38 13 f3 16 e7 c2 44 8a 3d 49 1c d6 64 d7 58 9f 82 2c f7 5b fe 24 e5 12 62 02 16 d7 ee dd 28 b2 79 e8 f6 d2 06 b6 85 f8 4b 7a 7f 54 67 31 53 48 f3 92 e9 2b 4d 22 39 2a bc f8 62 01 c6 c4 84 63 bd 44 c5 1a dd 85 70 ba a2 26 b1 ab 26 e8 9c 37 a2 b3 60 97 43 04 bd 9b f4 8a 52 a3 20 0d ba 73 9d ac 59 68 7f 94 2a e1 4f e6 07 62 6b d7 8c 2a 4b 02 51 c6 55 ff 47 63 66 95 7c 78 c9 82 d2 bf b5 a6 01
```
9e1beb .... is not in msds-keycredentiallink attribute :

```powershell
Get-ADUser -Identity userHKT2 -Properties "msds-KeyCredentialLink"
```

**Output:**
```plaintext
msds-KeyCredentialLink : {B:854:00020000200001 <key id : B6A4Exxxx>
20000282F7D6E6C9641C9691308A1EAF9D0BD7DDD6C2922EC2464F9C46175319033CC11B0103
<key material : 525341310008000003000000000100000000000000000000010001
B9C81ACFB7924D0129552C82E58C5609C84092C3DDDB56D836DCF8163E28384A203C3A545EED99832DEAB0CD8E1FF390803F2C4B19221188D2CB30D8E2F4955296590F777D84065D540CB591B98C0A4DECF4B60E16CA95433A2393DDA2766A12120AFC9E9FB0E1C2ECDD22AE523F0CF1984C29572B6560BDB2789CE4EE5A565 390E612ECB9DC1A86E7F32768888B989D80593EE1C522DEC1C71CBC71BE667DC935EB3ACD38F1CE7B9C5D65E42208F2B9DF3DB6F08A6584CD37CEF047E4D9F377080DE363725B6CB59052BFD0333A947298FF0803EFBCD377F1B93D1963DC75D2A3AED3C18456EA6DF6F2CFDF8BE7B33D41F999394C295E5812A401AE4DCA464F0100040101000501100006E6380A7AA085E64F915C2B36A09A7D8C0F0007010000000002000000000000000000080008000000000000000008000936C1AE66F616DA48>:CN=xxxx,

B:854:00020000200001
<key id : 28755Fxxxx>
200002964E8AE2532F0AC4BA36A6CEBD130380EA707DA4B10BDF13E9508517F31A1FBF1B0103
<key material : 525341310008000003000000000100000000000000000000010001 AF84D75BA45A1313A41E214A35E018328A03A0A84AAF68B4EE2CCE9CF087535597A73CBAC98F1B734477516302A56CCAD32F31EE05B478267EF3216619BD89D51FAF0285BEBDBD98FBB1CE3B3A6878D11CA84B08658E390E71ED9F709BA32CE2B87D1430C5EDE99414C067F5D986B2DF778CDD9BEB07E0C06AEB37F8AEAFF99328ACCD9206332BA273F5959817DCF2DB6047F76E355D1CBDC2399891AB02B289B29053CB7F63AF486D9A6DBF8F05FDE802343C52B27F578B48429655FF6EC04B397B737B52C7C3B5D4CC7B23D9D6B5DE382D5618F587B7D85E81031DBBB810726CCCFF5E0F152A993F47AD560E5D0BC55C956463226E1B20B946B9A56D800C25010004010100050110000649D4C9DFE6F8E04A9C76EB4321EEFFBB0F000701000000000200000000000000000008000800000000000000000800099161173B4FA0D848> :CN=xxxt}
```

### Troubleshooting Tip

If the user object is an InetOrgPerson, the "msds-KeyCredentialLink" in AD may not be updated as the rule is scoped for "person". As a result, Active Directory Federation Services (ADFS) fails to validate the NGC key used during authentication.

#### Creating a New ADSync Rule

```powershell
New-ADSyncRule  
-Name 'Out to AD - User NGCKey'
-Identifier '515d25ba-4ae7-4622-b67a-6f3811f8eXXX'   
-Description ''  
-Direction 'Outbound'
-Precedence X     
-PrecedenceAfter '00000000-0000-0000-0000-000000000000'  
-PrecedenceBefore '00000000-0000-0000-0000-000000000000'   
-SourceObjectType 'person'
-TargetObjectType 'user'  
-Connector '58b27e0e-e269-488a-8cdf-32899a06cXXX'  
-LinkType 'Join'  
-SoftDeleteExpiryInterval 0   
-ImmutableTag 'Microsoft.OuttoADUserNGCKey.001'  
-OutVariable syncRule
```

#### Adding Attribute Flow Mapping

```powershell
Add-ADSyncAttributeFlowMapping   
-SynchronizationRule $syncRule[0]     
-Source @('deviceKey')     
-Destination 'msDS-KeyCredentialLink'   
-FlowType 'Direct'   
-ValueMergeType 'Update'   
-OutVariable syncRule
```

```powershell
New-Object -TypeName 'Microsoft.IdentityManagement.PowerShell.ObjectModel.ScopeCondition' -ArgumentList 'sourceAnchor','','ISNOTNULL'     
```

### Other Articles Related to the msDS-KeyCredentialLink Attribute

- [4524961 How is msDS-KeyCredentialLink populated and written back to AD](https://internal.evergreen.microsoft.com/topic/4524961)
- [4536443 ADDS: NTDSAI: SamDsReplaceSamNgcKey writes duplicate KeyID entries to a computer object's msDS-KeyCredentialLink attribute causing subsequent key based authentications to fail](https://internal.evergreen.microsoft.com/topic/4536443)
- [4553385 ADDS: Security: NGC Keys Deep Dive](https://internal.evergreen.microsoft.com/topic/4553385)
- [4570604 ADDS: Security: Protected Groups and the case of Key Admins and Enterprise Key Admins in WS2016](https://internal.evergreen.microsoft.com/topic/4570604)
- [4032996 ADDS: Security: Key Admins security groups are granted Read and Write access to the ms-DS-Key-Credential-Link attribute on all child objects on WS16+](https://internal.evergreen.microsoft.com/topic/4032996)

---
