# ARM Azure Stack Hub AzS Support 诊断命令 (Service Fabric) — 排查工作流

**来源草稿**: ado-wiki-a-AzsSupportComputeInfra.md, ado-wiki-a-AzsSupportCpiClusterNodeState.md (共 67 cmdlet 参考文件)
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Service Fabric 集群节点状态诊断
> 来源: ASH AzS.Support Module cmdlet 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **连接到 PEP (Privileged Endpoint)** 并导入 Azs.Support 模块
2. **检查基础设施主机状态**:
   - `Get-AzsSupportInfrastructureHost` — 获取物理主机节点信息
   - `Confirm-AzsSupportInfrastructureHost -ComputerName "Azs-Node01"` — 验证节点有效性
3. **检查计算机信息**:
   - `Get-AzsSupportComputerInformation -ComputerName "Azs-Node01"` — 收集 Uptime/OS 版本等
4. **管理 CPI 集群节点**:
   - `Set-AzsSupportCpiClusterNodeState -ComputerName "Azs-Node01" -Enable`
   - `Set-AzsSupportCpiClusterNodeState -ComputerName "Azs-Node01" -Disable`
5. **检查 Service Fabric 应用状态** — 确认关键 SF Apps 运行正常

---

## Scenario 2: 基础设施 VM 诊断
> 来源: ASH AzS.Support Module cmdlet 参考 | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. `Confirm-AzsSupportInfrastructureVM -ComputerName "AzS-ACS01"` — 验证 InfraVM 有效性
2. 检查 ECE role node 定义中的 InfraVM 列表
3. 收集日志并分析 Service Fabric 健康状态
