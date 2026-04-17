# ARM Azure Stack Hub AzS Support 诊断命令 (Compute / Storage) — 排查工作流

**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md 等 72 cmdlet 参考文件
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: 计算资源诊断
> 来源: ASH AzS.Support Module cmdlet 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **获取主机信息**: `Get-AzsSupportInfrastructureHost`
2. **获取 VM 信息**: `Get-AzsSupportComputerInformation -ComputerName {name}`
3. **检查 CRP 集群节点状态**: `Set-AzsSupportCpiClusterNodeState`
4. **收集 Guest OS 日志**: 使用 `AzsSupportGuestLogCollection` 相关 cmdlet
5. **VM 连接诊断**: `AzsSupportVMConnect` cmdlet

---

## Scenario 2: 存储资源诊断
> 来源: ASH AzS.Support Module cmdlet 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. 使用 CSSTools 模块中的存储相关 cmdlet 收集信息
2. 检查 Blob Service、Table Service 等状态
3. 分析 NRP/KVS 资源状态: `Get-AzSSupportNrpKvsResource`
