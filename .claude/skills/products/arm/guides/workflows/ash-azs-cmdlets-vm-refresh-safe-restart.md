# ARM Azure Stack Hub AzS Support 诊断命令 (VM Refresh / Safe Restart) — 排查工作流

**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md 等 67 cmdlet 参考文件
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: 基础设施 VM 刷新与安全重启
> 来源: ASH AzS.Support Module cmdlet 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **验证目标 VM**: `Confirm-AzsSupportInfrastructureVM -ComputerName {name}`
2. **检查 Hyper-V 状态**: 确认 VM 在 Hyper-V 中的运行状态
3. **安全重启流程**:
   - 确认 failover cluster 状态
   - 验证其他节点可承担负载
   - 执行 safe restart/refresh 操作
4. **验证重启后状态**: 重新检查 InfraVM 和 cluster node 状态
