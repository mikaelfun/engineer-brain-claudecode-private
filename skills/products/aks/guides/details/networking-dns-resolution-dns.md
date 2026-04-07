# AKS DNS 解析排查 — dns -- Comprehensive Troubleshooting Guide

**Entries**: 35 | **Draft sources**: 6 | **Kusto queries**: 0
**Source drafts**: ado-wiki-aks-troubleshooting-dns-performance-lab.md, ado-wiki-custom-logging-with-fluentbit.md, ado-wiki-troubleshoot-nsg-common-scenarios.md, mslearn-dns-resolution-troubleshooting.md, mslearn-realtime-dns-analysis.md, onenote-coredns-logging-enable.md
**Generated**: 2026-04-07

---

## Phase 1: Race condition in Linux kernel with concurrent UDP

### aks-226: AKS pods experience intermittent 5-second DNS resolution delays

**Root Cause**: Race condition in Linux kernel with concurrent UDP DNS queries on conntrack entries

**Solution**:
Update Azure CNI. Options: single-request-reopen in resolv.conf, node-local DNS cache, or upgrade kernel. TSG: CloudNativeCompute wiki/101057

`[Score: [G] 10.0 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 2: Node pools are severely over-committed on CPU (lim

### aks-544: AKS pods intermittently fail DNS resolution with timeout errors (communications ...

**Root Cause**: Node pools are severely over-committed on CPU (limits 435-642%), causing CoreDNS pods to experience CPU throttling. Workload pods flooding CoreDNS with excessive DNS queries. Cluster not following best practices: no dedicated system pool, non-ephemeral OS disk, incorrect SKU sizing.

**Solution**:
1) Create dedicated system node pool with proper SKU sizing and ephemeral OS disk (ref: learn.microsoft.com/azure/aks/use-system-pools). 2) Tune workload resource requests/limits for better pod distribution across nodes. 3) If still insufficient, implement Node Local DNS (kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/). 4) Monitor CoreDNS with managed Prometheus + Grafana (dashboard ID 14981). Note: Azure DNS has per-VM query limits.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AKS%20troubleshooting%20DNS%20performance%20issues%20lab)]`

## Phase 3: When node pools use different subnets with custom 

### aks-1136: DNS resolution from User node pool pods fails, or kubectl logs returns TLS hands...

**Root Cause**: When node pools use different subnets with custom NSGs, inbound/outbound rules may block UDP 53 (DNS to CoreDNS) or TCP 10250 (kubelet) between subnets

**Solution**:
Configure custom NSGs to allow required inter-subnet traffic: UDP 53 for DNS, TCP 10250 for kubelet; AKS does not auto-update custom NSGs

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/traffic-between-node-pools-is-blocked)]`

## Phase 4: Node cannot reach required endpoints during bootst

### aks-078: AKS node provisioning fails with CSE error codes 50 (ERR_OUTBOUND_CONN_FAIL) or ...

**Root Cause**: Node cannot reach required endpoints during bootstrap. Common causes: custom DNS not resolving storage FQDN, NVA blocking traffic, NSG blocking outbound, ExpressRoute/on-prem routing issues.

**Solution**:
Verify required outbound FQDNs. Check cluster-provision.log (/var/log/azure/cluster-provision.log) via Geneva Actions or InspectIaaSDisk. Involve Network team for NVA/NSG/DNS verification.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 5: AKS does not allow direct modification of the buil

### aks-218: Cannot modify CoreDNS forward plugin policy for root zone in AKS; need to change...

**Root Cause**: AKS does not allow direct modification of the built-in CoreDNS Corefile

**Solution**:
Configure a custom CoreDNS ConfigMap to override or extend DNS behavior. Do not modify built-in corefile directly

`[Score: [G] 8.0 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 6: Jumpbox VM 不在 AKS 集群所在的 VNet 或对等 VNet 中，无法解析 priva

### aks-460: kubectl 无法连接 AKS Private Cluster 的 API Server

**Root Cause**: Jumpbox VM 不在 AKS 集群所在的 VNet 或对等 VNet 中，无法解析 private API server FQDN。

**Solution**:
确保 jumpbox 部署在 AKS VNet 或已对等的 VNet 中。验证 DNS 解析：nslookup <cluster>.<zone>.privatelink.<region>.azmk8s.io。

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConnecting%20Private%20Cluster%20Jumpbox%20MI)]`

## Phase 7: Jumpbox VM is not in the same VNet or a peered VNe

### aks-461: kubectl cannot reach AKS private cluster API server from jumpbox VM

**Root Cause**: Jumpbox VM is not in the same VNet or a peered VNet as the AKS private cluster

**Solution**:
Deploy jumpbox in the AKS VNet or a peered VNet; verify DNS resolution of the private API server FQDN with nslookup

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConnecting%20Private%20Cluster%20Jumpbox%20MI)]`

## Phase 8: AKS nodes do not have custom /etc/hosts entries by

### aks-475: AKS worker nodes cannot resolve custom hostnames that require external DNS; need...

**Root Cause**: AKS nodes do not have custom /etc/hosts entries by default and there is no built-in way to configure them.

**Solution**:
Deploy a privileged DaemonSet using nsenter to inject entries into node's /etc/hosts. The DaemonSet container uses 'nsenter --target 1 --mount --uts --ipc --net --pid' with hostPID:true to access the node's root namespace and append DNS entries resolved via dig.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Customizing%20node%20hosts%20file)]`

## Phase 9: When a custom NSG is associated with AKS subnets, 

### aks-545: AKS inbound traffic between node pools blocked — pods on one node pool cannot re...

**Root Cause**: When a custom NSG is associated with AKS subnets, AKS does not automatically update NSG rules. Missing allow rules for inter-nodepool traffic (especially UDP 53 for DNS) cause inbound traffic to be dropped.

**Solution**:
1) Use Network Watcher > NSG diagnostics (Target: VMSS NIC, Protocol: UDP, Source: other node IP) to identify the blocking rule; 2) Or use ASC > Test Traffic (Direction: TunnelorLocalIn, Source: other node IP, Dest port: 53, Protocol: UDP); 3) Add NSG allow rule for UDP port 53 between node pool subnets.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F11%20-%20Troubleshoot%20NSG%20Common%20Scenarios)]`

## Phase 10: iptables DNAT rules not properly forwarding traffi

### aks-560: DNS resolution times out via kube-dns service IP but works when querying CoreDNS...

**Root Cause**: iptables DNAT rules not properly forwarding traffic from kube-dns service ClusterIP to CoreDNS pod endpoints — likely kube-proxy issue

**Solution**:
Isolate using nslookup: test kube-dns service IP, CoreDNS pod IP, and upstream DNS IP separately. If service IP fails but pod IP works, investigate kube-proxy iptables rules

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20CoreDNS)]`

## Phase 11: High CPU usage (~100%) on node hosting CoreDNS pod

### aks-561: DNS timeout with CoreDNS error: read udp i/o timeout when forwarding to upstream...

**Root Cause**: High CPU usage (~100%) on node hosting CoreDNS pod causes CoreDNS to fail forwarding DNS requests to upstream

**Solution**:
Check node CPU via Applens Performance or ASI Node VM Performance. Delete the CoreDNS pod to reschedule it to a healthier node: kubectl delete pod <coredns-pod> -n kube-system

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20CoreDNS)]`

## Phase 12: Private DNS zone not properly linked to the VNet, 

### aks-569: Private AKS cluster — unable to connect to API server due to DNS lookup failure ...

**Root Cause**: Private DNS zone not properly linked to the VNet, or DNS record for API server missing/incorrect in the private DNS zone

**Solution**:
1. Check DNS zone linked to VNet: az network private-dns link vnet list. 2. Check DNS A record exists: az network private-dns record-set a list. 3. Verify record points to correct private endpoint IP. 4. If using custom DNS, ensure conditional forwarding to 168.63.129.16 for privatelink zone.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20PrivateLink%20Cluster)]`

## Phase 13: Custom DNS server cannot resolve A records under A

### aks-803: AKS nodes cannot resolve API server private FQDN in a private AKS cluster with c...

**Root Cause**: Custom DNS server cannot resolve A records under Azure private DNS zone. DNS queries not forwarded to Azure default DNS (168.63.129.16), or virtual network link between custom DNS VNet and private DNS zone is missing.

**Solution**:
For Azure-hosted custom DNS: 1) Link private DNS zone to custom DNS server VNet. 2) Forward queries to 168.63.129.16. For on-prem DNS: 1) Set up Azure VM as forwarder. 2) Link private DNS zone to VM VNet. 3) On-prem forwards to Azure VM, VM forwards to 168.63.129.16. AKS VNet auto-linked but custom DNS VNet must also be linked.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FSetup%20private%20AKS%20with%20custom%20DNS%20server)]`

## Phase 14: Multiple possible causes: Azure DNS resolver failu

### aks-555: AKS DNS resolution failure: NXDOMAIN or connection timeout when resolving FQDN

**Root Cause**: Multiple possible causes: Azure DNS resolver failure, misconfigured custom DNS, network policy blocking DNS traffic on port 53.

**Solution**:
Use nslookup/dig to test. Check Jarvis for DNS request stats from VM (https://jarvis-east.dc.ad.msft.net/E91170D5) and Azure DNS query results (https://jarvis-west.dc.ad.msft.net/B436207C). Engage Azure Network POD (CloudNet PG) for advanced DNS troubleshooting.

`[Score: [B] 7.0 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F%5BTSG%5D%20Azure%20DNS)]`

## Phase 15: Azure Automation Account configured at subscriptio

### aks-626: After stopping and restarting a private AKS cluster via Azure Automation runbook...

**Root Cause**: Azure Automation Account configured at subscription level stops all AKS clusters including private ones. Stopping a private AKS cluster can break the private DNS zone link to the virtual network, causing DNS resolution failures for the API server FQDN

**Solution**:
Exclude private AKS clusters from the automation schedule by adding filtering logic in the runbook. If already affected, re-link the private DNS zone to the virtual network per https://learn.microsoft.com/en-us/azure/aks/private-clusters

`[Score: [B] 6.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FTools%2FMiscellaneous%2FResource%20Shutdown%20Automation)]`

## Phase 16: Network-level changes (DNS, firewall ports/FQDNs, 

### aks-1096: All AKS cluster nodes change to NotReady status simultaneously after network-lev...

**Root Cause**: Network-level changes (DNS, firewall ports/FQDNs, NSG rules, route table for AKS traffic) break kubelet heartbeat communication with API server

**Solution**:
Verify and correct network-level changes; check connectivity to AKS outbound requirements using curl/telnet from node; stop and restart affected nodes; review AKS diagnostics for SNAT failures or IOPS issues

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-after-being-healthy)]`

## Phase 17: Custom DNS server misconfiguration - cannot resolv

### aks-1098: AKS node NotReady with CSE provisioning failure; kubelet fails to start during n...

**Root Cause**: Custom DNS server misconfiguration - cannot resolve API server FQDN; missing conditional forwarders to Azure DNS; private DNS zone not linked to custom DNS VNet

**Solution**:
Configure custom DNS with conditional forwarders to Azure DNS (168.63.129.16); link private AKS DNS zone to custom DNS VNets; verify via az vmss run-command invoke with telnet/nslookup

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-custom-script-extension-errors)]`

## Phase 18: CoreDNS default scaling insufficient for DNS traff

### aks-1103: CoreDNS pod OOMKilled in kube-system due to DNS traffic spikes

**Root Cause**: CoreDNS default scaling insufficient for DNS traffic volume

**Solution**:
Customize CoreDNS scaling; ensure system node pool has 3+ nodes; isolate user workloads to user node pools

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters)]`

## Phase 19: VNet DNS settings mix custom DNS servers with Azur

### aks-1120: DNS resolution fails from inside pod but works from worker node; CoreDNS randoml...

**Root Cause**: VNet DNS settings mix custom DNS servers with Azure DNS (168.63.129.16). CoreDNS forward plugin uses random policy to select upstream server, so some queries go to Azure DNS which cannot resolve custom/private domains. Node resolver uses sequential policy and always hits the first (custom) DNS server.

**Solution**:
Remove Azure DNS (168.63.129.16) from VNet DNS settings. Keep only custom DNS servers in VNet config. Configure Azure DNS as forwarder in your custom DNS server instead.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/troubleshoot-dns-failure-from-pod-but-not-from-worker-node)]`

## Phase 20: Nodes cannot resolve cluster FQDN via DNS. Common 

### aks-1160: AKS cluster creation/start fails with K8SAPIServerDNSLookupFailVMExtensionError ...

**Root Cause**: Nodes cannot resolve cluster FQDN via DNS. Common in private clusters with custom DNS missing conditional forwarder to Azure DNS (168.63.129.16) or DNS zone not linked to VNet.

**Solution**:
Verify DNS: dig/nslookup <cluster-fqdn>. Ensure custom DNS forwards to 168.63.129.16. For private clusters verify DNS zone linked to VNet. Reconcile failed creation with az resource update.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-k8sapiserverdnslookupfailvmextensionerror)]`

## Phase 21: AKS nodes and Key Vault private endpoint are on di

### aks-1266: Key Vault Secrets Provider: StatusCode=403 Forbidden - Public network access is ...

**Root Cause**: AKS nodes and Key Vault private endpoint are on different virtual networks; no VNet link or peering configured

**Solution**:
Create virtual network link for AKS VNet at private DNS zone (privatelink.vaultcore.azure.net); add VNet peering between AKS and Key Vault VNets; verify with nslookup and nc

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver)]`

## Phase 22: A jumpbox VM was added to the same Availability Se

### aks-014: AKS cluster upgrade fails with error code 'UpgradeFailed', CSE extension error '...

**Root Cause**: A jumpbox VM was added to the same Availability Set as AKS worker nodes with custom DNS servers configured on its NIC. Azure propagates NIC DNS settings within an availability set to all members, causing AKS worker node NICs to inherit incorrect custom DNS servers, breaking outbound DNS resolution during upgrade.

**Solution**:
Option 1: Delete the jumpbox VM from the availability set. Option 2: Change the jumpbox NIC DNS setting from custom DNS servers to 'Inherit from virtual network'. ERR_OUTBOUND_CONN_FAIL=50 indicates inability to establish outbound network connection during node provisioning.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1]]`

## Phase 23: AKS 1.12.4+ uses CoreDNS instead of KubeDNS; CoreD

### aks-032: DNS issues in AKS cluster; need to debug DNS resolution but CoreDNS pods show no...

**Root Cause**: AKS 1.12.4+ uses CoreDNS instead of KubeDNS; CoreDNS logging is disabled by default for performance; without enabling the log plugin all DNS query traffic is invisible in pod logs

**Solution**:
1) Create coredns-custom ConfigMap in kube-system with test.override containing "log" directive; 2) Delete old coredns-custom configmap and recreate from yaml; 3) Delete CoreDNS pods to force config reload (pods auto-restart); 4) kubectl logs on new CoreDNS pod to see DNS queries. CRITICAL: disable logging immediately after diagnosis (remove log line, recreate ConfigMap, restart pods) — CoreDNS logging is a severe performance killer in production.

`[Score: [B] 6.0 | Source: [onenote: MCVKB/Net/=======8.AKS=======/8.1[AKS]Ho]]`

## Phase 24: Custom DNS server configured on the VNET did not h

### aks-166: AKS cluster provision fails when VNET uses custom DNS server that does not open ...

**Root Cause**: Custom DNS server configured on the VNET did not have UDP port 53 open, causing DNS query timeouts during AKS provisioning. AKS node bootstrapping requires DNS resolution to reach Azure endpoints.

**Solution**:
Ensure the custom DNS server opens UDP port 53 for DNS queries. Verify DNS resolution works from within the VNET before creating AKS cluster.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 25: Known Linux (Ubuntu) kernel race condition in conn

### aks-173: DNS resolution in AKS pods fails intermittently; sporadic DNS lookup timeouts in...

**Root Cause**: Known Linux (Ubuntu) kernel race condition in conntrack/netfilter causing intermittent DNS query failures. The race condition affects UDP DNS packets traversing iptables NAT rules.

**Solution**:
Upgrade to a newer AKS node image with patched kernel. Workaround: use TCP for DNS queries, or configure ndots:1 in pod DNS config to reduce DNS query amplification.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 26: The --dns-service-ip value is not within the --ser

### aks-1186: AKS cluster creation fails with DnsServiceIpOutOfServiceCidr. The DNS service IP...

**Root Cause**: The --dns-service-ip value is not within the --service-cidr range specified during cluster creation.

**Solution**:
Ensure the DNS service IP (--dns-service-ip) falls within the service CIDR (--service-cidr) range.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/dnsserviceipoutofservicecidr-error)]`

## Phase 27: Custom DNS server misconfigured; private DNS zone 

### aks-1207: AKS cluster start/create fails with VMExtensionError_K8SAPIServerDNSLookupFail —...

**Root Cause**: Custom DNS server misconfigured; private DNS zone not linked to VNet; conditional forwarding doesn't support subdomains

**Solution**:
Verify DNS resolution with dig/nslookup on node; link private DNS zone to VNet; configure custom DNS correctly for private cluster; reconcile cluster with 'az resource update' if needed

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-k8sapiserverdnslookupfail)]`

## Phase 28: CSE cannot reach endpoints for downloading Kuberne

### aks-1210: AKS cluster creation fails with VMExtensionProvisioningTimeout: VM extension pro...

**Root Cause**: CSE cannot reach endpoints for downloading Kubernetes/CNI binaries, outbound connectivity blocked, DNS resolution failure, or apt-get update timeout during node provisioning

**Solution**:
1) Check egress filtering setup against AKS required FQDNs (aka.ms/aks/outbound-rules). 2) Verify DNS resolution for cluster FQDN on custom DNS. 3) For private clusters ensure Azure DNS 168.63.129.16 is upstream DNS. 4) Review firewall rules not blocking required ports

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-provisioningtimeout)]`

## Phase 29: --dns-service-ip in AKSNodeClass incorrect or not 

### aks-1278: NAP/Karpenter DNS service IP mismatch - pods cannot resolve DNS or kubelet fails...

**Root Cause**: --dns-service-ip in AKSNodeClass incorrect or not matching kube-dns ClusterIP; DNS IP not in service CIDR; firewall blocking port 53

**Solution**:
Verify --dns-service-ip matches kube-dns ClusterIP, ensure DNS IP within service CIDR, check NSG allows port 53 TCP/UDP, restart CoreDNS if errored

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision)]`

## Phase 30: By design, the Root zone under vnetDNSOverrides ca

### aks-634: AKS LocalDNS validation failure when configuring Root zone (.) with forwardDesti...

**Root Cause**: By design, the Root zone under vnetDNSOverrides cannot use ClusterCoreDNS as forwardDestination. This would create a routing loop since VnetDNS traffic for the root zone must go to the actual VNET DNS servers, not back to cluster CoreDNS.

**Solution**:
Set forwardDestination to VnetDNS for the Root zone under vnetDNSOverrides. Only cluster.local zone can use ClusterCoreDNS as the forward destination in vnetDNSOverrides.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS)]`

## Phase 31: By design, the cluster.local zone cannot forward t

### aks-646: AKS LocalDNS validation failure when configuring cluster.local zone with forward...

**Root Cause**: By design, the cluster.local zone cannot forward to VnetDNS. Kubernetes internal service names (cluster.local) must be resolved by CoreDNS within the cluster, not by external VNET DNS servers.

**Solution**:
Set forwardDestination to ClusterCoreDNS for the cluster.local zone in both vnetDNSOverrides and kubeDNSOverrides.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS)]`

## Phase 32: ServerStale Verify mode requires UDP protocol for 

### aks-657: AKS LocalDNS validation failure when configuring ServerStale=Verify with Protoco...

**Root Cause**: ServerStale Verify mode requires UDP protocol for stale response verification. ForceTCP is incompatible with the Verify mode of serve-stale.

**Solution**:
Either change Protocol from ForceTCP to PreferUDP, or change serveStale from Verify to Immediate or Disable when using ForceTCP.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS)]`

## Phase 33: Directly updating DNS Servers on the VNET via port

### aks-665: Customer updates VNET DNS servers directly via Azure portal or CLI on the VNET i...

**Root Cause**: Directly updating DNS Servers on the VNET via portal/CLI only updates NRP (Network Resource Provider). AKS RP is not aware of this change, so it is not propagated to the nodes.

**Solution**:
After updating VNET DNS servers, perform a nodepool reimage via AKS RP to apply and persist the changes: az aks nodepool upgrade --resource-group <rg> --cluster-name <cluster> --name <nodepool> --node-image-only

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS)]`

## Phase 34: AKS LocalDNS and upstream NodeLocalDNS are two dis

### aks-672: DNS resolution issues when both upstream Kubernetes NodeLocalDNS (NodeLocal DNSC...

**Root Cause**: AKS LocalDNS and upstream NodeLocalDNS are two distinct DNS caching mechanisms that conflict when both are enabled. They compete for DNS traffic interception on the node, causing unpredictable resolution behavior.

**Solution**:
Do not enable both NodeLocalDNS (upstream) and AKS LocalDNS on the same cluster. Migrate from upstream NodeLocalDNS to AKS LocalDNS for Azure-managed DNS caching with enhanced resiliency and automated management.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS)]`

## Phase 35: Twistlock (Prisma Cloud) Defender uses iptables NF

### aks-1064: DNS resolution fails for pods on a specific AKS node with Temporary failure in n...

**Root Cause**: Twistlock (Prisma Cloud) Defender uses iptables NFQUEUE rules to intercept DNS traffic (UDP port 53) for inspection. When Defender is OOM-killed during a cluster upgrade, its NFQUEUE consumer process terminates without cleaning up the iptables rules. The orphaned NFQUEUE rules continue redirecting DNS response packets to a queue with no consumer, causing packets to be dropped. Node-level DNS is unaffected because host traffic does not traverse these iptables chains.

**Solution**:
1. Identify affected node via pod logs and kubectl get pods -o wide. 2. Cordon the node: kubectl cordon <node>. 3. Drain workloads: kubectl drain <node> --ignore-daemonsets --delete-emptydir-data. 4. Delete/reimage the VMSS instance (az vmss delete-instances) to get a clean node. 5. Preventive: Increase Twistlock Defender memory limits (1Gi+), monitor for OOM events, consider excluding critical namespaces from Twistlock network interception.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FDNS%2FAKS%20DNS%20failures%20caused%20by%20Twistlock%20Defender%20NFQUEUE%20after%20OOM)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS pods experience intermittent 5-second DNS resolution delays | Race condition in Linux kernel with concurrent UDP DNS queri... | Update Azure CNI. Options: single-request-reopen in resolv.c... | [G] 10.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 2 | AKS pods intermittently fail DNS resolution with timeout errors (communications ... | Node pools are severely over-committed on CPU (limits 435-64... | 1) Create dedicated system node pool with proper SKU sizing ... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AKS%20troubleshooting%20DNS%20performance%20issues%20lab) |
| 3 | DNS resolution from User node pool pods fails, or kubectl logs returns TLS hands... | When node pools use different subnets with custom NSGs, inbo... | Configure custom NSGs to allow required inter-subnet traffic... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/traffic-between-node-pools-is-blocked) |
| 4 | AKS node provisioning fails with CSE error codes 50 (ERR_OUTBOUND_CONN_FAIL) or ... | Node cannot reach required endpoints during bootstrap. Commo... | Verify required outbound FQDNs. Check cluster-provision.log ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 5 | Cannot modify CoreDNS forward plugin policy for root zone in AKS; need to change... | AKS does not allow direct modification of the built-in CoreD... | Configure a custom CoreDNS ConfigMap to override or extend D... | [G] 8.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 6 | kubectl 无法连接 AKS Private Cluster 的 API Server | Jumpbox VM 不在 AKS 集群所在的 VNet 或对等 VNet 中，无法解析 private API ser... | 确保 jumpbox 部署在 AKS VNet 或已对等的 VNet 中。验证 DNS 解析：nslookup <clu... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConnecting%20Private%20Cluster%20Jumpbox%20MI) |
| 7 | kubectl cannot reach AKS private cluster API server from jumpbox VM | Jumpbox VM is not in the same VNet or a peered VNet as the A... | Deploy jumpbox in the AKS VNet or a peered VNet; verify DNS ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConnecting%20Private%20Cluster%20Jumpbox%20MI) |
| 8 | AKS worker nodes cannot resolve custom hostnames that require external DNS; need... | AKS nodes do not have custom /etc/hosts entries by default a... | Deploy a privileged DaemonSet using nsenter to inject entrie... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Compute/Linux/Customizing%20node%20hosts%20file) |
| 9 | AKS inbound traffic between node pools blocked — pods on one node pool cannot re... | When a custom NSG is associated with AKS subnets, AKS does n... | 1) Use Network Watcher > NSG diagnostics (Target: VMSS NIC, ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20Aks%20and%20Network%20team%20common%20troubleshooting%2F11%20-%20Troubleshoot%20NSG%20Common%20Scenarios) |
| 10 | DNS resolution times out via kube-dns service IP but works when querying CoreDNS... | iptables DNAT rules not properly forwarding traffic from kub... | Isolate using nslookup: test kube-dns service IP, CoreDNS po... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20CoreDNS) |
| 11 | DNS timeout with CoreDNS error: read udp i/o timeout when forwarding to upstream... | High CPU usage (~100%) on node hosting CoreDNS pod causes Co... | Check node CPU via Applens Performance or ASI Node VM Perfor... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20CoreDNS) |
| 12 | Private AKS cluster — unable to connect to API server due to DNS lookup failure ... | Private DNS zone not properly linked to the VNet, or DNS rec... | 1. Check DNS zone linked to VNet: az network private-dns lin... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20PrivateLink%20Cluster) |
| 13 | AKS nodes cannot resolve API server private FQDN in a private AKS cluster with c... | Custom DNS server cannot resolve A records under Azure priva... | For Azure-hosted custom DNS: 1) Link private DNS zone to cus... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FSetup%20private%20AKS%20with%20custom%20DNS%20server) |
| 14 | AKS DNS resolution failure: NXDOMAIN or connection timeout when resolving FQDN | Multiple possible causes: Azure DNS resolver failure, miscon... | Use nslookup/dig to test. Check Jarvis for DNS request stats... | [B] 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2F%5BTSG%5D%20Azure%20DNS) |
| 15 | After stopping and restarting a private AKS cluster via Azure Automation runbook... | Azure Automation Account configured at subscription level st... | Exclude private AKS clusters from the automation schedule by... | [B] 6.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACT%20Team%2FTools%2FMiscellaneous%2FResource%20Shutdown%20Automation) |
| 16 | All AKS cluster nodes change to NotReady status simultaneously after network-lev... | Network-level changes (DNS, firewall ports/FQDNs, NSG rules,... | Verify and correct network-level changes; check connectivity... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-after-being-healthy) |
| 17 | AKS node NotReady with CSE provisioning failure; kubelet fails to start during n... | Custom DNS server misconfiguration - cannot resolve API serv... | Configure custom DNS with conditional forwarders to Azure DN... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/node-not-ready-custom-script-extension-errors) |
| 18 | CoreDNS pod OOMKilled in kube-system due to DNS traffic spikes | CoreDNS default scaling insufficient for DNS traffic volume | Customize CoreDNS scaling; ensure system node pool has 3+ no... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/availability-performance/troubleshoot-oomkilled-aks-clusters) |
| 19 | DNS resolution fails from inside pod but works from worker node; CoreDNS randoml... | VNet DNS settings mix custom DNS servers with Azure DNS (168... | Remove Azure DNS (168.63.129.16) from VNet DNS settings. Kee... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/dns/troubleshoot-dns-failure-from-pod-but-not-from-worker-node) |
| 20 | AKS cluster creation/start fails with K8SAPIServerDNSLookupFailVMExtensionError ... | Nodes cannot resolve cluster FQDN via DNS. Common in private... | Verify DNS: dig/nslookup <cluster-fqdn>. Ensure custom DNS f... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-k8sapiserverdnslookupfailvmextensionerror) |
| 21 | Key Vault Secrets Provider: StatusCode=403 Forbidden - Public network access is ... | AKS nodes and Key Vault private endpoint are on different vi... | Create virtual network link for AKS VNet at private DNS zone... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-key-vault-csi-secrets-store-csi-driver) |
| 22 | AKS cluster upgrade fails with error code 'UpgradeFailed', CSE extension error '... | A jumpbox VM was added to the same Availability Set as AKS w... | Option 1: Delete the jumpbox VM from the availability set. O... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.1] |
| 23 | DNS issues in AKS cluster; need to debug DNS resolution but CoreDNS pods show no... | AKS 1.12.4+ uses CoreDNS instead of KubeDNS; CoreDNS logging... | 1) Create coredns-custom ConfigMap in kube-system with test.... | [B] 6.0 | [onenote: MCVKB/Net/=======8.AKS=======/8.1[AKS]Ho] |
| 24 | AKS cluster provision fails when VNET uses custom DNS server that does not open ... | Custom DNS server configured on the VNET did not have UDP po... | Ensure the custom DNS server opens UDP port 53 for DNS queri... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 25 | DNS resolution in AKS pods fails intermittently; sporadic DNS lookup timeouts in... | Known Linux (Ubuntu) kernel race condition in conntrack/netf... | Upgrade to a newer AKS node image with patched kernel. Worka... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 26 | AKS cluster creation fails with DnsServiceIpOutOfServiceCidr. The DNS service IP... | The --dns-service-ip value is not within the --service-cidr ... | Ensure the DNS service IP (--dns-service-ip) falls within th... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/dnsserviceipoutofservicecidr-error) |
| 27 | AKS cluster start/create fails with VMExtensionError_K8SAPIServerDNSLookupFail —... | Custom DNS server misconfigured; private DNS zone not linked... | Verify DNS resolution with dig/nslookup on node; link privat... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-k8sapiserverdnslookupfail) |
| 28 | AKS cluster creation fails with VMExtensionProvisioningTimeout: VM extension pro... | CSE cannot reach endpoints for downloading Kubernetes/CNI bi... | 1) Check egress filtering setup against AKS required FQDNs (... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/vmextensionerror-provisioningtimeout) |
| 29 | NAP/Karpenter DNS service IP mismatch - pods cannot resolve DNS or kubelet fails... | --dns-service-ip in AKSNodeClass incorrect or not matching k... | Verify --dns-service-ip matches kube-dns ClusterIP, ensure D... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/extensions/troubleshoot-node-auto-provision) |
| 30 | AKS LocalDNS validation failure when configuring Root zone (.) with forwardDesti... | By design, the Root zone under vnetDNSOverrides cannot use C... | Set forwardDestination to VnetDNS for the Root zone under vn... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS) |
| 31 | AKS LocalDNS validation failure when configuring cluster.local zone with forward... | By design, the cluster.local zone cannot forward to VnetDNS.... | Set forwardDestination to ClusterCoreDNS for the cluster.loc... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS) |
| 32 | AKS LocalDNS validation failure when configuring ServerStale=Verify with Protoco... | ServerStale Verify mode requires UDP protocol for stale resp... | Either change Protocol from ForceTCP to PreferUDP, or change... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS) |
| 33 | Customer updates VNET DNS servers directly via Azure portal or CLI on the VNET i... | Directly updating DNS Servers on the VNET via portal/CLI onl... | After updating VNET DNS servers, perform a nodepool reimage ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS) |
| 34 | DNS resolution issues when both upstream Kubernetes NodeLocalDNS (NodeLocal DNSC... | AKS LocalDNS and upstream NodeLocalDNS are two distinct DNS ... | Do not enable both NodeLocalDNS (upstream) and AKS LocalDNS ... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FLocalDNS) |
| 35 | DNS resolution fails for pods on a specific AKS node with Temporary failure in n... | Twistlock (Prisma Cloud) Defender uses iptables NFQUEUE rule... | 1. Identify affected node via pod logs and kubectl get pods ... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FDNS%2FAKS%20DNS%20failures%20caused%20by%20Twistlock%20Defender%20NFQUEUE%20after%20OOM) |
