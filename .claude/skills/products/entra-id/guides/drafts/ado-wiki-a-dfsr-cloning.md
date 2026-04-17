---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/DFSR: Cloning"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FDFSR%3A%20Cloning"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1381307&Instance=1381307&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1381307&Instance=1381307&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This guide provides detailed instructions for cloning a Distributed File System Replication (DFSR) database to reduce initial synchronization time for new members of a replication group. It also covers steps to replace a corrupted DFSR database using cloning. 

[[_TOC_]]

---

# DFSR cloning

DFSR cloning is the process of cloning a Distributed File System Replication (DFSR) database to decrease the amount of time it takes for the initial synchronization to complete for a new member of a replication group. The DFSR database is used for all configured replicated folders on a given volume, and there is one database per volume if the member has multiple volumes with configured replicated folders.

**References:**

[Export-DfsrClone](https://learn.microsoft.com/en-us/powershell/module/dfsr/export-dfsrclone?view=windowsserver2022-ps)

[Export a Clone of the DFS Replication Database](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/dn482443(v=ws.11))

The examples in the articles use variables in PowerShell, but it is not required. You can just put the variable values on the PowerShell command.   
Below is an example of the process:

## 1. Identify the replication group and member to clone

Identify the replication group that you are adding the new member to and identify the member that you will clone. If there is not an existing replication group because this is a new implementation, then you will need to create the replication group.

**Example of creating the new replication group:**

**Variables:**

- ComputerName = "SRV01"
- ContentPath = "H:\RF01"
- GroupName = "RG01"
- FolderName = "RF01"

**Commands:**

```powershell
New-DfsReplicationGroup -GroupName RG01
New-DfsReplicatedFolder -GroupName RG01 -FolderName RF01
Add-DfsrMember -GroupName RG01 -ComputerName SRV01
Set-DfsrMembership -GroupName RG01 -FolderName RF01 -ContentPath H:\RF01 -ComputerName SRV01 -PrimaryMember $True
```

 _Note: When cloning for a new replication group, you will need to create the replication group with just the first member. You cannot do this in the DFS Management console; it needs to be done from PowerShell. You create it with just the first member so that once the initial sync is complete and you export the database, you can then import it into the second member. The second member cannot already be a member of the replication group before you import the database._

 Wait for the **4112** event to be logged in the DFS Replication event log indicating that the initial sync is complete.

## 2. Preseed the data to the new member

Preseed the data to the new member that will be added to the replication group. See the DFSR: [Preseeding](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1518927/DFSR-Preseeding) wiki page for more information.

## 3. Export the DFSR database

Export the DFSR database from the newly created and initialized volume. Create a folder to export the database to, for example, `H:\DfsrClone`.

**Command:**

```powershell
Export-DfsrClone -Volume H: -Path H:\DfsrClone
```

  Wait for the **2402** event in the DFS Replication event log to indicate the export completed successfully.

## 4. Copy the exported DFSR database

Copy the exported DFSR database and config files to the destination server.

```powershell
Robocopy.exe "H:\DfsrClone" "\\Srv02\H$\DfsrClone" /B
```

## 5. Verify there are no existing databases on the destination server

Launch an elevated Windows PowerShell session and then type the following, where H is the drive letter of the appropriate replicated folder:

```powershell
Get-ChildItem -path "H:\System Volume Information\dfsr" -hidden
```

If there aren't any DFS Replication databases on the volume, there won't be any output. If a directory is listed, use DFS Management or the following Windows PowerShell command to confirm that there aren't any replicated folders on drive H:\ (you cannot clone into an existing DFS Replication database).

```powershell
Get-DfsrMembership | Where-Object -Property ContentPath -Like H:\* | Format-Table
```

If the destination volume doesn't currently contain any replicated folders, but it did previously (such as reusing storage when replacing a server), in the elevated Windows PowerShell session, type the following command:

```powershell
Stop-Service DFSR
Remove-Item path "H:\system volume information\dfsr" recurse -force
Start-Service DFSR
```

## 6. Import the clone

**Command:**

```powershell
Import-DfsrClone -Volume H: -Path "H:\DfsrClone"
```

  Wait for the **2404** event in the DFS Replication event log to indicate the export completed successfully. Event 2416 also contains cloning progress events.

## 7. Add the new member to the replication group

You can do this in the DFS Management console or with PowerShell.

**Variables:**

- ComputerName = "Srv01"
- DestinationComputerName = "Srv02"
- GroupName = "RG01"
- FolderName = "RF01"
- ContentPath = "H:\RF01"

**Commands:**

```powershell
Add-DfsrMember -GroupName RG01 -ComputerName SRV02
Add-DfsrConnection -GroupName RG01 -SourceComputerName SRV01 DestinationComputerName SRV02
Set-DfsrMembership -GroupName RG01 -FolderName RF01 -ContentPath H:\RF01 -ComputerName SRV02
```

 Wait for the **4104** event to be logged in the DFS Replication event log indicating that the initial sync is complete.

---

# Use cloning to replace a corrupted DFS Replication database

In the event of DFS Replication database corruption caused by hardware issues (such as abrupt power loss), you can save time by cloning the database from another server rather than waiting for the automatic nonauthoritative recovery to complete.

To perform a database recovery by using cloning, follow the procedures to export a database clone and import a database clone, but skip preseeding the replicated folder. Also, prior to performing the import, remove the server from the replicated folder memberships that are affected by the corruption. This prevents DFS Replication from attempting to rebuild the database.

To do so, from an elevated Windows PowerShell session, type the following command to remove only the member. (This removes all of that computers memberships in that replication group because Windows PowerShell does not support removing a single membership.)

**Command:**

```powershell
Remove-DfsrMember GroupName RG01 ComputerName SRV02
```

**Important**

If you remove a member from a replication group, all of its memberships are affected. Only perform this operation if all the servers memberships exist only on the volume with the corrupt database.

If there are volumes without corrupt databases, you should use the DFSRADMIN command instead. Open an elevated command prompt window, and type the following command to remove only the single affected membership:

**Command:**

```powershell
Dfsradmin membership delete /rgname:rg01 /rfname:rf01 /memname:srv02
```

---

See reference articles at the top of this page for more details. Always test thoroughly prior to directing the customer so you know what behavior to expect and can guide them accurately.

_All screenshots, machine name references, IP addresses, and log outputs are from internal lab machines and not customer data._