# ACI 排查关键术语

> 来源：ADO Wiki `/Azure Kubernetes Service Wiki/ACI/ACI Terminologies for Troubleshooting`
> 提取时间：2026-04-04

## Container Group（CG）

Container Group 是调度在同一台主机上的一组容器集合，共享生命周期、资源、本地网络和存储卷。概念上类似 Kubernetes 中的 Pod。

**获取 CG Name**：客户提供完整资源 URI，或从 Portal → 资源概览页面获取。

格式示例：
```
/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.ContainerInstance/containerGroups/<cg-name>
```

## Cluster Deployment Name（caas 名称）

Cluster Deployment 是 Container Group 的活跃实例。**查询后端执行集群日志必须提供 caas-xxx 名称**，因为执行集群日志不存储 correlation ID。

### 方法一：Kusto Helper

1. 打开 [Kusto Helper](https://portal.microsoftgeneva.com/dashboard/ACC/Kusto%20Helper?overrides=...)
2. 填入正确的 `SubscriptionId`、`resourceGroup`、`containerGroup`
3. 从 `subscription Deployments` widget 中读取 Cluster Deployment name

### 方法二：Kusto 查询

```kusto
let BT = datetime(YYYY-MM-DD);
let ET = datetime(YYYY-MM-DD);
let resURI = '/subscriptions/<sub-id>/resourcegroups/<rg>/providers/Microsoft.ContainerInstance/containerGroups/<cg-name>';
// 查询 SubscriptionDeployments 表过滤 resourceUri
```

> **注意**：同一时间只有一个活跃的 Cluster Deployment，确保 caas 名称对应客户问题发生的时间戳。

## 关键诊断要点

| 概念 | 说明 |
|------|------|
| CG Name | ARM 资源名，Portal 可见 |
| caas name | 后端执行实例名（caas-xxx），查后端日志必需 |
| correlation ID | 执行集群日志**不存储** correlation ID |
| Kusto 主表 | `SubscriptionDeployments` |
