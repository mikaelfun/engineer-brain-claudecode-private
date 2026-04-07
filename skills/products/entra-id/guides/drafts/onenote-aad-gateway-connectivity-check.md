# AAD Gateway Connectivity Troubleshooting

## 概述
当 AAD Connect 或其他服务连接 Azure AD 出现网络连通性问题时，可通过 AAD Gateway Kusto 日志排查请求是否到达 AAD GW。

## Kusto 查询方法

### 1. 查询 AllRequestSummaryEvents
```kusto
// Cluster: idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn
// Database: AADGatewayProd
AllRequestSummaryEvents
| where env_time > ago(1d)
| where TargetTenantId contains "xxx"  // 替换为目标租户 ID
| project env_time, env_cloud_roleInstance, AdditionalParameters, ClientRequestId,
          GatewayRequestId, OriginalHost, TargetHost, IncomingUrl, StatusCode,
          HostConfigIdentifier, TargetRequestId, TargetTenantId, ResponseHeaders,
          AttemptedTargetData, callerIpAddress, SourceMoniker, SourceNamespace
| take 100
```

**注意**: callerIpAddress 列已做 hash 处理，无法直接看到客户端公网 IP。

### 2. 通过 ClientIPEvent 关联真实 IP
使用 GwRequestId 在 Jarvis log（ClientIPEvent 表）中关联，可获取真实客户端 IP。

### 3. 确认请求是否到达 AAD GW
- 如果 Jarvis 日志中未看到来自客户 IP 的请求 → 中间网络连通性问题（ISP/GFW/WAN 设备）
- 如果有请求但返回错误 → AAD 服务端问题

## 常见场景
- **Global on-prem AADC → China Azure AD**: 可能被 GFW 阻断
  - 参考: https://learn.microsoft.com/en-us/azure/virtual-wan/interconnect-china
- **WAN 设备过载**: 某些时段阻断请求

## Kusto 权限申请
- TSG: https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/7185/Gateway-Kusto-Clusters

## 21v 适用性
主要用于排查 China Azure AD (Mooncake) 环境的连接问题。
