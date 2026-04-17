# Disk Backup, Restore & Snapshots — 排查工作流

**来源草稿**: mslearn-backup-dr-managed-disks.md, mslearn-vm-restore-point-troubleshooting.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: 备份方案选择
> 来源: mslearn-backup-dr-managed-disks.md | 适用: Mooncake ✅ / Global ✅

### 方案对比决策树

| 场景 | 推荐方案 |
|------|----------|
| 低成本磁盘备份 | 增量快照 |
| 多磁盘 VM 备份 | Restore Points |
| 全托管备份 | Azure Backup |
| 完整 BCDR | Azure Site Recovery |
| 生产 DB (SQL/Oracle) | Always On AG + 跨区域副本 |
| 数据损坏/勒索软件 | 增量快照时间点恢复 |

### 快照一致性注意

运行中 VM 快照可能包含:
1. 部分进行中的操作
2. 多磁盘快照时间不一致
3. 条带卷需协调: freeze disks → flush writes → snapshot all

**一致性工具:**
- Windows: VSS (应用一致)
- Linux: `fsfreeze` (文件一致)

---

## Scenario 2: VM Restore Point 故障排查
> 来源: mslearn-vm-restore-point-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 系统排查步骤

1. **检查 VM 健康状态** — provisioning state 必须为 Running
2. **检查 VM Guest Agent** — Windows: services.msc; Linux: `ps -e | grep walinuxagent`
3. **检查扩展状态** — 所有扩展须为 provisioning succeeded
4. **检查快照扩展** — VMSnapshot 不能为 failed 状态
   - 杀毒可能阻止 IaaSBcdrExtension.exe → 排除路径
   - 需要网络访问: 端口 80, 443, 32526; IP 168.63.129.16
   - Guest VM 内必须启用 DHCP

### 常见错误码速查

| 错误码 | 原因 | 修复 |
|--------|------|------|
| DiskRestorePointUsedByCustomer | 磁盘恢复点有活跃 SAS | 先执行 EndGetAccess |
| OperationNotAllowed (disk not allocated) | 不健康磁盘 | 用 excludeDisks 排除 |
| VMRestorePointClientError (shared disk) | 共享磁盘不支持 | 排除共享磁盘 |
| DiskRestorePointClientError (KeyVault) | KeyVault 已删除 | 重建 KeyVault |
| VMRestorePointClientError (VSS) | VSS writers 状态异常 | 重启 VSS + VM |
| VMRestorePointClientError (snapshot limit) | 超过 500 快照 | 删除旧恢复点 |
| VMAgentStatusCommunicationError | Agent 停止/过期 | 重装/重启 agent |

---

## Scenario 3: 增量快照跨区域复制
> 来源: mslearn-backup-dr-managed-disks.md | 适用: Mooncake ✅ / Global ✅

### 限制
- 每订阅最多 100 个并行跨区域复制
- 必须按创建顺序复制
- 首次快照 = 完整复制；后续 = 仅变更部分