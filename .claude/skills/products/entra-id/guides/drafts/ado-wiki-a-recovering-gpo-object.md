---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Active Directory Disaster Recovery/Recovering GPO object"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FActive%20Directory%20Disaster%20Recovery%2FRecovering%20GPO%20object"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668277&Instance=1668277&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668277&Instance=1668277&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article describes the options to recover Group Policy Objects (GPOs) and related objects to a previous state after an undesired change. It includes methods for backing up and restoring GPOs, GPO links, and WMI filters.

[[_TOC_]]

# Usage

This section will describe the options to recover GPOs and the related objects to a previous state after an undesired change.

# Group policy components

Before discussing the methods to restore GPOs and related objects like GPO links and WMI filters, it is important to understand the components that make up a GPO.

A Group Policy Object (GPO) is a virtual storage location for all policy settings. It does not physically exist anywhere. It is not an Active Directory class or attribute, and it cannot be found as a singular item anywhere on the domain controller or client machines. It consists of two component groups: the Group Policy Container (GPC) and the Group Policy Template (GPT).

## Group policy container

The Group Policy Container is stored in Active Directory on a per-domain basis as part of the domain partition. It is stored as a child container under the system container and is listed by individual GUID, not name.

For example: `CN={31B2F340-016D-11D2-945F-00C04FB984F9},CN=Policies,CN=System,DC=CONTOSO,DC=COM`

It is replicated to all other domain controllers in the domain by normal Active Directory replication. There are a few pieces of metadata that are stored per GPO basis. This metadata information includes, among other items, the version of the policy, user-friendly name, location path within the SYSVOL folder for the corresponding component of the Group Policy, and the Client Side Extensions (CSE) called by the policy.

## Group policy template

The Group Policy Template is stored in the `SYSVOL\Policies` folder, which can be found by default in `%systemroot%\SYSVOL\sysvol\<domainname>\Policies\POLICYGUID`.

For example: `C:\Windows\SYSVOL\domain\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}`

This is located and replicated with every single domain controller in the domain. The Group Policy Template information is replicated to all other domain controllers in the domain by the Distributed File Service - Replication (DFSR) or, for legacy systems, File Replication Service (FRS) and is stored in folders named by GUID. There is also a large volume of information that can be stored within a Group Policy Template, such as version information, Group Policy user settings, Group Policy machine settings, and any Group Policy scripts or files that have been referenced in the policy.

![image.png](/.attachments/image-54906ed2-3a24-42c0-8886-aca7b9f00a79.png)
## Group policy links

Group Policy links are essentially pointers that associate a Group Policy Container (GPC) with a specific Active Directory container, such as a site, domain, or Organizational Unit (OU).

![image.png](/.attachments/image-688ad883-5fad-45f4-b2ec-2e772268e6d1.png)

> **Note:** The reference is a string and not a linked value and it ends with a flag. The flag represents the state of the GPO link:<br>
> 0 - Default (link is enabled)<br>
> 1 - Link disabled<br>
> 2 - GPO enforced<br>
> In this example, three GPOs are linked to the root of CONTOSO. The gPlink includes three distinguished names that refer to the GPCs and each one ends with a flag:

![image.png](/.attachments/image-04ddd8e4-ac2e-4509-8171-9bef523b92f3.png)

## GPO WMI filter

WMI filters allow you to apply Group Policy Objects (GPOs) based on specific criteria determined by WMI queries. This adds an extra layer of specificity to GPO application, enabling administrators to target policies more granularly. WMI filters are queries written in WMI Query Language (WQL) that determine whether a GPO should be applied to a particular set of computers. These queries can check for various system details such as OS version, hardware characteristics, and software configurations.

The WMI filters are located within the WMIPolicy container.

For example: `CN={3713ABB7-1E06-4B8A-B4B8-A500B62A1197},CN=SOM,CN=WMIPolicy,CN=System,DC=CONTOSO,DC=COM`

![image.png](/.attachments/image-5beb24c3-0ab9-4635-86e2-57c54adea3b2.png)

# Restoring GPOs (GPC + GPT)

Reverting GPO changes or restoring a deleted GPO from a system state backup requires the restoration of both the GPC and the GPT folder from SYSVOL. Hence, an authoritative restore of the GPC and authoritative restores of the associated SYSVOL folder (the GPT) would be a last resort option.

## 1. Dedicated GPOs backup

Backup all GPOs on a daily basis:

A) Using the GPMC console

![image.png](/.attachments/image-d7945231-977d-462c-8c22-b99c5d97866a.png)

B) Via a one-line PowerShell command:
```powershell
Backup-GPO -Path c:\GPOBackup -ALL
```

C) Using a PowerShell script that backs up all Group Policy Objects to `C:\GPOBackup` into a new folder with the current date in the folder name. Additionally, it will delete the oldest folder if there are more than seven folders in `C:\GPOBackup`.

```powershell
# Define the backup path
$backupPath = "C:\GPOBackup"

# Get the current date for the folder name
$date = Get-Date -Format "yyyyMMdd"
$newBackupFolder = "$backupPath\$date"

# Create the new backup folder
New-Item -ItemType Directory -Path $newBackupFolder

# Backup all GPOs to the new backup folder
Backup-GPO -All -Path $newBackupFolder

# Get a list of all folders in the backup path, sorted by creation time
$folders = Get-ChildItem -Path $backupPath | Where-Object { $_.PSIsContainer } | Sort-Object CreationTime

# Check if there are more than 7 folders
if ($folders.Count -gt 7) {
    # Calculate the number of folders to delete
    $foldersToDelete = $folders.Count - 7
    
    # Delete the oldest folders
    $folders[0..($foldersToDelete - 1)] | ForEach-Object { Remove-Item -Recurse -Force -Path $_.FullName }
}
```

>  **Note:** Restoring a GPO from the above backup can be done using the GPMC snap-in by choosing one of the options depending on the scenario or using the cmdlet `Restore-GPO`:

![image.png](/.attachments/image-8b965aff-9b9e-44a0-9582-41dc49068a08.png)

## 2. AGPM

It is probably the easiest and least time-consuming GPO restoration operation for those who have already implemented Advanced Group Policy Management (AGPM) and are using the product to control, manage, and rollback GPOs. The rollback feature can help you recover from GPO changes that need to be revised or deleted GPOs:
[Roll Back to a Previous Version of a GPO](https://learn.microsoft.com/en-us/previous-versions/windows/microsoft-desktop-optimization-pack/agpm/roll-back-to-a-previous-version-of-a-gpo) 

[Restore a Deleted GPO](https://learn.microsoft.com/en-us/previous-versions/windows/microsoft-desktop-optimization-pack/agpm/restore-a-deleted-gpo)

More about AGPM:
- [Workflow: GPO: AGPM workflow](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/766305/Workflow-GPO-AGPM-workflow)
- [AGPM Under The Hood (part 1)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-production-gpos-under-the-hood)
- [AGPM Under The Hood (part 2)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-operations-under-the-hood-part-2-check-out)
- [AGPM Under The Hood (part 3)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-operations-under-the-hood-part-3-check-in)
- [AGPM Under The Hood (part 4)](https://learn.microsoft.com/en-us/archive/blogs/askds/agpm-operations-under-the-hood-part-4-import-and-export)

>  **Note:** AGPM is currently set to go out of support in April 2026, so it probably won't be a good idea to encourage customers to adopt AGPM.

## 3. Last resort - system state backup and authoritative restore

As this is a time-consuming and relatively complex task, refer to [Authoritative restore](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?wikiVersion=GBmaster&pagePath=/Sandbox/In%252DDevelopment%20Content/%F0%9F%A7%AATesting%20area%20for%20content%20development/Sagi%27s%20Test%20area/Workflow%3A%20Active%20directory%20disaster%20recovery/Recovering%20AD%20Objects&pageId=1434378&_a=edit&anchor=authoritative-restore) of the GPC and the GPT from a system state backup.

# Restoring GPLinks

As this is an OU's attribute, the restoration can be done from an LDF backup file that was previously taken using LDIFDE. The following command will generate a file with all the GPO links in the Contoso.com domain partition:

```powershell
ldifde -f gplink_export.ldf -d "DC=contoso,DC=com" -l "GPLink" -p Subtree
```

Alternatively, you can restore the attribute from an [AD snapshot that was previously taken using NTDSUtil](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1434378/Recovering-AD-Objects?anchor=attribute-recovery-using-ntdsutil-snapshots%2C-ldifde-export) of system backup using the [Authoritative restore](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?wikiVersion=GBmaster&pagePath=/Sandbox/In%252DDevelopment%20Content/%F0%9F%A7%AATesting%20area%20for%20content%20development/Sagi%27s%20Test%20area/Workflow%3A%20Active%20directory%20disaster%20recovery/Recovering%20AD%20Objects&pageId=1434378&_a=edit&anchor=authoritative-restore) method.

# Restoring WMI filters

Like with GPLinks, a WMI filter's content can be restored from an LDF backup file. The below sample command exports all the domain's WMI filters to an LDF file:

```
ldifde -f WMIFilters.ldf -d "CN=SOM,CN=WMIPolicy,CN=System,DC=CONTOSO,DC=COM" -o instancetype,whencreated,whenchanged,objectguid,dSCorePropagationData,uSNCreated,uSNChanged -p Subtree
```