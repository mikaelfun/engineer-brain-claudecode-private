---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/User, computer, group, and object management/Workflow: DS Object Mgmt: Tools/DSACLS.exe: Query Permissions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/User%2C%20computer%2C%20group%2C%20and%20object%20management/Workflow%3A%20DS%20Object%20Mgmt%3A%20Tools/DSACLS.exe%3A%20Query%20Permissions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419699&Instance=419699&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/419699&Instance=419699&Feedback=2)

___
<div id='cssfeedback-end'></div>

# Overview

The most common use for using DSACLS.exe is to display the permissions of an object in Active Directory (AD). This is a good tool to query a Domain Controller (DC) for the permissions on any object so you can output it to a text file for review. This tool can also be used to modify permissions if needed as well, however, that is out of the scope of this article.

## Usage

To query permissions with this tool, you can simply specify the Distinguished Name (DN) of the object in AD. You may also specify the server you want to query against. This is helpful for checking the permissions against multiple Domain Controllers to validate they are in sync.

**Query a user "ADFSUser1" in the Contoso.com Domain:**
```
DSACLS.exe CN=ADFSUser1,OU=ADFSUsers,OU=Employees,DC=Contoso,DC=com
```
**Query a user "ADFSUser1" in the Contoso.com Domain against the Contoso-dc01.contoso.com Domain Controller:**
```
DSACLS.exe \\Contoso-DC01.contoso.com:389\CN=ADFSUser1,OU=ADFSUsers,OU=Employees,DC=Contoso,DC=com
```

**Example Output:**

Below is the output from a user named MoveMe1 in the ADMT OU under EMPS OU in the Contoso.com Domain. You can see that there is normally a large number of Access Control Lists (ACLs) on a user account by default. Also note that the Access Control Entries (ACEs) on this object are completely out of order. The normal canonical order is:
- Explicit/non-inherited Deny ACEs
- Explicit/non-inherited Allow ACEs
- Inherited Deny ACEs from parent
- Inherited Allow ACEs from parent
- Inherited Deny ACEs from grandparent
- Inherited Allow ACEs from grandparent

This output was collected using the below command:
```
DSACLS.exe CN=MoveMe1,OU=ADMT,OU=Emps,DC=contoso,DC=com > C:\temp\DSACLS_Output.txt
```

```
Owner: CONTOSO\Domain Admins
Group: CONTOSO\Domain Admins

Access list:
<---------------------------------- Explicit ACEs, first Deny, then Allow:
Allow CONTOSO\Domain Admins           FULL CONTROL
Allow BUILTIN\Account Operators       FULL CONTROL
Allow NT AUTHORITY\Authenticated Users
                                      SPECIAL ACCESS
                                      READ PERMISSIONS
Allow NT AUTHORITY\SELF               SPECIAL ACCESS
                                      READ PERMISSIONS
                                      LIST CONTENTS
                                      READ PROPERTY
                                      LIST OBJECT
Allow NT AUTHORITY\SYSTEM             FULL CONTROL
<---------------------------------- First level inherited ACEs, first Deny, then Allow:
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS   <Inherited from parent>
                                      WRITE PERMISSIONS
                                      DELETE TREE
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS   <Inherited from parent>
                                      DELETE
Allow BUILTIN\Pre-Windows 2000 Compatible Access
                                      SPECIAL ACCESS   <Inherited from parent>
                                      READ PERMISSIONS
                                      LIST CONTENTS
                                      READ PROPERTY
                                      LIST OBJECT
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS   <Inherited from parent>
                                      READ PERMISSIONS
                                      LIST CONTENTS
                                      READ PROPERTY
                                      LIST OBJECT
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS   <Inherited from parent>
                                      READ PERMISSIONS
                                      LIST CONTENTS
                                      READ PROPERTY
                                      LIST OBJECT
Allow CONTOSO\Enterprise Admins       FULL CONTROL   <Inherited from parent>
Allow BUILTIN\Pre-Windows 2000 Compatible Access
                                      SPECIAL ACCESS   <Inherited from parent>
                                      LIST CONTENTS
Allow BUILTIN\Administrators          SPECIAL ACCESS   <Inherited from parent>
                                      DELETE
                                      READ PERMISSIONS
                                      WRITE PERMISSIONS
                                      CHANGE OWNERSHIP
                                      CREATE CHILD
                                      LIST CONTENTS
                                      WRITE SELF
                                      WRITE PROPERTY
                                      READ PROPERTY
                                      LIST OBJECT
                                      CONTROL ACCESS
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchActiveSyncDevices   <Inherited from parent>
                                      CREATE CHILD
                                      DELETE CHILD
                                      LIST CONTENTS
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for inetOrgPerson   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for computer   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for group   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for organizationalUnit   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for user   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for contact   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Organization Management
                                      FULL CONTROL for msExchDynamicDistributionList   <Inherited from parent>
Allow CONTOSO\Exchange Trusted Subsystem
                                      FULL CONTROL for msExchDynamicDistributionList   <Inherited from parent>
Allow CONTOSO\RAS and IAS Servers     SPECIAL ACCESS for Account Restrictions
                                      READ PROPERTY
Allow CONTOSO\RAS and IAS Servers     SPECIAL ACCESS for Logon Information
                                      READ PROPERTY
Allow CONTOSO\RAS and IAS Servers     SPECIAL ACCESS for Group Membership
                                      READ PROPERTY
Allow CONTOSO\RAS and IAS Servers     SPECIAL ACCESS for Remote Access Information
                                      READ PROPERTY
Allow CONTOSO\Cert Publishers         SPECIAL ACCESS for userCertificate
                                      WRITE PROPERTY
                                      READ PROPERTY
Allow BUILTIN\Windows Authorization Access Group
                                      SPECIAL ACCESS for tokenGroupsGlobalAndUniversal
                                      READ PROPERTY
Allow BUILTIN\Terminal Server License Servers
                                      SPECIAL ACCESS for terminalServer
                                      WRITE PROPERTY
                                      READ PROPERTY
Allow BUILTIN\Terminal Server License Servers
                                      SPECIAL ACCESS for Terminal Server License Server
                                      WRITE PROPERTY
                                      READ PROPERTY
Allow NT AUTHORITY\Authenticated Users
                                      SPECIAL ACCESS for General Information
                                      READ PROPERTY
Allow NT AUTHORITY\Authenticated Users
                                      SPECIAL ACCESS for Public Information
                                      READ PROPERTY
Allow NT AUTHORITY\Authenticated Users
                                      SPECIAL ACCESS for Personal Information
                                      READ PROPERTY
Allow NT AUTHORITY\Authenticated Users
                                      SPECIAL ACCESS for Web Information
                                      READ PROPERTY
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for Personal Information
                                      WRITE PROPERTY
                                      READ PROPERTY
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for Phone and Mail Options
                                      WRITE PROPERTY
                                      READ PROPERTY
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for Web Information
                                      WRITE PROPERTY
                                      READ PROPERTY
Allow BUILTIN\Pre-Windows 2000 Compatible Access
                                      SPECIAL ACCESS for Logon Information   <Inherited from parent>
                                      READ PROPERTY
Allow BUILTIN\Pre-Windows 2000 Compatible Access
                                      SPECIAL ACCESS for Group Membership   <Inherited from parent>
                                      READ PROPERTY
Allow BUILTIN\Pre-Windows 2000 Compatible Access
                                      SPECIAL ACCESS for General Information   <Inherited from parent>
                                      READ PROPERTY
Allow BUILTIN\Pre-Windows 2000 Compatible Access
                                      SPECIAL ACCESS for Remote Access Information   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Delegated Setup         SPECIAL ACCESS for Account Restrictions   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for canonicalName   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for userAccountControl   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for Exchange Information   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for memberOf   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for proxyAddresses   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for proxyAddresses   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for pwdLastSet   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for showInAddressBook   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for showInAddressBook   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for adminDisplayName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for adminDisplayName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for groupType   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for managedBy   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchMailboxSecurityDescriptor   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMServerWritableFlags   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for thumbnailPhoto   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for displayName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for displayName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for Public Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUserCulture   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for displayNamePrintable   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for displayNamePrintable   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for mail   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for mail   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for userAccountControl   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for countryCode   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchMobileMailboxFlags   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchSafeRecipientsHash   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for wWWHomePage   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for userCertificate   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMDtmfMap   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchBlockedSendersHash   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for Personal Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for textEncodedORAddress   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for textEncodedORAddress   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for publicDelegates   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for publicDelegates   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for publicDelegates   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMSpokenName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMPinChecksum   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for legacyExchangeDN   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for legacyExchangeDN   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for sAMAccountName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchSafeSendersHash   <Inherited from parent>
                                      WRITE PROPERTY
Allow NT AUTHORITY\ENTERPRISE DOMAIN CONTROLLERS
                                      SPECIAL ACCESS for tokenGroups   <Inherited from parent>
                                      READ PROPERTY
Allow NT AUTHORITY\NETWORK SERVICE    SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent>
                                      READ PROPERTY
Allow NT AUTHORITY\Authenticated Users
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent>
                                      READ PROPERTY
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for msDS-AllowedToActOnBehalfOfOtherIdentity   <Inherited from parent>
                                      WRITE PROPERTY
                                      READ PROPERTY
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for Private Information   <Inherited from parent>
                                      WRITE PROPERTY
                                      READ PROPERTY
                                      CONTROL ACCESS
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for Add/Remove self as member   <Inherited from parent>
                                      WRITE PROPERTY
Deny  Everyone                        Change Password
Deny  NT AUTHORITY\SELF               Change Password
Allow Everyone                        Change Password
Allow NT AUTHORITY\SELF               Change Password
Allow NT AUTHORITY\SELF               Send As
Allow NT AUTHORITY\SELF               Receive As
Allow CONTOSO\Exchange Windows Permissions
                                      Change Password   <Inherited from parent>
Allow CONTOSO\Exchange Windows Permissions
                                      Reset Password   <Inherited from parent>

<---------------------------------- From here the output does not apply to the current object:
Permissions inherited to subobjects are:
Inherited to all subobjects
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS   <Inherited from parent>
                                      READ PERMISSIONS
                                      LIST CONTENTS
                                      READ PROPERTY
                                      LIST OBJECT
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS   <Inherited from parent>
                                      READ PERMISSIONS
                                      LIST CONTENTS
                                      READ PROPERTY
                                      LIST OBJECT
Allow CONTOSO\Enterprise Admins       FULL CONTROL   <Inherited from parent>
Allow BUILTIN\Pre-Windows 2000 Compatible Access
                                      SPECIAL ACCESS   <Inherited from parent>
                                      LIST CONTENTS
Allow BUILTIN\Administrators          SPECIAL ACCESS   <Inherited from parent>
                                      DELETE
                                      READ PERMISSIONS
                                      WRITE PERMISSIONS
                                      CHANGE OWNERSHIP
                                      CREATE CHILD
                                      LIST CONTENTS
                                      WRITE SELF
                                      WRITE PROPERTY
                                      READ PROPERTY
                                      LIST OBJECT
                                      CONTROL ACCESS
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for inetOrgPerson   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for computer   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for group   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for organizationalUnit   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for user   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for contact   <Inherited from parent>
                                      CREATE CHILD
Allow CONTOSO\Organization Management
                                      FULL CONTROL for msExchDynamicDistributionList   <Inherited from parent>
Allow CONTOSO\Exchange Trusted Subsystem
                                      FULL CONTROL for msExchDynamicDistributionList   <Inherited from parent>
Allow CONTOSO\Delegated Setup         SPECIAL ACCESS for Account Restrictions   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for canonicalName   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for userAccountControl   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for Exchange Information   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for memberOf   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent>
                                      READ PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for proxyAddresses   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for proxyAddresses   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for pwdLastSet   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for showInAddressBook   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for showInAddressBook   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Organization Management
                                      SPECIAL ACCESS for adminDisplayName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Trusted Subsystem
                                      SPECIAL ACCESS for adminDisplayName   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for groupType   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Windows Permissions
                                      SPECIAL ACCESS for managedBy   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchMailboxSecurityDescriptor   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMServerWritableFlags   <Inherited from parent>
                                      WRITE PROPERTY
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for thumbnailPhoto   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for displayName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for displayName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for Public Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUserCulture   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for displayNamePrintable   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for displayNamePrintable   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for mail   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for mail   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for userAccountControl   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for countryCode   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchMobileMailboxFlags   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchSafeRecipientsHash   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for wWWHomePage   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for userCertificate   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMDtmfMap   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchBlockedSendersHash   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for Personal Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for textEncodedORAddress   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for textEncodedORAddress   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for publicDelegates   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for publicDelegates   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for publicDelegates   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMSpokenName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMPinChecksum   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for legacyExchangeDN   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for legacyExchangeDN   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for sAMAccountName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchSafeSendersHash   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow NT AUTHORITY\ENTERPRISE DOMAIN CONTROLLERS 
                                      SPECIAL ACCESS for tokenGroups   <Inherited from parent> 
                                      READ PROPERTY 
Allow NT AUTHORITY\NETWORK SERVICE    SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow NT AUTHORITY\Authenticated Users 
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for msDS-AllowedToActOnBehalfOfOtherIdentity   <Inherited from parent> 
                                      WRITE PROPERTY 
                                      READ PROPERTY 
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for Private Information   <Inherited from parent> 
                                      WRITE PROPERTY 
                                      READ PROPERTY 
                                      CONTROL ACCESS 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for Add/Remove self as member   <Inherited from parent> 
                                      WRITE PROPERTY 
Deny  Everyone                        Change Password 
Deny  NT AUTHORITY\SELF               Change Password 
Allow Everyone                        Change Password 
Allow NT AUTHORITY\SELF               Change Password 
Allow NT AUTHORITY\SELF               Send As 
Allow NT AUTHORITY\SELF               Receive As 
Allow CONTOSO\Exchange Windows Permissions 
                                      Change Password   <Inherited from parent> 
Allow CONTOSO\Exchange Windows Permissions 
                                      Reset Password   <Inherited from parent> 
 
<---------------------------------- From here the output does not apply to the current object: 
Permissions inherited to subobjects are: 
Inherited to all subobjects 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      READ PERMISSONS 
                                      LIST CONTENTS 
                                      READ PROPERTY 
                                      LIST OBJECT 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      READ PERMISSONS 
                                      LIST CONTENTS 
                                      READ PROPERTY 
                                      LIST OBJECT 
Allow CONTOSO\Enterprise Admins       FULL CONTROL   <Inherited from parent> 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      LIST CONTENTS 
Allow BUILTIN\Administrators          SPECIAL ACCESS   <Inherited from parent> 
                                      DELETE 
                                      READ PERMISSONS 
                                      WRITE PERMISSIONS 
                                      CHANGE OWNERSHIP 
                                      CREATE CHILD 
                                      LIST CONTENTS 
                                      WRITE SELF 
                                      WRITE PROPERTY 
                                      READ PROPERTY 
                                      LIST OBJECT 
                                      CONTROL ACCESS 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for inetOrgPerson   <Inherited from parent> 
                                      CREATE CHILD 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for computer   <Inherited from parent> 
                                      CREATE CHILD 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for group   <Inherited from parent> 
                                      CREATE CHILD 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for organizationalUnit   <Inherited from parent> 
                                      CREATE CHILD 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for user   <Inherited from parent> 
                                      CREATE CHILD 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for contact   <Inherited from parent> 
                                      CREATE CHILD 
Allow CONTOSO\Organization Management 
                                      FULL CONTROL for msExchDynamicDistributionList   <Inherited from parent> 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      FULL CONTROL for msExchDynamicDistributionList   <Inherited from parent> 
Allow CONTOSO\Delegated Setup         SPECIAL ACCESS for Account Restrictions   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for canonicalName   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for userAccountControl   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for Exchange Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for memberOf   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for proxyAddresses   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for proxyAddresses   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for pwdLastSet   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for showInAddressBook   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for showInAddressBook   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for adminDisplayName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for adminDisplayName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for groupType   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for managedBy   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchMailboxSecurityDescriptor   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMServerWritableFlags   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for thumbnailPhoto   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for displayName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for displayName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for Public Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUserCulture   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for displayNamePrintable   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for displayNamePrintable   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for mail   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for mail   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for userAccountControl   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for countryCode   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchMobileMailboxFlags   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchSafeRecipientsHash   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for wWWHomePage   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for userCertificate   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMDtmfMap   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchBlockedSendersHash   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for Personal Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for textEncodedORAddress   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for textEncodedORAddress   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for publicDelegates   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for publicDelegates   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for publicDelegates   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMSpokenName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for garbageCollPeriod   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchUMPinChecksum   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Organization Management 
                                      SPECIAL ACCESS for legacyExchangeDN   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Trusted Subsystem 
                                      SPECIAL ACCESS for legacyExchangeDN   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for sAMAccountName   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchSafeSendersHash   <Inherited from parent> 
                                      WRITE PROPERTY 
Allow NT AUTHORITY\NETWORK SERVICE    SPECIAL ACCESS for Exchange Personal Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow NT AUTHORITY\Authenticated Users 
                                      SPECIAL ACCESS for Exchange Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for msDS-AllowedToActOnBehalfOfOtherIdentity   <Inherited from parent> 
                                      WRITE PROPERTY 
                                      READ PROPERTY 
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for Private Information   <Inherited from parent> 
                                      WRITE PROPERTY 
                                      READ PROPERTY 
                                      CONTROL ACCESS 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS for Add/Remove self as member   <Inherited from parent> 
                                      WRITE PROPERTY 
 
Inherited to computer 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      DELETE 
Allow NT AUTHORITY\SELF               SPECIAL ACCESS for msTPM-TpmInformationForComputer   <Inherited from parent> 
                                      WRITE PROPERTY 
Inherited to group 
Allow NT AUTHORITY\ENTERPRISE DOMAIN CONTROLLERS 
                                      SPECIAL ACCESS for tokenGroups   <Inherited from parent> 
                                      READ PROPERTY 
Inherited to computer 
Allow NT AUTHORITY\ENTERPRISE DOMAIN CONTROLLERS 
                                      SPECIAL ACCESS for tokenGroups   <Inherited from parent> 
                                      READ PROPERTY 
Inherited to contact 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      DELETE 
Inherited to group 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      READ PERMISSONS 
                                      LIST CONTENTS 
                                      READ PROPERTY 
                                      LIST OBJECT 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      DELETE 
Inherited to inetOrgPerson 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      READ PERMISSONS 
                                      LIST CONTENTS 
                                      READ PROPERTY 
                                      LIST OBJECT 
Inherited to organizationalUnit 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      DELETE 
Inherited to inetOrgPerson 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      WRITE PERMISSIONS 
                                      DELETE TREE 
Allow CONTOSO\Exchange Windows Permissions 
                                      SPECIAL ACCESS   <Inherited from parent> 
                                      DELETE 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS for Remote Access Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS for General Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS for Logon Information   <Inherited from parent> 
                                      READ PROPERTY 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS for Account Restrictions   <Inherited from parent> 
                                      READ PROPERTY 
Allow CONTOSO\Exchange Servers        SPECIAL ACCESS for msExchActiveSyncDevices   <Inherited from parent> 
                                      CREATE CHILD 
                                      DELETE CHILD 
                                      LIST CONTENTS 
Allow BUILTIN\Pre-Windows 2000 Compatible Access 
                                      SPECIAL ACCESS for Group Membership   <Inherited from parent> 
                                      READ PROPERTY 
The command completed successfully 
````