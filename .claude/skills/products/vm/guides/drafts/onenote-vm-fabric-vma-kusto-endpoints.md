---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=====1. Process=======/1.11 Fabric and VMA Kusto Query and case Study.md"
sourceUrl: null
importDate: "2026-04-04"
type: reference-guide
---

# Mooncake VM 诊断 Kusto 端点参考表

> 此文件内容来自 MCVKB 1.11，包含 Mooncake 各 VM 相关 Kusto 集群的端点、访问申请方式和示例查询。

## Kusto 端点列表

| 服务 | Endpoint | 访问申请 | 备注 |
|------|----------|---------|------|
| **ARM** | https://armmc.kusto.chinacloudapi.cn (旧) / https://armmcadx.chinaeast2.kusto.chinacloudapi.cn (新，从2022年6月起) | MyAccess: [ARM Logs](https://myaccess/identityiq/accessRequest/accessRequest.jsf#/accessRequest/review?role=ARM+Logs) | 查 ARM 操作日志 |
| **Portal** | https://azportalmc.kusto.chinacloudapi.cn | — | 门户操作日志 |
| **Compute Manager (FC)** | https://azurecmmc.kusto.chinacloudapi.cn (旧) / https://azurecm.chinanorth2.kusto.chinacloudapi.cn (新) | MyAccess: FC Log Read-Only Access - 12894 | VM 分配、容器健康状态 |
| **CRP** | https://azcrpmc.kusto.chinacloudapi.cn | MyAccess: TM-CSSMCUS-RW | Mooncake support team 默认可访问 |
| **Disk RP (Managed Disk)** | https://disksmc.kusto.chinacloudapi.cn | — | 托管磁盘相关 |
| **VMA** | https://vmainsight.kusto.windows.net:443 | IDWeb SG: VMA KustoDB User (AAD Federated) | VM 代理洞察 |
| **RDFE** | https://rdfemc.kusto.chinacloudapi.cn | MyAccess: FC Log Read-Only Access - 12894 | 经典部署模型 |
| **RDOSMC** | https://rdosmc.kusto.chinacloudapi.cn | IDWeb SG: RDOS Mooncake Kusto Viewers | RDOS 主机 OS 日志 |
| **AKS** | https://akscn.kusto.chinacloudapi.cn | MyAccess: TM-ACS-Mooncake-Viewer | AKS 集群日志 |

## 示例查询

### CRP 联合查询（ARM + Compute Manager）
```kusto
union cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests,
cluster('armmc.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
| where ...
```

### Compute Manager 容器健康快照
```kusto
union
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerHealthSnapshot,
cluster('azurecmmc.kusto.chinacloudapi.cn').database('AzureCM').LogContainerHealthSnapshot
```

## 参考

- ARM Kusto 访问指南: https://armwiki.azurewebsites.net/troubleshooting/kusto/getting_access.html#mooncake
- 原始页面包含更多 Kusto 查询样例和 case study，请参阅完整 MCVKB 页面
