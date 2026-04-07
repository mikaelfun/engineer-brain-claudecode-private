# Mooncake Kusto Endpoints Reference

## ARM
| Endpoint | Access |
|----------|--------|
| `armmc.kusto.chinacloudapi.cn` (legacy) | MyAccess: ARM Logs |
| `armmcadx.chinaeast2.kusto.chinacloudapi.cn` (new, from Jun 8th) | MyAccess: ARM Logs |

**Sample query:**
```kql
union cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests,
cluster('armmc.kusto.chinacloudapi.cn').database('armmc').HttpIncomingRequests
```

**Reference:** https://armwiki.azurewebsites.net/troubleshooting/kusto/getting_access.html#mooncake

## Portal
| Endpoint | Access |
|----------|--------|
| `azportalmc.kusto.chinacloudapi.cn` | — |

## Compute Manager (AzureCM)
| Endpoint | Access |
|----------|--------|
| `azurecmmc.kusto.chinacloudapi.cn` (legacy) | MyAccess: FC Log Read-Only Access - 12894 |
| `azurecm.chinanorth2.kusto.chinacloudapi.cn` (new) | MyAccess: FC Log Read-Only Access - 12894 |

**Sample query:**
```kql
union
cluster('azurecm.chinanorth2.kusto.chinacloudapi.cn').database('azurecm').LogContainerHealthSnapshot,
cluster('azurecmmc.kusto.chinacloudapi.cn').database('AzureCM').LogContainerHealthSnapshot
```

## CRP
| Endpoint | Access |
|----------|--------|
| `azcrpmc.kusto.chinacloudapi.cn` | MyAccess: TM-CSSMCUS-RW (default for Mooncake support) |

## Disk RP (Managed Disk)
| Endpoint | Access |
|----------|--------|
| `disksmc.kusto.chinacloudapi.cn` | — |

## VMA
| Endpoint | Access |
|----------|--------|
| `vmainsight.kusto.windows.net:443` | IDWeb SG: VMA KustoDB User (AAD Federated) |

## RDFE
| Endpoint | Access |
|----------|--------|
| `rdfemc.kusto.chinacloudapi.cn` | MyAccess: FC Log Read-Only Access - 12894 |

## RDOS
| Endpoint | Access |
|----------|--------|
| `rdosmc.kusto.chinacloudapi.cn` | IDWeb SG: RDOS Mooncake Kusto Viewers |

## AKS
| Endpoint | Access |
|----------|--------|
| `akscn.kusto.chinacloudapi.cn` | MyAccess: TM-ACS-Mooncake-Viewer |

## ACI (Azure Container Instances)
| Endpoint | Access |
|----------|--------|
| `accprod.kusto.windows.net:443` | MyAccess: ACI logs |

## Source
- MCVKB 8.8 "Fabric and VMA Kusto Query and case Study"
