---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Windows LAPS - LAPSv2/Windows LAPS - Storing Password - Active Directory/Configure LAPS for OnPrem Active Directory"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20LAPS/Windows%20LAPS%20-%20LAPSv2/Windows%20LAPS%20-%20Storing%20Password%20-%20Active%20Directory/Configure%20LAPS%20for%20OnPrem%20Active%20Directory"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/789485&Instance=789485&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/789485&Instance=789485&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides a step-by-step guide to introducing Windows Local Administrator Password Solution (LAPS) into your environment. Follow these instructions to update the Active Directory schema, configure settings, and manage passwords securely.


[[_TOC_]]

# Steps on introducing Windows LAPS into the environment

## Step 1: Updating the Active Directory schema

- Run this command on a Domain Controller, Member Server, or Client machine with the latest builds.
- The account that will extend the schema with Windows LAPS attributes must be part of the Enterprise Administrators or Schema Admin Group.
- Updating the schema is a per-forest operation.
- Windows LAPS attributes do not update, modify, or delete the old legacy LAPS attributes.  
  PowerShell Command: 
```
Update-LapsADSchema
```

## Step 2: Create a new OU or use an existing OU to grant the managed device permission to update its password

In this example, we will create a new Organizational Unit (OU) named "NewLaps."  
PowerShell Command: 
```
Set-LapsADComputerSelfPermission -Identity NewLaps
```
Output: 
```
Name    DistinguishedName
----    -----------------
NewLAPS OU=NewLAPS,DC=contoso,DC=com
```

## Step 3: Removing extended rights permissions

Some users or groups might already have extended rights permission on the managed device's OU. This permission is problematic because it grants the ability to read confidential attributes (all Windows LAPS password attributes are marked as confidential). To check who is granted these permissions, use the Find-LapsADExtendedRights cmdlet.
PowerShell Command: 
```
Find-LapsADExtendedRights -Identity newlaps
```
Output: 
```
ObjectDN                  ExtendedRightHolders
--------                  --------------------
OU=NewLAPS,DC=contoso,DC=com {NT AUTHORITY\SYSTEM, LAPS\Domain Admins}
```

```
Set-LapsADComputerSelfPermission -Identity NewLaps
```

## Step 4: Configure Windows LAPS settings

There are two methods to configure Windows LAPS:

**Method 1:** Group Policy configured via a GPO applied in Active Directory or Local GPO
**Method 2:** Microsoft Endpoint Manager (Intune) to manage Windows LAPS via CSP

**Method 1:** Group Policy

Windows LAPS includes a new Group Policy Object (GPO) that you can use to administer policy settings on Active Directory domain-joined devices. To access the Windows LAPS Group Policy, in Group Policy Management Editor, go to Computer Configuration > Administrative Templates > System > LAPS.

**Default Configuration:**

By default, encryption is enabled on Windows clients when you configure Windows LAPS.

**More Information on GPO Settings:**
[Learn more about LAPS management policy settings](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-management-policy-settings)  

![a picture of the available settings for LAPS](/.attachments/image-b44b98f6-e78a-498f-b89e-a9cdc764c1c3.png =800x400)

**Let's configure the GPO to the below settings:**

- **Password Settings:**  
![a picture of the password settings](/.attachments/image-b76814e5-6c4a-4e2f-b2fe-ad027d682368.png =500x400)

- **Configure Password Backup Directory:**  
![a picture of the "Configure Password Backup Directory" setting](/.attachments/image-8c1f0d65-d667-46e3-9f4f-29cce42069c6.png =500x400)

- **Name of Administrator Account to manage:**  
![a picture of the "Name of Administrator Account to manage" setting](/.attachments/image-b123a763-4009-418a-9190-957b2c83f5bc.png =500x400) 

## Step 5: Moving the machine to the NewLAPS

After configuring the Windows LAPS settings, move the machine to the NewLAPS OU if you are using a GPO.

## Step 6: Initiate a policy processing cycle

To initiate a policy processing cycle, you can use any of the two methods:

**Method 1:**
PowerShell Command: 
```
Invoke-LapsPolicyProcessing
```

**Method 2:**
```
gpupdate /force
```

## Step 7: View Windows LAPS events in the Event Viewer

Windows LAPS events are by default in the below event channel. This operational log is enabled by default.

Event Viewer | Application and Services | Microsoft | Windows | LAPS | Operational

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/11/2022 9:43:45 AM
Event ID:      10003
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
LAPS policy processing is now starting.
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/11/2022 9:43:45 AM
Event ID:      10021
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
The current LAPS policy is configured as follows:
 
 Policy source: GPO
 Backup directory: Active Directory
 Local administrator account name: raviks
 Password age in days: 2
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
Date:          12/11/2022 9:43:45 AM
Event ID:      10009
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
LAPS is configured to backup passwords to Active Directory.
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/11/2022 9:43:45 AM
Event ID:      10054
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
LAPS is processing the current policy in response to a Group Policy change notification.
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/11/2022 9:43:45 AM
Event ID:      10055
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
LAPS is using the following domain controller:
  DCName: DCA.contoso.com
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/11/2022 9:50:33 AM
Event ID:      10015
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
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
Date:          12/11/2022 9:50:33 AM
Event ID:      10018
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
LAPS successfully updated Active Directory with the new password.
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/11/2022 9:50:33 AM
Event ID:      10020
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
LAPS successfully updated the local admin account with the new password.
 
 Account name: raviks
 Account RID: 0x3E8
```

```
Log Name:      Microsoft-Windows-LAPS-Operational
Source:        Microsoft-Windows-LAPS
Date:          12/11/2022 9:50:33 AM
Event ID:      10004
Task Category: None
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      OnPremServer.contoso.com
Description:
LAPS policy processing succeeded.
```

## Step 8: Retrieve password from Active Directory

There are two methods to retrieve passwords from Active Directory:

**Method 1: PowerShell**

You can view the password attribute below, which would be the password of the local admin named Raviks.

You can also run the command with the -verbose switch to get more information.

Example:
```
Get-LapsADPassword -Identity OnPremServer  -AsPlaintext -verbose
```

```
PS C:\Windows\System32> Get-LapsADPassword -Identity OnPremServer  -AsPlaintext

ComputerName        : ONPREMSERVER
DistinguishedName   : CN=ONPREMSERVER,OU=NewLAPS-Container,DC=contoso,DC=com
Account             : raviks
Password            : uJ#X/[%G2BAC+h
PasswordUpdateTime  : 12/11/2022 10:49:29 AM
ExpirationTimestamp : 12/13/2022 10:49:29 AM
Source              : EncryptedPassword
DecryptionStatus    : Success
AuthorizedDecryptor : CONTOSO\Domain Admins
```

**Method 2: RSAT Tools**

You can log in to a Domain Controller that supports the feature or install RSAT Tools on a supported Member Server or supported Client Machine. Find the machine account in Active Directory. Right-click and choose the LAPS tab.  

![a picture of the LAPS tab showing the copy and show password options](/.attachments/image-e4d8f1b2-0685-4f66-ac10-ced7131f7a46.png =400x400)

## Step 9: Run diagnostics

Diagnostics PowerShell is used to troubleshoot scenarios. You can run the below command to get diagnostic information.

**Note:** This command can be used to troubleshoot issues that are happening at the moment and not an intermittent issue. There is a separate Logman Provider to troubleshoot intermittent issues.

The below command would run the diagnostics during performing a sync cycle with Active Directory.

**Option 1:**
```
Get-LapsDiagnostics
```

The below command would run the diagnostics during performing a sync cycle with Active Directory alongside a network trace.

**Option 2:**
```
Get-LapsDiagnostics -CollectNetworkTrace
```

The below command would run the diagnostics during performing a sync cycle with Active Directory with a network trace and would also reset or rotate the password.

**Option 3:**
```
Get-LapsDiagnostics -ResetPassword -CollectNetworktrace 
```

**Need more help:**
```PowerShell
PS C:\Windows\System32> help Get-LapsDiagnostics
```

**Diagnostics log analysis:**

Review the below log analysis link of a client machine storing information in Active Directory.
[Log Analysis Source: Active Directory](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/774714/Log-Analysis-Source-Active-Directory)


# Need additional help or have feedback?

| **Learn more about the Windows LAPS** | **If you need more help, email DSPOD DL** | **To provide feedback to this workshop** |
|---|---|---|
| **Visit** the [Windows LAPS documentation](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overv) | **Email** DSPOD DL | **Provide feedback** to this workshop |
