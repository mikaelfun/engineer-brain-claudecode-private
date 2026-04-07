# AKS Nginx Ingress Controller -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Draft sources**: 3 | **Kusto queries**: 0
**Source drafts**: ado-wiki-multiple-nginx-ingress-controller-setup.md, ado-wiki-upgrading-ingress-nginx-specific-version.md, mslearn-deploy-unmanaged-nginx-ingress.md
**Generated**: 2026-04-07

---

## Phase 1: App-routing operator 通过 reconciliation loop 持续管理 P

### aks-185: AKS App Routing addon 创建的 Ingress Controller 的 PDB/ConfigMap 无法修改或删除，修改后几分钟内自动重置...

**Root Cause**: App-routing operator 通过 reconciliation loop 持续管理 PDB 和 ConfigMap 资源。CRD (nginxingresscontrollers.yaml) 未暴露 PDB/ConfigMap 配置项，用户修改会被 operator 覆盖。删除 Ingress Controller 时 PDB/ConfigMap 随之删除

**Solution**:
这是 app-routing addon 的设计限制。1) PDB 策略和 ConfigMap (如 proxy_pass whitelist) 无法通过直接编辑生效；2) 需自定义 PDB/ConfigMap 时，使用非 addon 方式 (helm) 部署 Ingress Controller；3) 自定义 CA 功能尚无 ETA

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Mooncake container mirror (dockerhub.azk8s.cn) req

### aks-204: Docker image pull fails with image not found when using Mooncake mirror dockerhu...

**Root Cause**: Mooncake container mirror (dockerhub.azk8s.cn) requires explicit library/ prefix for official Docker Hub images. Unlike Docker Hub which implicitly adds library/ for official images, the mirror does not.

**Solution**:
Use full path with library/ prefix: dockerhub.azk8s.cn/library/nginx:1.15.5 instead of dockerhub.azk8s.cn/nginx:1.15.5. For non-official images, use the full namespace as-is.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 3: AKS App Routing 限制了 ingress controller 的自定义能力，不支持 

### aks-511: AKS App Routing managed NGINX ingress 间歇性返回 HTTP 400 Bad Request，相同请求在其他环境正常

**Root Cause**: AKS App Routing 限制了 ingress controller 的自定义能力，不支持 debug mode、error log verbosity 等。HTTP 400 通常由畸形/无效 header、协议违规、或冲突 header（如同时发送 Content-Length 和 Transfer-Encoding: chunked）触发。

**Solution**:
1) 通过 spec.logFormat 配置自定义 access log 格式以获取请求级别可见性；2) 临时启用 debug（kubectl patch configmap nginx -n app-routing-system --type merge -p '{"data":{"error-log-level":"debug"}}')获取详细 header 拒绝原因；3) 用 curl 复现并关联 access log 分析具体被拒绝的 header；4) 排查后记得 revert debug 配置。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FHow%20to%20Configure%20and%20Troubleshoot%20Ingress%20Access%20Logging%20in%20AKS%20App%20Routing)]`

## Phase 4: Default admission webhook for ingress-nginx commun

### aks-513: Admission webhook validation error when creating ingress resources with same hos...

**Root Cause**: Default admission webhook for ingress-nginx community version validates across ALL webhook instances, not scoped to specific IngressClass. Multiple controllers share the same admission logic causing cross-controller validation conflicts.

**Solution**:
Disable admissionWebhooks (--set controller.admissionWebhooks.enabled=false) or configure matchLabels/objectSelector (--set controller.admissionWebhooks.objectSelector) to scope validation per ingress controller. Fixed in ingress-nginx v1.1.2 (PR #8221).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FMultiple%20Nginx%20Ingress%20Controller%20Setup)]`

## Phase 5: Ingress resource misconfiguration - incorrect back

### aks-519: Nginx ingress returns 404 Not Found when accessing application via host-based ro...

**Root Cause**: Ingress resource misconfiguration - incorrect backend service or path rules

**Solution**:
Check the events of the ingress resource (kubectl describe ingress) and review nginx ingress controller pod logs for relevant errors

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Using%20multiple%20different%20ingress%20controllers%20in%20a%20cluster)]`

## Phase 6: Default K8s TLS secrets do not sync with Key Vault

### aks-035: Need to configure Nginx Ingress Controller to use TLS certificates from Azure Ke...

**Root Cause**: Default K8s TLS secrets do not sync with Key Vault; KV CSI Driver with autorotation bridges this gap; Nginx Ingress Controller natively detects volume changes and reloads cert without Reloader when mounted via CSI driver

**Solution**:
1) Enable addon: az aks enable-addons --addons azure-keyvault-secrets-provider; 2) Get addon managed identity clientId; 3) Grant identity "Key Vault Administrator" role on KV scope; 4) Create SecretProviderClass with useVMManagedIdentity=true, userAssignedIdentityID, keyvaultName, cloudName=AzureChinaCloud, secretObjects[type=kubernetes.io/tls] mapping tls.key+tls.crt to cert objectName; 5) Install Nginx ingress via helm with extraVolumes/extraVolumeMounts mounting the CSI volume — K8s TLS secret appears once pod starts; 6) Create Ingress referencing secretName from SecretProviderClass; 7) Enable autorotation: az aks addon update --enable-secret-rotation (default poll 2min). NOTE: Nginx Ingress auto-detects cert renewal without Reloader — confirmed by lab test; verified via "k get secret ingress-tls-csi" showing updated tls.crt

`[Score: [B] 6.5 | Source: [onenote: MCVKB/Net/=======8.AKS=======/8.7 [AKS] ]]`

## Phase 7: CPU exhaustion on NGINX ingress pods; HPA reached 

### aks-1282: Managed NGINX ingress controller returns HTTP 502/504 gateway errors or signific...

**Root Cause**: CPU exhaustion on NGINX ingress pods; HPA reached max replicas or no nodes available; resource limits misconfigured

**Solution**:
Monitor HPA (kubectl get hpa -n app-routing-system -w); check pending pods; configure NginxIngressController CRD scaling (maxReplicas, minReplicas, threshold); default 500m CPU request with no limits

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/load-bal-ingress-c/troubleshoot-performance-ingress)]`

## Phase 8: Azure platform-provided domain names are CNAME rec

### aks-053: Cannot configure multiple host-based ingress rules on AKS; Azure platform domain...

**Root Cause**: Azure platform-provided domain names are CNAME records rather than A records. CNAME records cannot have additional prefix subdomains added. This prevents host-based routing using Azure default domains for multiple services.

**Solution**:
1) Use a custom domain with A record pointing to the ingress controller's public IP. 2) Configure multiple ingress rules with different custom hostnames. 3) For Mooncake: use mirror.azure.cn for helm charts, gcr.azk8s.cn for container images. 4) To deploy multiple ingress controllers, set different ingressClass: 'helm install stable/nginx-ingress --set controller.ingressClass=first'. 5) Helm setup for China: 'helm init --tiller-image gcr.azk8s.cn/kubernetes-helm/tiller:$VER --stable-repo-url https://mirror.azure.cn/kubernetes/charts/'

`[Score: [B] 5.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

---

## Known Issues Quick Reference

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
