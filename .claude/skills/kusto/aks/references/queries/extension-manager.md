---
name: extension-manager
description: Extension Manager 扩展管理器日志查询
tables:
  - ExtensionManagerConfigAgentTraces
  - ManagedClusterSnapshot
parameters:
  - ccpNamespace: CCP Namespace
  - starttime: 开始时间
  - endtime: 结束时间
---

# Extension Manager 扩展管理器日志

## 用途

查询 AKS 扩展 (Extensions) 的配置代理日志，用于诊断 Flux、Azure Policy 等扩展问题。

## 使用场景

1. **扩展安装失败** - 诊断扩展部署问题
2. **Flux GitOps 问题** - 分析 GitOps 配置错误
3. **Azure Policy 问题** - 诊断策略应用失败

## 查询 1: 检查扩展状态 (从 ManagedClusterSnapshot)

```kql
let queryCcpNamespace = '{ccpNamespace}';
ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where cluster_id == queryCcpNamespace
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on ( 
    project extAddonName = tostring(extensionAddonProfiles.name), 
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
| project extAddonName, ProvisionStatus
```

## 查询 2: 扩展错误日志汇总

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryNamespace = '{ccpNamespace}';
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryNamespace
| where container != "msi-adapter"
| where LogLevel != "Information"
| extend msg = iff(Message != "na", Message, log)
| extend msg = replace_regex(msg, "^\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2} ", "")
| project PreciseTimeStamp, msg, LogLevel, container, pod
| summarize count=count() by binTime=bin(PreciseTimeStamp, 30m), msg, LogLevel, container, pod
| project binTime, LogLevel, count, msg, container, pod
| order by binTime desc, count desc 
```

## 查询 3: Flux 扩展日志

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryNamespace = '{ccpNamespace}';
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryNamespace
| where container has "flux"
| where LogLevel in ("Warning", "Error")
| project PreciseTimeStamp, LogLevel, Message, log, container, pod
| order by PreciseTimeStamp desc
```

## 查询 4: Azure Policy 扩展日志

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryNamespace = '{ccpNamespace}';
ExtensionManagerConfigAgentTraces
| where PreciseTimeStamp between(queryFrom .. queryTo)
| where namespace == queryNamespace
| where container has "policy" or container has "gatekeeper"
| where LogLevel in ("Warning", "Error")
| project PreciseTimeStamp, LogLevel, Message, log, container, pod
| order by PreciseTimeStamp desc
```

## 常见扩展容器

| 扩展 | 容器名称模式 |
|------|------------|
| Flux (GitOps) | flux-*, source-controller, kustomize-controller |
| Azure Policy | gatekeeper-*, azure-policy-* |
| Dapr | dapr-*, daprd |
| Key Vault | secrets-store-* |

## 注意事项

- 需要先获取 CCP Namespace
- 过滤掉 `msi-adapter` 容器可以减少噪音
- `LogLevel` 通常为 Information/Warning/Error
