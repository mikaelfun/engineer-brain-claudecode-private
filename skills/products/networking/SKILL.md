# Networking 产品排查 Skill

> 覆盖 VPN Gateway、ExpressRoute、Application Gateway、NSG、NIC、VNet。

## 1. 诊断层级

```
Layer 1: Network MDS
  ├─ 集群: aznwchinamc.chinanorth2 / aznwmds
  ├─ 关键表: TunnelEventsTable, GatewayTenantHealth, CircuitTable
  └─ 用途: VPN/ER/AppGw 遥测

Layer 2: Resource Graph
  ├─ 集群: argmcn2nrpone.chinanorth2 / AzureResourceGraph
  └─ 用途: 资源拓扑查询（VNet/Subnet/NIC/NSG）

Layer 3: NMAgent
  ├─ 集群: aznwchinamc.chinanorth2 / aznwmds
  └─ 关键表: NMAgentCriticalErrorFifteenMinuteTable
```

## 2. 决策树

### VPN 连接断开
```
VPN 断连
  ├─→ TunnelEventsTable → Tunnel 状态变化
  ├─→ GatewayTenantHealth → Gateway 健康状态
  ├─→ 分析断连原因（IKE 协商失败 / 对端不可达 / SA 过期）
  └─→ msft-learn: "VPN Gateway troubleshoot"
```

### ExpressRoute 问题
```
ER 故障
  ├─→ CircuitTable → Circuit 状态
  ├─→ DeviceStatic / DeviceIpInterface → 物理设备状态
  └─→ ADO Wiki: "ExpressRoute {symptom}"
```

### Application Gateway 5xx
```
AppGw 返回 5xx
  ├─→ ApplicationGatewaysExtendedLatestProd → 配置快照
  ├─→ 分析 backend health
  └─→ msft-learn: "Application Gateway troubleshoot 502"
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/networking/` (2 DB: aznwmds, AzureResourceGraph)
- **ADO Wiki**: "VPN", "ExpressRoute", "AppGw"
- **ARG 查询**: 资源拓扑关系

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| VPN Tunnel Down | IKE 协商失败 | 检查 PSK、加密算法匹配 |
| ER Circuit Down | 物理链路故障 | 联系 ISP / 检查 peering 配置 |
| AppGw 502 | Backend unhealthy | 检查 backend pool 健康探测 |
| NSG 阻断流量 | 规则优先级 | 使用 NSG flow log 诊断 |
