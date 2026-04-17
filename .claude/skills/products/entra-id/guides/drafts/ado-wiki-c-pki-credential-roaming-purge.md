---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Workflow: PKI Client/Workflow: PKI Client: Credential Roaming/How to Purge AD Credentials Roaming attributes and Re-Enable Credentials Roaming"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Workflow%3A%20PKI%20Client/Workflow%3A%20PKI%20Client%3A%20Credential%20Roaming/How%20to%20Purge%20AD%20Credentials%20Roaming%20attributes%20and%20Re-Enable%20Credentials%20Roaming"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753241&Instance=1753241&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1753241&Instance=1753241&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This guide details the steps to purge Active Directory (AD) credentials roaming attributes and re-enable credentials roaming. The goal is to remove excessive credentials data from AD and ensure that recently enrolled certificates are properly roamed to AD.

[[_TOC_]]

# How to purge AD credentials roaming attributes and re-enable credentials roaming

In my laboratory, the test user TU1 is in the domain contoso.lab. TU1 has credentials roaming (Cred Roaming) enabled.

The action plan assumes that an undesired and large number of credentials have been roamed to AD, and credential roaming is blocked.

The goal is to remove Cred Roaming data in AD and, after that, make sure that recently enrolled certificates present in the local user certificate store are roamed to AD.

After this action plan is completed, it is critical to identify the misbehaving application that creates a huge number of certificates/keys repeatedly.

The plan is:

- Disable Cred Roaming.
- Remove Cred Roaming data from AD.
- Enable Cred Roaming.

:memo:**NOTE:** The detailed action plan presented below references user TU1 in the contoso.lab domain. In a real-life situation, the username and domain name should be changed accordingly.

**Detailed Action Plan:**

1. Initial state is Cred Roaming enabled.

![Credentials Roaming group policy enabled](/.attachments/image-3873af1d-111a-4e7f-a116-5537495d2e72.png)

```
C:\Users\tu1>certutil -store -user my
my "Personal"
================ Certificate 0 ================
Serial Number: 31b1f75d8b87b6b5438e2184b1215523
Issuer: CN=tu1
 NotBefore: 6/13/2024 1:49 PM
 NotAfter: 5/20/2124 1:49 PM
Subject: CN=tu1
Signature matches Public Key
Root Certificate: Subject matches Issuer
Cert Hash(sha1): fa56fb70b1b2a1bc29124ec0f733b0b8daa50673
  Key Container = 09f6f703-ea5e-4c1e-a9f9-d72fee0865cc
  Unique container name: 8b72b3318e53edeced29c7e72f720f63_4925fd66-7787-4a01-99b3-bb5fa7662eac
  Provider = Microsoft Enhanced Cryptographic Provider v1.0
Encryption test passed
CertUtil: -store command completed successfully.
```

**Credentials Roaming Data**

```
"DataType" "DIMS_Roaming_Status" "Token_Type" "Token_ID" "Token_Size" "Last_Roamed" "Key_Info" "Cert_Subject" "Cert_Issuer" "Cert_Template"
"ATTRIBUTE AD DATA" "No Status" "TYPE_MY_STORE" "FA56FB70B1B2A1BC29124EC0F733B0B8DAA50673" "1083" "6/13/2024 1:49:27 PM" "09f6f703-ea5e-4c1e-a9f9-d72fee0865cc" "CN=tu1" "self signed" "not applicable"
"ATTRIBUTE AD DATA" "No Status" "TYPE_RSA_KEY" "8b72b3318e53edeced29c7e72f720f63_4925fd66-7787-4a01-99b3-bb5fa7662eac" "2081" "6/13/2024 1:49:27 PM" "1ec24518-6369-4431-aef6-4588c5b0eb88" "not applicable" "not applicable" "not applicable"
"ATTRIBUTE AD DATA" "No Status" "TYPE_DPAPI" "1ec24518-6369-4431-aef6-4588c5b0eb88" "740" "6/13/2024 1:47:14 PM" "N/A" "not applicable" "not applicable" "not applicable"

C:\Users\tu1\AppData\Local\Microsoft\DIMS>dir /A:hs /S
 Volume in drive C is Windows
 Volume Serial Number is F877-CDFF

 Directory of C:\Users\tu1\AppData\Local\Microsoft\DIMS

07/09/2024  09:18 AM               512 state.dat
07/09/2024  09:18 AM               512 state.da~
               2 File(s)          1,024 bytes

     Total Files Listed:
               2 File(s)          1,024 bytes
               0 Dir(s)  94,946,746,368 bytes free
```

2. Disable Cred Roaming by moving TU1 to another Organizational Unit (OU) without Cred Roaming enabled.

![Credentials Roaming group policy disabled](/.attachments/image-ff6c26b6-f717-4864-8c6f-ca15c9aee37c.png)

3. Log off TU1 and log back in as TU1.

4. Delete `C:\Users\tu1\AppData\Local\Microsoft\DIMS` and all its content, then reboot the machine.

5. Log in as TU1 and verify that the deleted `C:\Users\tu1\AppData\Local\Microsoft\DIMS` is NOT re-created. If Cred Roaming is properly disabled, `C:\Users\tu1\AppData\Local\Microsoft\DIMS` will NOT be created. If `C:\Users\tu1\AppData\Local\Microsoft\DIMS` is present, please revisit the previous steps and ensure that the Cred Roaming Group Policy Object (GPO) is disabled. If `C:\Users\tu1\AppData\Local\Microsoft\DIMS` is NOT present, proceed with the next step.

6. After Cred Roaming is disabled, the data is still in AD. Considering that the limit is reached and we cant selectively delete tokens in AD, we need to delete Cred Roaming data from AD to restore Cred Roaming activity. Cred Roaming data can be deleted by running the following PowerShell (PS) script in the context of the user (in this case, it will be TU1):

```
function Get-DistinguishedName ($strUserName) 
{  
   $searcher = New-Object System.DirectoryServices.DirectorySearcher([ADSI]'') 
   $searcher.Filter = "(&(objectClass=User)(samAccountName=$strUserName))" 
   $result = $searcher.FindOne() 
 
   return $result.GetDirectoryEntry().DistinguishedName 
} 

$strUsername =  $env:username

$strDN = Get-DistinguishedName $strUserName 
$strDN

$ldapDN = "LDAP://" + $strDN
$adUser = New-Object DirectoryServices.DirectoryEntry $ldapDN
$adUser.PutEx(1, "msPKIAccountCredentials", $null)
$adUser.PutEx(1, "msPKIRoamingTimeStamp", $null)
$adUser.PutEx(1, "msPKIDPAPIMasterKeys", $null)
$adUser.SetInfo() 
```

**IMPORTANT:** The PowerShell script pasted above must be executed in the security context of the user who reported the issue.

7. Once the script is run, you can get an LDIFDE (LDAP Data Interchange Format Data Exchange) dump of the user or use the "Credential Roaming Utility."

8. After Cred Roaming AD attributes are deleted, enable Cred Roaming again.
