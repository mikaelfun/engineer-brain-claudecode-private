# AKS Istio 安装与配置 — gateway-api -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 15 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-Application-Routing-nginx.md, ado-wiki-a-Istio-Egress-Gateway.md, ado-wiki-a-Managed-Istio.md, ado-wiki-a-Managed-NAT-Gateway.md, ado-wiki-a-kubernetes-managed-gateway-api.md, ado-wiki-a-tsg-diagnosing-istio-latency.md, ado-wiki-b-apim-backend-tls-trust-failures.md, ado-wiki-c-E2E-TLS-AppGW-to-AKS-Certificate-Chain.md, ado-wiki-c-Scheduler-Customization-kube-scheduler.md, ado-wiki-c-Secure-TLS-Bootstrapping.md
**Kusto references**: api-throttling-analysis.md
**Generated**: 2026-04-07

---

## Phase 1: Upstream Ingress-NGINX open-source project retirem

### aks-104: Managed NGINX ingress with AKS App Routing add-on retiring Nov 2026; upstream In...

**Root Cause**: Upstream Ingress-NGINX open-source project retirement. Microsoft provides critical security patching through Nov 2026 only.

**Solution**:
Migrate before Nov 2026: 1) Gateway API with App Routing (GA May 2026); 2) App Gateway for Containers (GA); 3) Istio add-on (GA). Only App Routing with NGINX enabled affected.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: TLS Secret 必须创建在 Gateway 所在的命名空间中。如果 Secret 和 Gate

### aks-520: AKS Managed Gateway API 的 Gateway 资源状态显示 'Bad TLS configuration' 和 'invalid cert...

**Root Cause**: TLS Secret 必须创建在 Gateway 所在的命名空间中。如果 Secret 和 Gateway 不在同一 namespace，Gateway 无法引用到证书。

**Solution**:
确保 TLS Secret 创建在 Gateway 资源所在的 namespace：kubectl -n <gateway-namespace> create secret tls <name> --cert=<cert-file> --key=<key-file>。使用 kubectl describe gateway <name> 检查 ResolvedRefs 和 Programmed 条件确认修复。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio)]`

## Phase 3: Istio 控制平面 istiod 的 gRPC 端口 15012 不可达，可能是 istiod p

### aks-521: Istio Gateway proxy pod 日志显示 'failed to warm certificate: failed to generate wor...

**Root Cause**: Istio 控制平面 istiod 的 gRPC 端口 15012 不可达，可能是 istiod pod 未正常运行、网络策略阻止了流量、或 istiod 正在重启中。

**Solution**:
1) 检查 istiod pods 状态：kubectl get pods -n aks-istio-system；2) 确认 istiod service 端口 15012 正常监听；3) 检查 NetworkPolicy 是否阻止了 gateway pod 到 istiod 的连接；4) 查看 istiod 日志排查根因：kubectl logs -n aks-istio-system -l app=istiod。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio)]`

## Phase 4: 每个 GatewayClass 只允许一个 ConfigMap。ConfigMap 必须部署在 ak

### aks-522: AKS Managed Gateway API 使用多个 GatewayClass-level ConfigMap 导致配置冲突或不生效

**Root Cause**: 每个 GatewayClass 只允许一个 ConfigMap。ConfigMap 必须部署在 aks-istio-system 命名空间，且必须包含 label gateway.istio.io/defaults-for-class=istio。安装 Managed Gateway CRD 后 ConfigMap 可能需要 ~5 分钟才能自动部署。

**Solution**:
1) 确认只有一个 GatewayClass-level ConfigMap：kubectl get configmap -n aks-istio-system -l gateway.istio.io/defaults-for-class=istio；2) 删除多余的 ConfigMap；3) 如需 Gateway-level 自定义，使用 spec.infrastructure.parametersRef 引用单独的 ConfigMap，Gateway-level 配置优先于 GatewayClass-level。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio)]`

## Phase 5: Upstream Kubernetes NGINX ingress controller proje

### aks-652: NGINX Ingress controller (App Routing add-on) is being retired. Upstream Kuberne...

**Root Cause**: Upstream Kubernetes NGINX ingress controller project end-of-life. No more security or bug fixes from upstream.

**Solution**:
Microsoft supports NGINX App Routing with critical security fixes until November 2026. Migration options: 1) App Routing Gateway API (meshless Istio) - Preview March 2026, GA May 2026. 2) Application Gateway for Containers - GA now, supports Ingress + Gateway API. 3) Istio add-on - Ingress GA, Gateway API Preview (GA targeted May 2026).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FApplication%20Routing%20(nginx)%20Add-on)]`

## Phase 6: App Routing Gateway API deploys its own Istio cont

### aks-668: Conflict when using Istio service mesh add-on and App Routing Gateway API Implem...

**Root Cause**: App Routing Gateway API deploys its own Istio control plane (non-revisioned, gatewayClassName: approuting-istio, controller: istio.aks.azure.com/gateway-controller) that conflicts with the Istio add-on (revisioned, gatewayClassName: istio, controller: istio.io/gateway-controller). They cannot coexist.

**Solution**:
Disable one before enabling the other. If migrating from Istio add-on to App Routing Gateway API: 1) Clean up all Istio CRDs and resources from prior installation. 2) Update gatewayClassName from 'istio' to 'approuting-istio'. 3) Remove revision labels (istio.io/rev=<asm-revision>). Verify via ASI or Kusto query that approuting-istio is enabled.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FApplication%20Routing%20Gateway%20API%20(Istio)%20Add-on)]`

## Phase 7: Default Azure LB health probes not configured for 

### aks-1231: Istio Gateway API ingress not receiving traffic - Azure Load Balancer health pro...

**Root Cause**: Default Azure LB health probes not configured for Istio Gateway API deployment; health probe path/port/protocol mismatch

**Solution**:
Add Azure LB annotations to Gateway spec: health-probe-request-path=/healthz/ready, probe_protocol=http, probe_port=15021; or customize via GatewayClass/Gateway ConfigMap

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-gateway-api)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Managed NGINX ingress with AKS App Routing add-on retiring Nov 2026; upstream In... | Upstream Ingress-NGINX open-source project retirement. Micro... | Migrate before Nov 2026: 1) Gateway API with App Routing (GA... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS Managed Gateway API 的 Gateway 资源状态显示 'Bad TLS configuration' 和 'invalid cert... | TLS Secret 必须创建在 Gateway 所在的命名空间中。如果 Secret 和 Gateway 不在同一 n... | 确保 TLS Secret 创建在 Gateway 资源所在的 namespace：kubectl -n <gatewa... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio) |
| 3 | Istio Gateway proxy pod 日志显示 'failed to warm certificate: failed to generate wor... | Istio 控制平面 istiod 的 gRPC 端口 15012 不可达，可能是 istiod pod 未正常运行、网... | 1) 检查 istiod pods 状态：kubectl get pods -n aks-istio-system；2)... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio) |
| 4 | AKS Managed Gateway API 使用多个 GatewayClass-level ConfigMap 导致配置冲突或不生效 | 每个 GatewayClass 只允许一个 ConfigMap。ConfigMap 必须部署在 aks-istio-sy... | 1) 确认只有一个 GatewayClass-level ConfigMap：kubectl get configmap... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2Fmanaged%20gateway%20api%20istio) |
| 5 | NGINX Ingress controller (App Routing add-on) is being retired. Upstream Kuberne... | Upstream Kubernetes NGINX ingress controller project end-of-... | Microsoft supports NGINX App Routing with critical security ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FApplication%20Routing%20(nginx)%20Add-on) |
| 6 | Conflict when using Istio service mesh add-on and App Routing Gateway API Implem... | App Routing Gateway API deploys its own Istio control plane ... | Disable one before enabling the other. If migrating from Ist... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FApplication%20Routing%20Gateway%20API%20(Istio)%20Add-on) |
| 7 | Istio Gateway API ingress not receiving traffic - Azure Load Balancer health pro... | Default Azure LB health probes not configured for Istio Gate... | Add Azure LB annotations to Gateway spec: health-probe-reque... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-gateway-api) |
