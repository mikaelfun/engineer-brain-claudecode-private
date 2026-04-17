---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Migration Scenario - Legacy LAPS to Windows LAPS (Storing Passwords in Active Directory)/Migration steps in details"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Migration%20Scenario%20-%20Legacy%20LAPS%20to%20Windows%20LAPS%20%28Storing%20Passwords%20in%20Active%20Directory%29/Migration%20steps%20in%20details"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053856&Instance=1053856&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1053856&Instance=1053856&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide provides detailed instructions for migrating to the new Windows Local Administrator Password Solution (WLAPS) from Legacy LAPS. It covers prerequisites, schema extension, group policy settings, and cmdlets for managing passwords.

[[_TOC_]]

# Important note before starting the migration

Based on customer feedback regarding the tedious installation of the LAPS MSI package, we have simplified the migration to the new Windows Local Administrator Password Solution (WLAPS). **Any new Windows 10 22H2 - 3C.2023, Windows 11 21H2, 22H2 - 3C.2023, Windows Server 2019 RS5 - 4B.2023, and Windows Server 2022 FE - 4B.2023** joined to an existing environment with Legacy LAPS will start rotating the Administrator password and save it to the legacy attribute (ms-Mcs-AdmPwd) without the need to install the legacy LAPS package.

The only condition is that the embedded new LAPS client will respond to the legacy LAPS Group Policy Object (GPO) settings as long as the legacy LAPS package is not installed.

You can start uninstalling the legacy LAPS package from any of the Windows clients and servers that were upgraded to the **above build version**, and those clients will still respond to the legacy LAPS GPO settings:   

![A image showing the add or remove programs interface with legacy laps package right clicked and the option to uninstall is highlighted and other indications the legacy LAPS is used.](/.attachments/image-7364806c-689b-4e69-a807-277199b51842.png)

**Notes:**

- **Invoke-LapsPolicyProcessing**: The new LAPS client wakes up every hour to process the policy. Running the Invoke-LapsPolicyProcessing cmdlet will trigger the process immediately.
- **Get-LapsADPassword**: The cmdlet retrieves passwords from Windows Server Active Directory (Legacy or New LAPS attributes). Using `-AsPlainText` will display the password in clear text:

```
PS C:\> Get-LapsADPassword -Identity lapsclient1

ComputerName        : LAPSCLIENT1
DistinguishedName   : CN=LAPSCLIENT1,OU=LAPSOU,DC=CONTOSO,DC=COM
Account             : Administrator
Password            : System.Security.SecureString
PasswordUpdateTime  : 1/15/2023 7:54:40 AM
ExpirationTimestamp : 2/14/2023 7:54:40 AM
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : CONTOSO\Domain Admins
```

```
PS C:\> Get-LapsADPassword -Identity lapsclient1 -AsPlainText

ComputerName        : LAPSCLIENT1
DistinguishedName   : CN=LAPSCLIENT1,OU=LAPSOU,DC=CONTOSO,DC=COM
Account             : Administrator
Password            : zx2.I64R12l)o7
PasswordUpdateTime  : 1/15/2023 7:54:40 AM
ExpirationTimestamp : 2/14/2023 7:54:40 AM
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : CONTOSO\Domain Admins
```

## The New LAPS (WLAPS)

To start using the new LAPS in your environment, complete the following tasks:

### 1. Raising the domain functional level to Windows Server 2016

This is mandatory for encrypting the password in Active Directory for two reasons:
1. It encourages customers to upgrade their 2012r2 Domain Controllers (DC) to a newer version.
2. The encryption support is based on the built-in Data Protection API (DPAPI) group encryption feature in Windows, which allows us to encrypt a blob that only members of a particular group can decrypt. Due to a code defect in the transition from WS 2012R2 to WS2016 in the encryption code base, encrypted blobs from WS2012R2 may not be compatible with WS2016 or above.

### 2. Extending the schema

You can either introduce a new Windows Server 2022 build FE - 4B as a Domain Controller or extend your schema from Windows 11 21H2, 22H2 - 3C or Windows Server 2022 build 4B using the following command (must be performed by a member of the 'Schema Admins' group):

```
PS C:\Users\sagiv> Update-LapsADSchema
```  

![a image showing the new attributes for Windows LAPS](/.attachments/image-01ba90e2-bd16-4fc6-be61-70952717197a.png)


### 3. Granting permission to update passwords

Similarly to the legacy LAPS, the client needs permission to update its own password. To grant these permissions on the clients Organizational Unit (OU), run the cmdlet:

```
Set-LapsADComputerSelfPermission -Identity "OU name or OU distinguishedName"
```  
  
![a image showing the output of the command above](/.attachments/image-543d5fcd-4fde-4d78-b0cb-c1144d3d0129.png)

The outcome of running the command:

![a image of ldp showing the added permission](/.attachments/image-4ddf4030-9782-4a1f-851e-8a401ec32f71.png)


**Note**

The LAPS attributes are set as confidential attributes, so you may want to check if there are other users or groups that were granted extended rights permissions to read confidential attributes on the OUs in question as this can be considered a security breach. The command below shows that no one aside from the default Access Control Entries (ACEs) was added:

```
PS C:\Users\sagiv> Find-LapsADExtendedRights -Identity LAPSOU

ObjectDN                                                       ExtendedRightHolders
--------                                                            --------------------
OU=LAPSOU,DC=CONTOSO,DC=COM           {NT AUTHORITY\SYSTEM, CONTOSO\Domain Admins}
```

### 4. Group Policy

To view and manage the new settings, the new .admx/.adml files should be copied to the SYSVOL policy definition folder. These files can be found on any new native Windows 11 client or Windows Server 2022 in the default folder `c:\windows\policy definition`. 

Run the following commands to copy the new template to the Domain Controllers (DC) SYSVOL folder:

```
copy \\lapsclient1\c$\Windows\PolicyDefinitions\laps.admx C:\Windows\SYSVOL\domain\Policies\PolicyDefinitions\
copy \\lapsclient1\c$\Windows\PolicyDefinitions\en-us\laps.adml C:\Windows\SYSVOL\domain\Policies\PolicyDefinitions\en-us
```

The new LAPS settings can be found under _Computer configuration > Administrative templates > System > LAPS:

![a image of the new LAPS settings](/.attachments/image-e6b8dc9c-95fd-4bfa-8459-de092472bc36.png)


#### A) Configure password backup directory

Since we are dealing with an on-premises scenario, you should choose "Active Directory" as the backup directory:    


![a image shoing the settings of the "Configure password backup directory" setting](/.attachments/image-b268c77a-2eec-4f3e-9e81-d5bd1b645cb7.png)  
#### B) Enable password encryption  

If for some reason you do not want the password to be encrypted when backed up to AD, the setting needs to be "Disabled"; otherwise, it will be enabled by default:  

![a image shoing the settings of the "Enable password encryption" setting](/.attachments/image-48f7dd34-215a-488f-b214-6cb038b14b67.png)  

Once the native client reads the new settings, a new password is set and backed up to the new LAPS attribute.

#### C) Name of administrator account to manage

Do not enable this policy if the goal is to manage the well-known Administrator user account. The password of the built-in renamed admin is managed while the policy setting is not configured:  

![a image demonstrating the statement above by various sources](/.attachments/image-6c355a30-e0ed-4739-9f99-02dee69368e0.png)  

Enable and set this policy only if the goal is to manage the password of a local user other than the 'S-1-5-%-500' users Security Identifier (SID). For example, managing a different local user:  

![a image demonstrating the statement above by various sources](/.attachments/image-189a96f1-1f23-4985-b4ac-ac6162294c24.png)  


#### D) Configure size of the encrypted password history

Enabling this setting allows you to store up to 12 encrypted passwords of the local Administrator.

**Notes**:
- The historic password will be stored in AD (within the msLAPS-EncryptedPasswordHistory attribute) only if the password is set to be encrypted.
- The limit of 12 encrypted passwords is to avoid unnecessary AD database bloat. Each encrypted password's blob weighs about 1300 bytes, so the current password and the 12 historic passwords (13 passwords) will increase the size of the Directory Information Tree (DIT) by approximately 17KB (13*1300 bytes) per computer object.
- Use the cmdlet followed by `-AsPlainText -IncludeHistory` to view all historic passwords:  

![a image demonstrating the statements above by various sources](/.attachments/image-5cde21db-6758-422e-bb2c-c6e312792a49.png)  

#### E) Configure authorized password decryptors

By default, only Domain Admins group members can decrypt the encrypted password. Allowing non-domain admins to view the encrypted password is possible by enabling this policy and specifying a SID of a user/group or the user/group name in the format DomainName\UserName (such as contoso\LAPSAuthorized):  

![a image demonstrating the statement above by various sources](/.attachments/image-f9fce30f-4898-45ec-8969-40763783e7ff.png)  


#### F) Password settings

Similarly to Legacy LAPS, enabling this policy allows you to configure different password parameters than the default. The default parameters are:
- Password complexity: Large letters, small letters, numbers, and special characters
- Password length: 14 characters
- Password age: 30 days

#### G) Post-authentication actions

Enabling this policy allows you to control which action to perform in case of logon using the local administrator:  

![a image shoing the mentioned above setting window](/.attachments/image-cd94131e-1db2-4ed2-8156-1eb8a20dae4c.png)  

Using the above policy setting, the local administrator will be logged off and a new password will be rotated an hour after the administrators logon.  

**Note**: Prior to the action (logoff/restart), the following message pops up on the Administrator session:  

![a image showing the pop up for the managed account once the post action has reached](/.attachments/image-33912606-3157-49b6-af7d-665770f5cde1.png)  

#### H) Do not allow password expiration time longer than required

If this setting is enabled or not configured, planned password expiration longer than the password age dictated by the "Password Settings" policy is not allowed.
