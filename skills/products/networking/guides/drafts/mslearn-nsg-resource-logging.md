# NSG Resource Logging

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-nsg-manage-log

## 概述
NSG 资源日志包含两类：Event（基于 MAC 地址的规则应用记录）和 Rule Counter（每 300 秒汇总的规则命中计数）。仅支持 ARM 部署模型。

## 启用方式

### Azure Portal
1. 搜索 Network Security Groups → 选择 NSG
2. Monitoring → Diagnostic settings → Add diagnostic setting
3. 选择日志类别（allLogs 或单独类别）
4. 选择目标：Log Analytics / Storage Account / Event Hub / Partner

### PowerShell
```powershell
$Nsg = Get-AzNetworkSecurityGroup -Name myNsg -ResourceGroupName myResourceGroup
$Oms = Get-AzOperationalInsightsWorkspace -ResourceGroupName myWorkspaces -Name myWorkspace
New-AzDiagnosticSetting -Name myDiagnosticSetting -ResourceId $Nsg.Id -WorkspaceId $Oms.ResourceId
```

### Azure CLI
```bash
az monitor diagnostic-settings create \
  --name myNsgDiagnostics \
  --resource $nsgId \
  --logs '[{"category":"NetworkSecurityGroupEvent","enabled":true,"retentionPolicy":{"days":30,"enabled":true}},{"category":"NetworkSecurityGroupRuleCounter","enabled":true,"retentionPolicy":{"days":30,"enabled":true}}]' \
  --workspace myWorkspace --resource-group myWorkspaces
```

## 日志目标
- Log Analytics workspace（推荐，可用 NSG Analytics 方案）
- Azure Storage（写入 PT1H.json 文件）
- Event Hub
- Partner integrations

## 日志格式

### Event 日志
记录 NSG 规则在 VM 上的应用（按 MAC 地址），包含：subnetPrefix, macAddress, primaryIPv4Address, ruleName, direction, priority, type, conditions

### Rule Counter 日志
记录规则匹配连接数：matchedConnections 字段

## 注意事项
- 源 IP 不在 NSG 日志中记录 → 需启用 VNet Flow Logs 获取完整 IP 流量
- NSG Flow Logs 将于 2027-09-30 退役，建议迁移到 VNet Flow Logs
- 可用 Traffic Analytics 分析流量数据
