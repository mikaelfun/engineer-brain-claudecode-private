# AKS Istio 安装与配置 — general -- Quick Reference

**Sources**: 2 | **21V**: All | **Entries**: 10
**Last updated**: 2026-04-06

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Istio add-on sidecar containers (istio-init, istio-proxy) flagged as non-complia... | The istio-init container requires elevated privileges (NET_A... | 1) PG is working on a fix (track via ICM 651225361); 2) Temp... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FIstio%20add%20on%20sidecar%20incompatible%20with%20azure%20policies) |
| 2 | Azure Policy reports Istio add-on sidecar container istio-init as non-compliant:... | The istio-init container runs as root (UID 0) which violates... | 1) By default Azure Policy effect is 'Audit' so pods are sti... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FIstio%20add%20on%20sidecar%20incompatible%20with%20azure%20policies) |
| 3 | Customer attempts to remove server response headers using Envoy Lua filters in A... | Envoy adds the Server header after Lua filters execute. Azur... | Create an IcM with PG to request whitelisting of envoy filte... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FEnvoy_filters_Constraints_in_Azure_managed_Istio) |
| 4 | API server overloaded with TCP timeouts - application or third-party tool (e.g. ... | Client app creates new API server watch connections on each ... | Use watches instead of frequent GET calls; fix application b... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server) |
| 5 | Istio add-on egress gateway cannot be used on cluster | Static Egress Gateway is not supported on Azure CNI Pod Subn... | Use a different CNI configuration (not Azure CNI Pod Subnet)... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-egress-gateway) |
| 6 | Istio egress gateway pods stuck in ContainerCreating state | StaticGatewayConfiguration does not have egressIpPrefix assi... | Check StaticGatewayConfiguration status for egressIpPrefix; ... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-egress-gateway) |
| 7 | Istio add-on error: Istio based Azure service mesh is incompatible with feature | Conflicting extension (e.g. Open Service Mesh) enabled along... | Disable the conflicting feature and clean up corresponding r... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-general-troubleshooting) |
| 8 | Istio ingress gateway pod crashes or not ready | Istiod control plane not ready (ingress gateway depends on i... | Verify istiod pod ready first; set correct gateway selector:... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-ingress-gateway) |
| 9 | Istio CNI enabled but istio-init containers still injected into new pods, CNI no... | Istio CNI DaemonSet not properly provisioned - CNI plugin in... | Verify CNI DaemonSet running on all nodes: kubectl get daemo... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-cni-troubleshooting) |
| 10 | Istio CNI enabled but pods fail to start with connection refused error in istio-... | CNI traffic redirection setup failed - istio-validation cont... | Check istio-validation logs: kubectl logs POD -c istio-valid... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-cni-troubleshooting) |

## Quick Troubleshooting Path

1. Check: 1) PG is working on a fix (track via ICM 651225361); 2) Temporary workaround for Pod Security Standa `[source: ado-wiki]`
2. Check: 1) By default Azure Policy effect is 'Audit' so pods are still created but shown as non-compliant; 2 `[source: ado-wiki]`
3. Check: Create an IcM with PG to request whitelisting of envoy filters for the specific user subscription `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/istio-installation-general.md)
