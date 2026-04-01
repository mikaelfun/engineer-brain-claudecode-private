# AKS 产品排查 Skill

> 覆盖 Azure Kubernetes Service、AKS Arc、AKS on Azure Stack HCI。

## 1. 诊断层级架构

```
Layer 1: AKS Front-End
  ├─ 集群: mcakshuba / AKSprod
  ├─ 关键表: FrontEndQoSEvents, FrontEndContextActivity, IncomingRequestTrace
  └─ 提取: operationId, ccpNamespace

Layer 2: AKS Async Processing
  ├─ 集群: mcakshuba / AKSprod
  ├─ 关键表: AsyncQoSEvents, AsyncContextActivity, RemediatorEvent
  └─ 提取: 详细错误, underlay 信息

Layer 3: AKS Control Plane (CCP)
  ├─ 集群: mcakshuba / AKSccplogs
  ├─ 关键表: KubeAudit, KubeControllerManager, ClusterAutoscaler, ControlPlaneEvents
  └─ 提取: K8s 事件, 调度决策

Layer 4: CRP (如涉及 VMSS/Node)
  ├─ 集群: azcrpmc / crp_allmc
  └─ 参见 VM 产品 skill

Layer 5: Fabric (如涉及节点硬件)
  ├─ 集群: azurecm / azurecm
  └─ 参见 VM 产品 skill
```

## 2. 决策树

### 集群创建/升级失败
```
AKS 操作失败
  ├─→ FE 查 FrontEndQoSEvents → httpStatusCode + errorCode
  │     ├─ 4xx 错误 → 客户端问题（参数/权限/quota）
  │     └─ 5xx 错误 → 服务端问题 → Async 层继续
  ├─→ Async 查 AsyncQoSEvents → 详细错误
  │     ├─ VMSS 相关 → 转 CRP 层查 ApiQosEvent
  │     ├─ SubnetFull → 建议扩大子网
  │     └─ QuotaExceeded → 提 quota
  └─→ ADO Wiki: "AKS {errorCode}"
```

### 节点 NotReady
```
节点 NotReady
  ├─→ CCP 查 ControlPlaneEvents → 节点状态事件
  ├─→ CCP 查 KubeControllerManager → NodeLifecycle 事件
  ├─→ AKSprod 查 BlackboxMonitoringActivity → 连通性
  └─→ 如果是硬件问题 → 转 VM 产品 skill
```

### Cluster Autoscaler 问题
```
扩缩容异常
  ├─→ CCP 查 ClusterAutoscaler → 扩缩容决策日志
  ├─→ AKSprod 查 ManagedClusterSnapshot → autoscaler 配置
  └─→ 如果 VMSS scale-out 失败 → 转 CRP 层 AllocationFailed 流程
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/aks/` (2 DB: AKSprod, AKSccplogs)
- **ADO Wiki**: org=msazure, 搜索 "AKS {topic}"
- **ICM**: 检查 AKS 服务 outage
- **msft-learn**: AKS troubleshooting 文档

## 4. Kusto 数据库地图

| 数据库 | 集群 | 表数 | 核心用途 |
|--------|------|------|---------|
| AKSprod | mcakshuba.chinaeast2 | 18 | FE/Async 操作、集群快照 |
| AKSccplogs | mcakshuba.chinaeast2 | 6 | K8s 控制面日志 |

## 5. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| CreateOrUpdate 409 | 并发操作冲突 | 等待前一操作完成后重试 |
| SubnetFull | 子网 IP 用完 | 扩大子网或清理未使用的 IP |
| ERR_OOMS_NO_OPERATION_STATE | 异步操作状态丢失 | 通常是暂时性，重试 |
| Node NotReady - NetworkPluginError | CNI 配置异常 | 检查子网/NSG/CNI 版本 |
| Cluster stuck "Updating" | 升级过程卡住 | 查 Async 层找具体阶段 |
