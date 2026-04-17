---
source: onenote
sourceRef: "MCVKB/Net/=======8.AKS=======/8.1[AKS]How to enable the CoreDNS log for diagnose.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# AKS CoreDNS 日志启用指南

AKS 1.12.4 起默认使用 CoreDNS 替代 KubeDNS，日志功能默认关闭（性能考虑）。排查 DNS 问题时可临时启用。

> ⚠️ 诊断完成后务必关闭日志，开启日志对性能影响显著。

## 步骤

### 1. 创建 coredns-custom ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: coredns-custom
  namespace: kube-system
data:
  test.override: |
    log
```

### 2. 应用配置（删除旧 ConfigMap，重建）

```bash
kubectl --namespace kube-system delete configmap coredns-custom
kubectl --namespace kube-system create -f coredns-custom.yaml
kubectl --namespace kube-system describe configmap coredns-custom
```

### 3. 重启 CoreDNS Pod 使配置生效

```bash
kubectl --namespace kube-system delete pod <coredns-pod-name>
```

Pod 会自动重建。

### 4. 查看日志

```bash
kubectl --namespace kube-system logs <new-coredns-pod-name>
```

## 注意事项

- 此操作适用于 AKS 1.12.4+（CoreDNS 版本）
- 日志开启后每条 DNS 查询都会记录，生产环境请谨慎并尽快关闭
- 关闭方法：将 ConfigMap 中的 `log` 行删除并重建，然后重启 CoreDNS pod
