# AKS ACR 认证与 RBAC — image-pull -- Comprehensive Troubleshooting Guide

**Entries**: 27 | **Draft sources**: 16 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-acr-build-image-docker-buildkit-secret.md, ado-wiki-a-acr-define-idea-for-feedback-forum.md, ado-wiki-a-acr-enable-image-deletion-with-locks.md, ado-wiki-a-acr-health-check-command-background.md, ado-wiki-acr-behind-firewall.md, ado-wiki-acr-find-user-of-manifest-event.md, ado-wiki-acr-image-or-repository-recovery.md, ado-wiki-acr-investigate-bulk-image-tag-deletions.md, ado-wiki-acr-list-old-images-script.md, ado-wiki-b-acr-authorization-rbac-abac.md
**Kusto references**: image-integrity.md
**Generated**: 2026-04-07

---

## Phase 1: The Kubelet managed identity does not have AcrPull

### aks-368: AKS image pull from ACR fails with "unauthorized: authentication required" when ...

**Root Cause**: The Kubelet managed identity does not have AcrPull role assignment on the ACR. When ACR is attached to AKS, AcrPull permission should be assigned automatically to the Kubelet MI, but this can fail or be missing

**Solution**:
Option 1: Detach and reattach ACR (requires Owner or Contributor+User Access Administrator): az aks update --detach-acr then --attach-acr. Option 2: Manually verify Kubelet MI identity via az aks show --query identityProfile.kubeletidentity.resourceId, then add AcrPull role assignment to the ACR IAM for that identity

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20authentication%20with%20AKS%20deployed%20using%20Managed%20Identity)]`

## Phase 2: ACR has private endpoints enabled with public acce

### aks-420: Cannot connect to ACR or pull images when private endpoints enabled; error "Coul...

**Root Cause**: ACR has private endpoints enabled with public access disabled. The client (e.g. AKS node) is not on a VNET where the private endpoint is connected, so it cannot resolve private DNS records or connect over the endpoint.

**Solution**:
Use Jarvis "Get Registry Private Endpoints" action to retrieve NRP PE ID. Find the private endpoint in ASC to identify which VNET it is connected to. Verify the client is on the same VNET as the private endpoint to allow private DNS resolution and connectivity.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New)]`

## Phase 3: Docker Hub rate limits: anonymous 100 pulls/6hrs I

### aks-084: AKS pods fail to pull container images from Docker Hub with rate limit errors (H...

**Root Cause**: Docker Hub rate limits: anonymous 100 pulls/6hrs IP-based, free 200 pulls/6hrs, paid 5000/24hrs. Azure IP exemption ended.

**Solution**:
1) Authenticate Docker pulls (free, 200/6hrs). 2) Paid Docker account for higher limits. 3) Best: import images into ACR with az acr import. 4) Configure imagePullSecrets or ACR integration for AKS.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: ACR private endpoint connection was disconnected (

### aks-346: ACR image pull fails with "no route to host" error when private endpoint is enab...

**Root Cause**: ACR private endpoint connection was disconnected (removed by the private-link resource owner), causing incorrect effective routes on the AKS node NIC. The private IP resolves correctly but routing to the private endpoint is broken.

**Solution**:
Recreate the private endpoint for ACR. Verify NIC effective routes show correct next-hop for the private endpoint subnet.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20FailedPullImage%20NoRouteToHost%20PE)]`

## Phase 5: AKS kubelet sends two parallel requests to ACR: on

### aks-362: ACR image pull fails with '401 Unauthorized' (failed to fetch anonymous token) w...

**Root Cause**: AKS kubelet sends two parallel requests to ACR: one with empty credentials (anonymous access) and one with real credentials. When pulling a non-existing image from an ACR without anonymous access enabled, the anonymous request returns 401 while the authenticated request returns 404. Both errors are surfaced, making the 401 confusing.

**Solution**:
Verify the image name and tag exist in the ACR repository. The 401 error is a red herring caused by kubelet retry logic; the real issue is image not found (404). Check repositories with 'az acr repository list' and tags with 'az acr repository show-tags'.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Pull%20Image%20401%20Anonymous%20Token)]`

## Phase 6: Service Connector extension does not auto-update. 

### aks-371: AKS Service Connector (SC) job fails with image pull error: sc-operator image ta...

**Root Cause**: Service Connector extension does not auto-update. The installed version pins to a specific image tag (e.g., 20250417.1) which gets removed from ACR over time. kubelet keeps trying to pull the removed tag, causing repeated NotFound errors.

**Solution**:
1) Delete the outdated SC extension: az k8s-extension delete --name <ext-name> --cluster-name <aks> --resource-group <rg> --cluster-type managedClusters; 2) Recreate the Service Connection (e.g., az aks connection create keyvault ...) which re-adds SC extension with a valid tag; 3) Verify in Portal → Extensions + applications that sc-extension is healthy.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20pulls%20fail%20service%20connector%20extension%20not%20auto%20updating)]`

## Phase 7: Service endpoint created on AKS subnet for ACR for

### aks-373: ACR image pull fails with 403 Forbidden when AKS uses selected networks + servic...

**Root Cause**: Service endpoint created on AKS subnet for ACR forces traffic to go via Azure backbone with private IPs, conflicting with ACR selected networks firewall which only allows public LB outbound IPs

**Solution**:
Delete the service endpoint for ACR on the AKS subnet; service endpoints and ACR selected network IP rules are incompatible when the traffic source is from the same VNet

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20imagepull%20forbidden%20serviceendpoint)]`

## Phase 8: Service Principal credentials used by AKS to authe

### aks-378: AKS nodes failing to pull images from ACR; image pull errors when creating new p...

**Root Cause**: Service Principal credentials used by AKS to authenticate to ACR have expired, or SP configured in AKS does not match the one assigned in ACR IAM

**Solution**:
Check SP expiry with 'az ad sp credential list --id <SP_ID>'. If expired, reset with 'az ad sp credential reset'. Verify AKS SP matches ACR IAM SP using 'az aks show -n <cluster> -g <rg> | grep client'. If mismatch, add correct SP to ACR IAM. Test with 'docker login <acr>.azurecr.io -u <sp> -p <secret>'.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FAKS%20Nodes%20Failing%20To%20Pull%20Images%20From%20Azure%20Container%20Registry)]`

## Phase 9: AKS 集群位于代理服务器或防火墙后面，阻断了 ACR 及其数据端点的访问。

### aks-379: AKS 集群已通过 az aks update --attach-acr 集成 ACR，但拉取镜像失败，报错 Failed to pull image / EO...

**Root Cause**: AKS 集群位于代理服务器或防火墙后面，阻断了 ACR 及其数据端点的访问。

**Solution**:
在代理服务器或防火墙中放行 ACR 端点：1) https://<acr>.azurecr.io 2) https://<acr>.<region>.data.azurecr.io 3) https://*.blob.core.windows.net。参考: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-firewall-access-rules

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FAKS%20is%20unable%20to%20pull%20ACR%20images)]`

## Phase 10: ACR has Selected Networks/Firewall enabled and the

### aks-421: Cannot connect to ACR or pull images; error "client with IP is not allowed acces...

**Root Cause**: ACR has Selected Networks/Firewall enabled and the client public IP is not in the ACR IP allowlist rules.

**Solution**:
Use Jarvis "Get Registry Master Entity" action to view the IP rules configured on the ACR. Verify the client public IP is listed in the allowed IP rules. Add the client IP to the ACR firewall allowlist if missing.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New)]`

## Phase 11: Firewall blocks required ACR endpoints - REST endp

### aks-496: Docker image pull from ACR fails when cluster or target runtime is behind a fire...

**Root Cause**: Firewall blocks required ACR endpoints - REST endpoint (*.azurecr.io), blob storage endpoint (*.blob.core.windows.net), and data proxy endpoint (region-acr-dp.azurecr.io) are not allowed

**Solution**:
Allow REST endpoint and storage endpoint in firewall rules per https://docs.microsoft.com/bs-cyrl-ba/azure/container-registry/container-registry-firewall-access-rules. If ACR has vNET firewall enabled, also allow data proxy endpoint: region-acr-dp.azurecr.io (e.g., neu-acr-dp.azurecr.io for North Europe). For geo-replicated registries, allow data proxy for all replicated regions.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Behind%20Firewall)]`

## Phase 12: When ACR vNET firewall is enabled, docker pull goe

### aks-497: ACR image pull fails when both target runtime firewall and ACR vNET firewall are...

**Root Cause**: When ACR vNET firewall is enabled, docker pull goes through data proxy (region-acr-dp.azurecr.io) instead of direct blob storage URL. Customer is unaware of data proxy endpoint and has not allowed it in their firewall.

**Solution**:
Allow data proxy endpoint region-acr-dp.azurecr.io in firewall. New consistent data endpoint format: registry_name.region.data.azurecr.io (e.g., myregistry.northeurope.data.azurecr.io). For geo-replicated registries, allow data endpoint for each replicated region.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Behind%20Firewall)]`

## Phase 13: By default, AKS service principal only has permiss

### aks-532: AKS cluster cannot pull images from ACR in a different Azure AD tenant; imagePul...

**Root Cause**: By default, AKS service principal only has permissions in its home tenant; cross-tenant ACR authentication requires multi-tenant AAD application configuration

**Solution**:
1) Enable multi-tenant AAD App registration in AKS tenant, 2) Provision the service principal in ACR tenant via OAuth2 authorize URL, 3) Assign AcrPull role to the SP on the ACR, 4) Update AKS cluster with the AAD Application client secret. Ref: https://github.com/Azure/acr/blob/main/docs/aks-acr-across-tenants.md

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FSet%20up%20AKS%20to%20pull%20from%20ACR%20in%20a%20different%20AD%20tenant)]`

## Phase 14: ACR is not properly attached to AKS, so AKS lacks 

### aks-915: AKS pod deployment fails with rpc error 503 Service Unavailable when pulling ima...

**Root Cause**: ACR is not properly attached to AKS, so AKS lacks permission to access ACR for Artifact Streaming.

**Solution**:
Verify ACR is attached to AKS properly. Ensure the AKS managed identity has AcrPull role on the ACR. Use az aks check-acr to validate.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming)]`

## Phase 15: The VM SKU used for AKS nodes has insufficient IOP

### aks-1003: Image pulling from ACR fails or takes over an hour for large container images (>...

**Root Cause**: The VM SKU used for AKS nodes has insufficient IOPS for pulling large images. For example, Standard_NC4as_T4_v3 has only 4000 IOPS while actual IO demand exceeds this limit, causing IO throttling. containerd imagePullProgressTimeout (default 1m) cancels pulls with no progress. After first pull fails, AKS retries with empty credentials resulting in misleading 401 error.

**Solution**:
Replace the AKS node VM SKU with one that has higher IOPS (e.g., upgrade from Standard_NC4as_T4_v3 to Standard_NC8as_T4_v3). Check IO throttling in ASI: Host Analyser > VM Counter > Throttling. For VM SKUs without documented IOPS, query Kusto azurevmcentral cluster to check NetworkDiskIOPS values.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FTroubleshooting%20image%20pull%20with%20huge%20image)]`

## Phase 16: AKS Service Principal credential expired. SP crede

### aks-146: AKS pods fail to pull images with 401 Unauthorized (ImagePullBackOff) after Serv...

**Root Cause**: AKS Service Principal credential expired. SP credential is written directly in /etc/kubernetes/azure.json on each node. Standard SP reset (az aks update-credentials) requires node reboot which causes downtime.

**Solution**:
Graceful SP update without node reboot: 1) SSH to AKS node, read current SP secret from /etc/kubernetes/azure.json; 2) Use az ad app credential reset --id <appId> --password <current-secret> --append to extend expiry (requires az cli <= 2.36.0); 3) No node reboot needed since AKS and VMSS config remain unchanged. Note: az cli breaking change (Graph migration) removed --password parameter in newer versions.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 17: AKS kubelet identity missing AcrPull/ContainerRegi

### aks-1109: ACR image pull fails with 401 Unauthorized: failed to authorize: failed to fetch...

**Root Cause**: AKS kubelet identity missing AcrPull/ContainerRegistryRepositoryReader role on ACR; or service principal expired; or kubelet identity removed from VMSS

**Solution**:
Check role assignment: az role assignment list --scope <acr-resource-id>; attach ACR: az aks update --attach-acr <acr>; check SP expiry: az ad app credential list; verify kubelet identity on VMSS; reconcile: az aks update

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster)]`

## Phase 18: Container image architecture (ARM64 vs AMD64) does

### aks-1110: ACR image pull fails with no match for platform in manifest or exec format error...

**Root Cause**: Container image architecture (ARM64 vs AMD64) does not match AKS node architecture

**Solution**:
Push images matching node architecture; or build and push multi-architecture images supporting both ARM64 and AMD64

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster)]`

## Phase 19: Incorrect image reference - wrong registry name (e

### aks-1111: ACR image pull fails with not found error: wrong registry name, repository, or t...

**Root Cause**: Incorrect image reference - wrong registry name (e.g. azureacr.io vs azurecr.io), wrong repository name, or wrong tag

**Solution**:
Verify full image reference: <registry>.azurecr.io/<repository>:<tag>; common mistake is azureacr.io instead of azurecr.io

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster)]`

## Phase 20: (1) ACR private endpoint DNS zone missing VNet lin

### aks-1112: ACR image pull fails with 403 Forbidden when ACR has network restrictions

**Root Cause**: (1) ACR private endpoint DNS zone missing VNet link for AKS VNet; (2) ACR public access restricted and AKS LB IP not in allowed range

**Solution**:
(1) Add AKS VNet link to privatelink.azurecr.io DNS zone; (2) Add AKS LB public IP to ACR firewall: az acr network-rule add --name <acr> --ip-address <aks-lb-ip>

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster)]`

## Phase 21: VNet peering not configured or disconnected betwee

### aks-1113: ACR image pull fails with dial tcp <acrprivateip>:443: i/o timeout when using pr...

**Root Cause**: VNet peering not configured or disconnected between ACR private endpoint VNet and AKS VNet

**Solution**:
Configure VNet peering between both VNets; verify peering status is Connected; test TCP from AKS node: telnet <acr-private-ip> 443; for hub-spoke use Azure Firewall

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster)]`

## Phase 22: Kubelet default registryPullQPS rate limit exceede

### aks-1115: ACR image pull fails with pull QPS exceeded when multiple jobs pull same images ...

**Root Cause**: Kubelet default registryPullQPS rate limit exceeded by concurrent image pulls

**Solution**:
Change imagePullPolicy from Always to IfNotPresent in deployment YAML to prevent unnecessary pulls

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster)]`

## Phase 23: ACR cache rules or private endpoint not properly c

### aks-1273: Network isolated AKS cluster: image pull fails due to network isolation; cannot ...

**Root Cause**: ACR cache rules or private endpoint not properly configured; for managed ACR, bootstrap resources may be missing

**Solution**:
BYO ACR: verify cache rules and private endpoints. Managed ACR: check bootstrap resources, reconcile cluster if missing. Non-MCR images: create extra cache rules in private ACR

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-network-isolated-cluster)]`

## Phase 24: Kubelet configuration in CSE not updated after clu

### aks-1274: Network isolated cluster: image pull fails after updating cluster to network iso...

**Root Cause**: Kubelet configuration in CSE not updated after cluster update

**Solution**:
Reimage the node to update kubelet configuration following the Update ACR ID guide

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-network-isolated-cluster)]`

## Phase 25: Docker Hub enforces rate limits: anonymous=100 pul

### aks-027: AKS pods fail to pull images from docker.io (Docker Hub) with rate limit errors;...

**Root Cause**: Docker Hub enforces rate limits: anonymous=100 pulls/6h by IP, free account=200 pulls/6h, paid=5000/24h. Microsoft had a partner agreement exempting Azure IPs from throttling, which ended June 30 2022. AKS system pods are NOT pulled from Docker Hub; only customer workload images using docker.io are impacted.

**Solution**:
1) Authenticate Docker pulls: sign up for free Docker account and configure imagePullSecrets. 2) Best option for ACR users: import images to ACR (az acr import) and reference ACR in deployments. 3) Paid Docker account raises limit to 5000/24h. 4) Self-hosted registry (last resort, out of Azure support scope). Note: AKS system/platform pods are unaffected.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3]]`

## Phase 26: Network virtual appliance (NVA) or firewall/proxy 

### aks-1114: ACR image pull fails with net/http: TLS handshake timeout

**Root Cause**: Network virtual appliance (NVA) or firewall/proxy misconfiguration blocking or delaying TLS handshake to ACR

**Solution**:
Check NVA/firewall/proxy configuration; verify routes to ACR; update NVAs with validated routes

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster)]`

## Phase 27: Private ACR has two private endpoints (registry + 

### aks-852: Image pull failures (403 Forbidden / 401 Unauthorized) from private ACR. AKS has...

**Root Cause**: Private ACR has two private endpoints (registry + data) that must be reachable directly. HTTP proxy routes traffic to ACR endpoints through proxy which lacks connectivity to private endpoints.

**Solution**:
Option 1: Configure proxy to allow traffic to both ACR endpoints. Option 2: Add both endpoints to AKS noProxy config, then update (not reimage) node images.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FUnable%20to%20connect%20to%20private%20ACR%20via%20proxy)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS image pull from ACR fails with "unauthorized: authentication required" when ... | The Kubelet managed identity does not have AcrPull role assi... | Option 1: Detach and reattach ACR (requires Owner or Contrib... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20authentication%20with%20AKS%20deployed%20using%20Managed%20Identity) |
| 2 | Cannot connect to ACR or pull images when private endpoints enabled; error "Coul... | ACR has private endpoints enabled with public access disable... | Use Jarvis "Get Registry Private Endpoints" action to retrie... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New) |
| 3 | AKS pods fail to pull container images from Docker Hub with rate limit errors (H... | Docker Hub rate limits: anonymous 100 pulls/6hrs IP-based, f... | 1) Authenticate Docker pulls (free, 200/6hrs). 2) Paid Docke... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | ACR image pull fails with "no route to host" error when private endpoint is enab... | ACR private endpoint connection was disconnected (removed by... | Recreate the private endpoint for ACR. Verify NIC effective ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20FailedPullImage%20NoRouteToHost%20PE) |
| 5 | ACR image pull fails with '401 Unauthorized' (failed to fetch anonymous token) w... | AKS kubelet sends two parallel requests to ACR: one with emp... | Verify the image name and tag exist in the ACR repository. T... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Pull%20Image%20401%20Anonymous%20Token) |
| 6 | AKS Service Connector (SC) job fails with image pull error: sc-operator image ta... | Service Connector extension does not auto-update. The instal... | 1) Delete the outdated SC extension: az k8s-extension delete... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20image%20pulls%20fail%20service%20connector%20extension%20not%20auto%20updating) |
| 7 | ACR image pull fails with 403 Forbidden when AKS uses selected networks + servic... | Service endpoint created on AKS subnet for ACR forces traffi... | Delete the service endpoint for ACR on the AKS subnet; servi... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20imagepull%20forbidden%20serviceendpoint) |
| 8 | AKS nodes failing to pull images from ACR; image pull errors when creating new p... | Service Principal credentials used by AKS to authenticate to... | Check SP expiry with 'az ad sp credential list --id <SP_ID>'... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FAKS%20Nodes%20Failing%20To%20Pull%20Images%20From%20Azure%20Container%20Registry) |
| 9 | AKS 集群已通过 az aks update --attach-acr 集成 ACR，但拉取镜像失败，报错 Failed to pull image / EO... | AKS 集群位于代理服务器或防火墙后面，阻断了 ACR 及其数据端点的访问。 | 在代理服务器或防火墙中放行 ACR 端点：1) https://<acr>.azurecr.io 2) https://... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FAKS%20is%20unable%20to%20pull%20ACR%20images) |
| 10 | Cannot connect to ACR or pull images; error "client with IP is not allowed acces... | ACR has Selected Networks/Firewall enabled and the client pu... | Use Jarvis "Get Registry Master Entity" action to view the I... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FPlatform%20and%20Tooling%2FTools%2FJarvis%2FACR%20Jarvis%20Actions%20New) |
| 11 | Docker image pull from ACR fails when cluster or target runtime is behind a fire... | Firewall blocks required ACR endpoints - REST endpoint (*.az... | Allow REST endpoint and storage endpoint in firewall rules p... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Behind%20Firewall) |
| 12 | ACR image pull fails when both target runtime firewall and ACR vNET firewall are... | When ACR vNET firewall is enabled, docker pull goes through ... | Allow data proxy endpoint region-acr-dp.azurecr.io in firewa... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Behind%20Firewall) |
| 13 | AKS cluster cannot pull images from ACR in a different Azure AD tenant; imagePul... | By default, AKS service principal only has permissions in it... | 1) Enable multi-tenant AAD App registration in AKS tenant, 2... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FSet%20up%20AKS%20to%20pull%20from%20ACR%20in%20a%20different%20AD%20tenant) |
| 14 | AKS pod deployment fails with rpc error 503 Service Unavailable when pulling ima... | ACR is not properly attached to AKS, so AKS lacks permission... | Verify ACR is attached to AKS properly. Ensure the AKS manag... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Artifact%20Streaming) |
| 15 | Image pulling from ACR fails or takes over an hour for large container images (>... | The VM SKU used for AKS nodes has insufficient IOPS for pull... | Replace the AKS node VM SKU with one that has higher IOPS (e... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FOthers%2FTroubleshooting%20image%20pull%20with%20huge%20image) |
| 16 | AKS pods fail to pull images with 401 Unauthorized (ImagePullBackOff) after Serv... | AKS Service Principal credential expired. SP credential is w... | Graceful SP update without node reboot: 1) SSH to AKS node, ... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 17 | ACR image pull fails with 401 Unauthorized: failed to authorize: failed to fetch... | AKS kubelet identity missing AcrPull/ContainerRegistryReposi... | Check role assignment: az role assignment list --scope <acr-... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster) |
| 18 | ACR image pull fails with no match for platform in manifest or exec format error... | Container image architecture (ARM64 vs AMD64) does not match... | Push images matching node architecture; or build and push mu... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster) |
| 19 | ACR image pull fails with not found error: wrong registry name, repository, or t... | Incorrect image reference - wrong registry name (e.g. azurea... | Verify full image reference: <registry>.azurecr.io/<reposito... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster) |
| 20 | ACR image pull fails with 403 Forbidden when ACR has network restrictions | (1) ACR private endpoint DNS zone missing VNet link for AKS ... | (1) Add AKS VNet link to privatelink.azurecr.io DNS zone; (2... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster) |
| 21 | ACR image pull fails with dial tcp <acrprivateip>:443: i/o timeout when using pr... | VNet peering not configured or disconnected between ACR priv... | Configure VNet peering between both VNets; verify peering st... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster) |
| 22 | ACR image pull fails with pull QPS exceeded when multiple jobs pull same images ... | Kubelet default registryPullQPS rate limit exceeded by concu... | Change imagePullPolicy from Always to IfNotPresent in deploy... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster) |
| 23 | Network isolated AKS cluster: image pull fails due to network isolation; cannot ... | ACR cache rules or private endpoint not properly configured;... | BYO ACR: verify cache rules and private endpoints. Managed A... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-network-isolated-cluster) |
| 24 | Network isolated cluster: image pull fails after updating cluster to network iso... | Kubelet configuration in CSE not updated after cluster updat... | Reimage the node to update kubelet configuration following t... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-network-isolated-cluster) |
| 25 | AKS pods fail to pull images from docker.io (Docker Hub) with rate limit errors;... | Docker Hub enforces rate limits: anonymous=100 pulls/6h by I... | 1) Authenticate Docker pulls: sign up for free Docker accoun... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.3] |
| 26 | ACR image pull fails with net/http: TLS handshake timeout | Network virtual appliance (NVA) or firewall/proxy misconfigu... | Check NVA/firewall/proxy configuration; verify routes to ACR... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/cannot-pull-image-from-acr-to-aks-cluster) |
| 27 | Image pull failures (403 Forbidden / 401 Unauthorized) from private ACR. AKS has... | Private ACR has two private endpoints (registry + data) that... | Option 1: Configure proxy to allow traffic to both ACR endpo... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FUnable%20to%20connect%20to%20private%20ACR%20via%20proxy) |
