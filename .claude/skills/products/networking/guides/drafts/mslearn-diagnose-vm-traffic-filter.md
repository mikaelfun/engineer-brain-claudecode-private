# Diagnose VM Network Traffic Filter Problem

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/diagnose-network-traffic-filter-problem

## 场景
VM 无法通过特定端口（如 80）从互联网访问，需要诊断 NSG 有效安全规则。

## 诊断步骤

### Azure Portal
1. 搜索 VM → Networking → Network settings → 查看 Inbound/Outbound port rules
2. 确认关联的 NSG（subnet-level + NIC-level）
3. 选择网络接口 → Help → Effective security rules
4. 可下载 CSV 包含所有规则（Portal 只显示前 50 条）

### PowerShell
```powershell
Get-AzEffectiveNetworkSecurityGroup -NetworkInterfaceName "vm-nic" -ResourceGroupName "test-rg"
```

### Azure CLI
```bash
az network nic list-effective-nsg --name vm-nic --resource-group test-rg
```

## 解决方案模板
允许特定端口入站的 NSG 规则：
| 属性 | 值 |
|------|------|
| Source | Any |
| Source port ranges | Any |
| Destination | VM IP / 子网 |
| Destination port ranges | 80 (或目标端口) |
| Protocol | TCP |
| Action | Allow |
| Priority | 100 (低于冲突的 deny 规则) |
| Name | Allow-HTTP-All |

## 关键注意事项
- 子网和 NIC 都关联了 NSG 时，两边都必须开放端口
- 建议在子网级别关联 NSG 以简化管理
- 无 NSG 关联时所有端口默认开放（不安全）
- Service tags: VirtualNetwork 包含对等网络, Internet 包含 VNet 外所有公网 IP
- 如需不同安全策略可使用 ASG (Application Security Group)

## 进阶诊断
- Network Watcher → IP Flow Verify：检查特定流量是否被允许/拒绝
- 排除 OS 内防火墙、强制隧道等因素
