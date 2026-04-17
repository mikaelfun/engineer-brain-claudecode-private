# AKS 网络连通性通用 — general -- Comprehensive Troubleshooting Guide

**Entries**: 39 | **Draft sources**: 4 | **Kusto queries**: 1
**Source drafts**: ado-wiki-a-container-debug-tools.md, ado-wiki-a-kubelet-serving-cert-rotation.md, ado-wiki-analyzing-journalctl-logs-for-oom-kills.md, ado-wiki-use-nsenter-to-debug-pods.md
**Kusto references**: arm-crp-tracking.md
**Generated**: 2026-04-07

---

## Phase 1: Ubuntu unattended-upgrades triggers systemd update

### aks-159: AKS nodes experience connection timeout/reset around UTC 06:00-07:00; network re...

**Root Cause**: Ubuntu unattended-upgrades triggers systemd update (e.g. 237-3ubuntu10.56 to 10.57) which causes network service restart; waagent detects DHCP client restart and restores routing table; during restart window, pod network connectivity is disrupted

**Solution**:
Workaround 1: Disable at OS level - edit /etc/apt/apt.conf.d/20auto-upgrades, set Unattended-Upgrade to 0. Workaround 2: Deploy DaemonSet (github.com/Azure/AKS/blob/master/examples/unattended-upgrades/daemonset.yaml). Workaround 3: Use AKS auto-upgrade with node-image channel + maintenance windows. Note: upgrading K8s version does NOT fix this

`[Score: [G] 10.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 2: Container exceeds memory limits and gets OOMKilled

### aks-1126: Intermittent timeouts accessing application on AKS; some curl requests succeed (...

**Root Cause**: Container exceeds memory limits and gets OOMKilled (exit code 137, reason: OOMKilled). Kubernetes restarts the container but it fails again, causing intermittent availability.

**Solution**:
Remove memory limit temporarily to observe actual memory usage. Set appropriate memory limits based on observed usage. Investigate potential memory leaks in the application. Configure liveness/readiness probes for faster recovery.

`[Score: [G] 8.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/intermittent-timeouts-or-server-issue)]`

## Phase 3: Cluster running outdated Docker version (docker://

### aks-170: Docker daemon stops working on AKS nodes; kubelet logs show Cannot connect to th...

**Root Cause**: Cluster running outdated Docker version (docker://1.13.1) combined with OOM conditions on the node. Old Docker runtime is less resilient to memory pressure.

**Solution**:
Update Docker/Moby to version 3.0.x or later. If node is in failed state, resize the OS disk: az disk update -g $nodeRG -n $OSdiskname -z $newSize. Drain and cordon affected nodes before maintenance.

`[Score: [G] 8.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 4: NPM pods consume excessive memory, exceeding defau

### aks-225: Azure NPM (Network Policy Manager) pods crash with OOM in AKS when network polic...

**Root Cause**: NPM pods consume excessive memory, exceeding default limits and getting OOM-killed

**Solution**:
Workaround: disable network policy. Check with PG for updated NPM version with memory optimization

`[Score: [G] 8.0 | Source: [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn]]`

## Phase 5: Azure Resource Manager throttling limits exceeded 

### aks-1164: AKS cluster creation fails with SubscriptionRequestsThrottled (Status=429): Numb...

**Root Cause**: Azure Resource Manager throttling limits exceeded for the subscription due to excessive GET/PUT requests to specific resource providers.

**Solution**:
Use a different subscription, reduce automated script frequency, scope scripts to query only necessary resources, or distribute users across subscriptions.

`[Score: [G] 8.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-subscriptionrequeststhrottled)]`

## Phase 6: AKS uses containerd runtime instead of Docker, so 

### aks-523: Docker buildx fails on AKS worker nodes with error: Cannot connect to the Docker...

**Root Cause**: AKS uses containerd runtime instead of Docker, so the Docker daemon socket is not available on worker nodes. Docker buildx expects a Docker daemon connection by default.

**Solution**:
Use Kubernetes driver for buildx: 1) Create ServiceAccount with pod/deployment permissions. 2) Run a Docker pod with buildx plugin installed. 3) Create buildx builder with --driver kubernetes flag: docker buildx create --use --name k8s node-amd64 --driver kubernetes --driver-opt image=moby/buildkit:master. 4) Build images using docker buildx build with --push to push to registry.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FOther%2FBuilding%20container%20images%20on%20AKS%20worker%20nodes%20using%20Docker%20buildx)]`

## Phase 7: Subscription exceeds ARM-level rate limits (15000 

### aks-571: AKS cluster operations (upgrade, scale, create) fail with HTTP 429 OperationNotA...

**Root Cause**: Subscription exceeds ARM-level rate limits (15000 reads/hr, 1200 writes/hr per FrontDoor instance). Common causes: monitoring software making excessive GET calls, too many concurrent users, or automated scripts constantly scanning the subscription. ARM throttling identified by failureCause=Gateway in HttpIncomingRequests.

**Solution**:
1) Identify throttling source via Kusto: query HttpIncomingRequests in armprod for 429 status codes; failureCause=Gateway means ARM throttling, failureCause=Service means RP throttling. 2) Reduce API call rate: run automated scripts less frequently, scope queries to needed resources. 3) Use Azure Resource Graph for read-heavy workloads. 4) ARM/RP rate limits are global and cannot be increased per-subscription. 5) Use clientApplicationId and operationName to identify which app/user is causing excessive calls.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/429%20Throttling)]`

## Phase 8: The custom script extension timed out running apt-

### aks-583: AKS node provisioning fails with vmssCSE exit code 99 (ERR_APT_UPDATE_TIMEOUT) —...

**Root Cause**: The custom script extension timed out running apt-get update. A Linux update package is taking too long, often due to network connectivity issues to package repositories or concurrent dpkg process.

**Solution**:
1. Check /var/log/dpkg.log for time gaps. 2. Run InspectIaaSDisk with AKS manifest for cluster-provision.log. 3. Check endpoint connectivity. 4. Fix network configuration if needed. 5. SSH to node and run apt-get update to reproduce.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 9: Bootstrap provision script is missing. Most common

### aks-584: AKS node provisioning fails with vmssCSE exit code 100 (ERR_CSE_PROVISION_SCRIPT...

**Root Cause**: Bootstrap provision script is missing. Most common cause: customer modified VMSS OS configuration custom Data (unsupported). Alternative: CRP/Fabric failure at Pre-Provisioning Service preventing ISO mount.

**Solution**:
1. Check VMSS OS configuration custom data — if modified, that is unsupported. 2. Check Extensions page in ASC. 3. If custom data was not modified, escalate to CRP team as potential platform issue.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 10: SSL inspection tool (e.g., ZScaler, corporate prox

### aks-588: AKS node provisioning fails with vmssCSE exit code 25 (ERR_MOBY_APT_LIST_TIMEOUT...

**Root Cause**: SSL inspection tool (e.g., ZScaler, corporate proxy) intercepts HTTPS connections to packages.microsoft.com and replaces the certificate with its own CA. The node CA trust store does not contain the proxy CA, so curl fails SSL verification - effectively a man-in-the-middle scenario.

**Solution**:
Bypass the SSL inspection tool (ZScaler/corporate proxy) for communications to packages.microsoft.com and other required AKS outbound FQDNs. If using AKS HTTP proxy feature, ensure the proxy CA certificate is included in the cluster trusted CA configuration. Verify: curl -v https://packages.microsoft.com/config/ubuntu/18.04/prod.list from node to check certificate chain.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning)]`

## Phase 11: Internal error in Azure resource provider (CRP for

### aks-597: AKS cluster delete fails with ResourceGroupDeletionBlocked or ResourceGroupDelet...

**Root Cause**: Internal error in Azure resource provider (CRP for compute resources like VMSS, NRP for network resources like LB/NSG/PIP) during managed resource deletion. Not caused by customer configuration but by transient or persistent RP-side issues.

**Solution**:
1) Use ASI AKS Operation to identify the failing resource. 2) Query CRP (azcrp/crp_allprod ApiQosEvent_nonGet) or NRP logs for the failed DELETE operation details. 3) Try manual resource deletion (e.g., az vmss delete) as a quick mitigation — issue may auto-resolve. 4) If not resolved, escalate to owning RP team: EEE AzureRT for VM/VMSS failures, EEE Cloudnet for network failures — provide resource ID, CRP/NRP operation ID and correlation ID.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20operation%20failed%20with%20ResourceGroupDeletionBlocked%20ResourceGroupDeletionTimeout)]`

## Phase 12: Kubernetes version upgrade breaks compatibility wi

### aks-624: After Kubernetes version upgrade, customer cannot connect to application through...

**Root Cause**: Kubernetes version upgrade breaks compatibility with nginx ingress controller (and other cluster add-ons like LinkerD, akv2k8s). Nginx ingress has a supported versions matrix that must be matched to the K8s version.

**Solution**:
Check nginx ingress supported versions table (https://github.com/kubernetes/ingress-nginx#supported-versions-table) and upgrade nginx ingress to a version compatible with the new K8s version. Similarly check compatibility for all other workloads/add-ons deployed on the cluster.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Processes/Strategic%20Customer%20Processes/AT%26T%20Reminders%20and%20Guidelines)]`

## Phase 13: FluxConfigAgent cannot communicate with the Azure 

### aks-662: FluxConfiguration changes not reflecting on cluster; configuration applying loca...

**Root Cause**: FluxConfigAgent cannot communicate with the Azure dataplane to post status back; caused by invalid/missing identity token, network blocking HTTPS to DP endpoint, or HIS certificate retrieval failure

**Solution**:
Check fluxconfig-agent pod logs for communication errors; verify HTTPS connectivity from pod to <location>.dp.kubernetesconfiguration.azure.com; query Kusto ConfigAgentTraces for 401/403 responses or 'Failed to get certificate from HIS' errors; verify connectedCluster resource exists in ARM

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG)]`

## Phase 14: Pod CIDR exhaustion in CNI Overlay. Each node pre-

### aks-755: AKS NAP/Karpenter nodes stuck NotReady. NodeNetworkConfig events: primaryIP is n...

**Root Cause**: Pod CIDR exhaustion in CNI Overlay. Each node pre-allocates /24 (256 IPs). Small Pod CIDR (e.g. /21=8 nodes max) causes IP allocation failure.

**Solution**:
Expand Pod CIDR via Azure CNI Overlay expansion (learn.microsoft.com/azure/aks/azure-cni-overlay-pod-expand). NotReady nodes auto-recover.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20Auto%20Provision%20subnet%20is%20full%20and%20pod%20cidr%20exhausted)]`

## Phase 15: AKS installs windows-exporter via AKSWindowsExtens

### aks-805: Customer's own windows-exporter or Windows service fails to start on AKS Windows...

**Root Cause**: AKS installs windows-exporter via AKSWindowsExtension using port 19182 (not the open-source default 9182). If a customer deployment also uses port 19182, a port conflict occurs.

**Solution**:
Configure the customer's windows-exporter to use a different port (e.g., 29182). Use Kusto query on ControlPlaneEvents kube-audit category to identify DaemonSets with hostPort 19182 conflicts. ICM ref: 530938116.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Node%20Extension)]`

## Phase 16: When AKS cluster using Azure CNI Overlay or Pod Su

### aks-898: Unable to delete subnet or parent VNet after AKS cluster deletion - subnet still...

**Root Cause**: When AKS cluster using Azure CNI Overlay or Pod Subnet networking is deleted, the ServiceAssociationLink (SAL) created during cluster provisioning is not automatically removed

**Solution**:
1) Remove delegation via Portal: Virtual Networks > Subnets > select subnet > Delegate subnet to service > None > Save. 2) Or via CLI: az network vnet subnet update --resource-group <RG> --name <subnet> --vnet-name <vnet> --remove delegations. 3) If above fails, use Jarvis actions for undelegation (note: restricted in China/21V, CSS cannot perform Jarvis undelegation in China).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FUndelegate%20Subnet)]`

## Phase 17: Pod CIDR exhaustion in Azure CNI Overlay cluster. 

### aks-955: NAP (Node Auto Provision / Karpenter) scaled nodes stuck in NotReady state; Node...

**Root Cause**: Pod CIDR exhaustion in Azure CNI Overlay cluster. Each node pre-allocates a /24 block (256 IPs) from Pod CIDR. When Pod CIDR is too small (e.g. /21 supports only 8 nodes), additional nodes cannot obtain IP allocation.

**Solution**:
1) Check NodeNetworkConfig events for 'Subnet is full' and 'primaryIP is nil' errors; 2) Expand Pod CIDR using az aks update per docs (https://learn.microsoft.com/en-us/azure/aks/azure-cni-overlay-pod-expand); 3) After expansion, NotReady nodes auto-recover; azure-cns pods redeploy but existing pods unaffected.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20Auto%20Provision%20subnet%20is%20full%20and%20pod%20cidr%20exhausted)]`

## Phase 18: New GPU node transitions to ready/schedulable stat

### aks-983: Pod fails to start on newly provisioned GPU node with: rpc error: code = Unavail...

**Root Cause**: New GPU node transitions to ready/schedulable state before full initialization; pod (e.g. GitLab CI runner) is scheduled and attempts to pull container image before containerd runtime is ready, causing CrashLoopBackOff on first attempt

**Solution**:
1) Taint GPU node pool and add tolerations/nodeSelectors for GPU-requiring pods only. 2) Add retry logic to CI job definitions. 3) Add pre-check script waiting for containerd socket availability. 4) Use DaemonSet to pre-pull large images on GPU node startup

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FContainerd%20socket%20errors%20on%20GPU%20nodes)]`

## Phase 19: Residual nmi DaemonSet from deprecated AAD Pod Ide

### aks-1010: Backup jobs fail with identity assignment errors after AAD Pod Identity addon re...

**Root Cause**: Residual nmi DaemonSet from deprecated AAD Pod Identity addon (deprecated Oct 2023, removed after March 2024) remains in cluster. Leftover nmi intercepts traffic to Azure IMDS, causing identity assignment failures for other pods.

**Solution**:
1) Check addon: 'az aks show --query addonProfiles.azurePodIdentity'. 2) Check residual nmi: 'kubectl get daemonset -n kube-system | grep nmi'. 3) Install aks-preview extension. 4) Disable: 'az aks update -g <rg> -n <cluster> --disable-pod-identity'. Migrate to Azure Workload Identity.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FResidual%20nmi%20daemonset%20after%20aad%20removal)]`

## Phase 20: The kube-node-lease namespace is stuck in Terminat

### aks-1051: AKS nodes report NodeNotReady status despite no memory/disk/network/kubelet reso...

**Root Cause**: The kube-node-lease namespace is stuck in Terminating state due to a finalizer (e.g., Rancher controller.cattle.io/namespace-auth) blocking namespace deletion. This prevents kubelet from updating its heartbeat lease, causing the control plane to mark nodes as NotReady.

**Solution**:
(1) Inspect namespace: `kubectl describe namespace kube-node-lease`. (2) Remove blocking finalizers: `kubectl patch namespace kube-node-lease -p '{"metadata":{"finalizers":[]}}' --type=merge`. (3) Verify namespace returns to Active status and nodes return to Ready. Note: kube-node-lease namespace is expected to remain Active in AKS; if accidentally deleted it is auto-recreated.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FNodeNotReady%20Kube%20node%20lease%20namespace)]`

## Phase 21: Missing required setup for managed storage: --enab

### aks-1086: ACNS Container Network Logs enabled (managed storage via AzMon), but no flow log...

**Root Cause**: Missing required setup for managed storage: --enable-retina-flow-logs not set, or Azure Monitor addon not enabled with --enable-high-log-scale-mode.

**Solution**:
Verify: 1) ACNS enabled (--enable-acns). 2) --enable-retina-flow-logs set. 3) az aks enable-addons -a monitoring --enable-high-log-scale-mode. Check: az aks addon list. Verify ama-logs DaemonSet pods running.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Cilium/Container%20Network%20Logs)]`

## Phase 22: retinanetworkflowlog CR not created, or acns-flowl

### aks-1087: ACNS Container Network Logs enabled (unmanaged storage), but events.log file not...

**Root Cause**: retinanetworkflowlog CR not created, or acns-flowlog-config ConfigMap not updated by cilium-operator. ~30s delay between CR ops and ConfigMap updates.

**Solution**:
1) Verify ACNS: az aks show, check advancedNetworking.enabled+observability.enabled. 2) kubectl get retinanetworkflowlog. 3) kubectl get cm acns-flowlog-config -n kube-system -oyaml. 4) Check cilium-operator pods. 5) Wait ~30s after CR creation.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Cilium/Container%20Network%20Logs)]`

## Phase 23: AKS outage Aug 30 2023: corrupted ARM manifest in 

### aks-086: AKS operations in ChinaNorth2/ChinaNorth3 fail with GatewayTimeout: gateway did ...

**Root Cause**: AKS outage Aug 30 2023: corrupted ARM manifest in ChinaNorth2/ChinaNorth3. Only control plane impacted. PG LSI ICM: 419210098.

**Solution**:
Platform outage resolved by PG restoring ARM manifest. Existing workloads unaffected. Check Azure status page and Iridias for similar future outages. 21v LSI ICMs: 419211705, 419213808.

`[Score: [B] 6.5 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 24: The cluster identity (service principal or managed

### aks-1192: AKS cluster creation fails with LinkedAuthorizationFailed: service principal has...

**Root Cause**: The cluster identity (service principal or managed identity) has permissions on the primary resource but lacks permissions on a linked/dependent resource referenced in the operation

**Solution**:
Grant the service principal/managed identity the required permission on the linked resource mentioned in the error message. Use Azure portal Role Assignments to assign the specific action (e.g., Microsoft.Network/ddosProtectionPlans/join/action) on the linked scope.

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/linkedauthorizationfailed-error)]`

## Phase 25: Combination of VM constraints (size, SKU, accelera

### aks-1212: AKS cluster create/scale fails with OverconstrainedAllocationRequest: VM cannot ...

**Root Cause**: Combination of VM constraints (size, SKU, accelerated networking, ephemeral disk, proximity placement group) is too restrictive for Azure to find matching capacity

**Solution**:
Create new node pool without proximity placement group association. Reduce constraints by removing ephemeral disk or accelerated networking requirements. For dedicated hosts, ensure enough hosts spanning required fault domains

`[Score: [B] 6.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/zonalallocation-allocationfailed-error)]`

## Phase 26: Customer was facing the error as they did not add 

### aks-1316: GitOps Flux V2 extension installation failed with an error message- "Helm Instal...

**Root Cause**: Customer was facing the error as they did not add the security context constraint for OpenShift cluster as mentioned in the docs: https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/tutorial-use-gitops-flux2?tabs=azure-cli#red-hat-openshift-onboarding-guidance

**Solution**:
We could install the extension successfully after adding the security context. NS="flux-system" oc adm policy add-scc-to-user nonroot system:serviceaccount:$NS:kustomize-controller oc adm policy add-scc-to-user nonroot system:serviceaccount:$NS:helm-controller oc adm policy add-scc-to-user nonroot system:serviceaccount:$NS:source-controller oc adm policy add-scc-to-user nonroot system:serviceaccount:$NS:notification-controller oc adm policy add-scc-to-user nonroot system:serviceaccount:$NS:image-automation-controller oc adm policy add-scc-to-user nonroot system:serviceaccount:$NS:image-reflector-controller

`[Score: [B] 6.5 | Source: [ContentIdea#188702](https://support.microsoft.com/kb/5037553)]`

## Phase 27: The logs generated from the below command indicate

### aks-1317: vCenter vCENTER is showing as Disconnected within Azure connected to Azure Arc R...

**Root Cause**: The logs generated from the below command indicate the following: az arcappliance logs vmware --ip 10.XX.XX.XXX --username USERNAME --password PASS --address XX-VCENTER.microsoft.com --out-dir C:\\Temp\\Folder  2024-09-30T13:00:39+01:00 DEBUG Unable to create Kubernetes client from kubeconfig. Error: kubeconfig not specified2024-09-30T13:00:39+01:00DEBUGvsphereProvider: Prepping the vsphere provider2024-09-30T13:00:39+01:00 DEBUGvsphereClient: GetClient{'vcenterurl': 'XX-VCENTER.microsoft.com'}2024-09-30T13:00:42+01:00DEBUGUnable to determine node IP from fabric. Error: error in provider prep: error getting the vSphere SDK client: ServerFaultCode: Cannot complete login due to an incorrect user name or password.2024-09-30T13:00:42+01:00DEBUG Kubernetes IPs are2024-09-30T13:00:42+01:00 DEBUG Fabric IPs are [] Analysis or Explanation:        2024-09-30T13:00:39+01:00 DEBUG Unable to create Kubernetes client from kubeconfig. Error: kubeconfig not specified This log indicates that the system attempted to create a Kubernetes client but failed because the kubeconfig file, which contains the configuration Information for accessing the Kubernetes cluster, was not specified.           2024-09-30T13:00:39+01:00 DEBUG vSphereProvider: Prepping the vSphere provider Here, The system is preparing the vSphere provider, which is responsible for managing virtual machines and other resources in a vSphere environment.           2024-09-30T13:00:39+01:00 DEBUG vsphereClient: GetClient {'vcenterurl': 'XX-VCENTER.microsoft.com'} This log shows that the system is attempting to get a client for the vSphere environment using the specified vCenter URL (XX-VCENTER.microsoft.com).           2024-09-30T13:00:42+01:00 DEBUG Unable to determine node IP from fabric. Error: error in provider prep: error getting the vSphere SDK client: ServerFaultCode: Cannot complete        login due to an incorrect user name or password. The system failed to determine the node IP from the fabric because there was an error in preparing the provider. Specifically, it encountered a ServerFaultCode indicating that the login could not be completed due to an incorrect username or password.            2024-09-30T13:00:42+01:00 DEBUG Kubernetes IPs are This log indicates that the system was unable to retrieve any Kubernetes IPs, resulting in an empty list.             2024-09-30T13:00:42+01:00 DEBUG Fabric IPs are [] Similarly, the system was unable to retrieve any fabric IPs, resulting in an empty list.     In summary, the logs indicate that the system encountered issues while trying to create a Kubernetes client and connect to the vSphere environment due to missing kubeconfig and incorrect login credentials. As a result, it was unable to determine the node IPs from the fabric and retrieve any Kubernetes or fabric IPs.

**Solution**:
Outdated VMware credentials used by Arc resource bridge. Update VMware credentials used by Arc resource bridge.

Update VMware credentials used by Arc resource bridge

 Azure CLI
 Open Cloud Shell
 az arcappliance update-infracredentials vmware --kubeconfig [REQUIRED] --skipWait
 
 Update VMware credentials used by Arc resource bridge with non-interactive mode using VMware credentials as parameters
 
 Azure CLI
 Open Cloud Shell az arcappliance update-infracredentials vmware --kubeconfig [REQUIRED] --address [REQUIRED] --username [REQUIRED] --password [REQUIRED] --skipWait

`[Score: [B] 6.5 | Source: [ContentIdea#196719](https://support.microsoft.com/kb/5047672)]`

## Phase 28: AKS operations span multiple tiers (AKS RP -> CRP 

### aks-039: AKS cluster create/upgrade operation fails; need to trace the failure from AKS R...

**Root Cause**: AKS operations span multiple tiers (AKS RP -> CRP -> RDOS/WA); each tier uses different correlation IDs; multi-hop Kusto query chain needed to follow operation across systems

**Solution**:
Kusto chain: 1) akscn/AKSprod FrontEndQoSEvents|AsyncQoSEvents by subscriptionID+resourceName -> get operationID; 2) AsyncContextActivity by operationID + level!=info -> find error message (e.g., ContextDeadlineExceeded on vmextension.put.request); 3) OutgoingRequestTrace by operationID+targetURI filter -> get clientRequestID (becomes CRP correlationID); 4) azcrpmc/crp_allmc ApiQosEvent by correlationId -> get goalSeekingActivityId (= CRP operationId); 5) ContextActivity by activityId -> trace CRP-level detail; 6) azurecm LogContainerSnapshot by subscriptionId+roleInstanceName -> get containerId; 7) rdosmc/rdos GuestAgentExtensionEvents by ContainerId -> VM extension/WA agent logs. Key clusters: akscn.kusto.chinacloudapi.cn/AKSprod, azcrpmc.kusto.chinacloudapi.cn/crp_allmc, rdosmc.kusto.chinacloudapi.cn/rdos, azurecm.chinanorth2.kusto.chinacloudapi.cn/azurecm

`[Score: [B] 6.0 | Source: [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2]]`

## Phase 29: CSE execution on new VMSS instances exceeds timeou

### aks-233: AKS cluster scale-up or node pool addition fails due to CustomScriptExtension (C...

**Root Cause**: CSE execution on new VMSS instances exceeds timeout during node bootstrapping, typically caused by network connectivity issues (DNS resolution, package download from MCR/apt repos) or slow provisioning in Mooncake

**Solution**:
1) Check CSE logs on failed node via SSH or serial console. 2) AKS remediator may auto-heal by reimaging the node (CSE -> node not ready -> remediator). 3) If auto-heal fails, manually delete stuck nodes and retry scale-up. 4) Verify DNS and outbound connectivity from VMSS subnet

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 30: Go-client HTTP/2 transport bug: TCP connections no

### aks-268: AKS nodes intermittently become NotReady and auto-recover; kubelet logs show fai...

**Root Cause**: Go-client HTTP/2 transport bug: TCP connections not properly recycled after server-side close. Fixed in K8s 1.20+ (PR#95981, PR#89652).

**Solution**:
1) Upgrade to K8s 1.20+ for go-client transport fixes. 2) For <1.20, accept auto-recovery. 3) Check NVA/NSG/DNS if persistent.

`[Score: [B] 6.0 | Source: [onenote: Mooncake POD Support Notebook/POD/VMSCIM]]`

## Phase 31: Konnectivity tunnel between API server and cluster

### aks-1123: 'Error from server: error dialing backend: dial tcp' for kubectl logs/exec/attac...

**Root Cause**: Konnectivity tunnel between API server and cluster nodes is broken. konnectivity-agent pods in kube-system are not running or not in ready state.

**Solution**:
Check konnectivity-agent pods in kube-system namespace. Delete the pods to force restart. Verify required outbound network rules for Konnectivity are not blocked.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/error-from-server-error-dialing-backend-dial-tcp)]`

## Phase 32: Network appliance or proxy blocks the ALPN TLS ext

### aks-1133: kubectl commands timeout - ALPN (Application-Layer Protocol Negotiation) TLS ext...

**Root Cause**: Network appliance or proxy blocks the ALPN TLS extension (RFC 7301) required by konnectivity-agent to establish tunnel with control plane

**Solution**:
Enable ALPN TLS extension on the network path; check intermediate proxies/firewalls for TLS inspection that strips ALPN

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server)]`

## Phase 33: The subnet has external resources associated with 

### aks-1201: AKS cluster create/update/scale fails with SubnetWithExternalResourcesCannotBeUs...

**Root Cause**: The subnet has external resources associated with it (service association links, subnet delegations from other Azure services), preventing AKS from using it. Azure enforces that subnets with external resources cannot be shared across certain resource types.

**Solution**:
Option 1: Create a new subnet and associate it with AKS. Option 2: Delete the external references (service association links, subnet delegations) from the existing subnet, then retry.

`[Score: [B] 6.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/subnetwithexternalresourcescannotbeusedbyotherresources-error)]`

## Phase 34: Target AKS cluster is in stopped state. Trusted Ac

### aks-1049: Trusted Access partner service receives 400 error when connecting to AKS cluster...

**Root Cause**: Target AKS cluster is in stopped state. Trusted Access dataplane rejects connections to stopped clusters with 400.

**Solution**:
Start the AKS cluster before attempting Trusted Access connection. Use az aks start to start the cluster.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Access)]`

## Phase 35: Azure NPM only supports Windows2022 node pools. Wi

### aks-1078: Azure NPM (azure-npm-win) pod is missing on WindowsAnnual node pool in AKS clust...

**Root Cause**: Azure NPM only supports Windows2022 node pools. WindowsAnnual is not supported for Azure NPM by design.

**Solution**:
Use Windows2022 node pools for Azure NPM / network policy support.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%20Annual%20Channel)]`

## Phase 36: Known issue in Azure Cloud Shell where MSI token a

### aks-1130: az aks command invoke fails in Azure Cloud Shell with Failed to connect to MSI, ...

**Root Cause**: Known issue in Azure Cloud Shell where MSI token acquisition fails for az aks command invoke

**Solution**:
Run az login first before running az aks command invoke in Cloud Shell, or run the command from a local machine/VM with Azure CLI installed

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.5 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures)]`

## Phase 37: Fixed replica count of Konnectivity agents becomes

### aks-1139: Konnectivity agent performance degrades as cluster grows: increased timeouts for...

**Root Cause**: Fixed replica count of Konnectivity agents becomes bottleneck in large clusters. Insufficient memory allocation or misconfigured Cluster Proportional Autoscaler causes OOM kills.

**Solution**:
Use Cluster Proportional Autoscaler for konnectivity-agent (edit configmap konnectivity-agent-autoscaler in kube-system). Adjust resource requests/limits. Monitor OOM kills with kubectl get events.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [Y] 4.0 | Source: [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tunnel-connectivity-issues)]`

## Phase 38: Target AKS cluster certificate has expired, causin

### aks-1046: Trusted Access partner service cannot connect to AKS cluster. ResponseFlags show...

**Root Cause**: Target AKS cluster certificate has expired, causing the API server to reject Trusted Access requests with 403 Forbidden.

**Solution**:
Follow the certificate rotation documentation (https://learn.microsoft.com/en-us/azure/aks/certificate-rotation) to rotate the cluster certificates.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Access)]`

## Phase 39: ama-logs pods cannot send data to Log Analytics wo

### aks-1050: AKS Insights page shows No data for selected filters. Container Insights dashboa...

**Root Cause**: ama-logs pods cannot send data to Log Analytics workspace. Causes: firewall blocking outbound, incorrect RBAC on AKS identity, or ama-logs DaemonSet not running.

**Solution**:
1) Verify ama-logs running: kubectl get ds ama-logs -n kube-system. 2) Check AKS identity Contributor role on LA workspace RG. 3) Test connectivity: nslookup/curl <workspace_id>.oms.opinsights.azure.com:443. 4) Verify egress rules for Azure Monitor.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FData%20missing%20from%20insights%20tab)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AKS nodes experience connection timeout/reset around UTC 06:00-07:00; network re... | Ubuntu unattended-upgrades triggers systemd update (e.g. 237... | Workaround 1: Disable at OS level - edit /etc/apt/apt.conf.d... | [G] 10.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 2 | Intermittent timeouts accessing application on AKS; some curl requests succeed (... | Container exceeds memory limits and gets OOMKilled (exit cod... | Remove memory limit temporarily to observe actual memory usa... | [G] 8.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/intermittent-timeouts-or-server-issue) |
| 3 | Docker daemon stops working on AKS nodes; kubelet logs show Cannot connect to th... | Cluster running outdated Docker version (docker://1.13.1) co... | Update Docker/Moby to version 3.0.x or later. If node is in ... | [G] 8.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 4 | Azure NPM (Network Policy Manager) pods crash with OOM in AKS when network polic... | NPM pods consume excessive memory, exceeding default limits ... | Workaround: disable network policy. Check with PG for update... | [G] 8.0 | [onenote: POD/VMSCIM/4. Services/AKS/##Regular Syn] |
| 5 | AKS cluster creation fails with SubscriptionRequestsThrottled (Status=429): Numb... | Azure Resource Manager throttling limits exceeded for the su... | Use a different subscription, reduce automated script freque... | [G] 8.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/create-upgrade-delete/error-code-subscriptionrequeststhrottled) |
| 6 | Docker buildx fails on AKS worker nodes with error: Cannot connect to the Docker... | AKS uses containerd runtime instead of Docker, so the Docker... | Use Kubernetes driver for buildx: 1) Create ServiceAccount w... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FOther%2FBuilding%20container%20images%20on%20AKS%20worker%20nodes%20using%20Docker%20buildx) |
| 7 | AKS cluster operations (upgrade, scale, create) fail with HTTP 429 OperationNotA... | Subscription exceeds ARM-level rate limits (15000 reads/hr, ... | 1) Identify throttling source via Kusto: query HttpIncomingR... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Cluster%20Management/429%20Throttling) |
| 8 | AKS node provisioning fails with vmssCSE exit code 99 (ERR_APT_UPDATE_TIMEOUT) —... | The custom script extension timed out running apt-get update... | 1. Check /var/log/dpkg.log for time gaps. 2. Run InspectIaaS... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 9 | AKS node provisioning fails with vmssCSE exit code 100 (ERR_CSE_PROVISION_SCRIPT... | Bootstrap provision script is missing. Most common cause: cu... | 1. Check VMSS OS configuration custom data — if modified, th... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 10 | AKS node provisioning fails with vmssCSE exit code 25 (ERR_MOBY_APT_LIST_TIMEOUT... | SSL inspection tool (e.g., ZScaler, corporate proxy) interce... | Bypass the SSL inspection tool (ZScaler/corporate proxy) for... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FCSE%20Exit%20Codes%2FvmssCSE%20failures%20during%20node%20provisioning) |
| 11 | AKS cluster delete fails with ResourceGroupDeletionBlocked or ResourceGroupDelet... | Internal error in Azure resource provider (CRP for compute r... | 1) Use ASI AKS Operation to identify the failing resource. 2... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FCluster%20delete%20operation%20failed%20with%20ResourceGroupDeletionBlocked%20ResourceGroupDeletionTimeout) |
| 12 | After Kubernetes version upgrade, customer cannot connect to application through... | Kubernetes version upgrade breaks compatibility with nginx i... | Check nginx ingress supported versions table (https://github... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACT%20Team/Processes/Strategic%20Customer%20Processes/AT%26T%20Reminders%20and%20Guidelines) |
| 13 | FluxConfiguration changes not reflecting on cluster; configuration applying loca... | FluxConfigAgent cannot communicate with the Azure dataplane ... | Check fluxconfig-agent pod logs for communication errors; ve... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCluster%20Management%2FMicrosoft.Flux%20FluxConfiguration%20TSG) |
| 14 | AKS NAP/Karpenter nodes stuck NotReady. NodeNetworkConfig events: primaryIP is n... | Pod CIDR exhaustion in CNI Overlay. Each node pre-allocates ... | Expand Pod CIDR via Azure CNI Overlay expansion (learn.micro... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20Auto%20Provision%20subnet%20is%20full%20and%20pod%20cidr%20exhausted) |
| 15 | Customer's own windows-exporter or Windows service fails to start on AKS Windows... | AKS installs windows-exporter via AKSWindowsExtension using ... | Configure the customer's windows-exporter to use a different... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Node%20Extension) |
| 16 | Unable to delete subnet or parent VNet after AKS cluster deletion - subnet still... | When AKS cluster using Azure CNI Overlay or Pod Subnet netwo... | 1) Remove delegation via Portal: Virtual Networks > Subnets ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FDelete%2FUndelegate%20Subnet) |
| 17 | NAP (Node Auto Provision / Karpenter) scaled nodes stuck in NotReady state; Node... | Pod CIDR exhaustion in Azure CNI Overlay cluster. Each node ... | 1) Check NodeNetworkConfig events for 'Subnet is full' and '... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCRUD%2FScale%2FNode%20Auto%20Provision%20subnet%20is%20full%20and%20pod%20cidr%20exhausted) |
| 18 | Pod fails to start on newly provisioned GPU node with: rpc error: code = Unavail... | New GPU node transitions to ready/schedulable state before f... | 1) Taint GPU node pool and add tolerations/nodeSelectors for... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FContainerd%20socket%20errors%20on%20GPU%20nodes) |
| 19 | Backup jobs fail with identity assignment errors after AAD Pod Identity addon re... | Residual nmi DaemonSet from deprecated AAD Pod Identity addo... | 1) Check addon: 'az aks show --query addonProfiles.azurePodI... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FSecurity%20and%20Identity%2FAAD%2FResidual%20nmi%20daemonset%20after%20aad%20removal) |
| 20 | AKS nodes report NodeNotReady status despite no memory/disk/network/kubelet reso... | The kube-node-lease namespace is stuck in Terminating state ... | (1) Inspect namespace: `kubectl describe namespace kube-node... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FCompute%2FVirtual%20Machine%20TSGs%2FNodeNotReady%20Kube%20node%20lease%20namespace) |
| 21 | ACNS Container Network Logs enabled (managed storage via AzMon), but no flow log... | Missing required setup for managed storage: --enable-retina-... | Verify: 1) ACNS enabled (--enable-acns). 2) --enable-retina-... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Cilium/Container%20Network%20Logs) |
| 22 | ACNS Container Network Logs enabled (unmanaged storage), but events.log file not... | retinanetworkflowlog CR not created, or acns-flowlog-config ... | 1) Verify ACNS: az aks show, check advancedNetworking.enable... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Monitoring/Network%20Observability%20(Kappie)/Advanced/Cilium/Container%20Network%20Logs) |
| 23 | AKS operations in ChinaNorth2/ChinaNorth3 fail with GatewayTimeout: gateway did ... | AKS outage Aug 30 2023: corrupted ARM manifest in ChinaNorth... | Platform outage resolved by PG restoring ARM manifest. Exist... | [B] 6.5 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 24 | AKS cluster creation fails with LinkedAuthorizationFailed: service principal has... | The cluster identity (service principal or managed identity)... | Grant the service principal/managed identity the required pe... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/linkedauthorizationfailed-error) |
| 25 | AKS cluster create/scale fails with OverconstrainedAllocationRequest: VM cannot ... | Combination of VM constraints (size, SKU, accelerated networ... | Create new node pool without proximity placement group assoc... | [B] 6.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/zonalallocation-allocationfailed-error) |
| 26 | GitOps Flux V2 extension installation failed with an error message- "Helm Instal... | Customer was facing the error as they did not add the securi... | We could install the extension successfully after adding the... | [B] 6.5 | [ContentIdea#188702](https://support.microsoft.com/kb/5037553) |
| 27 | vCenter vCENTER is showing as Disconnected within Azure connected to Azure Arc R... | The logs generated from the below command indicate the follo... | Outdated VMware credentials used by Arc resource bridge. Upd... | [B] 6.5 | [ContentIdea#196719](https://support.microsoft.com/kb/5047672) |
| 28 | AKS cluster create/upgrade operation fails; need to trace the failure from AKS R... | AKS operations span multiple tiers (AKS RP -> CRP -> RDOS/WA... | Kusto chain: 1) akscn/AKSprod FrontEndQoSEvents\|AsyncQoSEve... | [B] 6.0 | [onenote: MCVKB/VM+SCIM/=======18. AKS=======/18.2] |
| 29 | AKS cluster scale-up or node pool addition fails due to CustomScriptExtension (C... | CSE execution on new VMSS instances exceeds timeout during n... | 1) Check CSE logs on failed node via SSH or serial console. ... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 30 | AKS nodes intermittently become NotReady and auto-recover; kubelet logs show fai... | Go-client HTTP/2 transport bug: TCP connections not properly... | 1) Upgrade to K8s 1.20+ for go-client transport fixes. 2) Fo... | [B] 6.0 | [onenote: Mooncake POD Support Notebook/POD/VMSCIM] |
| 31 | 'Error from server: error dialing backend: dial tcp' for kubectl logs/exec/attac... | Konnectivity tunnel between API server and cluster nodes is ... | Check konnectivity-agent pods in kube-system namespace. Dele... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/error-from-server-error-dialing-backend-dial-tcp) |
| 32 | kubectl commands timeout - ALPN (Application-Layer Protocol Negotiation) TLS ext... | Network appliance or proxy blocks the ALPN TLS extension (RF... | Enable ALPN TLS extension on the network path; check interme... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tcp-timeouts-kubetctl-third-party-tools-connect-api-server) |
| 33 | AKS cluster create/update/scale fails with SubnetWithExternalResourcesCannotBeUs... | The subnet has external resources associated with it (servic... | Option 1: Create a new subnet and associate it with AKS. Opt... | [B] 6.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/error-codes/subnetwithexternalresourcescannotbeusedbyotherresources-error) |
| 34 | Trusted Access partner service receives 400 error when connecting to AKS cluster... | Target AKS cluster is in stopped state. Trusted Access datap... | Start the AKS cluster before attempting Trusted Access conne... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Access) |
| 35 | Azure NPM (azure-npm-win) pod is missing on WindowsAnnual node pool in AKS clust... | Azure NPM only supports Windows2022 node pools. WindowsAnnua... | Use Windows2022 node pools for Azure NPM / network policy su... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Windows%20Annual%20Channel) |
| 36 | az aks command invoke fails in Azure Cloud Shell with Failed to connect to MSI, ... | Known issue in Azure Cloud Shell where MSI token acquisition... | Run az login first before running az aks command invoke in C... | [Y] 4.5 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/resolve-az-aks-command-invoke-failures) |
| 37 | Konnectivity agent performance degrades as cluster grows: increased timeouts for... | Fixed replica count of Konnectivity agents becomes bottlenec... | Use Cluster Proportional Autoscaler for konnectivity-agent (... | [Y] 4.0 | [MS Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/tunnel-connectivity-issues) |
| 38 | Trusted Access partner service cannot connect to AKS cluster. ResponseFlags show... | Target AKS cluster certificate has expired, causing the API ... | Follow the certificate rotation documentation (https://learn... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Feature%20Specific/Trusted%20Access) |
| 39 | AKS Insights page shows No data for selected filters. Container Insights dashboa... | ama-logs pods cannot send data to Log Analytics workspace. C... | 1) Verify ama-logs running: kubectl get ds ama-logs -n kube-... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FMonitoring%2FData%20missing%20from%20insights%20tab) |
