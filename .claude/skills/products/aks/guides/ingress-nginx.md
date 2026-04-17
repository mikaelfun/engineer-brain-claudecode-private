# AKS Nginx Ingress Controller -- Quick Reference

**Sources**: 3 | **21V**: All | **Entries**: 8
**Last updated**: 2026-04-05

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS App Routing addon 创建的 Ingress Controller 的 PDB/ConfigMap 无法修改或删除，修改后几分钟内自动重置... | App-routing operator 通过 reconciliation loop 持续管理 PDB 和 Confi... | 这是 app-routing addon 的设计限制。1) PDB 策略和 ConfigMap (如 proxy_pas... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Docker image pull fails with image not found when using Mooncake mirror dockerhu... | Mooncake container mirror (dockerhub.azk8s.cn) requires expl... | Use full path with library/ prefix: dockerhub.azk8s.cn/libra... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 3 | AKS App Routing managed NGINX ingress 间歇性返回 HTTP 400 Bad Request，相同请求在其他环境正常 | AKS App Routing 限制了 ingress controller 的自定义能力，不支持 debug mode... | 1) 通过 spec.logFormat 配置自定义 access log 格式以获取请求级别可见性；2) 临时启用 d... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FHow%20to%20Configure%20and%20Troubleshoot%20Ingress%20Access%20Logging%20in%20AKS%20App%20Routing) |
| 4 | Admission webhook validation error when creating ingress resources with same hos... | Default admission webhook for ingress-nginx community versio... | Disable admissionWebhooks (--set controller.admissionWebhook... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FMultiple%20Nginx%20Ingress%20Controller%20Setup) |
| 5 | Nginx ingress returns 404 Not Found when accessing application via host-based ro... | Ingress resource misconfiguration - incorrect backend servic... | Check the events of the ingress resource (kubectl describe i... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Using%20multiple%20different%20ingress%20controllers%20in%20a%20cluster) |
| 6 | Need to configure Nginx Ingress Controller to use TLS certificates from Azure Ke... | Default K8s TLS secrets do not sync with Key Vault; KV CSI D... | 1) Enable addon: az aks enable-addons --addons azure-keyvaul... | [B] 6.5 | [onenote: MCVKB/Net/=======8.AKS=======/8.7 [AKS] ] |
| 7 | Managed NGINX ingress controller returns HTTP 502/504 gateway errors or signific... | CPU exhaustion on NGINX ingress pods; HPA reached max replic... | Monitor HPA (kubectl get hpa -n app-routing-system -w); chec... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/troubleshoot-performance-ingress) |
| 8 | Cannot configure multiple host-based ingress rules on AKS; Azure platform domain... | Azure platform-provided domain names are CNAME records rathe... | 1) Use a custom domain with A record pointing to the ingress... | [B] 5.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |

## Quick Troubleshooting Path

1. Check: 这是 app-routing addon 的设计限制。1) PDB 策略和 ConfigMap (如 proxy_pass whitelist) 无法通过直接编辑生效；2) 需自定义 PDB/Conf `[source: onenote]`
2. Check: Use full path with library/ prefix: dockerhub `[source: onenote]`
3. Check: 1) 通过 spec `[source: ado-wiki]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/ingress-nginx.md)
