---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Azure Local MocARB/Azure Arc Resource Bridge/Azure Arc Resource Bridge Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/Azure%20Local%20MocARB/Azure%20Arc%20Resource%20Bridge/Azure%20Arc%20Resource%20Bridge%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---



Overview
--------

This article outlines the steps to access and troubleshoot the Azure Arc Resource Bridge from the Management VM (MGMT VM) in an Azure Local environment.

* * *

 Step 1: Copy `kubeconfig` to Management VM
---------------------------------------------

Copy the `kubeconfig` file from one of the **Azure Local nodes** to the Management VM:
```powershell
# X is the C drive for the seed node
Copy-Item "X:\ClusterStorage\Infrastructure_1\Shares\SU1_Infrastructure_1\MocArb\WorkingDirectory\Appliance\kubeconfig" -Destination "C:\kubeconfig"`
# Set the environment variable:
$env:KUBECONFIG = "C:\kubeconfig"
```
* * *

 Step 2: Verify Cluster Node Status
-------------------------------------

Run the following to check node status:
```powershell
kubectl get no -o wide
```
Sample output:

![image.png](/.attachments/image-44a07677-d26e-4e83-830b-b702827f10d0.png)

* * *

 Step 3: List All Pods Across Namespaces
------------------------------------------

This will show the status of all pods. Notably, the `telemetry-manager` pod is in `CrashLoopBackOff`:
```powershell
kubectl get po -o wide -A
```

![image.png](/.attachments/image-e4bbee2e-6660-46a1-869d-86e189e7475c.png)
* * *



In an Azure Arc Resource Bridge deployment, the **KVA (Kubernetes Virtual Appliance)** machine plays a central role by hosting a wide variety of critical pods across multiple namespaces. These include system-level components such as `kube-apiserver`, `etcd`, and `controller-manager` under the `kube-system` namespace, as well as Azure Arc-specific agents like `connect-agent`, `metrics-agent`, and `extension-manager` under the `azure-arc` namespace. Additionally, it runs hybrid infrastructure controllers such as the `azstackhci-operator`, `aks-operator`, and `moc-operator`, each within their respective namespaces. This consolidation enables the KVA to act as the operational hub for cluster management, telemetry, monitoring, and hybrid connectivity, making it a foundational element in the Azure Arc-enabled Kubernetes architecture.

| Namespace | Description | Key Components or Roles | Notes |
|-----------|-------------|--------------------------|-------|
| aks-operator-system | Hosts the AKS Operator for observability and monitoring. | aks-operator-controller-manager | Deploys Prometheus, Alertmanager, and VM extensions. |
| azstackhci-operator-system | Manages Azure Stack HCI integration with Kubernetes. | telemetry-manager, azstackhci-operator-controller-manager | Handles telemetry and lifecycle of HCI services. |
| azure-arc | Hosts Azure Arc agents and services. | connect-agent, config-agent, metrics-agent, prometheus, alertmanager | Enables Azure management for on-prem clusters. |
| caph-system | Cluster API Provider for HCI. | caph-controller-manager | Part of Cluster API ecosystem. |
| capi-system | Core Cluster API controllers. | capi-controller-manager | Manages cluster lifecycle. |
| capi-kubeadm-bootstrap-system | Manages bootstrap process using kubeadm. | capi-kubeadm-bootstrap-controller-manager | Used during cluster creation. |
| capi-kubeadm-control-plane-system | Manages control plane using kubeadm. | capi-kubeadm-control-plane-controller-manager | Handles control plane lifecycle. |
| cert-manager | Manages TLS certificates in Kubernetes. | cert-manager, cainjector, webhook | Automates certificate issuance and renewal. |
| cloudop-system | Hosts cloud operations controllers. | cloudop-controller-manager, kvaio-controller-manager | Supports hybrid infrastructure orchestration. |
| hybridaks-operator-system | Manages hybrid AKS deployments. | hybridaks-operator-controller-manager | Ensures hybrid cluster compliance. |
| kube-system | Core Kubernetes system components. | kube-apiserver, controller-manager, scheduler, calico, etcd | Critical for Kubernetes functionality. |
| moc-operator-system | Manages Microsoft On-premise Cloud (MOC) resources. | moc-operator-controller-manager | Handles MOC-specific services. |

* * *

 Step 4: Troubleshoot Pods
-----------------------------------------------
as an example of troublshooting PODs, `telemetry-manager` POD showing thousands restarts
### Describe the Pod
```powershell
kubectl describe po telemetry-manager-8c8f85d4c-gghk2 -n azstackhci-operator-system
```
![image.png](/.attachments/image-b7674d8d-dec0-4f51-b219-ceff8d77353e.png)

### View Logs for container `msi-adapter` Container

```powershell
kubectl logs telemetry-manager-8c8f85d4c-gghk2 -n azstackhci-operator-system -c msi-adapter --tail=100
kubectl logs telemetry-manager-8c8f85d4c-gghk2 -n azstackhci-operator-system -c msi-adapter --previous
```

* * *

 Step 5: Check Restart Count
------------------------------
```powershell
kubectl get pod telemetry-manager-8c8f85d4c-gghk2 -n azstackhci-operator-system -o jsonpath="{.status.containerStatuses[*].restartCount}"
```