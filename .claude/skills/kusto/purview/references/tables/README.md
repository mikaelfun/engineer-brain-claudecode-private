# Purview/RMS Kusto 表参考

本目录包含 Azure Purview、Azure RMS (Azure Information Protection) 相关的 Kusto 表定义。

## 表索引

### Azure RMS MC 集群 (azrms 数据库)

| 表名 | 用途 | 文档 |
|------|------|------|
| IFxRequestLogEvent | MIP/AIP 请求日志（加密、解密、预授权等） | [📄](./IFxRequestLogEvent.md) |
| IFxTrace | RMS 跟踪日志 | [📄](./IFxTrace.md) |
| IFxScenarioLogEvent | RMS 场景日志 | [📄](./IFxScenarioLogEvent.md) |

### ESTS MC 集群 (ESTS 数据库)

| 表名 | 用途 | 文档 |
|------|------|------|
| PerRequestTableIfx | AAD 登录请求（用于 RMS 认证） | [📄](./PerRequestTableIfx.md) |
| DiagnosticTracesIfx | 诊断跟踪日志（AAD 错误详情） | [📄](./DiagnosticTracesIfx.md) |

## 集群信息

| 集群名称 | URI | 数据库 |
|----------|-----|--------|
| Azure RMS MC | https://azrmsmc.kusto.chinacloudapi.cn | azrms |
| ESTS MC | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn | ESTS |

详见: [kusto_clusters.csv](../kusto_clusters.csv)

## 访问权限

- CME 卡有直接访问权限
- 需要 Azure Information Protection 相关支持权限

## 其他可用表 (azrms 数据库)

以下表也存在于 azrms 数据库，可用于深度诊断：

| 表名 | 用途 |
|------|------|
| IFxCacheLog | RMS 缓存日志 |
| IFxScenarioTraces | 场景跟踪日志 |
| IISLogs | IIS 访问日志 |
| IISErrorLogs | IIS 错误日志 |
| IdSni2DiagnosticsEvent | SNI 诊断事件 |
| IdSni2AuthorizationEvent | SNI 授权事件 |
| IdSni2PolicyIssuerEvent | SNI 策略颁发者事件 |
| IdSni2CertificateEvent | SNI 证书事件 |
| IdSni2PolicyListEvent | SNI 策略列表事件 |
