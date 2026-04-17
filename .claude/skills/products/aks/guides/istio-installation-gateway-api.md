# AKS Istio 安装与配置 — gateway-api -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 7
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Managed NGINX ingress with AKS App Routing add-on retiring Nov 2026; upstream In... | Upstream Ingress-NGINX open-source project retirement. Micro... | Migrate before Nov 2026: 1) Gateway API with App Routing (GA... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS Managed Gateway API 的 Gateway 资源状态显示 'Bad TLS configuration' 和 'invalid cert... | TLS Secret 必须创建在 Gateway 所在的命名空间中。如果 Secret 和 Gateway 不在同一 n... | 确保 TLS Secret 创建在 Gateway 资源所在的 namespace：kubectl -n <gatewa... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio) |
| 3 | Istio Gateway proxy pod 日志显示 'failed to warm certificate: failed to generate wor... | Istio 控制平面 istiod 的 gRPC 端口 15012 不可达，可能是 istiod pod 未正常运行、网... | 1) 检查 istiod pods 状态：kubectl get pods -n aks-istio-system；2)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio) |
| 4 | AKS Managed Gateway API 使用多个 GatewayClass-level ConfigMap 导致配置冲突或不生效 | 每个 GatewayClass 只允许一个 ConfigMap。ConfigMap 必须部署在 aks-istio-sy... | 1) 确认只有一个 GatewayClass-level ConfigMap：kubectl get configmap... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio) |
| 5 | NGINX Ingress controller (App Routing add-on) is being retired. Upstream Kuberne... | Upstream Kubernetes NGINX ingress controller project end-of-... | Microsoft supports NGINX App Routing with critical security ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FApplication%20Routing%20(nginx)%20Add-on) |
| 6 | Conflict when using Istio service mesh add-on and App Routing Gateway API Implem... | App Routing Gateway API deploys its own Istio control plane ... | Disable one before enabling the other. If migrating from Ist... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FApplication%20Routing%20Gateway%20API%20(Istio)%20Add-on) |
| 7 | Istio Gateway API ingress not receiving traffic - Azure Load Balancer health pro... | Default Azure LB health probes not configured for Istio Gate... | Add Azure LB annotations to Gateway spec: health-probe-reque... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-gateway-api) |

## Quick Troubleshooting Path

1. Check: Migrate before Nov 2026: 1) Gateway API with App Routing (GA May 2026); 2) App Gateway for Container `[source: onenote]`
2. Check: 确保 TLS Secret 创建在 Gateway 资源所在的 namespace：kubectl -n <gateway-namespace> create secret tls <name> -- `[source: ado-wiki]`
3. Check: 1) 检查 istiod pods 状态：kubectl get pods -n aks-istio-system；2) 确认 istiod service 端口 15012 正常监听；3) 检查 N `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/istio-installation-gateway-api.md)
