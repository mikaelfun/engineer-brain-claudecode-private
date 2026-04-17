# Disk Disk Export, Upload & Access — 详细速查

**条目数**: 3 | **类型**: 📊 速查（无融合素材）
**生成日期**: 2026-04-07

---

### 1. Cannot export/download managed disk VHD: AuthorizationFailed or blocked. NetworkAccessPolicy DenyAll

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: NetworkAccessPolicy DenyAll/AllowPrivate. beginGetAccess RBAC permission may be missing.

**方案**: Check NetworkAccessPolicy. DenyAll: change to AllowAll/AllowPrivate. AllowPrivate: create disk access + private endpoint. Ensure RBAC has beginGetAccess.

**标签**: export, download, NetworkAccessPolicy, DenyAll, private-link, RBAC

---

### 2. Disk access private endpoint: max 100 concurrent import/export. Upload fails with both disk access a

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: Disk access limits: 100 concurrent ops, cannot combine with disk encryption set for upload, same region/sub required.

**方案**: Use multiple disk access resources. Remove encryption set before upload via private endpoint. Same region/subscription.

**标签**: private-endpoint, disk-access, import, export, 100-limit, encryption-set

---

### 3. Orphaned unattached managed disks incur costs after VM deletion. Unexpected disk charges.

**分数**: 🔵 7.5 | **来源**: [MS Learn] | **置信度**: high
**21V 适用**: ✅ 是

**根因**: VM deletion does not delete attached disks by default. Disks become unattached but billable.

**方案**: Find: portal Disks filter Unattached. PS: Get-AzDisk Where ManagedBy null. CLI: az disk list query managedBy null. Delete unneeded. Azure Advisor.

**标签**: orphaned, unattached, cost, billing, delete, Azure-Advisor, cleanup

---

