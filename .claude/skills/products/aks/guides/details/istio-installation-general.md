# AKS Istio 安装与配置 — general -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-Istio-CNI-Plugin.md
**Generated**: 2026-04-07

---

## Phase 1: The istio-init container requires elevated privile

### aks-537: Istio add-on sidecar containers (istio-init, istio-proxy) flagged as non-complia...

**Root Cause**: The istio-init container requires elevated privileges (NET_ADMIN, NET_RAW capabilities, runAsUser=0) for iptables traffic interception rules, which conflicts with Pod Security Standards 'restricted' enforcement and Azure Policy requirements.

**Solution**:
1) PG is working on a fix (track via ICM 651225361); 2) Temporary workaround for Pod Security Standards: change namespace annotation from 'enforce: restricted' to 'enforce: privileged'; 3) Consider enabling Istio CNI plugin to eliminate the need for elevated privileges in istio-init: az aks mesh enable-ingress-gateway --resource-group $RG --name $CLUSTER. Reference: https://istio.io/latest/docs/setup/additional-setup/cni/

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FIstio%20add%20on%20sidecar%20incompatible%20with%20azure%20policies)]`

## Phase 2: The istio-init container runs as root (UID 0) whic

### aks-538: Azure Policy reports Istio add-on sidecar container istio-init as non-compliant:...

**Root Cause**: The istio-init container runs as root (UID 0) which violates Azure Policy constraints requiring containers to run as non-root users.

**Solution**:
1) By default Azure Policy effect is 'Audit' so pods are still created but shown as non-compliant; 2) To suppress non-compliance events, exclude Istio-injected namespaces from the Azure Policy assignment; 3) Long-term fix: enable Istio CNI plugin which eliminates the need for istio-init to run as root. Reference: https://istio.io/latest/docs/setup/additional-setup/cni/#installing-the-cni-node-agent

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2FIstio%20add%20on%20sidecar%20incompatible%20with%20azure%20policies)]`

## Phase 3: Envoy adds the Server header after Lua filters exe

### aks-630: Customer attempts to remove server response headers using Envoy Lua filters in A...

**Root Cause**: Envoy adds the Server header after Lua filters execute. Azure Managed Istio denylists EnvoyFilter and WasmPlugin resources, preventing customers from applying advanced configurations to strip the header.

**Solution**:
Create an IcM with PG to request whitelisting of envoy filters for the specific user subscription. Upon approval, PG can activate the Envoy filter toggle for the AKS cluster. Note: Envoy filters in Azure Managed Istio are not GA or officially supported; support is best-effort only.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FEnvoy_filters_Constraints_in_Azure_managed_Istio)]`

## Phase 4: Client app creates new API server watch connection

### aks-1134: API server overloaded with TCP timeouts - application or third-party tool (e.g. ...

**Root Cause**: Client app creates new API server watch connections on each internal secret read (e.g. Istio mixer bug), accumulating connections that overload API server

**Solution**:
Use watches instead of frequent GET calls; fix application bugs that leak watch connections (e.g. upgrade Istio); monitor API server request rates

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server)]`

## Phase 5: Static Egress Gateway is not supported on Azure CN

### aks-1229: Istio add-on egress gateway cannot be used on cluster

**Root Cause**: Static Egress Gateway is not supported on Azure CNI Pod Subnet clusters

**Solution**:
Use a different CNI configuration (not Azure CNI Pod Subnet); verify cluster CNI plugin type before enabling Istio egress gateway

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-egress-gateway)]`

## Phase 6: StaticGatewayConfiguration does not have egressIpP

### aks-1230: Istio egress gateway pods stuck in ContainerCreating state

**Root Cause**: StaticGatewayConfiguration does not have egressIpPrefix assigned yet; kube-egress-gateway-cni-manager blocks istio-proxy creation until IP prefix provisioned (up to 5 min)

**Solution**:
Check StaticGatewayConfiguration status for egressIpPrefix; wait up to 5 min; verify gatewayNodepoolName references valid Gateway mode agent pool; check kube-egress-gateway-cni-manager logs

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-egress-gateway)]`

## Phase 7: Conflicting extension (e.g. Open Service Mesh) ena

### aks-1234: Istio add-on error: Istio based Azure service mesh is incompatible with feature

**Root Cause**: Conflicting extension (e.g. Open Service Mesh) enabled alongside Istio add-on

**Solution**:
Disable the conflicting feature and clean up corresponding resources before enabling Istio add-on

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-general-troubleshooting)]`

## Phase 8: Istiod control plane not ready (ingress gateway de

### aks-1235: Istio ingress gateway pod crashes or not ready

**Root Cause**: Istiod control plane not ready (ingress gateway depends on istiod); or gateway selector not matching correct label

**Solution**:
Verify istiod pod ready first; set correct gateway selector: istio: aks-istio-ingressgateway-external or internal; check Helm releases in aks-istio-ingress namespace

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-ingress-gateway)]`

## Phase 9: Istio CNI DaemonSet not properly provisioned - CNI

### aks-1227: Istio CNI enabled but istio-init containers still injected into new pods, CNI no...

**Root Cause**: Istio CNI DaemonSet not properly provisioned - CNI plugin installation failures, network config errors, or node taints preventing CNI pod scheduling

**Solution**:
Verify CNI DaemonSet running on all nodes: kubectl get daemonset azure-service-mesh-istio-cni-addon-node -n aks-istio-system; check DaemonSet pod logs for errors; verify node taints/tolerations allow CNI pod scheduling

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-cni-troubleshooting)]`

## Phase 10: CNI traffic redirection setup failed - istio-valid

### aks-1228: Istio CNI enabled but pods fail to start with connection refused error in istio-...

**Root Cause**: CNI traffic redirection setup failed - istio-validation container detects that iptables rules were not properly configured by CNI plugin

**Solution**:
Check istio-validation logs: kubectl logs POD -c istio-validation; verify CNI DaemonSet is healthy; check pod events for network setup failures

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/istio-add-on-cni-troubleshooting)]`

---

## Known Issues Quick Reference

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
