# AKS 网络连通性通用 — vmss — 排查工作流

**来源草稿**: ado-wiki-b-Container-Network-Metrics-Dynamic.md, ado-wiki-b-common-network-issues.md, ado-wiki-b-network-deployment-types.md, ado-wiki-c-Network-Isolated-Cluster.md, ado-wiki-capture-network-trace-veth.md, ado-wiki-d-Container-Network-Logs.md, ado-wiki-enable-create-gpu-in-fdpo-subscription.md, ado-wiki-network-troubleshoot-tools.md, ado-wiki-network-troubleshooting-checklist.md, onenote-aks-rp-to-crp-kusto-trace.md
**Kusto 引用**: 无
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-b-Container-Network-Metrics-Dynamic.md | 适用: 适用范围未明确

### 排查步骤

##### Common Container Network Metrics Issues

#### **retina-crd-operator Deployment**

`retina-crd-operator` is deployed alongside `cilium-operator` as a side container. Check Cilium operator pod for errors from this component:

Search for: `retina`, `containernetworkmetric`, `retina-crd`, `retina-operator`

```bash
kubectl logs <cilium-operator-pod> -n kube-system | grep "containernetworkmetric"
```

##### **Kusto Query for Logs**

Cilium Operator logs can be checked via Kusto query:

_Keywords:_ `retina`, `retina-crd-operator`, `containernetworkmetric`

Source: `[cluster('aznwsdn.kusto.windows.net').database('ACN')]`

```shell
RetinaReport
    | where podname has "cilium-operator"
    | where Type has "AppTraces"
    | sort by TimeGenerated desc
    | take 50
```

---

##### Issue 1: ContainerNetworkMetric CRDs Not Recognized

**Symptoms:**

- `kubectl get containernetworkmetric` fails with "resource not found"
- CRD creation fails with schema validation errors

**Root Causes:**

- Feature not properly enabled
- Cilium operator not running
- Incorrect CRD schema

**Diagnostic Steps:**

```bash
#### Check if CRDs are installed
kubectl get crd | grep containernetworkmetric

#### Check cilium operator status
kubectl get pods -n kube-system -l name=cilium-operator

#### Check operator logs
kubectl logs -n kube-system deployment/cilium-operator
```

**Solutions:**

- Verify feature flag is enabled for subscription
- Check cilium operator is running and healthy
- Use correct CRD schema with `acn.azure.com/v1alpha1` apiVersion

---

##### Issue 2: Dynamic Metrics ConfigMap Not Updated

**Symptoms:**

- ContainerNetworkMetric CR created but ConfigMap unchanged
- CR shows "CONFIGURED" state but no metrics generated

**Root Causes:**

- Reconciliation timing delays
- Operator processing errors
- ConfigMap permission issues

**Diagnostic Steps:**

```bash
#### Check CR status
kubectl describe containernetworkmetric <cr-name>

#### Check ConfigMap contents
kubectl get configmap cilium-dynamic-metrics-config -n kube-system -o yaml

#### Check operator logs for reconciliation
kubectl logs -n kube-system deployment/cilium-operator | grep -i "containernetworkmetric"
```

**Solutions:**

- Wait 2 minutes for reconciliation (normal timing)
- Check operator has necessary RBAC permissions
- Restart cilium operator if stuck:

```bash
kubectl rollout restart deployment/cilium-operator -n kube-system
```

---

##### Issue 3: Metrics Not Generated Despite Configuration

**Symptoms:**

- ConfigMap updated correctly
- CR shows "CONFIGURED" state
- No metrics appear in expected endpoints

**Root Causes:**

- Incorrect filter configuration
- Operator pod not healthy
- Network traffic not matching filters

**Diagnostic Steps:**

```bash
#### Check Cilium pods status
kubectl get pods -n kube-system -l k8s-app=cilium

#### Check Cilium configuration
kubectl get configmap cilium-config -n kube-system -o yaml | grep -i "dynamic"

#### Check Cilium agent logs for enabled metrics
kubectl logs -n kube-system daemonset/cilium | grep -i "metrics"
```

**Solutions:**

- Restart Cilium pods:

```bash
kubectl rollout restart daemonset/cilium -n kube-system
```

- Verify filter syntax matches expected schema
- Generate network traffic that matches configured filters
- Check metrics endpoints are accessible

---

##### Issue 4: Slow ConfigMap Propagation

**Symptoms:**

- CR reconciliation takes longer than expected (>5 minutes)
- Intermittent ConfigMap updates

**Root Causes:**

- Operator restart or high load
- Kubernetes API server performance
- Resource constraints on operator pod

**Diagnostic Steps:**

```bash
#### Check operator pod status
kubectl get pods -n kube-system -l name=cilium-operator

#### Check operator logs for errors
kubectl logs -n kube-system deployment/cilium-operator --tail=50

#### Time reconciliation manually
time kubectl apply -f <cr-yaml>
kubectl get configmap cilium-dynamic-metrics-config -n kube-system --watch

#### Check operator resource usage
kubectl top pod -n kube-system | grep cilium-operator

#### Check operator events
kubectl get events -n kube-system --field-selector involvedObject.name=cilium-operator
```

**Solutions:**

- Increase operator resource limits if constrained
- Monitor for operator restarts and investigate causes
- Consider cluster performance optimization

---

##### Issue 5: CRD Schema Validation Failures

**Symptoms:**

- CRD creation fails with validation errors
- Error messages about unknown fields or incorrect structure

**Root Causes:**

- Using incorrect CRD schema
- Outdated CRD definitions
- Wrong apiVersion specification
- CRD already exists
- Wrong CRD naming

**Common Schema Errors:**

```txt
error validating data: ValidationError(ContainerNetworkMetric.spec.includeFilters[0].from): unknown field "pod" in com.azure.acn.v1alpha1.ContainerNetworkMetricFrom
```

**Correct Schema Example:**

```yaml
apiVersion: acn.azure.com/v1alpha1
kind: ContainerNetworkMetric
metadata:
  name: example-metric
spec:
  includeFilters:
  - name: "test-filter"
    from:
      namespacedPod: "default/test-pod-*"
    to:
      namespacedPod: "default/target-pod-*"
```

**Solutions:**

- Use `namespacedPod` field instead of separate namespace and pod fields
- Ensure `apiVersion: acn.azure.com/v1alpha1`
- Follow exact schema structure as documented
- Ensure only one ContainerNetworkMetric CR exists per cluster

---

##### Error Message Reference

#### Azure CLI Errors

- **Feature flag not enabled:**

```txt
Feature Microsoft.ContainerService/AdvancedNetworkingDynamicMetricsPreview is not enabled.
```

Solution: Enable feature flag.

- **Kubernetes version too low:**

```txt
The specified orchestrator version is not valid. Dynamic Metrics requires Kubernetes version 1.32.0 or later.
```

Solution: Upgrade cluster to supported version.

#### Kubectl Errors

- **CRD not found:**

```txt
error: resource mapping not found for "ContainerNetworkMetric": no matches for kind "ContainerNetworkMetric" in version "acn.azure.com/v1alpha1"
```

Solution: Verify feature is enabled and cilium operator is running.

- **Schema validation error:**

```txt
error validating data: ValidationError(ContainerNetworkMetric.spec): unknown field "filters" in com.azure.acn.v1alpha1.ContainerNetworkMetricSpec
```

Solution: Use correct field name `includeFilters` instead of `filters`.

---

##### Diagnostic Information Collection

#### Basic Environment Check

```bash
#### Kubernetes and cluster info
kubectl version --short
az aks show -g <resource-group> -n <cluster-name> --query "networkProfile"

#### Feature verification
kubectl get configmap cilium-config -n kube-system -o jsonpath='{.data.hubble-dynamic-metrics-config-path}'

#### cilium operator status
kubectl get pods -n kube-system -l name=cilium-operator
kubectl logs -n kube-system deployment/cilium-operator --tail=50
```

#### ContainerNetworkMetric Resources

```bash
#### List all CRDs and their status
kubectl get containernetworkmetric -o yaml

#### Check dynamic metrics ConfigMap
kubectl get configmap cilium-dynamic-metrics-config -n kube-system -o yaml

#### Check Cilium configuration
kubectl get configmap cilium-config -n kube-system -o yaml | grep -A10 -B5 "dynamic"
```

#### Pod and Service Status

```bash
#### Cilium pods status
kubectl get pods -n kube-system -l k8s-app=cilium
kubectl logs -n kube-system daemonset/cilium --tail=100 | grep -i "dynamic|metrics"

#### cilium operator detailed logs
kubectl logs -n kube-system deployment/cilium-operator | grep -i "containernetworkmetric"

#### System events
kubectl get events -n kube-system --sort-by='.lastTimestamp'
```

#### Complete Diagnostic Information Collection

When reporting dynamic metrics issues, collect the following comprehensive diagnostic information:

- Environment Information
- Kubernetes and cluster info
- Cilium and cilium operator status
- Configuration details
- CRD information
- Logs

---

##### Common Issues Quick Reference

- **Filters Not Applied:** Wait up to 1 minute for propagation, check ConfigMap content:

```bash
kubectl get configmap cilium-config -n kube-system -o jsonpath='{.data.enable-hubble-open-metrics}' | jq '.metricsFilters'
```

- **CRD Validation Failures:** Use correct `acn.azure.com/v1alpha1` apiVersion, CRD name `container-network-metric`, and fields.

- **ConfigMap Not Updating:** Check cilium operator logs and RBAC permissions:

```bash
kubectl logs -n kube-system deployment/cilium-operator | grep -i "containernetworkmetric"
```

- **No Metrics Visible:** Verify feature flag enabled and Cilium pods healthy:

```bash
kubectl get configmap cilium-config -n kube-system -o jsonpath='{.data.hubble-dynamic-metrics-config-path}'
```

---

## Scenario 2: Troubleshoot Common issues when working with customer
> 来源: ado-wiki-b-common-network-issues.md | 适用: 适用范围未明确

### 排查步骤

#### Troubleshoot Common issues when working with customer

#### 1. Troubleshoot inbound connections

- Basic troubleshooting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connection-issues-application-hosted-aks-cluster
- Custom NSG blocks traffic: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/custom-nsg-blocks-traffic
- Failures in the "az aks command invoke" command: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/resolve-az-aks-command-invoke-failures
- Get and analyze HTTP response codes: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/get-and-analyze-http-response-codes
- Intermittent timeouts or server issues: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/intermittent-timeouts-or-server-issue

#### 2. Cannot connect to AKS cluster through API server

- Basic troubleshooting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-cluster-connection-issues-api-server
- Client IP address can't access API server: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/client-ip-address-cannot-access-api-server
- Config file isn't available when connecting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/config-file-is-not-available-when-connecting
- Tunnel connectivity issues: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/tunnel-connectivity-issues
- User can't get cluster resources: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/user-cannot-get-cluster-resources

#### 3. Troubleshoot outbound connections

- Basic network flow and troubleshooting: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/basic-troubleshooting-outbound-connections
- Can't connect to pods and services in same cluster: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connection-pods-services-same-cluster
- Can't connect to endpoints in same virtual network: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-same-virtual-network
- Can't connect to endpoints outside virtual network (public internet): https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-outside-virtual-network
- DNS resolution failure from within pod but not from worker node: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-dns-failure-from-pod-but-not-from-worker-node
- Traffic between node pools is blocked by custom NSG: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/traffic-between-node-pools-is-blocked

---

## Scenario 3: What is the Network deployment type used in the AKS cluster?
> 来源: ado-wiki-b-network-deployment-types.md | 适用: 适用范围未明确

### 排查步骤

#### What is the Network deployment type used in the AKS cluster?

AKS (Azure Kubernetes Service) provides two network deployment types - **Kubenet and Azure CNI**. Both Kubenet and Azure CNI provide network connectivity for your AKS clusters, however, there are advantages and disadvantages to each.
Kubenet `conserves IP` address space and uses Kubernetes internal or external load balancers to reach pods from outside of the cluster.

On the other hand, Azure CNI `offers full virtual network` connectivity for pods, and they can be directly reached via their private IP address from connected networks. However, this deployment type **requires more IP address space**.

In terms of **behavior differences** between Kubenet and Azure CNI, **both support** pod-to-pod connectivity, access to resources secured by service endpoints, and exposing Kubernetes services using a load balancer service, App Gateway, or ingress controller. However, there are some differences in their capabilities. For example, Azure CNI **supports** VMs in peered virtual networks and **Windows node pools**, whereas Kubenet **does not**.

DNS functionality for both Kubenet and Azure CNI is provided by CoreDNS, which is a deployment running in AKS with its own autoscaler.

By default, CoreDNS is configured to forward unknown domains to the DNS functionality of the Azure Virtual Network where the AKS cluster is deployed, making Azure DNS and Private Zones work for pods running in AKS.

The Direct method can be used to determine if AKS was deployed using the **CNI** or **Kubenet** via Azure Support Center (ASC), ASI, Jarvis Actions, Kusto queries based on your preferences.

#### Important Note

> While the supported plugins meet most networking needs in Kubernetes, advanced users of AKS may desire to use the same CNI plugin that they use in on-premises Kubernetes environments or take advantage of specific advanced functionality available in other CNI plugins.
> For users who wish to deploy a **custom CNI plugin on their AKS cluster**, it is possible to create a cluster with no CNI plugin pre-installed. This allows for the installation of any third-party CNI plugin that works in Azure.

_**BYOCNI has support implications**_ - Microsoft support will not be able to assist with CNI-related issues in clusters deployed with BYOCNI.

---

## Scenario 4: Network Isolated Cluster
> 来源: ado-wiki-c-Network-Isolated-Cluster.md | 适用: 适用范围未明确

### 排查步骤

#### Network Isolated Cluster


#### Overview

**Status:** Public Preview
**Public documentation**: <https://aka.ms/aks/network-isolated-cluster>

#### Training Video

[Network Isolated Cluster Deep Dive.mp4](https://microsoft.sharepoint.com/:v:/t/AzureCSSContainerServicesTeam/EXSRJsmzFkBJnEvhZEjd-NYBuS-PJQByJuhhn-L8QbWk2w?e=zfGi5p&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)

#### Limitation

- k8s version >= 1.30
- does not support kubenet
- only supports ubuntu
- does not support older VHD version and custom image
- does not support public cluster v1
- does not support VMAS

####  Support Scope

1. fail to pull images from managed ACR
2. Cluster unable to upgrade/scale due to network egress issue

#####  Unsupported s2 scenario

1. BYO ACR incorrect configuration. Can verify by connecting to the ACR from a VM. If it fails, it should be customer error.
1. We do not support anonymous access to ACR for now.
1. We allowed byo vnet + byo acr + any addons, however, it will be customer's own responsibility to setup the network to ensure connection to the required endpoints, such as AAD, arm endpoint.

#####  Addon compabilities

- For managed vnet, we already block all addons. If miss any addon and recieve the incident, please transfer to Security team.
- For BYO vnet, we do not block any addons. But it will be customer's own responsibility to handle to network to connect to the endpoint that the addon requires. Though it might already outside the support range, considering sometimes customer may still requiring assistance, we take some examples on how customer can solve their addon issues.

#### Gathering Info

- CSE cluster-provision.log

##### Network isolated cluster type

We have type "none" and "block".

- `none` means we by default do not provide customer egress network. However, customer can still define their own network like BYO vnet / subnet.
- If it is `block`, we do not allow BYO VNET, and use NSG to block egress.

##### ASI

#### Verify cluster enabled network isolated cluster

![asi-ni-enable.png](/.attachments/asi-ni-enable-48e6c322-35fa-47e5-ade3-58440a2e7b19.png)

#### Verify if the cluster is BYO ACR or Managed ACR

![asi-ni-details.png](/.attachments/asi-ni-details-f06647a5-d16f-48a3-9a68-7cd9e4ee6215.png)

##### ASC

Access the VMSS disk inspect to download the node log

##### Geneva action

Download node and cse log via geneva action

##### Kusto query

#### general QOS

```k
let queryFrom = datetime("2024-09-19T04:43:45.734Z");
let queryTo = datetime("2024-09-20T04:43:45.734Z");
let queryFeatureName = "Bootstrap Artifact Source Cache";
let query = "\"enableBootstrapArtifactSourceCache\":\"true\"";

let interval=(queryTo - queryFrom)/100;
aks_prod_qos_op_all(queryFrom, queryTo, "")
| where propertiesBag has query
| summarize totalRequests = count(), totalErr = countif(isServiceFailure(resultType, resultCode, resultSubCode)) by bin(TIMESTAMP, interval)
| project TIMESTAMP, qos = (1. - percent(totalErr, totalRequests)) * 100
```

####  Get CSE log

- Customer option:

1. ssh into vmss via bastion
2. cat /logs/azure/cluster-provisioning.log

- PG option

1. Check operation failure via Async log, it will report the last few lines of errors
2. if the log does not show useful log, use geneva action to download the node log

- Support Engineer

1. Use Azure Support Center(ASC) to download node log

#### operation failure

```k
union AsyncQoSEvents, AsyncContextlessActivity, AsyncContextActivity
| where operationID == "cc03f208-932c-4ed5-99dd-cf5aade23f22"
```

Pay attention to cse error and bootstrapprofile related error.

#### Common Errors

##### Frontend errors

| Error | Rca | Solution |
| --- | --- | --- |
| Network isolated cluster is not allowed since feature flag %q is not registered. | feature flag is required during preview | register feature flag |
| BootstrapProfile with artifact source %q is not valid. Allowed values are 'Direct', 'Cache' | invalid request | make sure the request body bootstrapProfile.artifactSource is 'Direct' or 'Cache' |
| BootstrapProfile artifact source cannot be changed from 'Cache' to 'Direct' | we do not support change from Cache to Direct | |
| BootstrapProfile container registry id must be empty when artifact source is 'Direct' | bad request | customer shoud not define the containerRegistryId and artifact source=Direct at the same time |
| BootstrapProfile container registry id is not allowed to modify if it is managed registry | bad request | customer is using managed acr, we do not allow change the managed acr id |
| BootstrapProfile managed container registry is only allowed when VNET is managed | bad request | |
| BootstrapProfile Bring Your Own(BYO) container registry is only allowed when VNET is custom | bad Request | |
| BootstrapProfile Bring Your Own(BYO) container registry %q does not exist | customer pass one acr id that not exists | it only happens for BYO scenario |
| BootstrapProfile Bring Your Own(BYO) container registry %q does not enable anonymous pull access | byo acr does not enable anonymous access | let customer change the acr configuration |

##### CSE Failed

The CSE Error code should between 206 to 210. Please check the cluster provision log or async log. If it mentions `oras pull xxx` failed. Create an ICM.
Quickest mitigation is to let customer disable network isolated cluster.

If the error is about 'connect xxx failed', please create an ICM for this. Quick mitigation is still disable network isolated cluster or customer setup their own firewall to pass the fqdn.

| Error | Rca | solution |
| --- | --- | --- |
| CSE failure with error 207 | kubernetes-node binary download error | check if related kubernetes-node version exists in mcr, if not exists, contact Security team for immediate fix |
| CSE failure with error 208 | kubelet credential provider download error | same as 206, but for credential provider |
| CSE failure with error 209 | WASM shims download error | same as 206, but this package plan to deprecate |
| CSE failure with error 210 | reserved error not in use for now | |
| CSE failure with error 211 | network timeout to acr | incorrect private endpoint configuration to access acr. Can double confirm via directly ping acr through vm |
| CSE failure with error 212 | kubelet ideneity has no permission to access acr | make sure kubelet identity has acr pull permission to the boostrap acr |

##### Cluster Image pull failed

We by design leverage [ACR cache rule](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-artifact-cache?pivots=development-environment-azure-portal) as the solution for image pull. And we provide two modes, BYO ACR and managed ACR.

1. check the cluster if it is BYO ACR or managed ACR via ASI.
1. If it is BYO ACR, we need customers themselves to check their ACR, cache rule and private endpoint. Can also try to connect the ACR from node.
1. If it is Managed ACR, we by default only support MCR images. If the image pull failure is about other registry, then it is customer error. Customer need go to the ACR to create their own cache rule.
1. If it is Managed ACR and fail to pull MCR images, please let customer to check if the ACR and PE named with keyword `bootstrap` exists. If not, please reconcile the cluster.
1. There exists one known issue, for managed ACR, if customer delete the cache rule, cluster reconcile will not bring it back. Mitigation is to remove the ACR and then reconcile or ask customer to add the cache rule.
1. If the issue is still not resolved, create an ICM.

##### Cluster image cannot pull after update existed cluster to network isolated cluster or change the private ACR resource id

1. This is by design, customer needs to reimage the node to update the kubelet configuration in cse.

##### Node Not Ready with error related to CNI plugin

1. Azure CNI plugin is not installed via CSE. It is installed via daemonset azure-cns.
1. Check if the pod azure-cns under kube-system is running. The pod may have image pull failure due to incorrect ACR configuration. If so, please check the image pull failed guide.
1. If the azure-cns is crashing, collect log and create an ICM.
1. If azure-cns is running, however, node is still not ready. The node ready reason might not be related to network isolated feature. Please check the node not ready reason first.

##### ACR, cache rule, private endpoint and private DNS zone is deleted by accident

If the cache rule is deleted from the managed ACR by accident, the mitigation is to delete the ACR and reconcile the cluster.
If ACR or private endpoint or private DNS zone is deleted by accident, the mitigation is just to reconcile the cluster.

##### AAD endpoint related, e.g. Azure Workload Identity

- Option 1, if customer has their own firewall, whitelist the aad endpoint in their firewall.
- Option 2, [Use service tag](https://learn.microsoft.com/en-us/azure/virtual-network/service-tags-overview#available-service-tags) and [service endpoint](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-service-endpoints-overview) for AAD. In the nsg in customer's vnet, add AzureActiveDirectory in the outbound rule. In vnet service endpoint add `Azure Active Directory`

##### Need connection to customer managed resources like azure key vault, container insight

- Option 1 (recommend), setup one private endpoint in the vnet to connect to the resource. e.g. [monitoring addon](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/kubernetes-monitoring-private-link)
- Option 2, if the related resource support service endpoint, add service endpoint in the vnet.

#### Partner Info

| Team | Description |
| - | - |
| Azure Container Registry | This feature uses Azure Container Registry as pull through cache |

#### Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Jordan Harder <Jordan.Harder@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Vijay Rodrigues (VIJAYROD) <vijayrod@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>

---

## Scenario 5: Capture Network trace based on the veth
> 来源: ado-wiki-capture-network-trace-veth.md | 适用: 适用范围未明确

### 排查步骤

#### Capture Network trace based on the veth

#### Summary and Goals

This WIKI provides one method to capture Network trace based on the veth of the pod. This might be helpful when handling the case related to packet retransmission. I received several cases related to high packet retransmission rate of a pod generated by Dynatrace.

##### Prerequisites

You need to have one debug pod with privileged mode to follow the steps. Here is one method to implement one privileged pod if allowed.

```yaml
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: debugger-<Node_Name>
spec:
  containers:
  - name: debugger
    image: mcr.microsoft.com/cbl-mariner/busybox:2.0
    stdin: true
    securityContext:
      privileged: true
    volumeMounts:
    - name: host-root-volume
      mountPath: /host
  volumes:
  - name: host-root-volume
    hostPath:
      path: /
  hostNetwork: true
  hostPID: true
  restartPolicy: Always
  nodeName: <Node_Name>
EOF
```

#### Implementation Steps

1. Create the debug pod, login and chroot.

    ```bash
    kubectl apply -f debugger.yaml
    kubectl exec debugger-<node-name> -it -- sh
    chroot host
    ```

2. Use **crictl** and **nsenter** to get the pid of the relevant pod and then obtain the pod's network interface. The interface ID is found from "2: eth0@if**17**".

    ```bash
    crictl pods | grep <pod-name>
    crictl inspectp <pod-id> | grep pid
    nsenter -t <pid> -n ip addr show eth0
    ```

3. Get the veth according to the interface ID.

    ```bash
    ip link | grep "^<interface-id>"
    ```

4. Capture the network trace based on the veth.

    ```bash
    tcpdump -s 0 -vvv -i <veth-name> -w /tmp/netCapturePod.cap
    # Or capture all interfaces filtered by pod IP for comparison:
    tcpdump -s 0 -vvv -i any 'host <pod-ip>' -w /tmp/netCaptureNode.cap
    ```

**Key findings:**
- Capturing on veth shows clean traffic without duplicated packets
- Capturing on all interfaces (`-i any`) may show duplicated packets recorded by several NICs (eth0, enP*, cbr0, veth)
- Works on both **Kubenet** and **Azure CNI Overlay** clusters

**Alternative method** (without privileged pod): Use `kubectl debug` to access the node, capture with `-i any` filtered by pod IP, then use Wireshark to filter by interface (`sll.ifindex==<pod_if_index>`) and export filtered packets (uncheck "Include depended upon packets").

#### Owner

Tom Zhu <zhuwei@microsoft.com>

---

## Scenario 6: Troubleshooting Flow
> 来源: ado-wiki-d-Container-Network-Logs.md | 适用: 适用范围未明确

### 排查步骤

##### ACNS & Container Network Logs features are enabled, but no logs are appearing in Grafana or file events.log doesn't appear on the host...

#### 1. Verify that feature is enabled.

Note:
 - If logs are expected on Azure Log Analytics or Grafana then customer is using *Managed Storage* via Azure Monitor (AzMon) logs.

 - If logs are only expected on events.log file on the host customer is using *Unmanaged Storage*.

Determine which type of storage customer is using and validate the set up:

**Unmanaged Storage** (files stored on the host):
1. ACNS is enabled ```--enable-acns ```

To check cluster:
```shell
az aks show -g <resource-group> -n <cluster-name>
```

Expect to find:
```shell
"networkProfile":{
	"advancedNwtworking": {
	 "enabled": true,
	 "observability":{
	   "enabled": true
	    }
	}
}
```

**Managed Storage** (AzMon):
1. ACNS is enabled ```--enable-acns ```
2. The Container Network Logs is enabled ```--enable-retina-flow-logs```
3. AKS addons monitoring is enabled ```aks enable-addons -a monitoring --enable-high-log-scale-mode```
	- Monitoring Addon high log scale mode (--enable-high-log-scale-mode). This is required to add Microsoft-RetinaNetworkFlowLogs stream and create DCR with this stream

To check addons:
```shell
az aks addon list -g <resource-group> -n <cluster-name>
```

Expect to see:
```shell
{
    "api_key": "omsagent",
    "enabled": true,
    "name": "monitoring"
}
```

To check cluster:
```shell
az aks show -g <resource-group> -n <cluster-name>
```

Expect to find:
```shell
"netowrkProfile":{
	"advancedNwtworking": {
	 "enabled": true,
	 "observability":{
	   "enabled": true
	    }
	}
}
----------------------------
"osmagent":{
	"config":{
		"enableRetinaNetworkFlags": "True"
	}
}
```
Without 'enableRetinaNetworkFlags' set to 'true' container insigth agent would not eb able to colelct flow logs.

For further investigation on Managed Storage issues follow this TSG: [Handling CI Agent Networkflow Logs Issues](https://msazure.visualstudio.com/DefaultCollection/InfrastructureInsights/_git/InfrastructureInsights.wiki?path=/ContainerInsights/TSG/Troubleshooting/CI-Agent-Networkflow-Logs.md&version=GBlongw/networkflowlogs-TSG&_a=preview)


#### 2. Check that feature is configured to collect logs.

Once it is verified that feature is enabled.
Check that feature is configured to collect network flow logs.

To configure the feature, a Custom Resource named 'RetinaNetworkFlowLogs' must be applied to set up filters that will be used for collecting flow logs.

Check if any CR's have been applied: (this CRD is cluster scoped don't need to specify namespace)
```shell
 kubectl get retinanetworkflowlog
```

If you can see CRs returned by above command check that they have been configured by:
```shell
 kubectl describe retinanetworkflowlog <cr-name>
```

Expect to see a Spec node that contains 'Includefilters' & Status node.
Status.State should be 'CONFIGURED' not 'FAILED'

```shell
Spec:
  Includefilters:
    From:
      Namespaced Pod:
        namespace/pod-
    Name:  sample-filter
    Protocol:
      tcp
    To:
      Namespaced Pod:
        namespace/pod-
    Verdict:
      dropped
Status:
  State:      CONFIGURED
  Timestamp:  2025-05-01T11:24:48Z
```

The CR 'retinanetworkflowlog' controls a config map called 'acns-flowlog-config'
The config map is used to configure the Hubble dynamic exporter to write the flow logs to a file:

Check that the config map has been updated:
```shell
kubectl describe configmap acns-flowlog-config -n kube-system
```

Expect the contents to match those of the described CR (From, To, Protocol, Verdict ect)
```shell
flowlogs.yaml:
----
flowLogs:
- filePath: /var/log/acns/hubble/events.log
  includeFilters:
  - destination_pod:
    - namespace/pod-
    protocol:
    - tcp
    source_pod:
    - namespace/pod-
    verdict:
    - DROPPED
  name: all
```

#### 3. Check flow logs file on the host.

If so far everything is matching, the location of the flow log files can be checked.
The flow logs are aggregated on files on the host.

```events.log``` file should exist here: ```/var/log/acns/hubble```

Check that the file has entries by tailing the events.log file.
Exepect to see flow log JSON objects.

The properties of flow log should match the configured CR for example:
```shell
  "flow": {
    "source": {
      "ID": 307,
      "identity": 38691,
      "cluster_name": "default",
      "namespace": "namepace",
      "pod_name": "pod-666498f4bc-7bhfn",
      "workloads": []
    },
    "destination": {
      "ID": 203,
      "identity": 38691,
      "cluster_name": "default",
      "namespace": "namespace",
      "pod_name": "pod-666498f4bc-db9dv",
      "workloads": []
    },
  },
}
```

#### 4. Check Cilium Agent & Operator Configuration

**retina-crd-operator issues**

If the CR is configured but the configmap ```acns-flowlog-config``` is empty:
```shell
flowlogs.yaml:
----
{}
```
There could be an issue with retina-crd-operator.

retina-crd-operator is deployed along side cilium-operator as a side container.
Cilium operator pod can be checked for any errors from this component:
Search for: "retina", "retinanetworkflowlog", "retina-crd", "retina-operator"
```shell
kubectl logs <cilium-operator-pod> -n kube-system | grep "retinanetworkflowlog"
```
Also seacrh for errors relating to 'dynamic exporter'.

If no logs are present relating to retinanetworkflowlog check the operator to see if crd-manager container config exists:
```shell
kubectl get po -n kube-system -oyaml <cilium-operator-pod>
```

Expect to see:
```shell
  containers:
  - args:
    - retina-crd-manager
    - --enable-k8s-api-discovery
    - --config-dir
    - /retina/
    command:
    - /retina-operator
---------
    volumeMounts:
    - mountPath: /retina/
      name: cilium-config-path
```

There might be errors associated with management of CRD or configmap.
In this case retina teams needs to investigate.

If the config map is not present or the events.log file is not present another issue could be that everything is configured but cilium operator or cilium agent configuration is not correct.
Check cilium config:
```shell
kubectl get configmap cilium-config -n kube-system -o yaml
```
Expect to see these components they MUST exist:
```shell
  hubble-export-file-max-size-mb: "10"
  hubble-export-file-max-backups: "5"
  hubble-flowlogs-config-path: /flowlog-config/flowlogs.yaml
  enable-telemetry: "true"
  leader-election: "true"
  hubble-flowlogs-configmapname: acns-flowlog-config
  flowlogs.yaml: |
    flowLogs:
      - name: all
        fieldMask: []
        includeFilters: []
        excludeFilters: []
        filePath: "/var/log/acns/hubble/events.log"
```

Check cilium agent to make sure volume mount exists:
```shell
 kubectl get po -n kube-system -oyaml <cilium-agent-pod>
```
Expect to see:
```shell
    - mountPath: /flowlog-config
      name: hubble-flowlog-config
      readOnly: true
      recursiveReadOnly: Disabled
```


If some of properties are missing that would cause a failure in colelcting logs.

#### 5. Check AMA configuration

***AMA integration issues***

If all the steps above have been validated and flowlogs are being written to the file on the node,
issue lies on the AMA integration and the file being consumed by ama agent.

Check ama-logs pod to make sure volume mount exists:
```shell
 kubectl get po -n kube-system -oyaml <ama-logs-pod>
```
Expect to see:
```shell
    - mountPath: /flowlog-config
      name: hubble-flowlog-config
      readOnly: true
      recursiveReadOnly: Disabled
```

Check Data Collection Rule exits for retinnetworkflowlogs:
```shell
    az monitor data-collection rule list --resource-group <resource-group>
```

Expect to see 'Microsoft-RetinaNetworkFlowLogs' in the streams array:
```shell
  "dataFlows": [
      {
        "streams": [
          "Microsoft-Perf",
          "Microsoft-Syslog",
          "Microsoft-WindowsEvent",
          "Microsoft-RetinaNetworkFlowLogs",
        ],
        "destinations": [
          "centralWorkspace"
        ]
      }
    ]
  }
```


#### 6. Next Steps

As further troubelshooting steps:

If a cluster already has monitoring addon enabled, and they want to enable Container Netowrk Logs, the monitoring addon will need to be disabled and re-enabled with --enable-high-log-scale-mode.
Monitoring addon can be disabed & reenabled:
```shell
az aks disable-addons -a monitoring -g <group> -n <cluster>
az aks enable-addons -a monitoring --enable-high-log-scale-mode -g <group> -n <cluster>
az aks update --enable-retina-flow-logs --enable-acns -g <group> -n <cluster>
```

The feature could be disabled & reenabled:
```shell
az aks update --disable-retina-flow-logs -g <group> -n <cluster>
az aks update --enable-retina-flow-logs -g <group> -n <cluster>
```

Since this feature can take up Disk Write alocation Node Disk usage can be checked to see that it is within expected range.


##### Customer Facing Errors
#### Azure Cli
1) ACNS is a prerequisite for enabling AMA log collection feature:

    Trying to enable this on a cluster without acns:

    ```az aks update -g test-rg -n test-cluster --enable-retina-flow-logs ```

    Would result in an error message:

    ```Flow logs requires '--enable-acns', advanced networking to be enabled, and the monitoring addon to be enabled.```


2) If the cluster Kubernetes version is below 1.31.0, trying to enable '--enable-retina-flow-logs':

    ```The specified orchestrator version %s is not valid. Advanced Networking Flow Logs is only supported on Kubernetes version 1.31.0 or later. ```

    Where the %s is replaced by the customer's k8s version

3) If a customer tries to enable '--enable-retina-flow-logs' on a subscription where AFEC flag is not enabled:

    ``` Feature Microsoft.ContainerService/AdvancedNetworkingFlowLogsPreview is not enabled. Please see https://aka.ms/aks/previews for how to enable features.```


#### KubeCtl

1) If a customer tries to apply a RetinaNetworkFlowLog CR on a cluster where ACNS is not enabled:

   ``` error: resource mapping not found for <....>": no matches for kind "RetinaNetworkFlowLog" in version "acn.azure.com/v1alpha1" ensure CRDs are installed first```

#### Geneva Actions

Two actions are available to fetch ConfigMaps to check configuration:
Jarvis -> Actions -> ContainerApps -> Managed Clusters:

- **GetManagedClusterConfigMap** To get specific ConfigMap eg. ```acns-flowlog-config``` or ```cilium-config```
    - Need to specify Location/Endpoint, ManagedClusterName, Name(cm name), TargetNamespace
- ***GetManagedClusterConfigMap*** To get all ConfigMaps in a namespace
    - Need to specify Location/Endpoint, ManagedClusterName, TargetNamespace

#### Kusto

Cilium Operator logs can be checked via Kusto query below:
*Keywords: 'retina', 'retina-crd-operator', 'retinanetworkflowlog'*

Source: [cluster('aznwsdn.kusto.windows.net').database('ACN')]

```shell
RetinaReport
    | where podname has "cilium-operator"
    | where Type has "AppTraces"
    | sort by TimeGenerated desc
    | take 50
```

---

## Scenario 7: GPUs on AKS Nodes
> 来源: ado-wiki-enable-create-gpu-in-fdpo-subscription.md | 适用: 适用范围未明确

### 排查步骤

#### GPUs on AKS Nodes

#### Overview

With the continuous updates brought to AKS & NVidia, as well as the mandatory usage of the new FDPO Internal Azure Subscriptions, it became unclear how we could reproduce an "AKS / GPU" issue internally.

Goal of this page is to try to go straight to the point and list the necessary steps.

#### FDPO Subscriptions - how to get access to GPU sizes?

GPU sizes are potentially extremely expensive + low on capacity. So our internal FDPO subscriptions are blocked from using them.

First step is to require a quota increase. This can be done from the Azure portal - from the Subscription blade - Support & Troubleshooting - and type "quota increase" in the Issue Description - then ask for 2 or 3 instances of the VM SKU you want, and the region you want.

Note: you'll be contacted by Support folks from the Azure Subscription team, and it might take few days to get the quota approved...

eg. with that, I was approved for 3 instances of size NC6s_v3 in EastUS region.

---

Then you'll be blocked by an internal policy which prevents us from deploying such sizes:

```sh
az aks nodepool add --resource-group rg514914749france --cluster-name aks514914749france --name livegpuproc4 --node-count 1 --node-vm-size Standard_NC8as_T4_v3 --enable-cluster-autoscaler --skip-gpu-driver-install --tags Environment=Dev Provider=Terraform Team=Tracker --labels appdestination=livegpuprocessing gpu=T4 task=trackerlight --min-count 1 --max-count 2
```

Error: `RequestDisallowedByPolicy` - Resource was disallowed by policy `MCAPSGov Deny Policies` / `Block VM SKU Sizes`.

Procedure to follow is on the NoCode wiki: request exception with business justification, approval from SCMTeam, then submit ticket via MCAPS portal.

#### Use GPU in AKS

Public documentation: https://learn.microsoft.com/en-us/azure/aks/gpu-cluster

Three options:
1. **Manually install NVIDIA device plugin** (recommended)
2. **AKS GPU image** (Preview, based on Ubuntu 18.04, not recommended)
3. **NVIDIA GPU Operator** (requires NVidia steps)

##### Install the NVIDIA GPU Operator

Pre-requisites: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html#prerequisites

```sh
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia \
    && helm repo update
helm install --wait --generate-name \
    -n gpu-operator --create-namespace \
    nvidia/gpu-operator
```

Test GPU workload: https://learn.microsoft.com/en-us/azure/aks/gpu-cluster?tabs=add-ubuntu-gpu-node-pool#confirm-that-gpus-are-schedulable

Customization options: https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html#common-chart-customization-options

---

## Scenario 8: Common Troubleshoot tools and command lines
> 来源: ado-wiki-network-troubleshoot-tools.md | 适用: 适用范围未明确

### 排查步骤

#### Common Troubleshoot tools and command lines

#### Azure dropping container packets aggressively

- If the bandwidth is correlated to the drops, then we can saturate it for a short period and try to see if we get packet drops.
- This can be done with a tool such as **NTTTCP** or **Iperf**.
- We can also check if it is related to the establishment of new connections using **nc** or **psping** for TCP pings.
- Tests should be run from an affected node towards a VM on the same VNET (or peered VNET, no FW/NVA in between).
- The test VM should not be having significant BW occupation.
- If disruption is observed, get a packet capture during the test (source and destination).

##### NTTTCP

[Test VM network throughput by using NTTTCP](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-bandwidth-testing?tabs=windows)

##### Iperf to determine packet loss

Server side:
```console
iperf3 -s -p (port)
```

Client side:
```console
iperf3 -c (server ip) -p (port) -P 32
```

Reverse mode (measure download):
```console
iperf3 -r -s -p (port)
iperf3 -r -c (server ip) -p (port) -P 32
```

##### Tcpping (Linux)

For Ubuntu: https://gist.github.com/cnDelbert/5fb06ccf10c19dbce3a7

For ARO/restricted environments, build a custom tcpping container:

```dockerfile
FROM centos:latest
RUN sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-* && \
    sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*
RUN yum -y install tcptraceroute wget bc
RUN wget https://dl.fedoraproject.org/pub/epel/8/Everything/x86_64/Packages/t/tcping-1.3.5-19.el8.x86_64.rpm
RUN rpm -Uvh tcping-1.3.5-19.el8.x86_64.rpm
RUN touch /var/log/tcpping.log
RUN echo '#!/bin/bash' > /usr/bin/run_tcpping.sh && \
    echo 'ln -sf /proc/1/fd/1 /var/log/tcpping.log' >> /usr/bin/run_tcpping.sh && \
    echo 'while `sleep 1` ; do echo "`date` - `tcping "${TCPPING_WEBSITE}" "${TCPPING_PORT}" 2>&1`"; done > /var/log/tcpping.log' >> /usr/bin/run_tcpping.sh && \
    chmod +x /usr/bin/run_tcpping.sh
ENTRYPOINT ["/bin/bash", "/usr/bin/run_tcpping.sh"]
```

Deploy as pod with env vars TCPPING_WEBSITE and TCPPING_PORT.

Simple alternative using netcat (pre-installed on nodes):
```console
while `sleep 1` ; do echo "`date` - `nc -vzw 1 microsoft.com 443 2>&1`"; done
```

##### Ping / PSPing continuous test

Windows (PowerShell):
```powershell
#### ICMP
ping -t (VM IP) | Foreach{"{0} - {1}" -f (Get-Date),$_} | Out-File .\icmp.txt

#### TCP
psping.exe -t (VM IP):(port) | Foreach{"{0} - {1}" -f (Get-Date),$_} | Out-File .\psping.txt
```

Linux:
```bash
#### ICMP
while sleep 1 ; do echo `date` `ping -c1 -w1 (VM IP) |grep ttl`; done > continuousping_`date +%Y%m%d_%H%M`.log

#### TCP
while `sleep 1` ; do echo "`date` - `nc -vvzw 1 (VM IP) (port) 2>&1`"; done > continuoustcpping_`date +%Y%m%d_%H%M`.log
```

PSPing download: https://docs.microsoft.com/en-us/sysinternals/downloads/psping

#### Portal issue to list and manage network components

Private flight Portal link for network issues:
https://portal.azure.com/?Microsoft_Azure_Network=flight5

Debug shortcut: `Ctrl+Alt+D` — trace session ID to troubleshoot portal issues.

#### Azure Packets Drop after VM Freeze events

##### Symptom
Packet drops correlated with VM Freeze scheduled events. Mellanox NIC IRQs not balanced across CPUs.

##### Diagnosis
```bash
#### Check IRQ distribution
grep -r "" /proc/irq
cat /proc/interrupts
systemctl status irqbalance
lscpu -a | grep IRQ
irqbalance -l
```

##### MLX IRQ Check Script
```bash
#!/bin/bash
NR_CPUS=`nproc`
if [[ $NR_CPUS -gt 32 ]]; then NR_CPUS="32"; fi
NIC_LIST=`grep mlx5_comp /proc/interrupts | cut -d@ -f2 | sort -u`
if [ -z "$NIC_LIST" ]; then echo "No Mellanox NIC detected"; exit 1; fi
for nic in $NIC_LIST; do
  IRQS=`grep $nic /proc/interrupts | grep mlx5_comp | cut -d: -f1 | sort -u`
  NR_TARGET_CPUS=`for irq in $IRQS; do cat /proc/irq/$irq/effective_affinity_list; done | sort -u | wc -l`
  if [[ $NR_TARGET_CPUS -lt `expr $NR_CPUS / 2` ]]; then
    echo IRQ affinity of $nic may be suboptimal: please report with top, /proc/irq, /proc/interrupts, dmesg, syslog.
    exit 2
  fi
done
exit 0
```

##### Solution
Manually rebalance smp_affinity or restart irqbalance daemon. Use ftrace to identify programs adjusting IRQ affinity:
```bash
cd /sys/kernel/debug/tracing/
echo irq_affinity_proc_write >> set_ftrace_filter
echo irq_affinity_list_proc_write >> set_ftrace_filter
echo function > current_tracer
#### After repro:
cat /sys/kernel/debug/tracing/trace
```

Strace against irqbalance:
```bash
strace /usr/sbin/irqbalance -f -t 10
```

#### Nodes losing internet after LB SKU upgrade

Even with the feature to upgrade SKU from Basic to Standard, this will put cluster in a broken state. Customer must recreate the cluster.

Reference: https://learn.microsoft.com/en-us/azure/load-balancer/upgrade-basic-standard

Most common symptom: only one node in Ready state, others have CSE extension failure.

---

## Scenario 9: Troubleshooting Flow
> 来源: ado-wiki-network-troubleshooting-checklist.md | 适用: 适用范围未明确

### 排查步骤

##### Inbound Connections
- [Basic troubleshooting](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connection-issues-application-hosted-aks-cluster)
- [Custom NSG blocks traffic](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/custom-nsg-blocks-traffic)
- [az aks command invoke failures](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/resolve-az-aks-command-invoke-failures)
- [HTTP response codes](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/get-and-analyze-http-response-codes)
- [Intermittent timeouts](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/intermittent-timeouts-or-server-issue)

##### API Server Connectivity
- [Basic troubleshooting](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-cluster-connection-issues-api-server)
- [Client IP can't access API server](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/client-ip-address-cannot-access-api-server)
- [Config file not available](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/config-file-is-not-available-when-connecting)
- [Tunnel connectivity issues](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/tunnel-connectivity-issues)

##### Outbound Connections
- [Basic network flow](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/basic-troubleshooting-outbound-connections)
- [Pod-to-pod connectivity](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connection-pods-services-same-cluster)
- [Same VNet endpoints](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-same-virtual-network)
- [External endpoints](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-connections-endpoints-outside-virtual-network)
- [DNS failure from pod](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/troubleshoot-dns-failure-from-pod-but-not-from-worker-node)
- [Custom NSG blocks inter-nodepool traffic](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/traffic-between-node-pools-is-blocked)

---

## Scenario 10: AKS RP → CRP/DRP 请求链路追踪（Kusto）
> 来源: onenote-aks-rp-to-crp-kusto-trace.md | 适用: Mooncake ✅

### 排查步骤

#### AKS RP → CRP/DRP 请求链路追踪（Kusto）

> **场景**: AKS 操作失败（create/upgrade/scale），需从 AKS RP 跨层追踪到 CRP → RDOS/VM extension 定位根因
> **适用**: Mooncake | 作者: Icy Lin

#### 数据流

```
用户请求
  └→ AKS RP (FrontEndQoSEvents / AsyncQoSEvents)
       └→ AKS AsyncContextActivity (error detail)
            └→ AKS OutgoingRequestTrace (HTTP to CRP)
                 └→ CRP ApiQosEvent (correlationId)
                      └→ CRP ContextActivity (CRP detail)
                           └→ azurecm LogContainerSnapshot (containerId)
                                └→ RDOS GuestAgentExtensionEvents (WA/CSE logs)
```

---

#### Step 1 — 查 AKS RP OperationID

**Kusto**: `akscn.kusto.chinacloudapi.cn` / db: `AKSprod`

```kql
union
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').FrontEndQoSEvents,
  cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp between(datetime(YYYY-MM-DD 00:00) .. datetime(YYYY-MM-DD 23:59))
| where subscriptionID == "<subId>"
  and resourceName == "<clusterName>"
| project PreciseTimeStamp, correlationID, operationID, operationName, result, errorDetails
```

---

#### Step 2 — 查 AKS RP 错误详情

```kql
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp > ago(3d)
| where operationID == "<operationID from step 1>"
| where level != "info"
| project PreciseTimeStamp, level, msg, fileName, lineNumber, operationID
```

> 典型错误: `vmextension.put.request: error: ContextDeadlineExceeded`

---

#### Step 3 — 查 AKS RP → CRP 请求

```kql
cluster('akscn.kusto.chinacloudapi.cn').database('AKSprod').OutgoingRequestTrace
| where TIMESTAMP between(datetime(YYYY-MM-DD HH:00) .. datetime(YYYY-MM-DD HH:59))
| where operationID == "<operationID>"
| where targetURI contains "<vmName>"  // e.g., "cse-agent-7"
| project TIMESTAMP, correlationID, clientRequestID, operationID, msg, statusCode, targetURI
// clientRequestID 即 CRP 侧的 correlationId
```

---

#### Step 4 — 查 CRP OperationID

**Kusto**: `azcrpmc.kusto.chinacloudapi.cn` / db: `crp_allmc`

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ApiQosEvent
| where TIMESTAMP between(datetime(YYYY-MM-DD) .. datetime(YYYY-MM-DD+1))
| where correlationId == "<clientRequestID from step 3>"
| where operationName !contains "GET"
| project resourceGroupName, resourceName, goalSeekingActivityId, operationId
// goalSeekingActivityId = activityId in CRP ContextActivity
```

---

#### Step 5 — 查 CRP 详情

```kql
cluster('azcrpmc.kusto.chinacloudapi.cn').database('crp_allmc').ContextActivity
| where TIMESTAMP between(...)
| where activityId == "<goalSeekingActivityId>"
```

---

#### Step 6 — 查 ContainerId (azurecm)

**Kusto**: `azurecm.chinanorth2.kusto.chinacloudapi.cn` / db: `azurecm`

```kql
LogContainerSnapshot
| where TIMESTAMP between(...)
| where subscriptionId == "<subId>"
  and roleInstanceName contains "<vmName>"  // e.g., "aks-nodepool1-32471634-7"
| project TIMESTAMP, Tenant, tenantName, containerId, nodeId, roleInstanceName
| sort by TIMESTAMP asc nulls last
```

---

#### Step 7 — 查 VM Extension / WA Agent 日志

**Kusto**: `rdosmc.kusto.chinacloudapi.cn` / db: `rdos`

```kql
GuestAgentExtensionEvents
| where PreciseTimeStamp between(...)
| where ContainerId == "<containerId from step 6>"
| where Operation !in ('HeartBeat', 'HttpErrors')
| where isnotempty(Message)
| project PreciseTimeStamp, ContainerId, Level, GAVersion, Version, Operation, Message, Duration
```

---

#### 补充：IP/MAC 历史信息

```kql
// azurecm 查 IP/MAC
AllocatorServiceContainerAttributes
| where containerId contains "<containerId>"
| project containerId, name, value, PreciseTimeStamp
```

---
