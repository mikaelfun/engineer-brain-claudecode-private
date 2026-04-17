---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Permissions, access control, and auditing/Workflow: NTFS Permissions/Workflow: NTFS Permissions: Scenarios (samples)/Scenario 1: \"Access is denied\""
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FPermissions%2C%20access%20control%2C%20and%20auditing%2FWorkflow%3A%20NTFS%20Permissions%2FWorkflow%3A%20NTFS%20Permissions%3A%20Scenarios%20(samples)%2FScenario%201%3A%20%22Access%20is%20denied%22"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423320&Instance=423320&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423320&Instance=423320&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**
This article provides a detailed troubleshooting guide for resolving access issues faced by the user "TestUser" when attempting to access files within a specific folder. It includes steps for collecting user information, analyzing NTFS permissions, and reassigning permissions to resolve the issue.

# **Issue description:**

End user is not able to access the files below, from within the session of the user "TestUser":
c:\data\subfolder\file  
Error message: <span style="color:red"> _"Access is denied"_ </span>

Following error appears on screen:  
![Scenario_1_Access_is_denied.png](/.attachments/PermissionsAccessControlsAuditing/Scenario_1_Access_is_denied.png)

From a CMD window:
```
c:\Data\Subfolder>report2.html  
"Access is denied"  
```

===========================================================================

**Assessment/Scope:**

User is able to access the root folder c:\Data\Subfolder, but not the next child item C:\data\Subfolder\report2.html.  
The administrator of the box is able to access the C:\Data\Subfolder and files.  
Therefore, we need to focus on the folder Subfolder and associated child items, as the NTFS (NT File System) permission does not allow the user to access the folder and files.

**Troubleshooting:**

1. Collecting information about the impacted user:  
```
whoami /all > C:\MS\user_priv.txt
```

2. Collecting the NTFS permissions and ACLs (Access Control Lists) applied to the C:\Data\Subfolder folder structure:  
```
get-acl c:\data\subfolder\report2.html |fl | out-file C:\MS\Ps-getACLfile.txt
```
Alternatively, you can also run:  
```
(get-acl c:\data\subfolder\report2.html).access | out-file C:\MS\Ps-Access-file.txt
```

3. Analyzing the data:  
Group Memberships and privileges of the user:

```
USER INFORMATION 
---------------- 
User Name        SID                                          
================ ============================================ 
coconut\testuser S-1-5-21-2781196867-17781880-2749571769-1111 

GROUP INFORMATION 
----------------- 
Group Name                                 Type             SID          Attributes                                         
========================================== ================ ============ ================================================== 
Everyone                                   Well-known group S-1-1-0      Mandatory group, Enabled by default, Enabled group 
BUILTIN\Remote Desktop Users               Alias            S-1-5-32-555 Mandatory group, Enabled by default, Enabled group 
BUILTIN\Users                              Alias            S-1-5-32-545 Mandatory group, Enabled by default, Enabled group 
NT AUTHORITY\REMOTE INTERACTIVE LOGON      Well-known group S-1-5-14     Mandatory group, Enabled by default, Enabled group 
NT AUTHORITY\INTERACTIVE                   Well-known group S-1-5-4      Mandatory group, Enabled by default, Enabled group 
NT AUTHORITY\Authenticated Users           Well-known group S-1-5-11     Mandatory group, Enabled by default, Enabled group 
NT AUTHORITY\This Organization             Well-known group S-1-5-15     Mandatory group, Enabled by default, Enabled group 
LOCAL                                      Well-known group S-1-2-0      Mandatory group, Enabled by default, Enabled group 
Authentication authority asserted identity Well-known group S-1-18-1     Mandatory group, Enabled by default, Enabled group 
Mandatory Label\Medium Mandatory Level     Label            S-1-16-8192                                                     

PRIVILEGES INFORMATION 
---------------------- 
Privilege Name                Description                          State    
============================= ==================================== ======== 
SeShutdownPrivilege           Shut down the system                 Disabled 
SeChangeNotifyPrivilege       Bypass traverse checking             Enabled  
SeUndockPrivilege             Remove computer from docking station Disabled 
SeIncreaseWorkingSetPrivilege Increase a process working set       Disabled 
SeTimeZonePrivilege           Change the time zone                 Disabled 
```

Output of the permissions dumped in file C:\MS\Ps-getACLfile.txt:  
```
Path   : Microsoft.PowerShell.Core\FileSystem::C:\data\subfolder\report2.html 
Owner  : BUILTIN\Administrators 
Group  : COCONUT\Domain Users 
Access : BUILTIN\Administrators Allow  FullControl 
         NT AUTHORITY\SYSTEM Allow  FullControl 
Audit  :  
Sddl   : O:BAG:DUD:AI(A;ID;FA;;;BA)(A;ID;FA;;;SY) 
```

Output of the permissions dumped in file C:\MS\Ps-Access-file.txt:  
```
FileSystemRights  : FullControl 
AccessControlType : Allow 
IdentityReference : BUILTIN\Administrators 
IsInherited       : True 
InheritanceFlags  : None 
PropagationFlags  : None 

FileSystemRights  : FullControl 
AccessControlType : Allow 
IdentityReference : NT AUTHORITY\SYSTEM 
IsInherited       : True 
InheritanceFlags  : None 
PropagationFlags  : None 
```

**Analysis:**  
The data shows that the user account "TestUser" is only a "simple" user without any extended administrator privileges.  
And the NTFS permissions on the C:\data\Subfolder\report2.html file show that only the SYSTEM account and the Administrator groups currently have permissions to access the file.  

This means the user does not have access and is therefore getting the "Access Denied" error on screen.

**Resolution:**  
The administrator user needs to reassign the permissions to allow the "TestUser" account access to the mentioned file.

**Detailed steps:**
1. Login with an Administrator Account 
1. Check the permission on the report2.html file item.  
1. Reassign the correct permissions by reenabling the Inheritances from the Parent folder