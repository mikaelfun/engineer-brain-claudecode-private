---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] Azure Network Policy Manager"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Azure%20Network%20Policy%20Manager"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# [TSG] Azure Network Policy Manager

[[_TOC_]]

## Retirement Notice

**On 30 September 2028, we'll end support for Azure Network Policy Manager (NPM) on Linux nodes in AKS.**

The best replacement would be for the customer to migrate to [Cilium Network Policies](https://learn.microsoft.com/en-us/azure/aks/migrate-from-npm-to-cilium-network-policy)

**On 30 September 2026, we'll end support for Azure Network Policy Manager (NPM) on Windows nodes in AKS.**

For Windows, we recommend switching to Calico or using NSGs on the nodes.

### Reasoning for Retirement

- Scaling Concerns: NPM has experienced limitations in scalability, impacting its ability to effectively manage network policies in large-scale deployments. NPM currently is limited to cluster with a maximum of 250 nodes, while its replacement, Cilium Network Policy, can scale up to 3,000 nodes per cluster, with ongoing efforts to increase this limit to 5,000 nodes.
- Security Concerns: NPM has faced significant security challenges since its inception. One of the major issues is the inability to enforce NetworkPolicies on Kubernetes services of type LoadBalancer or NodePort with externalTrafficPolicy=Cluster. Despite multiple attempts to resolve these issues, they have persisted.
- Lack of Capabilities: Customers have requested features such as FQDN, L7, and cluster-wide policies. These are not available in NPM, but are offered by its replacement, Cilium Network Policy.
- Operational Efficiency: The deprecation of NPM will streamline operations by reducing the complexity associated with managing multiple network policy implementations.
- Transition to Cilium: The Networking team is making Cilium the default CNI for AKS.

## Known symptoms

1. The network policies don't work as expected

## Escalate Path

- AVA SME-AKS Triage (Teams channel)
- SEV3 ICM: EEE AKS

## Responsible PG/Owner

- Cloudnet\ContainerNetworking

## Tool/Log location

### Tool

- curl

### Log location

#### kubectl

- NPM pod log

#### Guest OS

- `iptables-save`
- `ipset -L`
- /var/log/kern.log

#### Jarvis

- AzureContainerService AKS > Customer Control Plane Operations > CustomerCluster - Run kubectl command
- AzureContainerService AKS > Customer Control Plane Operations > CustomerCluster - Run kubectl describe

#### CCP Log

- Kusto endpoint: https://aksccplogs.centralus.kusto.windows.net
- Tables: ControlPlaneEventsNonShoebox, ControlPlaneEventsShoebox

## Existing TSGs

- [Brief introduction of Network Policy on AKS](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/AKS-Network-Policy)
- NPM >v1.3.0 breaking changes: https://github.com/Azure/azure-container-networking/wiki/TSG:-NPM--v1.3.0-breaking-changes
- Is networkpolicy by Azure-NPM blocking my request? https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/101822/Is-networkpolicy-by-Azure-NPM-blocking-my-request
- Steps for updating/resetting Azure-NPM manually: https://github.com/Azure/azure-container-networking/wiki/Azure-NPM-troubleshooting-guide

## How it works

- Client enables the Azure NPM feature when they create the cluster. The manifest of the Azure NPM will be deployed to the k8s cluster and then k8s will create NPM pod on each node
- Client uses k8s API to add k8s Network Policy. The NPM pods watch it and add iptables rules and ipsets to intercept the traffic

## Troubleshooting Guides (TSGs)

1. Use "curl" to check if pod -> service and pod -> pod connectivity are good

   ```bash
   kubectl exec <pod name> -- curl -v http://<myservice>/example
   ```

2. Collect iptables/ipsets via running below commands in kube-proxy pod
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables-save > iptables.log`
   - `kubectl exec -n kube-system kube-proxy-kczpb -- ipset -L > ipset.log`

3. Review the iptables/ipsets to check if anything wrong. Reference: https://wiki.archlinux.org/title/Iptables

4. Review the NPM logs to check if NPM pod fails to sync network policies with the apiserver or fails to write iptables correctly

   ```bash
   kubectl logs <Azure NPM pod name> -n kube-system
   ```

5. Add traces to the iptable to understand where the packet jumps to when it goes through the iptables. The log will be redirected to '/var/log/kern.log'
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -I PREROUTING -t raw -p <udp/tcp> -j TRACE`
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -I OUTPUT -t raw -p <udp/tcp> -j TRACE`

   Analysis references:
   - https://backreference.org/2010/06/11/iptables-debugging/
   - https://sleeplessbeastie.eu/2020/11/13/how-to-trace-packets-as-they-pass-through-the-firewall/

6. After troubleshooting, remove the trace rules to avoid noisy logs
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -D PREROUTING -t raw -p udp -j TRACE`
   - `kubectl exec -n kube-system kube-proxy-kczpb -- iptables -D OUTPUT -t raw -p udp -j TRACE`

## Owner

Jordan Harder <Jordan.Harder@microsoft.com>
