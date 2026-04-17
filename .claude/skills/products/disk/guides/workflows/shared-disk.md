# Disk Azure Shared Disk — 排查工作流

**来源草稿**: mslearn-shared-disk-limitations-reference.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 共享磁盘限制速查
> 来源: mslearn-shared-disk-limitations-reference.md | 适用: Mooncake ✅ / Global ✅

### 支持的磁盘类型
- Ultra Disk, Premium SSD v2, Premium SSD, Standard SSD
- **HDD 不支持**

### 通用限制 (maxShares > 1)
- ❌ Host caching 不支持
- ❌ Write accelerator 不支持
- ❌ ADE (BitLocker/DM-Crypt) 不支持 → 使用 SSE
- ❌ 无法在 VMSS 模型中定义
- ⚠️ 扩容需先 deallocate 所有 VM 或 detach
- ⚠️ maxShares 只能在 detach 所有 VM 后修改

### 各类型 maxShares 限制

| 类型 | 小规格 | 中规格 | 大规格 | 跨 AZ |
|------|--------|--------|--------|--------|
| Premium SSD | P1-P20: 3 | P30-P50: 5 | P60-P80: 10 | ZRS only |
| Standard SSD | E1-E20: 3 | E30-E50: 5 | E60-E80: 10 | ZRS only |
| Ultra/PSSv2 | 1-15 (无限制) | — | — | ❌ 不支持跨 AZ |

### Premium SSD 额外限制
- 仅数据磁盘（不支持 OS 磁盘）
- 磁盘 bursting 不可用 (maxShares > 1)

---

## Scenario 2: 共享磁盘部署与排查
> 来源: mslearn-shared-disk-limitations-reference.md | 适用: Mooncake ✅ / Global ✅

### 创建共享磁盘
```bash
az disk create -g myRG -n mySharedDisk --size-gb 1024 --sku Premium_LRS --max-shares 2
```

### 更新现有磁盘
```bash
az disk update --name myDisk --max-shares 5 --resource-group myRG
```

### SCSI PR 命令 (故障转移集群)
支持: PR_REGISTER_KEY, PR_REGISTER_AND_IGNORE, PR_RESERVE, PR_PREEMPT_RESERVATION, PR_CLEAR_RESERVATION, PR_RELEASE_RESERVATION

### 常见排查问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 无法启用 host caching | 共享磁盘不支持 | By design |
| 无法启用 ADE | 共享磁盘不支持 | 改用 SSE |
| 无法扩容 | 磁盘仍附加在 VM 上 | Deallocate 所有 VM 或 detach |
| maxShares 修改失败 | 磁盘未从所有 VM detach | Detach 所有 VM |
| 无法跨 AZ (Premium) | 需要 ZRS | 改用 ZRS 磁盘 |