---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=====1. Process=======/Kusto Endpoint & Permissions.md"
sourceUrl: null
importDate: "2026-04-04"
type: reference-guide
---

# Mooncake Kusto 端点与权限完整参考

> 本页为全产品 Kusto 端点参考表，含认证方式、权限申请路径和样例查询。
> 相关文档: [VM 诊断专属端点](onenote-vm-fabric-vma-kusto-endpoints.md)

## 工具入口

- **Kusto Bot (Gaia)**：检查权限 → https://aka.ms/gaia
- **Kusto Explorer 下载**：https://aka.ms/ke
- **Kusto Explorer 导入文件（All-in-one）**：[202507 1.xml](https://microsoftapc-my.sharepoint.com/:u:/g/personal/sivershi_microsoft_com/EWAjQO4CKJdIh_SWgLvHsBMB5GrNwHsLFm6e0hE_hu-htA?e=AlvAd7)
- **IDWeb**：https://aka.ms/idweb
- **MyAccess**：https://aka.ms/myaccess
- **CoreIdentity**：https://coreidentity.microsoft.com/

> ⚠️ Mooncake (kusto.chinacloudapi.cn) 端点使用 **CME** 账号认证（不需要单独申请权限）。
> VMA、ICM 等 global 端点使用 **AAD Federated** 或 **dSTS**。

## VM 相关端点

| 服务 | 端点 | 权限申请 | 备注 |
|------|------|----------|------|
| ARM | https://armmcadx.chinaeast2.kusto.chinacloudapi.cn | MyAccess: ARM Logs / Azure Standard Access | DB: armmc |
| Resource Graph | https://argmcn2arm1pone.chinanorth2.kusto.chinacloudapi.cn | — | — |
| Portal | https://azportalmc2.chinaeast2.kusto.chinacloudapi.cn | Azure Standard Runtime Access (默认) | ClientEvents, ExtEvents |
| Compute Manager | https://azurecm.chinanorth2.kusto.chinacloudapi.cn | MyAccess: FC Log Read-Only Access - 12894 | LogContainerHealthSnapshot |
| CRP | https://azcrpmc.kusto.chinacloudapi.cn | MyAccess: TM-CSSMCUS-RW | Mooncake 团队默认有访问 |
| Azure Allocator | https://azureallocatormc.chinaeast2.kusto.chinacloudapi.cn | TBD | — |
| Disk RP | https://disksmc.chinaeast2.kusto.chinacloudapi.cn | CPR MDS read only (Local domain) | — |
| VMA | https://vmainsight.kusto.windows.net:443 | IDWeb SG: VMA KustoDB User | AAD Federated |
| RDFE | https://rdfemc.kusto.chinacloudapi.cn | MyAccess: FC Log Read-Only Access - 12894 | — |
| RDOS (已退役) | https://rdosmc.kusto.chinacloudapi.cn | IDWeb SG: RDOS Mooncake Kusto Viewers | 已被 Azcore 替代 |
| Azcore (替代RDOS) | https://azcore.chinanorth3.kusto.chinacloudapi.cn | IDWeb SG: AzCore Kusto Viewers | — |
| Azure Backup/Snapshot | https://mabprodmcadx.chinaeast2.kusto.chinacloudapi.cn | IDWeb SG: CSS-Kusto-NationalCloud-Access | MABKustoProd functions |
| Azure Site Recovery | https://asradxclusmc.chinanorth2.kusto.chinacloudapi.cn | CoreIdentity: DRS_MDS_ROAccess-13982 | TelemetryPEToProvider |
| Arc enabled server | https://hcrpmc.chinaeast2.kusto.chinacloudapi.cn | IDWeb: Arc enabled servers telemetry - Mooncake RO | Mooncake VM PoD 成员免申请 |

## Monitor 相关

| 服务 | 端点 | 权限 |
|------|------|------|
| Insights/Monitoring/Autoscale | https://azureinsightsmc.chinaeast2.kusto.chinacloudapi.cn | MyAccess: AzMon Essentials Logs |
| Alerting | https://aznscluster.chinaeast2.kusto.chinacloudapi.cn | JiT access |
| Alerting (CN2) | https://azalertsmcchn2.chinanorth2.kusto.chinacloudapi.cn | MyAccess: SmartAnalyticsKusto |

**样例查询（Metric Alert）**：
```kusto
let AlertRuleID = "/subscriptions/.../metricAlerts/...";
let starttime = datetime(2023-01-15 00:00);
let endtime = datetime(2023-02-15 00:00);
['traces']
| where env_time between (starttime..endtime)
| where tostring(customDimensions.AlertRuleId) == AlertRuleID
| where operation_Name == "POST alerts/createorupdate"
| summarize arg_max(env_time,*) by operation_ParentId
```

## AKS / ACI 端点

| 服务 | 端点 | 权限 |
|------|------|------|
| ACR | https://acrmc2.chinaeast2.kusto.chinacloudapi.cn | MyAccess: ACR Kusto Access |
| AKS | https://akscn.kusto.chinacloudapi.cn 或 https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn | CoreIdentity: TM-ACS-Mooncake-Viewer |
| ACI | https://acimooncake.chinaeast2.kusto.chinacloudapi.cn | MyAccess: ACI Logs |
| Automation | https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn | SG: Redmond\OaaSKustoGovUsers |

## AAD 端点

| 服务 | 端点 | 权限 |
|------|------|------|
| EvoSTS | https://estscnn2.chinanorth2.kusto.chinacloudapi.cn | CoreIdentity: AAD eSTS Telem CSS-TA（需 M1 审批） |
| MSODS | https://msodsmooncake.chinanorth2.kusto.chinacloudapi.cn | MyAccess: AAD MSODS - MDS Table RO |
| AAD Gateway BJB | https://idsharedmcbjb.chinanorth2.kusto.chinacloudapi.cn | — |
| AAD Gateway SHA | https://idsharedmcsha.chinaeast2.kusto.chinacloudapi.cn | — |
| B2C | https://cpimmcprod2.chinanorth2.kusto.chinacloudapi.cn | CoreIdentity: CpimMC Kusto Viewers - 20902 |
| AdIbizaUx | 同 AAD Gateway | CoreIdentity: Azure Identity - 20630 |
| AIP | https://azrmsmc.kusto.chinacloudapi.cn | IDWeb SG: RmsMooncakeKustoUser |

## 其他端点

| 服务 | 端点 | 权限 |
|------|------|------|
| Service Health | https://azsh.kusto.windows.net/azshmds | 见截图 |
| ICM | https://icmcluster.kusto.windows.net | IDWeb SG: AzNS Kusto Viewers / CoreIdentity: icm-kusto-access |
| Resource Mover (MC) | https://rmskustomc.chinanorth2.kusto.chinacloudapi.cn | IDWeb: Azure Resource Mover Support Engg Team |
| AVD (MC) | https://rdskmc.chinaeast2.kusto.chinacloudapi.cn | IDWeb SG: redmond\MooncakeCSSSAVDG |
| Logic App | https://azconnectmc.chinaeast2.kusto.chinacloudapi.cn | CoreIdentity: bapi connectors kusto |
| Storage (xstore) | https://xstore.kusto.windows.net | MyAccess: XStore ShoeboxLog Access |
| Sentinel | https://securityinsightsmc.chinaeast2.kusto.chinacloudapi.cn | 见 Sentinel Kusto Permissions |
| Intune | https://intunecn.chinanorth2.kusto.chinacloudapi.cn | MyAccess: IntuneKusto-CSSMooncake |
| Rome (MDC) | https://romelogsmc.kusto.chinacloudapi.cn | MyAccess: TM-ASC-Defenders (DATA VIEWERS) |
| Grafana | https://azuregrafanamc.chinanorth3.kusto.chinacloudapi.cn | CoreIdentity: TM-GrafanaChinaTelemetry |
| Azure Linux | https://azlinux.kusto.windows.net:443 | MyAccess: AzLinux Kusto Users |
| Update Management | https://azdeployermc.kusto.chinacloudapi.cn | CME |

## Service Health 样例查询

```kusto
cluster("Azsh").database("azshmds").ResourceProviderCommonLogs
| where PreciseTimeStamp >= datetime(10/1/2019)
| where armId contains "<subscriptionId>"
| where ProviderName == 'ResourceHealthEventSource'
| where availabilityState == 'Unavailable'
| extend VMName = tostring(split(armId, "/")[8])
| extend Title = parse_json(properties).Title
| where Title == 'Remote disk disconnected'
| project TIMESTAMP, VMName, Title
```
