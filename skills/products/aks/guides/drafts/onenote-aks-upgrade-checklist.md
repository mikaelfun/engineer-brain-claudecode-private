# AKS 升级注意事项与最佳实践

> **来源**: MCVKB 18.34 | 日期: 2021-12-09 (更新 2024-12-17)  
> **适用**: Mooncake AKS 所有版本

---

## 升级前检查清单

### 1. 版本选择
- 查看 [AKS Kubernetes 发布日历](https://docs.microsoft.com/zh-cn/azure/aks/supported-kubernetes-versions#aks-kubernetes-release-calendar)
- **不要跨版本升级**（如 1.18 → 1.20，应逐步升级）
- 支持策略：N-2 及以上版本在支持范围内；低于 N-3 无法获得支持
- N+2 版本 GA 后，第 N 个版本进入 EOS

### 2. 资源检查
```bash
kubectl top nodes
kubectl top pods --all-namespaces
```
- 资源占用 **>80%** → 先 `kubectl scale` 或手动 scale up 一个节点再升级

### 3. IP 地址检查（Azure CNI）
```bash
# 确认剩余 IP 数量足够（升级过程中节点 surge）
# 参考：https://docs.azure.cn/zh-cn/aks/configure-azure-cni#plan-ip-addressing-for-your-cluster
```

### 4. PodDisruptionBudget（PDB）
```bash
kubectl get poddisruptionbudgets --all-namespaces
# 如有 PDB，升级前先临时删除，升级完再恢复
```

### 5. Subscription Quota
- 确认 vCPU / 公共 IP 等 quota 足够（surge 节点需要额外资源）

### 6. Container Runtime 变更（1.19.11）
- 从 1.19.11 之前升级到 1.19.11+ → containerd 替换 Docker
- 参考：[容器运行时配置](https://docs.azure.cn/zh-cn/aks/cluster-configuration#container-runtime-configuration)

---

## 升级命令

### 单节点池集群
```bash
az aks upgrade \
  --resource-group <RG> \
  --name <ClusterName> \
  --kubernetes-version <target-version>
```

### 多节点池集群
```bash
# 1. 先升级 control plane
az aks upgrade --resource-group <RG> --name <ClusterName> \
  --kubernetes-version <target-version> --control-plane-only

# 2. 逐个升级 node pool
az aks nodepool upgrade \
  --resource-group <RG> --cluster-name <ClusterName> \
  --name <nodepoolName> --kubernetes-version <target-version>
```

---

## 升级后验证

```bash
kubectl get nodes
kubectl get pods --all-namespaces | grep -v Running
```

---

## 参考链接

- [升级 AKS 集群](https://docs.microsoft.com/zh-cn/azure/aks/upgrade-cluster)
- [升级节点池](https://docs.microsoft.com/zh-cn/azure/aks/use-multiple-node-pools#upgrade-a-node-pool)
- [AKS 支持的 Kubernetes 版本](https://docs.microsoft.com/zh-cn/azure/aks/supported-kubernetes-versions)
