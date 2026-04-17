# Diagnose VM Routing Problem

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/diagnose-network-routing-problem

## 场景
VM 连接失败时，通过查看网络接口的有效路由（effective routes）诊断路由问题。

## 诊断步骤

### Azure Portal
1. 搜索 VM → Networking → Network settings → 选择网络接口
2. Help → Effective routes → 查看所有生效路由
3. 路由过多时可下载为 CSV 文件

### PowerShell
```powershell
Get-AzEffectiveRouteTable -NetworkInterfaceName "vm-nic" -ResourceGroupName "test-rg" | Format-Table
```

### Azure CLI
```bash
az network nic show-effective-route-table --name vm-nic --resource-group test-rg
```

## 常见解决方案
- 添加自定义路由覆盖 Azure 默认路由
- 修改或删除导致路由到错误位置的自定义路由
- 确保路由表关联到正确的子网
- 确保 VPN 网关或 NVA 设备正常运行（使用 Network Watcher VPN diagnostics）

## 关键注意事项
- 路由使用最长前缀匹配（LPM）
- 自定义路由将流量导向 NVA 时，必须启用 NVA 的 IP 转发
- 0.0.0.0/0 路由（强制隧道）可能导致 RDP/SSH 从互联网无法连接
- VNet Peering 路由传播可能需要几秒钟
- 多网卡 VM 中只有主网卡有默认路由

## 进阶诊断工具
- Network Watcher → Next Hop：快速确定流量的下一跳类型
- Network Watcher → Connection Troubleshoot：确定路由、过滤和 OS 级别的问题原因
