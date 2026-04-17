---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/Network File System (NFS)/NFS File Share Snapshots_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/Workflows/Network%20File%20System%20(NFS)/NFS%20File%20Share%20Snapshots_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# NFS File Share Snapshots

GA since 1/30/2024. Available in all Azure public regions except West US 2.

## Design
- `.snapshots` is a virtual hidden folder; only exists when snapshots exist
- `ls -a` will NOT show it, but `cd .snapshots` works
- Format: `YYYYMMDDHHMMSS_snapshot`
- All entries under .snapshots are read-only (NFS4ERR_ROFS for write ops)
- Server cache refresh time: 30 seconds
- Snapshots retain all permissions and ownership

## Limitations
- Only AzRmStorageShare APIs supported (not AzStorageShare data plane APIs)
- Azure Backup NOT supported for NFS shares
- AzCopy NOT supported; use rsync or fpsync

## Known Issues

### 1. Stale Cache (30s)
Accessing snapshot within 30s of creation: `No such file or directory`
- Workaround: wait 30s, or touch /mnt/nfs, or remount

### 2. Slow Enumeration
find command on snapshot with huge entries is slow (client cache expires faster for snapshot FSID)
- Workaround: use subdirectory mount for the snapshot

### 3. Empty .snapshots After Pre-Mount Snapshot
If snapshots created before first mount, ls .snapshots returns empty
- Workaround: delete pre-mount snapshots, recreate after first mount

### 4. Access Fails After Disable/Re-Enable
stat .snapshots returns NFS4ERR_NOENT after toggling snapshot access
- Workaround: touch /mnt/nfs or remount; PG fix in progress

### 5. Lock Operations
Lock/Unlock supported but not real locks across VMs on different FE nodes

## Operations

### Create
```powershell
New-AzRmStorageShare -ResourceGroupName "<rg>" -StorageAccountName "<sa>" -Name "<share>" -Snapshot
```
```bash
az storage share snapshot --name <share> --account-name <sa>
```

### List
```powershell
Get-AzRmStorageShare -ResourceGroupName "<rg>" -StorageAccountName "<sa>" -IncludeSnapshot
```

### Delete
```powershell
Remove-AzRmStorageShare -ResourceGroupName "<rg>" -StorageAccountName "<sa>" -Name "<share>" -SnapshotTime "<time>"
```

### Access via NFS Client
```bash
cd .snapshots
ls
cd YYYYMMDDHHMMSS_snapshot
# Read/copy contents (read-only)
```

## Troubleshooting
1. Review Limitations and Known Issues
2. Create/Delete issues: Review RSRP Logs
3. Other issues: collect storage account, share name, snapshot name/time, timeframe
4. Discuss with TA or Storage SME

## Escalation
Escalate via ASC to leverage automation.

## Support Topics
- Routing: Azure Storage File > Azure Files Snapshots
- Queue: POD Azure IaaS VM/Storage
