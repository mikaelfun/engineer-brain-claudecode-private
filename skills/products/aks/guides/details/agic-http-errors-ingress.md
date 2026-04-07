# AKS AGIC HTTP 错误码排查 — ingress -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-AGIC-Support-Boundary.md, ado-wiki-a-agic-appgw-config-update-verification.md, ado-wiki-a-agic-backend-app-issues.md, ado-wiki-agic-multiple-apps-one-appgw.md
**Generated**: 2026-04-07

---

## Phase 1: NSG on Application Gateway subnet does not allow i

### aks-517: Unable to reach Application Gateway IP when using AGIC ingress controller in AKS...

**Root Cause**: NSG on Application Gateway subnet does not allow inbound traffic on port 80/443

**Solution**:
Allow port 80 and/or 443 on the Application Gateway NSG inbound rules

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Using%20multiple%20different%20ingress%20controllers%20in%20a%20cluster)]`

## Phase 2: VNet peering not configured between Application Ga

### aks-518: AGIC ingress controller cannot route traffic to AKS pods when Application Gatewa...

**Root Cause**: VNet peering not configured between Application Gateway VNet and AKS VNet

**Solution**:
Peer both the Application Gateway VNet and the AKS cluster VNet

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Using%20multiple%20different%20ingress%20controllers%20in%20a%20cluster)]`

## Phase 3: Application Gateway 将请求转发到后端时使用了客户端原始路径，但后端应用期望在不同

### aks-1007: AGIC 场景下通过 Application Gateway 访问后端应用返回 HTTP 404 Not Found，请求路径与后端应用期望路径不匹配

**Root Cause**: Application Gateway 将请求转发到后端时使用了客户端原始路径，但后端应用期望在不同的路径上接收请求

**Solution**:
在 ingress resource 上添加 appgw.ingress.kubernetes.io/backend-path-prefix 注解，将外部请求路径重写为后端应用实际期望的路径。也可修改应用配置使其在请求的路径上监听，或修改客户端请求 URL

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20404%20Not%20Found)]`

## Phase 4: The URL path in the client request does not match 

### aks-1016: AGIC/AppGW returns HTTP 404 Not Found when the request path does not match the b...

**Root Cause**: The URL path in the client request does not match the path on which the backend application is listening. In a reverse proxy setup (AKS/AGIC/AppGW), the request reaches the correct backend but the app cannot find the resource at that path.

**Solution**:
Add 'appgw.ingress.kubernetes.io/backend-path-prefix' annotation to the ingress resource to rewrite the request path. Alternatively, modify the request URL or reconfigure the app to listen on the expected path.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20404%20Not%20Found)]`

## Phase 5: AppGW enforces a request timeout (default 30s via 

### aks-1020: AGIC/AppGW returns HTTP 504 Gateway Timeout when backend response exceeds config...

**Root Cause**: AppGW enforces a request timeout (default 30s via AGIC annotation). If the backend takes longer to respond, AppGW returns HTTP 504.

**Solution**:
Check 'appgw.ingress.kubernetes.io/request-timeout' annotation on the ingress (kubectl describe ingress). Increase timeout if backend legitimately needs more time. Verify in Azure Portal under AppGW > Backend Settings.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20504%20Gateway%20Timeout)]`

## Phase 6: AGIC addon resource limits are managed by AKS and 

### aks-253: AGIC (Application Gateway Ingress Controller) addon pod OOMKilled when multiple ...

**Root Cause**: AGIC addon resource limits are managed by AKS and cannot be modified by user. With many listeners AGIC exceeds default memory limit.

**Solution**:
1) Use Helm-based AGIC installation which allows custom resource limits. 2) Raise IcM to AKS PG for addon limit increase. 3) Reduce listener count if possible.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 7: Application Gateway in stopped state, AGIC misconf

### aks-1281: AGIC connectivity issues - ingress has no IP address or HTTP timeout accessing s...

**Root Cause**: Application Gateway in stopped state, AGIC misconfigured, backend address pools not matching pod IPs, or AGIC pod errors

**Solution**:
Verify app via port-forward first; check ingress events; inspect AGIC logs (kubectl logs -n kube-system -l=app=ingress-appgw); verify App Gateway operationalState=Running; compare backend pool IPs with endpoints; start App Gateway if stopped

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/troubleshoot-app-gateway-ingress-controller-connectivity-issues)]`

## Phase 8: The AGIC addon enable operation reports completion

### aks-1061: Ingress resource created immediately after enabling AGIC addon does not get an I...

**Root Cause**: The AGIC addon enable operation reports completion before the Application Gateway resource is fully provisioned (takes 10+ minutes). AGIC detects the AppGW in stopped/updating state and skips Ingress reconciliation. Critically, Ingress resources created during this window are never picked up even after AppGW becomes ready - AGIC does not retroactively reconcile them.

**Solution**:
Delete and recreate the Ingress resource after verifying the Application Gateway resource is fully provisioned and no longer in updating state. The recreated Ingress will immediately be applied and obtain an IP. To avoid this issue: wait for Application Gateway to show Succeeded provisioning state before creating Ingress resources.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20does%20not%20apply%20ingress%20right%20after%20addon%20enabled)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Unable to reach Application Gateway IP when using AGIC ingress controller in AKS... | NSG on Application Gateway subnet does not allow inbound tra... | Allow port 80 and/or 443 on the Application Gateway NSG inbo... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Using%20multiple%20different%20ingress%20controllers%20in%20a%20cluster) |
| 2 | AGIC ingress controller cannot route traffic to AKS pods when Application Gatewa... | VNet peering not configured between Application Gateway VNet... | Peer both the Application Gateway VNet and the AKS cluster V... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Using%20multiple%20different%20ingress%20controllers%20in%20a%20cluster) |
| 3 | AGIC 场景下通过 Application Gateway 访问后端应用返回 HTTP 404 Not Found，请求路径与后端应用期望路径不匹配 | Application Gateway 将请求转发到后端时使用了客户端原始路径，但后端应用期望在不同的路径上接收请求 | 在 ingress resource 上添加 appgw.ingress.kubernetes.io/backend-p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20404%20Not%20Found) |
| 4 | AGIC/AppGW returns HTTP 404 Not Found when the request path does not match the b... | The URL path in the client request does not match the path o... | Add 'appgw.ingress.kubernetes.io/backend-path-prefix' annota... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20404%20Not%20Found) |
| 5 | AGIC/AppGW returns HTTP 504 Gateway Timeout when backend response exceeds config... | AppGW enforces a request timeout (default 30s via AGIC annot... | Check 'appgw.ingress.kubernetes.io/request-timeout' annotati... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20504%20Gateway%20Timeout) |
| 6 | AGIC (Application Gateway Ingress Controller) addon pod OOMKilled when multiple ... | AGIC addon resource limits are managed by AKS and cannot be ... | 1) Use Helm-based AGIC installation which allows custom reso... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 7 | AGIC connectivity issues - ingress has no IP address or HTTP timeout accessing s... | Application Gateway in stopped state, AGIC misconfigured, ba... | Verify app via port-forward first; check ingress events; ins... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/troubleshoot-app-gateway-ingress-controller-connectivity-issues) |
| 8 | Ingress resource created immediately after enabling AGIC addon does not get an I... | The AGIC addon enable operation reports completion before th... | Delete and recreate the Ingress resource after verifying the... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20does%20not%20apply%20ingress%20right%20after%20addon%20enabled) |
