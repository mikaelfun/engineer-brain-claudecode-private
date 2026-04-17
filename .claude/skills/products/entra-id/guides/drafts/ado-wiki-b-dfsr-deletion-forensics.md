---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/DFSR/Workflow: DFSR: Looking for Known Solutions/Common Solutions/Root Cause Analysis (RCA)/DFSR Deletion Forensics"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDFSR%2FWorkflow%3A%20DFSR%3A%20Looking%20for%20Known%20Solutions%2FCommon%20Solutions%2FRoot%20Cause%20Analysis%20(RCA)%2FDFSR%20Deletion%20Forensics"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# DFSR Deletion Forensics - Determining Where and When

## Introduction
When a file or folder object is deleted on one member, the deletion is propagated to any other member of the replicated folder. The change originator introducing the deletion stamps the update with its Global Version Sequence Number (GVSN) as {DatabaseGuid of member}-VersionVector. The Database Guid reflects the member where the update occurred and can be discovered, together with the timestamp, from the DFSR database.

The status of the deleted object is stored in all databases on all members for 60 days and can be queried with WMIC.

## Step 1: Get the Replicated Folder GUID

**WMIC (elevated prompt):**
```
wmic /namespace:\\root\microsoftdfs path DfsrReplicatedFolderInfo get ReplicatedFolderGuid,ReplicatedFolderName
```

**PowerShell:**
```powershell
Get-DfsReplicatedFolder -GroupName "contoso.com\dfsn\corpinstall" -FolderName corpinstall
```

## Step 2: Query the Database Record for the Deleted File

```
wmic /namespace:\\root\microsoftdfs path DfsrIdRecordInfo WHERE (filename='critical.txt' and replicatedfolderguid='ADDB9740-7113-44B9-8E54-464C7573550F') get filename,flags,updatetime,GVsn
```

### Output Interpretation:
- **Flags**: Normal file = 0x5 (PRESENT_FLAG 0x1 + UID_VISIBLE_FLAG 0x4). If Flags=4 (PRESENT_FLAG missing), the file is tombstoned (deleted).
- **GVsn**: `{DatabaseGuid}-vN` - The GUID identifies the member where the deletion occurred.
- **UpdateTime**: Format YYYYMMDDhhmmss (GMT).

| Flag Value | Meaning |
|--|--|
| PRESENT_FLAG 0x1 | Resource is not a tombstone; available on computer |
| NAME_CONFLICT_FLAG 0x2 | Tombstone generated from name conflict |
| UID_VISIBLE_FLAG 0x4 | ID record sent to partners |
| JOURNAL_WRAP_FLAG 0x10 | Volume had journal wrap, resource not yet checked |
| PENDING_TOMBSTONE_FLAG 0x20 | ID record being tombstoned |

**Note**: WMIC is required for deleted objects since `DfsrDiag.exe IDRecord /FilePath:` and `Get-DfsrIdRecord -Path` cannot be used when the object is already deleted.

## Step 3: Convert DatabaseGuid to Server Name

**dfsrdiag:**
```
dfsrdiag guid2name /guid:F04AC256-027D-4D99-A9D0-E593F41DA730 /RGName:"contoso.com\dfsn\corpinstall"
```

**PowerShell:**
```powershell
ConvertFrom-DfsrGuid -GroupName "contoso.com\dfsn\corpinstall" -Guid F04AC256-027D-4D99-A9D0-E593F41DA730
```

This reveals the server and volume where the deletion originated.

## ConflictAndDeleted Recovery

When a deletion is replicated into a DFSR server, the file is moved to `\DfsrPrivate\ConflictAndDeleted` under the replicated folder root (default quota: 660 MB, configurable). Local deletions go to Windows Recycle Bin.

File info in ConflictAndDeleted can be queried:
```
wmic /namespace:\\root\microsoftdfs /node:servername path DfsrConflictInfo where "filename like 'critical.doc%'" get * /format:textvaluelist
```

The `ConflictAndDeletedManifest.xml` file contains original paths. A restoration script is available at the AskDS blog.

## Auditing (The "Who")

Enable Object Access Auditing on critical replicated folders:
- Audit EVERYONE for DELETE with inheritance
- Keep total event log size around 300MB on Server 2003
- Configure AutoBackupLogFiles registry for automatic log rotation
- Auditing must be configured BEFORE the deletion occurs

**Important**: Auditing costs CPU time, disk I/O, and memory. Test in your environment first.
