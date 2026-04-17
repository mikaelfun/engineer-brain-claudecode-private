# AKS AGIC HTTP 错误码排查 — ingress -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 8
**Last updated**: 2026-04-06

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: Allow port 80 and/or 443 on the Application Gateway NSG inbound rules `[source: ado-wiki]`
2. Check: Peer both the Application Gateway VNet and the AKS cluster VNet `[source: ado-wiki]`
3. Check: 在 ingress resource 上添加 appgw `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/agic-http-errors-ingress.md)
