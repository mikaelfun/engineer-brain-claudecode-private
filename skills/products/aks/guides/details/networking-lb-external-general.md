# AKS 外部负载均衡器与 SNAT — general -- Comprehensive Troubleshooting Guide

**Entries**: 13 | **Draft sources**: 7 | **Kusto queries**: 0
**Source drafts**: ado-wiki-aci-service-unavailable-error.md, ado-wiki-c-Service-Allowed-IP-Ranges-Annotation.md, ado-wiki-capture-incoming-service-traffic.md, ado-wiki-runbook-automation-vmss-windows.md, ado-wiki-using-service-principals-deploy-with-ado.md, mslearn-internal-pod-service-connectivity.md, mslearn-pods-namespaces-terminating.md
**Generated**: 2026-04-07

---

## Phase 1: Konnectivity pod lifecycle issues can be diagnosed

### aks-136: Konnectivity-agent pod not running or failing health probes; need to debug konne...

**Root Cause**: Konnectivity pod lifecycle issues can be diagnosed via ControlPlaneEvents/ControlPlaneEventsNonShoebox tables in akscn.kusto.chinacloudapi.cn/AKSccplogs. Filter by category kube-audit, search for konnectivity-agent in pods, then mv-expand requestObject.status.conditions.

**Solution**:
KQL: union cluster(akscn...).database(AKSccplogs).ControlPlaneEvents, ...NonShoebox | where ccpNamespace == '<underlay-id>' | where category == 'kube-audit' | where properties contains 'konnectivity-agent' | mv-expand podCond = _jlog.requestObject.status.conditions | project PreciseTimeStamp, requestURI, verb, user, podCondType, podCondStatus, podCondReason, podCondMessage

`[Score: [G] 9.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Customer created cross-references between AKS-mana

### aks-596: AKS cluster delete fails with ResourceGroupDeletionBlocked or ResourceGroupDelet...

**Root Cause**: Customer created cross-references between AKS-managed infrastructure resources and non-managed resources. Modifying managed resources or adding non-managed resources in the node resource group is not supported. During cluster delete, AKS triggers node RG deletion, but Azure RP refuses to delete managed resources that are still referenced by external resources.

**Solution**:
Ask customer to remove the association/reference between the managed and non-managed resource, then retry cluster delete. Use ASI AKS Operation search (https://asi.azure.ms/services/AKS/pages/Operation%20Ids) to identify which specific managed resource and cross-reference is blocking deletion. Doc: https://learn.microsoft.com/azure/aks/faq#why-are-two-resource-groups-created-with-aks-

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20operation%20failed%20with%20ResourceGroupDeletionBlocked%20ResourceGroupDeletionTimeout)]`

## Phase 3: AKS cluster's Service Principal client secret expi

### aks-191: AKS LoadBalancer Service stuck in <pending> state; describe svc shows 401 AADSTS...

**Root Cause**: AKS cluster's Service Principal client secret expired. All ARM API calls from cloud-provider-azure fail with HTTP 401. LoadBalancer, PublicIP, and other Azure resource reconciliation is blocked.

**Solution**:
1) Reset SP credentials: az ad sp credential reset --id <appId>; 2) Update AKS: az aks update-credentials --resource-group <rg> --name <aks> --reset-service-principal --service-principal-id <appId> --client-secret <newSecret>; 3) Consider migrating to Managed Identity to avoid SP expiry issues.

`[Score: [G] 8.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: Customer removed platform-assigned tags (orchestra

### aks-071: After modifying AKS authorized IPs, all nodes unexpectedly rebooted/reimaged; VM...

**Root Cause**: Customer removed platform-assigned tags (orchestrator tag) from VMSS in MC_ resource group. During reconcile triggered by authorized IPs PUT, AKS detected missing tag and triggered VMSS model update.

**Solution**:
Never remove/modify platform-assigned tags on AKS resources in MC_ resource group. Detect via FrontEndQoSEvents Kusto log: Orchestrator version tag does not exist or is nil.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: SNAT port exhaustion from high outbound connection

### aks-726: Sporadic egress connectivity failures on AKS clusters with >500 nodes due to SNA...

**Root Cause**: SNAT port exhaustion from high outbound connection count at large scale

**Solution**:
Use AKS Managed NAT Gateway add-on (supports up to 64,512 flows per IP, max 16 IPs). See https://learn.microsoft.com/en-us/azure/aks/nat-gateway

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit)]`

## Phase 6: Third-party firewall performing SSL/TLS deep packe

### aks-745: AKS operations fail with ControlPlaneAddOnsNotReady/PodInitializing, kube-proxy ...

**Root Cause**: Third-party firewall performing SSL/TLS deep packet inspection between AKS nodes and MCR, causing certificate validation failure when pulling container images.

**Solution**:
Ask customer to temporarily disable firewall or third-party SSL inspection device, retry the operation. Verify by SSH into affected node checking kubelet/containerd logs.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending)]`

## Phase 7: kubectl retina plugin was built from a local devel

### aks-986: Retina Capture pod fails to start with ImagePullBackOff. kubectl retina plugin c...

**Root Cause**: kubectl retina plugin was built from a local development environment. The MCR image matching that local build version does not exist in the container registry.

**Solution**:
Use an officially released kubectl retina plugin version that has a corresponding MCR image. Or manually specify a valid image in the capture spec.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Capture%20TSG)]`

## Phase 8: k8s.gcr.io and global container registries are ina

### aks-015: AKS Engine pods fail to start with ImagePullBackOff when pulling images from k8s...

**Root Cause**: k8s.gcr.io and global container registries are inaccessible from Mooncake due to GFW. Components like calico-typha-horizontal-autoscaler fail image pull.

**Solution**:
Replace global registry endpoints with China proxy mirrors. For gcr.io/k8s.gcr.io use gcr.azk8s.cn/google_containers/<image>. Edit yaml (e.g. /etc/kubernetes/addons/calico-daemonset.yaml) to change image endpoint, then kubectl apply -f <yaml>. Ref: https://github.com/Azure/container-service-for-azure-china/blob/master/aks/README.md#22-container-registry-proxy

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

## Phase 9: Basic Load Balancer cannot work with Standard SKU 

### aks-257: AKS Basic LB + Standard SKU Public IP: service stuck in terminating state cannot...

**Root Cause**: Basic Load Balancer cannot work with Standard SKU Public IP. Validation should prevent this but failed. PIP gets attached to VMSS but LB operations fail leaving service terminating.

**Solution**:
1) Remove service and kubernetes-cluster-name tags from public IP. 2) Delete the service. 3) Use matching SKU (Basic+Basic or Standard+Standard).

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 10: Known issue with Windows nodes: kube-proxy will no

### aks-673: On Windows nodes with Shared SLB Health Probe enabled, kube-proxy does not start...

**Root Cause**: Known issue with Windows nodes: kube-proxy will not start until user creates the first non-HPC pod. The health-probe-proxy sidecar monitors port 10356 and forwards to kube-proxy healthz on port 10256, which is unavailable until kube-proxy starts.

**Solution**:
Create a non-HPC pod on the Windows node to trigger kube-proxy startup. This is a known limitation; fix is under discussion by AKS PG. Monitor PG updates for a permanent fix.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FShared%20SLB%20Health%20Probe)]`

## Phase 11: Asymmetric routing: UDR missing routes for firewal

### aks-847: External client cannot reach AKS service via Load Balancer public IP. Error: ups...

**Root Cause**: Asymmetric routing: UDR missing routes for firewall public egress IP, and DNAT rule not configured on firewall. Inbound traffic arrives via LB public IP but return traffic goes through firewall which drops it.

**Solution**:
1) Add route with Address Prefix of public egress IP (firewall public IP) and Next Hop Type Internet to the UDR. 2) Create DNAT rule on Azure Firewall. Both required. Cluster must have --outbound-type userDefinedRouting.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FKubenet%20UDR%20(User%20Defined%20Route)%20asymmetric%20routing%20from%20firewall%20missing%20routes%20configuration)]`

## Phase 12: Azure Policy blocks public IP/prefix creation. Sta

### aks-850: Gateway nodepool cannot join kubeegressgateway LB backend pool. Controller logs:...

**Root Cause**: Azure Policy blocks public IP/prefix creation. Static Egress Gateway tries to create managed public IP prefix which is denied.

**Solution**:
Set provisionPublicIps: false in StaticGatewayConfiguration to skip public IP creation.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20Static%20Egress%20Gateway%20Feature)]`

## Phase 13: ARM cache hydration issue - Azure Resource Manager

### aks-901: AKS resources (VMSS, disks, load balancers) not visible in Azure Portal, Azure R...

**Root Cause**: ARM cache hydration issue - Azure Resource Manager cache is not synchronized with underlying Resource Providers (CRP, DiskRP, AKS RP). The resource exists in the RP but is not reflected in the ARM cache.

**Solution**:
Use Jarvis action 'Azure Resource Manager > Resource Synchronization > Synchronize resource state' with the fully qualified resource ID to rehydrate ARM cache. If the resource ID is unknown, use CRP QoS Kusto query (cluster('azcrp').database('crp_allprod').ApiQosEvent_nonGet) filtering on SubscriptionID and MC_ resource group to identify it. Resource appears in ARM after a few minutes.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FTools%2FJarvis%2FSynchronize%20ARM%20when%20VMSS%20not%20visible%20Jarvis%20action)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Konnectivity-agent pod not running or failing health probes; need to debug konne... | Konnectivity pod lifecycle issues can be diagnosed via Contr... | KQL: union cluster(akscn...).database(AKSccplogs).ControlPla... | [G] 9.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | AKS cluster delete fails with ResourceGroupDeletionBlocked or ResourceGroupDelet... | Customer created cross-references between AKS-managed infras... | Ask customer to remove the association/reference between the... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20operation%20failed%20with%20ResourceGroupDeletionBlocked%20ResourceGroupDeletionTimeout) |
| 3 | AKS LoadBalancer Service stuck in <pending> state; describe svc shows 401 AADSTS... | AKS cluster's Service Principal client secret expired. All A... | 1) Reset SP credentials: az ad sp credential reset --id <app... | [G] 8.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | After modifying AKS authorized IPs, all nodes unexpectedly rebooted/reimaged; VM... | Customer removed platform-assigned tags (orchestrator tag) f... | Never remove/modify platform-assigned tags on AKS resources ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | Sporadic egress connectivity failures on AKS clusters with >500 nodes due to SNA... | SNAT port exhaustion from high outbound connection count at ... | Use AKS Managed NAT Gateway add-on (supports up to 64,512 fl... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/5k%20Node%20Limit) |
| 6 | AKS operations fail with ControlPlaneAddOnsNotReady/PodInitializing, kube-proxy ... | Third-party firewall performing SSL/TLS deep packet inspecti... | Ask customer to temporarily disable firewall or third-party ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FControlPlaneAddOnsNotReady%20because%20kube%20proxy%20stuck%20pending) |
| 7 | Retina Capture pod fails to start with ImagePullBackOff. kubectl retina plugin c... | kubectl retina plugin was built from a local development env... | Use an officially released kubectl retina plugin version tha... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Capture%20TSG) |
| 8 | AKS Engine pods fail to start with ImagePullBackOff when pulling images from k8s... | k8s.gcr.io and global container registries are inaccessible ... | Replace global registry endpoints with China proxy mirrors. ... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 9 | AKS Basic LB + Standard SKU Public IP: service stuck in terminating state cannot... | Basic Load Balancer cannot work with Standard SKU Public IP.... | 1) Remove service and kubernetes-cluster-name tags from publ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 10 | On Windows nodes with Shared SLB Health Probe enabled, kube-proxy does not start... | Known issue with Windows nodes: kube-proxy will not start un... | Create a non-HPC pod on the Windows node to trigger kube-pro... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FShared%20SLB%20Health%20Probe) |
| 11 | External client cannot reach AKS service via Load Balancer public IP. Error: ups... | Asymmetric routing: UDR missing routes for firewall public e... | 1) Add route with Address Prefix of public egress IP (firewa... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FKubenet%20UDR%20(User%20Defined%20Route)%20asymmetric%20routing%20from%20firewall%20missing%20routes%20configuration) |
| 12 | Gateway nodepool cannot join kubeegressgateway LB backend pool. Controller logs:... | Azure Policy blocks public IP/prefix creation. Static Egress... | Set provisionPublicIps: false in StaticGatewayConfiguration ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FOutbound%20Connectivity%2FTroubleshoot%20Static%20Egress%20Gateway%20Feature) |
| 13 | AKS resources (VMSS, disks, load balancers) not visible in Azure Portal, Azure R... | ARM cache hydration issue - Azure Resource Manager cache is ... | Use Jarvis action 'Azure Resource Manager > Resource Synchro... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FTools%2FJarvis%2FSynchronize%20ARM%20when%20VMSS%20not%20visible%20Jarvis%20action) |
