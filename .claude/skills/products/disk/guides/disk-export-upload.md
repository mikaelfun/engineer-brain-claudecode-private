# Disk Disk Export, Upload & Access — 排查速查

**来源数**: 3 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 100-limit, azure-advisor, billing, cleanup, cost, delete, denyall, disk-access, download, encryption-set

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot export/download managed disk VHD: AuthorizationFailed or blocked. NetworkAccessPolicy DenyAll. | NetworkAccessPolicy DenyAll/AllowPrivate. beginGetAccess RBAC permission may be missing. | Check NetworkAccessPolicy. DenyAll: change to AllowAll/AllowPrivate. AllowPrivate: create disk access + private endpoint | 🔵 7.5 | [MS Learn] |
| 2 | Disk access private endpoint: max 100 concurrent import/export. Upload fails with both disk access and encryption set. | Disk access limits: 100 concurrent ops, cannot combine with disk encryption set for upload, same reg | Use multiple disk access resources. Remove encryption set before upload via private endpoint. Same region/subscription. | 🔵 7.5 | [MS Learn] |
| 3 | Orphaned unattached managed disks incur costs after VM deletion. Unexpected disk charges. | VM deletion does not delete attached disks by default. Disks become unattached but billable. | Find: portal Disks filter Unattached. PS: Get-AzDisk Where ManagedBy null. CLI: az disk list query managedBy null. Delet | 🔵 7.5 | [MS Learn] |

## 快速排查路径

1. Cannot export/download managed disk VHD: AuthorizationFailed or blocked. Network → Check NetworkAccessPolicy `[来源: mslearn]`
2. Disk access private endpoint: max 100 concurrent import/export. Upload fails wit → Use multiple disk access resources `[来源: mslearn]`
3. Orphaned unattached managed disks incur costs after VM deletion. Unexpected disk → Find: portal Disks filter Unattached `[来源: mslearn]`
