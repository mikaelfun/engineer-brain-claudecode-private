# Disk Data Box Gateway — 排查工作流

**来源草稿**: ado-wiki-a-expand-data-disk-data-box-gateway.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Data Box Gateway 扩展数据磁盘
> 来源: ado-wiki-a-expand-data-disk-data-box-gateway.md | 适用: Mooncake ✅ / Global ✅

### ⚠️ 重要
**不要扩展默认数据驱动器**，这可能导致不可预测的行为。只能添加新的 SCSI 磁盘。

### 操作步骤

1. **关闭设备** — 等待关闭完成
2. **添加新的精简配置 SCSI 磁盘**
   - Hyper-V: 通过 Hyper-V Manager 添加虚拟硬盘
   - VMware ESXi: 通过 vSphere/ESXi 控制台添加虚拟磁盘
3. **重启设备** — 等待 local UI 可用
4. **在 Azure Portal 检查事件**:
   - 等待: "Started expanding the data disk"
   - 等待: "Successfully expanded the data disk"
5. **在 local UI dashboard 检查更新的容量**
   - 扩展可能需要**每 TB 约 10 分钟**
6. **验证 Azure Portal Metrics 页面**（可能需要 10 分钟更新）
7. **(可选) PowerShell 验证**:
   ```powershell
   Get-HcsAppliancePerfReport
   ```

### 注意事项
- 支持的虚拟化平台: Hyper-V 和 VMware ESXi
- Portal 显示容量可能略高于 local UI（预期行为）