---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Active Directory Disaster Recovery/Recovering AD Objects"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FActive%20Directory%20Disaster%20Recovery%2FRecovering%20AD%20Objects"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668276&Instance=1668276&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1668276&Instance=1668276&Feedback=2)

___
<div id='cssfeedback-end'></div>

## Table of Contents
1. [Usage](#usage)
2. [Pre-requisites](#pre-requisites)
3. [Active Directory Recycle Bin](#active-directory-recycle-bin)
   - [ADAC Requirements](#adac-requirements)
   - [ADAC Limitations](#adac-limitations)
   - [Restore a single object](#restore-a-single-object)
   - [Restore multiple objects](#restore-multiple-objects)
   - [Display limitations](#display-limitations)
4. [Authoritative restore](#authoritative-restore)
   - [Requirements](#requirements)
   - [Restoration process](#restoration-process)
5. [Attribute recovery using NTDSUtil snapshots, LDIFDE export](#attribute-recovery-using-ntdsutil-snapshots-ldifde-export)
   - [Requirements](#requirements-1)
   - [Creating an NTDS snapshot](#creating-an-ntds-snapshot)
   - [Recovering AD objects](#recovering-ad-objects)

## Summary
This document provides detailed instructions for recovering deleted objects and reverting object properties to a previous state in Active Directory. It covers the use of the Active Directory Recycle Bin, authoritative restore, and attribute recovery using NTDSUtil snapshots and LDIFDE export.

# Usage
This section describes the options to recover deleted objects and revert object properties to a previous state after an undesired change.

# Pre-requisites
**For changed or deleted objects:** System state backup or bare metal restore (BMR) backup

**For deleted objects:** Active Directory Recycle Bin enabled, or system state backup, or BMR backup

# Active Directory Recycle Bin
The most common and easy method to restore Active Directory deleted objects is via the Active Directory (AD) Recycle Bin. The AD Recycle Bin requires a Windows Server 2008 R2 Forest Functional Level or later. This feature is not enabled by default. 

It can be enabled via ADAC:

![image.png](/.attachments/image-24c695af-dc27-4a84-904f-78fdbd2a6425.png)

or via PowerShell:

```powershell
Enable-ADOptionalFeature -Identity 'CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=contoso,DC=com' -Scope ForestOrConfigurationSet -Target 'contoso.com'
```

Be aware that the recycle bin is only useful when the following conditions are met:
1. The object was deleted after the recycle bin was enabled.
2. The object can be restored via the ADAC snap-in as long as it used to exist in the domain partition. If the object was deleted from a different partition such as the configuration partition, it can be restored using the PowerShell `IncludeDeletedObjects` and `Restore-ADObject` cmdlets, for example:

   ```powershell
   Get-ADObject -Filter {isDeleted -eq $true -and name -like 'EFSRecovery*'} -SearchBase 'CN=Configuration,DC=CONTOSO,DC=COM' -IncludeDeletedObjects | Restore-ADObject
   ```

3. The object is still in the Deleted Object Lifetime and has not been transformed into a recycled object.

## ADAC requirements
- Restore the top-most deleted object in a tree
- Restore immediate children of that parent object
- Restore immediate children of those parent objects
- Repeat as necessary until all objects are restored

**Last Known Parent attribute shows parent relationship of each object:**
- Attribute changes from deleted location to restored location when you refresh
- Therefore, you can restore that child object when a parent objects location no longer shows the Deleted Objects containers distinguished name

Parent can easily be located by looking at the column Last known parent or clicking the **Locate Parent** button.

![ADDisasterRecovery_LocateParent.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_LocateParent.png)

## ADAC limitations
- ADAC only manages domain partitions and cannot restore deleted objects from the configuration partition.
- For DNS zones and records recovery, please refer to: [Using AD Recycle Bin to restore deleted DNS zones and their contents in Windows Server 2008 R2](https://techcommunity.microsoft.com/t5/ask-the-directory-services-team/using-ad-recycle-bin-to-restore-deleted-dns-zones-and-their/ba-p/398097)
- ADAC cannot restore sub-trees of objects in a single action. However, the sample script below may help with this task: [Restore Multiple, Deleted Active Directory Objects (Sample Script)](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd379504(v=ws.10)?redirectedfrom=MSDN)

## Restore a single object
1. Open Active Directory Administrative Center.
2. Click the domain name in the navigation pane.
3. Double-click Deleted Objects.
4. Right-click the object and select Restore (restores object to original location).
5. Click Restore To to change the restore location (useful if the deleted objects parent container is also deleted and you do not want to restore it).

![ADDisasterRecovery_RestoreSingleRecycleBin.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_RestoreSingleRecycleBin.png)

## Restore multiple objects
- You can restore multiple peer-level objects, for example, all direct objects in an Organizational Unit (OU).

To restore:
1. Hold the Ctrl key and click one or more deleted objects.
2. Click *Restore* from the Tasks pane.

- Also supports Ctrl+A and Shift+click.

![ADDisasterRecovery_RestoreMultipleRecycleBin.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_RestoreMultipleRecycleBin.png)

 **Note:** ADAC cannot restore sub-trees of objects in a single action. However, the sample script below may help with this task: [Restore Multiple, Deleted Active Directory Objects (Sample Script)](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd379504(v=ws.10)?redirectedfrom=MSDN)

## Display limitations
- Deleted Objects is likely to accumulate over 20,000 (or even 100,000) objects in large enterprises.
- Since the ADAC filter mechanism is client-side, it cannot show these additional objects.

To work around the display limitation:
1. Right-click the Deleted Objects container and select Search under this node.
2. Click the chevron to expose the +Add criteria menu, select and add Last modified between given dates.
   - Last modified time (whenChanged attribute) is a close approximation of deletion time.
   - This query performs a server-side search.
3. Use further display for filtering, sorting on the results.

# Authoritative restore
This method can be used when an object or subtree has been deleted. This method can also be used to return objects to a previous state when their attributes have been inadvertently changed.

Authoritative restore will only affect those objects or subtrees that the administrator specifically marks as authoritative using the `ntdsutil` commands. On the backend, those marked objects will increase their Version attribute by 100,000, allowing replication to identify them as the newest version of the object.

 **Note:** Authoritative restore will not cause newly populated attributes on affected objects to be restored with a null value. For example, if a user "Alice" has a user account and something populates the user's email attribute while previously the user had no email, an authoritative restore will not remove the new email address attribute value. Effectively, all attributes populated on the user at the time of the backup will be restored, and after replication occurs, the email value will still be present.

## Requirements
1. A healthy, up-to-date, accessible system state backup or BMR taken prior to the change.
2. The domain controller that is used for the restore must be in Directory Services Restore Mode (DSRM).

## Restoration process
1. Locate the system state backup or BMR backup that is going to be used and verify that it is accessible from the domain controller and the administrator that is going to perform the task. The domain controller can be any, as long as you have a valid backup for it. However, a Virtual Machine Domain Controller is highly preferred as it has a better rate for restore than physical Domain Controllers.
2. Ensure the administrator knows what the DSRM password is. Otherwise, reset the DSRM password following the steps below:
   a. Click Start > Run, type `ntdsutil`, and then click OK.
   b. At the Ntdsutil command prompt, type: `set dsrm password`.
   c. At the DSRM command prompt, type one of the following lines:
      - To reset the password on the server on which you're working, type `reset password on server null`. The null variable assumes that the DSRM password is being reset on the local computer. Type the new password when you're prompted. Note that no characters appear while you type the password.
      - or -
      - To reset the password for another server, type `reset password on server servername`, where servername is the DNS name for the server on which you're resetting the DSRM password. Type the new password when you're prompted. Note that no characters appear while you type the password.
   d. At the DSRM command prompt, type `q`.
   e. At the Ntdsutil command prompt, type `q` to exit.
3. Boot the domain controller in DSRM. There are a few ways to achieve this. While method A provides easy access to the DSRM, it requires reversing the settings. Method B sometimes fails to access DSRM; however, it does not require reversing any settings to go back to normal mode. Select the best method for your specific scenario or preference:

   **Method A) - MSConfig**<br>
   a. Click Start > Run, type `msconfig`, and then click OK.<br>
   b. Select the *Boot* tab and then mark the checkbox *Safe boot*.<br>
   c. Select the radio button *Active Directory repair*, click *OK*, and *Restart*.
   
   
   **Method B) - Automatic repair trigger**<br>
   a. Shut down the domain controller.<br>
   b. Start the domain controller and while the Windows logo shows up forcibly turn off the server.<br>
   c. Repeat three times and Automatic repair will be triggered. Let it load the files.<br>
   d. On the *Choose an Option* screen, select *Troubleshoot*.<br>
   e. Select *Startup Settings* and click on the *Restart* button.<br>
   f. With the keyboard, select *Directory Services Repair Mode*.
4. Once in DSRM, open Windows Server Backup and right-click on *Local Backup* selecting *Recover*.
5. Select the location to search the backup, local or remote, depending on where the backup is located.
6. Select the date and time of the backup to recover, confirm it matches the desired backup.
7. Select the radio button *System state*.
8. Select *Original location* and **keep the checkbox "Perform authoritative restore of Active Directory Files" unchecked**.
9. Click *Ok* on the informational message, **keep the checkbox "Automatically reboot the server to complete the recovery process" unchecked** and select *Recover* and confirm the warning message with *Yes*.

 **Warning:** Once the restore has completed, you will be prompted to restart. **Do not restart** the computer once the recovery is done. The objects to recover still need to be marked as authoritative. If the machine is rebooted without making this process, the objects will not be recovered, and the steps will need to be followed again.

10. Open an elevated command prompt and type the following commands:

```shell
ntdsutil
activate instance NTDS  # This will work for Active Directory, for AD LDS, use "list instances" command and activate the desired instance
authoritative restore
```

 **Note:** The `activate instance NTDS` command will work for Active Directory. For AD LDS, use the "list instances" command and activate the desired instance.

11. Now, depending on what needs to be recovered, whether a single object or a subtree, the next command will change.

   **For single objects:**
   ```shell
   restore object "Distinguished name of object to recover"
   ```
   Example: `restore object "CN=testuser,CN=Users,DC=contoso,DC=com"`

   **For a directory and its content (Organizational Unit, container, partition):**
   ```shell
   restore subtree "Distinguished name of object to recover"
   ```
   Example: `restore subtree "OU=Users,OU=Costa Rica,DC=contoso,DC=com"`

12. After entering the desired command, press enter, double-check the used command, and click Yes if everything is in order. You can continue to mark as authoritative other objects with the same command prompt.
13. Once you are done marking as authoritative all the required objects, revert back the boot configuration to normal mode (if you used method A) and restart. You can go back to Windows Server Backup and select *Restart* or restart normally.
14. After reboot, give a reasonable amount of time for it to replicate with the replication partners or force replication.

# Attribute recovery using NTDSUtil snapshots, LDIFDE export
Active Directory can recover AD objects' attributes from NTDS snapshots (do not confuse with VM snapshots).

## Requirements
1. The snapshot needs to be created prior to the change or deletion.

## Creating an NTDS snapshot
To create a snapshot, run the following commands on an elevated CMD as domain administrator:

1. `ntdsutil`
2. `activate instance ntds`
3. `snapshot`
4. `create`
5. Verify the snapshot has been created with the command: `list all`

![ADDisasterRecovery_SnapshotCreate.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotCreate.png)

* You can automate this process and take additional snapshots regularly by scheduling it to run regularly via a scheduled task that calls a batch file with the following command:
  ```shell
  ntdsutil.exe snapshot "Activate Instance NTDS" create quit quit
  ```
* You should verify you have enough disk space and if you already have a reasonable number of old snapshots, you can add the following command to the batch file which will delete the oldest snapshot each time a new snapshot is taken:
  ```shell
  ntdsutil.exe snapshot "Activate Instance NTDS" create quit quit
  ```

## Recovering AD objects
1. Mount the desired snapshot. In this example, snapshot 14 with the command: `mount 14`.

![ADDisasterRecovery_SnapshotMount.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotMount.png)

2. Notice that the previous action will print on the screen a path, in this case: C:\$SNAP_201310251439_VOLUMEC$\ -- Use the Windows Explorer to access the path and open the link.

![ADDisasterRecovery_SnapshotLink.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotLink.png)

3. Identify the NTDS.DIT path.


![ADDisasterRecovery_SnapshotNTDSPath.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotNTDSPath.png)

4. Use the offline browser `dsamain` to load the snapshot NTDS.DIT. This window needs to remain open. Example on port 50001.

![ADDisasterRecovery_SnapshotOpenNTDS.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotOpenNTDS.png)

5. Open another Command prompt window as administrator.
6. Export the snapshot for User1 changed object using LDIFDE. (Sample user: User1). This requires the correct Distinguished name.

```shell
ldifde -m- -f OUTPUT.LDF -s localhost:50001 - "CN=User1,OU=OU1,DC=root,DC=contoso,DC=com"
```

![ADDisasterRecovery_SnapshotExportObject.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotExportObject.png)

7. Extract the required values. In this example, the display name.

![ADDisasterRecovery_SnapshotSelectValue.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotSelectValue.png)

8. Create an LDIFDE import file to set the right value(s) back to the production environment.

![ADDisasterRecovery_SnapshotCreateLDIF.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotCreateLDIF.png)

9. Import using LDIFDE

`ldifde -i -f import.LDF`

![ADDisasterRecovery_SnapshotImportLDIF.png](/.attachments/ADDisasterRecovery/ADDisasterRecovery_SnapshotImportLDIF.png)