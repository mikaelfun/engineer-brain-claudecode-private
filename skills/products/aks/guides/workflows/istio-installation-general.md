# AKS Istio 安装与配置 — general — 排查工作流

**来源草稿**: ado-wiki-a-Istio-CNI-Plugin.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-Istio-CNI-Plugin.md | 适用: 适用范围未明确

### 排查步骤

Get the current image version used by the daemonset

```bash
kubectl get daemonset azure-service-mesh-istio-cni-addon-node -n aks-istio-system -o jsonpath='{.spec.template.spec.containers[?(@.name=="install-cni")].image}'
```

---
