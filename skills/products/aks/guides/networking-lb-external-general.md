# AKS 外部负载均衡器与 SNAT — general -- Quick Reference

**Sources**: 2 | **21V**: Partial | **Entries**: 13
**Last updated**: 2026-04-07

## Symptom Quick Reference

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

## Quick Troubleshooting Path

1. Check: KQL: union cluster(akscn `[source: onenote]`
2. Check: Ask customer to remove the association/reference between the managed and non-managed resource, then  `[source: ado-wiki]`
3. Check: 1) Reset SP credentials: az ad sp credential reset --id <appId>; 2) Update AKS: az aks update-creden `[source: onenote]`

> This topic has a fusion troubleshooting guide with complete workflow and Kusto query templates
> -> [Complete Troubleshooting Flow](details/networking-lb-external-general.md)
