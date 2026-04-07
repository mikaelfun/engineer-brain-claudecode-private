---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Password - Active Directory/Windows LAPS Events"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Password%20-%20Active%20Directory/Windows%20LAPS%20Events"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/781102&Instance=781102&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/781102&Instance=781102&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a detailed workflow of transitioning from no Local Administrator Password Solution (LAPS) configured to Legacy LAPS and then to Windows LAPS in a test environment. It includes various scenarios, event logs, and methods to view passwords.

[[_TOC_]]  

**Please note**: The events shown below are from a test environment and do not contain any customer data.

In the workflow below, we demonstrate the events of transitioning from no LAPS configured to Legacy LAPS and then to Windows LAPS. The client machine is joined to a domain, and the schema on domain controllers has been updated to Legacy LAPS.

# Scenario 1: No LAPS Configured

In our test environment, Contoso.com has installed Legacy LAPS Configuration Service Providers (CSPs) on a Windows 11 client machine. There is no LAPS Group Policy Object (GPO) or LAPS configuration in the environment.

## Events on the LAPS Channel
Event Viewer | Application and Services | Microsoft | Windows | LAPS | Operational

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/9/2022 1:48:35 AM
Event ID:      10003
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremClient.contoso.com
Description:
LAPS policy processing is now starting.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/9/2022 1:48:35 AM
Event ID:      10024
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremClient.contoso.com
Description:
LAPS policy is configured as disabled.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/9/2022 1:48:35 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremClient.contoso.com
Description:
LAPS policy processing succeeded.
```

# Scenario 2: Configured GPO for LAPS

We have a GPO configured for the Organizational Unit (OU) where the machine resides. The GPO configuration is as follows:
1. **Account Name**: raviks (Local account whose passwords are managed)
2. **Password Policy**: 30 days expiration

## Events on the LAPS Channel
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/9/2022 2:36:49 AM
Event ID:      10003
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremClient.contoso.com
Description:
LAPS policy processing is now starting.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/9/2022 2:36:49 AM
Event ID:      10023
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremClient.contoso.com
Description:
The current LAPS policy is configured as follows:
 
 Policy source: LegacyLaps
 Backup directory: Active Directory
 Local administrator account name: raviks
 Password age in days: 2
 Password complexity: 4
 Password length: 14
 Password expiration protection enabled: 0
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/9/2022 2:36:49 AM
Event ID:      10033
Task Category: None
Level:         Warning
Keywords:      
User:          SYSTEM
Computer:      OnPremClient.contoso.com
Description:
The machine is configured with legacy LAPS policy settings but a legacy LAPS product appears to be installed. The configured account's password will not be managed by Windows until the legacy product is uninstalled. Alternatively, you may consider configuring the newer LAPS policy settings.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/9/2022 2:36:49 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremClient.contoso.com
Description:
LAPS policy processing succeeded.
```

## Viewing the Password: Four Methods

**Method 1**: Active Directory Users and Computers, ADSIEdit, or LDP.exe

![a picture showing attribute editor and the related attributes](/.attachments/image-f3b987a4-7386-4425-b36d-075684858f59.png =300x200)


**Method 2**: Use LDIFDE.exe to dump the properties of the machine
```
ldifde -f ClientAttributes.txt -d "CN=ONPREMSERVER,OU=ManagedMachines,DC=contoso,DC=com" -p subtree -L *
```  

![a image showing LDP output example](/.attachments/image-789939aa-e5e7-4b83-826a-26cf65189b90.png)


**Method 3**: LAPS Admin Tool
When you install Legacy LAPS, you can choose to install the LAPS Admin Tool to view the attributes.  

![a image showing LAPS UI](/.attachments/image-62cf034d-7314-48ae-b6ac-ff9c2861c57a.png =300x200)

**Method4:** PowerShell Method. 

![a image showing powershell output example of the get-admpwdpassword command](/.attachments/image-266ed9c4-7a3a-4b0d-8369-51b616c1dfd2.png)

# Scenario 3: Extended Schema to Windows LAPS

The schema is extended to introduce Windows LAPS and configured via GPO, which applies to the OU where the machine is located.

## Events on the LAPS Channel
Event Viewer | Application and Services | Microsoft | Windows | LAPS | Operational

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10003
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS policy processing is now starting.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10021
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
The current LAPS policy is configured as follows:
 
 Policy source: GPO
 Backup directory: Active Directory
 Local administrator account name: raviks
 Password age in days: 30
 Password complexity: 4
 Password length: 14
 Password expiration protection enabled: 1
 Password encryption enabled: 1
 Password encryption target principal: 
 Password encrypted history size: 0
 Backup DSRM password on domain controllers: 0
 Post authentication grace period (hours): 24
 Post authentication actions: 0x3
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10009
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is configured to backup passwords to Active Directory.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10054
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is processing the current policy in response to a Group Policy change notification.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10055
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is using the following domain controller:
 
 DCName: ContosoDC1.contoso.com
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10015
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
The managed account password needs to be updated due to one or more reasons (0x1A06):
 
 The computer account does not have a password expiration attribute
The policy authority has changed
The policy is configured for password encryption but the encrypted password attribute was not found
The policy was changed to specify a different password encryption target
Local state is missing and/or inconsistent with directory state
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10018
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS successfully updated Active Directory with the new password.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10020
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS successfully updated the local admin account with the new password.
 
 Account name: raviks
 Account RID: 0x3E8
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:06:29 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS policy processing succeeded.
```

# Scenario 4: Background Processing of Windows LAPS

Windows LAPS is configured on a machine and has successfully updated the password to Active Directory. At an interval of one hour, the Windows LAPS engine runs a background sync to verify if the password needs to be updated based on the user's password expiry.

## Events on the LAPS Channel
Event Viewer | Application and Services | Microsoft | Windows | LAPS | Operational

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:07:14 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS policy processing succeeded.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:51:51 AM
Event ID:      10003
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS policy processing is now starting.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:51:51 AM
Event ID:      10021
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
The current LAPS policy is configured as follows:
 
 Policy source: GPO
 Backup directory: Active Directory
 Local administrator account name: raviks
 Password age in days: 30
 Password complexity: 4
 Password length: 14
 Password expiration protection enabled: 1
 Password encryption enabled: 1
 Password encryption target principal: 
 Password encrypted history size: 0
 Backup DSRM password on domain controllers: 0
 Post authentication grace period (hours): 24
 Post authentication actions: 0x3
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:51:51 AM
Event ID:      10009
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is configured to backup passwords to Active Directory.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:51:51 AM
Event ID:      10052
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is processing the current policy per normal background scheduling.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:51:51 AM
Event ID:      10055
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is using the following domain controller:
 
 DCName: ContosoDC1.contoso.com
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:51:51 AM
Event ID:      10016
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
The managed account password does not need to be updated at this time.
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 3:51:51 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS policy processing succeeded.
```

# Scenario 5: Configured GPO to Log-Off the Machine After 1 Hour Grace if a Managed Account Sign-In is Detected

The goal of this setting is to detect a login of a managed user and then perform actions based on the configured settings.

**Consider a Scenario:**

A helpdesk user wants to sign in to a machine (OnPremPC.contoso.com) as a managed user (raviks). They get the Windows LAPS password from the Active Directory machine account in the LAPS tab on the machine (OnPremPC.contoso.com). The helpdesk user then signs in to the machine as the local managed user (raviks) and enters the password retrieved from Active Directory.

Now, the helpdesk user knows the local admin password and probably has written down the password on a piece of paper. So the password is exposed to the helpdesk admin. The helpdesk admin performs their administrative operations on the machine and then signs off the machine, still knowing the password of the local admin user (raviks) on the OnPremPC.contoso.com.

Windows LAPS comes up with this new GPO which detects the sign-in of the local user (raviks) and then, reviewing the configuration, performs either of the activities:
1. Reset the password and log off the managed user.
2. Reset the password and reboot the machine.
3. Reset the password.
4. Disabled - take no actions.

**A Group Policy is configured below:**

Computer Configuration | Administrative Templates | System | LAPS

**Setting Name**: Post-authentication actions

**Setting**: Enabled

**Grace period (hours)**: 1 hour

**Actions**: Reset the password and log off the managed account

## Events on the LAPS Channel
Event Viewer | Application and Services | Microsoft | Windows | LAPS | Operational

![a image showing post authentication settings](/.attachments/image-1cbf717b-ef7c-4048-a4e0-936d3c376a82.png =500x400)


When the user (raviks) signed into the machine, Windows LAPS detected that the managed user had signed in and scheduled a background task to log off the user after one hour.


```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 5:42:33 AM
Event ID:      10041
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS detected a successful authentication for the currently managed account. A background task has been scheduled to execute the configured post-authentication actions after the configured grace period has expired.
 
 Account name: raviks
 Account RID: 0x3E8
 Password reset timer deadline: 2022-12-23T14:42:33.133351100Z
```
```
[1] 036C.0A5C::12/23/22-05:41:01.8224613 [LAPS] operations_cxx82 LapsBackgroundOperation::DoWork() - _pLapsCore->DoCoreProcessing returned _hrResult:0x0
[2] 036C.0A5C::12/23/22-05:42:33.1457801 [LAPS] lapsext_cxx110 LAPSExtNotifyLocalAccountAuthentication() - Starting
[2] 036C.0A5C::12/23/22-05:42:33.1457813 [LAPS] lapscore_cxx3151 LapsCore::NotifyLocalAccountAuthentication() - Starting - AccountRid:0x3e8(1000) StatisticsToApply:0x3000000 BadPasswordCount:0x0 LogonCount:0x0 LastLogon:0x0 LastLogoff:0x0 Workstation:97308-5dab-4dca-abe9-713009fb17af AuthDc:NULL
[3] 036C.0A5C::12/23/22-05:42:33.1470553 [LAPS] registrystate_cxx1594 RegistryState::CheckIfLegacyLapsInstalled() - Got file-not-found on legacy LAPS CSE regkey: Software\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}
[3] 036C.0A5C::12/23/22-05:42:33.1470703 [LAPS] localadminaccount_cxx405 LocalAdminAccount::StaticCreate() - Starting
[3] 036C.0A5C::12/23/22-05:42:33.1470706 [LAPS] localadminaccount_cxx422 LocalAdminAccount::StaticCreate() - Account name specified - searching by name
[3] 036C.0A5C::12/23/22-05:42:33.1470711 [LAPS] localadminaccount_cxx938 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Starting
[3] 036C.0A5C::12/23/22-05:42:33.1470931 [LAPS] localadminaccount_cxx998 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Looking up caller-specified account name pszAccountName:raviks
[3] 036C.0A5C::12/23/22-05:42:33.1470934 [LAPS] localadminaccount_cxx663 LocalAdminAccount::StaticLookupAccountInDomain() - Starting pszAccountName:raviks
[3] 036C.0A5C::12/23/22-05:42:33.1471705 [LAPS] localadminaccount_cxx1016 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Found account name in local acct domain pszAccountName:raviks dwAccountRidLocal:0x3e8
[3] 036C.0A5C::12/23/22-05:42:33.1472022 [LAPS] lapscore_cxx5417 LapsCore::ScheduleInitialPostAuthResetOperation() - Starting
[3] 036C.0A5C::12/23/22-05:42:33.1472046 [LAPS] lapscore_cxx7498 TraceTimestamp() - ullAuthenticationTimeUTC: Local: 12/23/2022-05:42:33.133 (UTC: 12/23/2022-13:42:33.133)
[3] 036C.0A5C::12/23/22-05:42:33.1472056 [LAPS] lapscore_cxx7498 TraceTimestamp() - ullPostAuthResetDelayDeadlineUTC: Local: 12/23/2022-06:42:33.133 (UTC: 12/23/2022-14:42:33.133)
[2] 036C.0A5C::12/23/22-05:42:33.1475138 [LAPS] lapscore_cxx5588 LapsCore::ScheduleInitialPostAuthResetOperation() - Exiting hr:0x0
[2] 036C.0A5C::12/23/22-05:42:33.1475184 [LAPS] lapsext_cxx118 LAPSExtNotifyLocalAccountAuthentication() - Returning fResult:0x1
```
```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10042
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
The post-authentication grace period has expired per policy. The configured post-authentication actions will now be executed.
 
 Account name: raviks
 Account RID: 0x3E8
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10003
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS policy processing is now starting.

```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10021
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
The current LAPS policy is configured as follows:
 
 Policy source: GPO
 Backup directory: Active Directory
 Local administrator account name: raviks
 Password age in days: 30
 Password complexity: 4
 Password length: 14
 Password expiration protection enabled: 1
 Password encryption enabled: 1
 Password encryption target principal: 
 Password encrypted history size: 0
 Backup DSRM password on domain controllers: 0
 Post authentication grace period (hours): 1
 Post authentication actions: 0x3

```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10009
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is configured to backup passwords to Active Directory.
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10051
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is updating the managed account password in response to a post-authentication action.
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10055
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS is using the following domain controller:
 
 DCName: ContosoDC1.contoso.com
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10018
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS successfully updated Active Directory with the new password.
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10020
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS successfully updated the local admin account with the new password.
 
 Account name: raviks
 Account RID: 0x3E8
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/23/2022 6:42:33 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremPC.contoso.com
Description:
LAPS policy processing succeeded.
```
```
[3] 036C.1528::12/23/22-06:42:33.1363891 [LAPS] lapscore_cxx5080 LapsCore::ProcessPostAuthResetDeadlineCallback() - Starting
[2] 036C.1528::12/23/22-06:42:33.1383757 [LAPS] registrystate_cxx1594 RegistryState::CheckIfLegacyLapsInstalled() - Got file-not-found on legacy LAPS CSE regkey: Software\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}
[2] 036C.1528::12/23/22-06:42:33.1383917 [LAPS] gpoconfig_cxx359 GPOConfig::TraceState() - GPOConfig: _PolicySource:GPO _BackupDirectory:AD _dwPwdAgeDays:30 _dwPwdComplexity:4 _dwPwdLength:14 _pszAdminName:raviks _fPwdExpirationProtectionRequired:TRUE _fADPasswordEncryptionEnabled:TRUE _pszADPasswordEncryptionPrincipal:NULL _dwADEncryptedPasswordHistorySize:0x0 _fADBackupDSRMPassword:FALSE _dwPostAuthResetDelay:1 _dwPostAuthActions:3
[2] 036C.1528::12/23/22-06:42:33.1383929 [LAPS] registrystate_cxx2188 RegistryState::TraceState() - RegistryState: _PolicySource:GPO _pszAdministratorAccountName:raviks _dwLastAccountRidUpdated:1000 _pszLastEncryptionTargetSid:S-1-5-21-540026570-2103930920-1995450845-512 _ullLastPasswordUpdateTime:0x1d916bea0f51624 _ullAzurePasswordExpiryTime:0x0 _fLegacyADSchemaValidated:0 _fNewADSchemaValidated:1 _AzureDeploymentType:4 _fLegacyLAPSInstalled:0 _fCDJConfiguredForPPE:0 _fDSRMMode:0 _ullPostAuthResetDeadline:0x1d916dcca922b87 _ullPostAuthResetAuthenticationTime:0x1d916d468cdc387 _countSid:S-1-5-21-2726427797-3325568563-816444041-1000 _ulPostAuthResetRetryCount:0 _ulPostAuthActions:0x3 _ulTestHookFlags:0x0
[2] 036C.1528::12/23/22-06:42:33.1383945 [LAPS] localadminaccount_cxx405 LocalAdminAccount::StaticCreate() - Starting
[2] 036C.1528::12/23/22-06:42:33.1383953 [LAPS] localadminaccount_cxx422 LocalAdminAccount::StaticCreate() - Account name specified - searching by name
[2] 036C.1528::12/23/22-06:42:33.1383960 [LAPS] localadminaccount_cxx938 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Starting
[2] 036C.1528::12/23/22-06:42:33.1384263 [LAPS] localadminaccount_cxx998 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Looking up caller-specified account name pszAccountName:raviks
[2] 036C.1528::12/23/22-06:42:33.1384272 [LAPS] localadminaccount_cxx663 LocalAdminAccount::StaticLookupAccountInDomain() - Starting pszAccountName:raviks
[2] 036C.1528::12/23/22-06:42:33.1385370 [LAPS] localadminaccount_cxx1016 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Found account name in local acct domain pszAccountName:raviks dwAccountRidLocal:0x3e8
[2] 036C.1528::12/23/22-06:42:33.1385882 [LAPS] lapscore_cxx4853 LapsCore::ExecutePostAuthResetActions() - Starting
[2] 036C.1528::12/23/22-06:42:33.1385889 [LAPS] postauthactiondata_cxx32 LapsPostAuthActionData::TraceState() - _ullPostAuthResetDeadline:0x1d916dcca922b87 _ullPostAuthResetAuthenticationTime:0x1d916d468cdc387 _pszPostAuthResetAccountSid:S-1-5-21-2726427797-3325568563-816444041-1000 _ulPostAuthResetRetryCount:0 _ulPostAuthActions:0x3
[2] 036C.1528::12/23/22-06:42:33.1385918 [LAPS] lapscore_cxx7498 TraceTimestamp() - _ullPostAuthResetDeadline: Local: 12/23/2022-06:42:33.133 (UTC: 12/23/2022-14:42:33.133)
[2] 036C.1528::12/23/22-06:42:33.1385930 [LAPS] lapscore_cxx7498 TraceTimestamp() - _ullPostAuthResetAuthenticationTime: Local: 12/23/2022-05:42:33.133 (UTC: 12/23/2022-13:42:33.133)
[2] 036C.1528::12/23/22-06:42:33.1385939 [LAPS] lapscore_cxx7498 TraceTimestamp() - ullLastPasswordUpdateTime: Local: 12/23/2022-03:06:38.415 (UTC: 12/23/2022-11:06:38.415)
[2] 036C.1528::12/23/22-06:42:33.1385947 [LAPS] lapscore_cxx7498 TraceTimestamp() - ullAccountAuthTimestamp: Local: 12/23/2022-05:42:33.133 (UTC: 12/23/2022-13:42:33.133)
[2] 036C.1528::12/23/22-06:42:33.1385951 [LAPS] lapscore_cxx4890 LapsCore::ExecutePostAuthResetActions() - Password was not reset in the interim - will try to reset it now
[2] 036C.1528::12/23/22-06:42:33.1385955 [LAPS] lapscore_cxx2370 LapsCore::QueueBackgroundRequest() - LapsCore::QueueBackgroundRequest called
[2] 036C.1528::12/23/22-06:42:33.1386045 [LAPS] requesttracker_cxx706 LapsRequestTracker::AddNewRequest() - Added new request _cRequests:0x5(5) cOperationIdTableElements:0x5(5) cRequestIdTableElements:0x0(0)
[2] 036C.1528::12/23/22-06:42:33.1386050 [LAPS] requesttracker_cxx115 LapsRequestTracker::AddPendingRequest() - Successfully added operation to request tracker operationId:124e6aed-9939-4861-befa-a1533409197f requestId:NULL
[2] 036C.1528::12/23/22-06:42:33.1386235 [LAPS] lapscore_cxx2479 LapsCore::QueueBackgroundRequest() - LapsCore::QueueBackgroundRequest returning hr:0x0
[2] 036C.1528::12/23/22-06:42:33.1386240 [LAPS] lapscore_cxx4924 LapsCore::ExecutePostAuthResetActions() - Waiting for post-auth-reset-initiated forced-pwd-reset to complete
[0] 036C.0B5C::12/23/22-06:42:33.1386575 [LAPS] operations_cxx73 LapsBackgroundOperation::DoWork() - Calling DoCoreProcessing with new activity id _clientActivityId:5a805cbe-6fba-43fa-95df-b7885db46530 activityIdLocal:58f82443-16cc-0002-c624-f858cc16d901
[0] 036C.0B5C::12/23/22-06:42:33.1386633 [LAPS] lapscore_cxx2097 LapsCore::DoCoreProcessing() - Starting requestType:PostAuthPasswordReset
[0] 036C.0B5C::12/23/22-06:42:33.1386661 [LAPS] requesttracker_cxx182 LapsCore::DoCoreProcessing() - Successfully marked operation as Started operationId:124e6aed-9939-4861-befa-a1533409197f requestId:NULL
[0] 036C.0B5C::12/23/22-06:42:33.1400476 [LAPS] registrystate_cxx1594 RegistryState::CheckIfLegacyLapsInstalled() - Got file-not-found on legacy LAPS CSE regkey: Software\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}
[0] 036C.0B5C::12/23/22-06:42:33.1400609 [LAPS] lapscore_cxx2126 LapsCore::DoCoreProcessing() - Machine state: fADJoined:1 fRunningOnDC:0 fAADJoined:0 fWPJoined:0 pszTenantId:NULL pszDeviceId:NULL
[0] 036C.0B5C::12/23/22-06:42:33.1400614 [LAPS] lapscore_cxx2137 LapsCore::DoCoreProcessing() - Tracing GPO config:
[0] 036C.0B5C::12/23/22-06:42:33.1400624 [LAPS] gpoconfig_cxx359 GPOConfig::TraceState() - GPOConfig: _PolicySource:GPO _BackupDirectory:AD _dwPwdAgeDays:30 _dwPwdComplexity:4 _dwPwdLength:14 _pszAdminName:raviks _fPwdExpirationProtectionRequired:TRUE _fADPasswordEncryptionEnabled:TRUE _pszADPasswordEncryptionPrincipal:NULL _dwADEncryptedPasswordHistorySize:0x0 _fADBackupDSRMPassword:FALSE _dwPostAuthResetDelay:1 _dwPostAuthActions:3
[0] 036C.0B5C::12/23/22-06:42:33.1400661 [LAPS] lapscore_cxx2144 LapsCore::DoCoreProcessing() - Tracing registry state:
[0] 036C.0B5C::12/23/22-06:42:33.1400669 [LAPS] registrystate_cxx2188 RegistryState::TraceState() - RegistryState: _PolicySource:GPO _pszAdministratorAccountName:raviks _dwLastAccountRidUpdated:1000 _pszLastEncryptionTargetSid:S-1-5-21-540026570-2103930920-1995450845-512 _ullLastPasswordUpdateTime:0x1d916bea0f51624 _ullAzurePasswordExpiryTime:0x0 _fLegacyADSchemaValidated:0 _fNewADSchemaValidated:1 _AzureDeploymentType:4 _fLegacyLAPSInstalled:0 _fCDJConfiguredForPPE:0 _fDSRMMode:0 _ullPostAuthResetDeadline:0x1d916dcca922b87 _ullPostAuthResetAuthenticationTime:0x1d916d468cdc387 _countSid:S-1-5-21-2726427797-3325568563-816444041-1000 _ulPostAuthResetRetryCount:0 _ulPostAuthActions:0x3 _ulTestHookFlags:0x0
[0] 036C.0B5C::12/23/22-06:42:33.1400681 [LAPS] lapscore_cxx2225 LapsCore::DoCoreProcessing() - Calling DoADCoreProcessing
[0] 036C.0B5C::12/23/22-06:42:33.1400703 [LAPS] lapscore_cxx5776 LapsCore::ClearPostAuthActionIfNeeded() - Calling LocalAdminAccount::StaticCreate
[0] 036C.0B5C::12/23/22-06:42:33.1400708 [LAPS] localadminaccount_cxx405 LocalAdminAccount::StaticCreate() - Starting
[0] 036C.0B5C::12/23/22-06:42:33.1400711 [LAPS] localadminaccount_cxx422 LocalAdminAccount::StaticCreate() - Account name specified - searching by name
[0] 036C.0B5C::12/23/22-06:42:33.1400714 [LAPS] localadminaccount_cxx938 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Starting
[0] 036C.0B5C::12/23/22-06:42:33.1400889 [LAPS] localadminaccount_cxx998 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Looking up caller-specified account name pszAccountName:raviks
[0] 036C.0B5C::12/23/22-06:42:33.1400893 [LAPS] localadminaccount_cxx663 LocalAdminAccount::StaticLookupAccountInDomain() - Starting pszAccountName:raviks
[0] 036C.0B5C::12/23/22-06:42:33.1401778 [LAPS] localadminaccount_cxx1016 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Found account name in local acct domain pszAccountName:raviks dwAccountRidLocal:0x3e8
[0] 036C.0B5C::12/23/22-06:42:33.1402115 [LAPS] lapscore_cxx5831 LapsCore::ClearPostAuthActionIfNeeded() - Keeping a existing+valid pending postauth operation for this account
[0] 036C.0B5C::12/23/22-06:42:33.1402133 [LAPS] lapscore_cxx1200 LapsCore::DoLDAPBind() - Calling LdapComputer::StaticCreate
[0] 036C.0B5C::12/23/22-06:42:33.1402139 [LAPS] ldapcomputer_cxx4174 LdapComputer::StaticCreate() - Got computer object DN pszComputerDN:NULL
[0] 036C.0B5C::12/23/22-06:42:33.1402143 [LAPS] ldapcomputer_cxx4180 LdapComputer::StaticCreate() - Calling DsrGetDcNameEx2
[0] 036C.0B5C::12/23/22-06:42:33.1404979 [LAPS] ldapcomputer_cxx4206 LdapComputer::StaticCreate() - DsrGetDcNameEx2 succeeded pDCInfo->DomainControllerName:\\ContosoDC1.contoso.com pDCInfo->DomainControllerAddress:\\192.168.2.107 pDCInfo->DomainControllerAddressType:1 pDCInfo->DomainName:contoso.com pDCInfo->DnsForestName:contoso.com pDCInfo->Flags:0xe003f1fd pDCInfo->DcSiteName:Default-First-Site-Name pDCInfo->ClientSiteName:Default-First-Site-Name
[0] 036C.0B5C::12/23/22-06:42:33.1405619 [LAPS] ldapcomputer_cxx1325 LdapComputer::CreateLDAPConnection() - Calling ldap_bind_s
[2] 036C.0B5C::12/23/22-06:42:33.2661258 [LAPS] ldapcomputer_cxx1350 LdapComputer::CreateLDAPConnection() - ldap_bind_s succeeded
[2] 036C.0B5C::12/23/22-06:42:33.2665752 [LAPS] ldapcomputer_cxx3272 LdapComputer::CacheRootDseState() - Got root DSE data defaultNamingContext:'DC=contoso,DC=com' configurationNamingContext:'CN=Configuration,DC=contoso,DC=com' schemaNamingContext:'CN=Schema,CN=Configuration,DC=contoso,DC=com' dnsHostName:'ContosoDC1.contoso.com'
[2] 036C.0B5C::12/23/22-06:42:33.2670181 [LAPS] ldapcomputer_cxx3153 LdapComputer::CacheDomainNCState() - Got domain NC data _dwDomainFunctionalLevel:7
[2] 036C.0B5C::12/23/22-06:42:33.2670243 [LAPS] ldapcomputer_cxx1431 LdapComputer::QueryCurrentComputerDN() - Doing LDAP search for computer object _pszDefaultNamingContext:DC=contoso,DC=com szSearchFilter:(samAccountName=ONPREMPC$)
[2] 036C.0B5C::12/23/22-06:42:33.2783563 [LAPS] ldapcomputer_cxx714 LdapComputer::CopyEncryptedPasswordHistoryAttribute() - Optional attribute not found in result set pszAttributeName:msLaps-EncryptedPasswordHistory
[2] 036C.0B5C::12/23/22-06:42:33.2783584 [LAPS] ldapcomputer_cxx836 LdapComputer::CopyEncryptedPasswordAttribute() - Optional attribute not found in result set pszAttributeName:msLaps-EncryptedDSRMPassword
[2] 036C.0B5C::12/23/22-06:42:33.2783603 [LAPS] ldapcomputer_cxx714 LdapComputer::CopyEncryptedPasswordHistoryAttribute() - Optional attribute not found in result set pszAttributeName:msLaps-EncryptedDSRMPasswordHistory
[2] 036C.0B5C::12/23/22-06:42:33.2783617 [LAPS] ldapcomputer_cxx169 LdapComputer::LoadStateFromAD() - Skipping LoadLegacyStateFromAD because legacy LAPS schema is not present
[2] 036C.0B5C::12/23/22-06:42:33.2783634 [LAPS] ldapcomputer_cxx4038 LdapComputer::TraceState() - LdapComputer state: _PwdExpirationLegacy:0x0 _PwdExpiration:0x1d92e5199599624 _EncryptedPassword present:True _cEncryptedPasswordHistory:0x0 _EncryptedDSRMPassword present:False _cEncryptedDSRMPasswordHistory:0x0 _pszComputerDN:CN=ONPREMPC,OU=NewLaps,DC=contoso,DC=com _pszDC:ContosoDC1.contoso.com _pszDnsHostName:ContosoDC1.contoso.com _dwDomainFunctionalLevel:7
[2] 036C.0B5C::12/23/22-06:42:33.2783642 [LAPS] lapscore_cxx7440 TraceTimestamp() - _PwdExpirationLegacy: Local: 0 (UTC: 0)
[2] 036C.0B5C::12/23/22-06:42:33.2783674 [LAPS] lapscore_cxx7498 TraceTimestamp() - _PwdExpiration: Local: 01/22/2023-03:06:38.415 (UTC: 01/22/2023-11:06:38.415)
[2] 036C.0B5C::12/23/22-06:42:33.2783680 [LAPS] lapscore_cxx1770 LapsCore::DoADCoreProcessing() - Calling LocalAdminAccount::StaticCreate
[2] 036C.0B5C::12/23/22-06:42:33.2783685 [LAPS] localadminaccount_cxx405 LocalAdminAccount::StaticCreate() - Starting
[2] 036C.0B5C::12/23/22-06:42:33.2783689 [LAPS] localadminaccount_cxx422 LocalAdminAccount::StaticCreate() - Account name specified - searching by name
[2] 036C.0B5C::12/23/22-06:42:33.2783692 [LAPS] localadminaccount_cxx938 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Starting
[2] 036C.0B5C::12/23/22-06:42:33.2783954 [LAPS] localadminaccount_cxx998 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Looking up caller-specified account name pszAccountName:raviks
[2] 036C.0B5C::12/23/22-06:42:33.2783957 [LAPS] localadminaccount_cxx663 LocalAdminAccount::StaticLookupAccountInDomain() - Starting pszAccountName:raviks
[2] 036C.0B5C::12/23/22-06:42:33.2784947 [LAPS] localadminaccount_cxx1016 LocalAdminAccount::StaticOpenLocalAccountViaNameorRid() - Found account name in local acct domain pszAccountName:raviks dwAccountRidLocal:0x3e8
[2] 036C.0B5C::12/23/22-06:42:33.2785305 [LAPS] lapscore_cxx1364 LapsCore::CheckADPasswordUpdateFactors() - Starting
[2] 036C.0B5C::12/23/22-06:42:33.2785315 [LAPS] lapscore_cxx7498 TraceTimestamp() - *pullNow: Local: 12/23/2022-06:42:33.174 (UTC: 12/23/2022-14:42:33.174)
[2] 036C.0B5C::12/23/22-06:42:33.2785321 [LAPS] lapscore_cxx1382 LapsCore::CheckADPasswordUpdateFactors() - dwLastAccountRidUpdated:0x3e8(1000) dwLocalAdminAccountRid:0x3e8(1000)
[2] 036C.0B5C::12/23/22-06:42:33.2785325 [LAPS] lapscore_cxx1424 LapsCore::CheckADPasswordUpdateFactors() - dwLastAccountRidUpdated and dwLocalAdminAccountRid are the same - dwLastAccountRidUpdated:0x3e8(1000) dwLocalAdminAccountRid:0x3e8(1000)
[2] 036C.0B5C::12/23/22-06:42:33.2785332 [LAPS] lapscore_cxx1451 LapsCore::CheckADPasswordUpdateFactors() - Managed account name is the same - no update required pszAccount:raviks pRegistryState->AdministratorAccountName():raviks
[2] 036C.0B5C::12/23/22-06:42:33.2785338 [LAPS] lapscore_cxx1478 LapsCore::CheckADPasswordUpdateFactors() - PolicySource same as before - no update needed; currentLapsPolicySource:2(GPO) lastLapsPolicySource:2(GPO)
[2] 036C.0B5C::12/23/22-06:42:33.2785347 [LAPS] lapscore_cxx1507 LapsCore::CheckADPasswordUpdateFactors() - Current DSRM mode same as before
[2] 036C.0B5C::12/23/22-06:42:33.2785354 [LAPS] lapscore_cxx7498 TraceTimestamp() - ullLdapPwdExpirationTimestamp: Local: 01/22/2023-03:06:38.415 (UTC: 01/22/2023-11:06:38.415)
[2] 036C.0B5C::12/23/22-06:42:33.2785359 [LAPS] lapscore_cxx1546 LapsCore::CheckADPasswordUpdateFactors() - Current password is still good (not yet expired)
[2] 036C.0B5C::12/23/22-06:42:33.2785363 [LAPS] lapscore_cxx1577 LapsCore::CheckADPasswordUpdateFactors() - No need to update password due to PwdExpirationProtectionEnabled policy lDaysToChange:0x1e(30) PasswordAgeDays:0x1e(30)
[2] 036C.0B5C::12/23/22-06:42:33.2787508 [LAPS] ldapcomputer_cxx1696 LdapComputer::BuildAndValidatePolicyEncryptionTarget() - Encryption target principal not specified in policy - defaulted to DomainAdmins
[2] 036C.0B5C::12/23/22-06:42:33.2787536 [LAPS] ldapcomputer_cxx1791 LdapComputer::BuildAndValidatePolicyEncryptionTarget() - Encryption principal sid:S-1-5-21-540026570-2103930920-1995450845-512
[2] 036C.0B5C::12/23/22-06:42:33.2787548 [LAPS] lapscore_cxx1659 LapsCore::CheckADPasswordUpdateFactors() - Encryption targets are the same - no update required pszEncryptionTargetSid:S-1-5-21-540026570-2103930920-1995450845-512 pszLastEncryptionTargetSid:S-1-5-21-540026570-2103930920-1995450845-512
[2] 036C.0B5C::12/23/22-06:42:33.2787553 [LAPS] lapscore_cxx1677 LapsCore::CheckADPasswordUpdateFactors() - Returning *pulPasswordUpdateFactors:0x0
[2] 036C.0B5C::12/23/22-06:42:33.2787557 [LAPS] lapscore_cxx1838 LapsCore::DoADCoreProcessing() - CheckADPasswordUpdateFactors returned ulPasswordUpdateFactors:0x0
[2] 036C.0B5C::12/23/22-06:42:33.2787560 [LAPS] lapscore_cxx1846 LapsCore::DoADCoreProcessing() - Forcing password reset due to admin request ulPasswordUpdateFactors:0x0
[2] 036C.0B5C::12/23/22-06:42:33.2787562 [LAPS] lapscore_cxx1887 LapsCore::DoADCoreProcessing() - fPasswordUpdateRequired is TRUE - starting password update process
[2] 036C.0B5C::12/23/22-06:42:33.2787565 [LAPS] lapscore_cxx1894 LapsCore::DoADCoreProcessing() - LocalAdminAccount::CreateNewValidatedPassword
[0] 036C.0B5C::12/23/22-06:42:33.2801607 [LAPS] lapscore_cxx1913 LapsCore::DoADCoreProcessing() - Calling pLdapComputer->UpdateNewPassword
[0] 036C.0B5C::12/23/22-06:42:33.2801617 [LAPS] ldapcomputer_cxx3036 LdapComputer::UpdateNewPassword() - Updating AD state using modern LAPS policies
[0] 036C.0B5C::12/23/22-06:42:33.2802779 [LAPS] ldapcomputer_cxx1696 LdapComputer::BuildAndValidatePolicyEncryptionTarget() - Encryption target principal not specified in policy - defaulted to DomainAdmins
[0] 036C.0B5C::12/23/22-06:42:33.2802809 [LAPS] ldapcomputer_cxx1791 LdapComputer::BuildAndValidatePolicyEncryptionTarget() - Encryption principal sid:S-1-5-21-540026570-2103930920-1995450845-512
[2] 036C.0B5C::12/23/22-06:42:33.2828752 [LAPS] ncrypthelpers_cxx359 EncryptBufferNCrypt() - Starting cbData:0x74
[0] 036C.0B5C::12/23/22-06:42:33.2990624 [LAPS] ncrypthelpers_cxx240 EncryptOrDecrypt() - NCryptStreamOpenToProtect succeeded
[0] 036C.0B5C::12/23/22-06:42:33.2990688 [LAPS] ncrypthelpers_cxx312 EncryptOrDecrypt() - NCryptStreamUpdate succeeded
[0] 036C.0B5C::12/23/22-06:42:33.2990722 [LAPS] ncrypthelpers_cxx384 EncryptBufferNCrypt() - Succeeded - *pcbEncryptedData:0x4d5
[0] 036C.0B5C::12/23/22-06:42:33.2990800 [LAPS] ldapcomputer_cxx2886 LdapComputer::UpdateNewPasswordHelper() - Calling ldap_modify_ext_sW with new password and expiry timestamp
[2] 036C.0B5C::12/23/22-06:42:33.3072644 [LAPS] ldapcomputer_cxx2907 LdapComputer::UpdateNewPasswordHelper() - ldap_modify_ext_sW succeeded
[2] 036C.0B5C::12/23/22-06:42:33.3072709 [LAPS] lapscore_cxx1969 LapsCore::DoADCoreProcessing() - Calling ResetLocalAdminAccountPassword
[2] 036C.0B5C::12/23/22-06:42:33.3072717 [LAPS] lapscore_cxx2836 LapsCore::ResetLocalAdminAccountPassword() - Starting - setting _dwPasswordModThreadId from 0x0 to 0xb5c
[2] 036C.0B5C::12/23/22-06:42:33.3072728 [LAPS] localadminaccount_cxx56 LapsCore::ResetLocalAdminAccountPassword() - Calling SamISetPasswordForeignUser2 to set new password _pszFullyQualifiedAccountName:ONPREMPC\raviks
[2] 036C.0B5C::12/23/22-06:42:33.3074228 [LAPS] lapsext_cxx155 LAPSExtAcceptPasswordModification() - Starting
[2] 036C.0B5C::12/23/22-06:42:33.3074233 [LAPS] lapscore_cxx3360 LapsCore::AcceptPasswordModification() - AcceptPasswordModification for account AccountName:raviks AccountRid:0x3e8(1000)
[2] 036C.0B5C::12/23/22-06:42:33.3074250 [LAPS] gpoconfig_cxx359 GPOConfig::TraceState() - GPOConfig: _PolicySource:GPO _BackupDirectory:AD _dwPwdAgeDays:30 _dwPwdComplexity:4 _dwPwdLength:14 _pszAdminName:raviks _fPwdExpirationProtectionRequired:TRUE _fADPasswordEncryptionEnabled:TRUE _pszADPasswordEncryptionPrincipal:NULL _dwADEncryptedPasswordHistorySize:0x0 _fADBackupDSRMPassword:FALSE _dwPostAuthResetDelay:1 _dwPostAuthActions:3
[2] 036C.0B5C::12/23/22-06:42:33.3075077 [LAPS] registrystate_cxx1594 RegistryState::CheckIfLegacyLapsInstalled() - Got file-not-found on legacy LAPS CSE regkey: Software\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}
[2] 036C.0B5C::12/23/22-06:42:33.3075183 [LAPS] lapscore_cxx3450 LapsCore::AcceptPasswordModification() - Allowing (own) password update of managed account currentThreadId:0xb5c AccountRid:0x3e8(1000)
[2] 036C.0B5C::12/23/22-06:42:33.3075200 [LAPS] lapsext_cxx163 LAPSExtAcceptPasswordModification() - Returning fResult:0x1
[2] 036C.0B5C::12/23/22-06:42:33.3498090 [LAPS] localadminaccount_cxx79 LapsCore::ResetLocalAdminAccountPassword() - SamISetPasswordForeignUser2 succeeded
[2] 036C.0B5C::12/23/22-06:42:33.3498099 [LAPS] lapscore_cxx2861 LapsCore::ResetLocalAdminAccountPassword() - Returning hr:0x0
[2] 036C.0B5C::12/23/22-06:42:33.3501391 [LAPS] lapscore_cxx3002 LapsCore::UpdateRegistryStateOnSuccessfulADUpdate() - Updated all registry state after successful AD password update
[2] 036C.0B5C::12/23/22-06:42:33.3504078 [LAPS] lapscore_cxx2030 LapsCore::DoADCoreProcessing() - Returning hr:0x0
[2] 036C.0B5C::12/23/22-06:42:33.3504087 [LAPS] lapscore_cxx2233 LapsCore::DoCoreProcessing() - DoADCoreProcessing returned hr:0x0
[2] 036C.0B5C::12/23/22-06:42:33.3504106 [LAPS] requesttracker_cxx265 LapsCore::DoCoreProcessing() - Successfully marked operation as Completed operationId:124e6aed-9939-4861-befa-a1533409197f requestId:NULL hrOutcome:0x0
[2] 036C.0B5C::12/23/22-06:42:33.3504172 [LAPS] operations_cxx82 LapsBackgroundOperation::DoWork() - _pLapsCore->DoCoreProcessing returned _hrResult:0x0
[0] 036C.1528::12/23/22-06:42:33.3504616 [LAPS] lapscore_cxx4940 LapsCore::ExecutePostAuthResetActions() - Post-auth-reset-initiated forced-pwd-reset succeeded
[0] 036C.1528::12/23/22-06:42:33.3504691 [LAPS] lapscore_cxx4497 LapsCore::TerminateInteractiveLogonSessions() - TerminateWinstations called for ONPREMPC\raviks
[0] 036C.1528::12/23/22-06:42:33.3506307 [LAPS] lapscore_cxx4531 LapsCore::TerminateInteractiveLogonSessions() - Calling WinStationGetAllUserSessions
[3] 036C.1528::12/23/22-06:42:33.3514751 [LAPS] lapscore_cxx4551 LapsCore::TerminateInteractiveLogonSessions() - WTSEnumerateSessionsExW succeeded cSessionInfos:0x3(3)
[3] 036C.1528::12/23/22-06:42:33.3516959 [LAPS] lapscore_cxx4624 LapsCore::TerminateInteractiveLogonSessions() - Skipping non-interesting session with user <null>\<null> SessionId:0x0
[3] 036C.1528::12/23/22-06:42:33.3518757 [LAPS] lapscore_cxx4633 LapsCore::TerminateInteractiveLogonSessions() - Found a session to terminate SessionId:0x1
[1] 036C.1528::12/23/22-06:42:33.3542979 [LAPS] lapscore_cxx4624 LapsCore::TerminateInteractiveLogonSessions() - Skipping non-interesting session with user <null>\<null> SessionId:0x3
[1] 036C.1528::12/23/22-06:42:33.3542988 [LAPS] lapscore_cxx4643 LapsCore::TerminateInteractiveLogonSessions() - Found 1 winstations that require termination
[1] 036C.1528::12/23/22-06:42:33.3542993 [LAPS] lapscore_cxx4659 LapsCore::TerminateInteractiveLogonSessions() - Calling WinStationSendMessageW to notify user SessionId:0x1
[1] 036C.1528::12/23/22-06:42:33.3545964 [LAPS] lapscore_cxx4685 LapsCore::TerminateInteractiveLogonSessions() - WinStationSendMessageW(The amount of time configured for your use of the LAPS account credentials has expired and you will be logged off in one minute. Please save your work immediately and contact your administrator to obtain updated credentials as needed.) succeeded for SessionId:0x1
[1] 036C.1528::12/23/22-06:42:33.3545973 [LAPS] lapscore_cxx4693 LapsCore::TerminateInteractiveLogonSessions() - Sleeping briefly
[2] 036C.1528::12/23/22-06:42:43.3693275 [LAPS] lapscore_cxx4699 LapsCore::TerminateInteractiveLogonSessions() - Back from sleeping
[2] 036C.1528::12/23/22-06:42:43.3693296 [LAPS] lapscore_cxx4706 LapsCore::TerminateInteractiveLogonSessions() - Calling WTSLogoffSession for SessionId:0x1
[2] 036C.1528::12/23/22-06:42:43.3708280 [LAPS] lapscore_cxx4724 LapsCore::TerminateInteractiveLogonSessions() - WTSLogoffSession succeeded for SessionId:0x1
```
# Need additional help or have feedback?

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |