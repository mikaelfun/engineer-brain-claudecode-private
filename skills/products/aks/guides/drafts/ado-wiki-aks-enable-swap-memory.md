---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Other/Enable swap memory for AKS nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FOther%2FEnable%20swap%20memory%20for%20AKS%20nodes"
importDate: "2026-04-05"
type: how-to-guide
---

# How to enable swap memory for AKS nodes

Author: <dandshi@microsoft.com>

## Summary and Goals

By default, as what is mentioned at <https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/#before-you-begin>, the Kubernetes nodes should have swap memory disabled. However, in some cases, customer may want to enable and further leverage it for Kubernetes workloads. This article introduces how to enable the swap memory in AKS cluster.

### **Attention!!!**

**We are not officially support using swap memory in AKS nodes and pods. Please do set proper expectation to your customers before introducing it.**

### Prerequisites

* AKS cluster version is greater than 1.22.
* Daemonset with privilege container for configuring kubelet feature gate. (node-installer)

### Limitation

* It can only be updated to newly added node pools. We can't enable it on existing node pools.
* For AKS cluster greater than 1.28, only Cgroup v2 supports enabling swap memory.

## Implementation Steps

1. By leveraging this [feature](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools), we can enable swap memory for AKS nodes by specifying size of the swap file and set the failSwapOn for kubelet as false.

    The Linux OS config should contain following content which specify the swap file size.

    ```json
    {
      "swapFileSizeMB": 1024
    }
    ```

   The kubelet config should contain following content

   ```json
   {
     "failSwapOn": "false"
   }
   ```

2. Enable swap memory for new AKS cluster: `az aks create --name <AKSName> --resource-group <AKSResourceGroup> --kubelet-config <kubeletConfigFilePath> --linux-os-config <linuxConfigFilePath>`
3. Enable swap memory for new node pools: `az aks nodepool add --name <nodePoolName> --cluster-name <AKSName> --resource-group <AKSResourceGroup> --kubelet-config <kubeletConfigFilePath> --linux-os-config <linuxConfigFilePath>`

4. Enable the feature gate "NodeSwap" by adding following content in kubelet configuration file under "/etc/default/kubeletconfig.json" on the node and then restart the kubelet.

    Leverage an open-source project [Node Installer](https://github.com/patnaikshekhar/AKSNodeInstaller) to enable the feature gate of Kubelet.

    Sample YAMLs:

    ```yaml
    apiVersion: v1
    kind: Namespace
    metadata:
      name: node-installer
    ---
    apiVersion: v1
    kind: ConfigMap
    metadata:
      name: node-swap-installer-config
      namespace: node-installer
    data:
      install.sh: |
        #!/bin/bash
        cat /etc/default/kubeletconfig.json | jq '.featureGates.NodeSwap=true' > /etc/default/kubeletconfig.json.tmp && mv /etc/default/kubeletconfig.json.tmp /etc/default/kubeletconfig.json
        systemctl restart kubelet
    ---
    apiVersion: apps/v1
    kind: DaemonSet
    metadata:
      name: installer
      namespace: node-installer
    spec:
      selector:
        matchLabels:
          job: installer
      template:
        metadata:
          labels:
            job: installer
        spec:
          hostPID: true
          nodeSelector:
            agentpool: swaptest
          restartPolicy: Always
          containers:
          - image: patnaikshekhar/node-installer:1.3
            name: installer
            securityContext:
              privileged: true
            volumeMounts:
            - name: install-script
              mountPath: /tmp
            - name: host-mount
              mountPath: /host
          volumes:
          - name: install-script
            configMap:
              name: node-swap-installer-config
          - name: host-mount
            hostPath:
             path: /tmp/install
    ```

### Result

After configuring all the stuffs, we should be able to see the swap memory using `free -m` in the nodes.

## References

* [Kubernetes official - Nodes](https://kubernetes.io/docs/concepts/architecture/nodes/#swap-memory)
* [Kubernetes blog](https://kubernetes.io/blog/2023/08/24/swap-linux-beta/)
* [MS official - Custom node configuration](https://learn.microsoft.com/en-us/azure/aks/custom-node-configuration?tabs=linux-node-pools)
* [3rd party documentation - What is Swap space and how it works](https://phoenixnap.com/kb/swap-space)
