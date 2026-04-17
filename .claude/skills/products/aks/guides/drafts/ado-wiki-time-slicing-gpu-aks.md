---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Time Slicing GPU"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FLinux%2FTime%20Slicing%20GPU"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Time-Slicing GPUs in Azure Kubernetes Service

Author: <chenchinluo@microsoft.com>

## Summary and Goals

A customer inquired about configuring time-slicing in an AKS cluster with GPUs. They want to use the shared GPU feature to run multiple workloads.

According to NVIDIA documentation, there are currently two ways to share GPUs in Kubernetes:

- Multi-Instance GPU (MIG)
- Time-Slicing

However, our official documents currently only provide MIG operation examples, and we lack official documentation and related cases for implementing time-slicing.

- [Microsoft Official Docs about MIG](https://learn.microsoft.com/en-us/azure/aks/gpu-multi-instance?tabs=azure-cli)

Our goal is to enable NVIDIA time-slicing to achieve multiple workloads on one GPU in AKS cluster.

**[Important]** Since there is no official AKS documentation for Time-slicing at this stage, please note that this is not within the support scope.

### Prerequisites

The environment used here is the FDPO Tenant subscription - Microsoft Non-Production (fdpo.onmicrosoft.com).

To conduct the test, we need to apply for a quota for the GPU SKU (NVADSA10v5) first. Once we obtain the quota, we can deploy an AKS cluster with a GPU node pool.

Additionally, when establishing a GPU node pool, pay attention to the MCAPS policy blocking. We cannot create a GPU node pool directly. Please refer to the following link:

- [MCAPS Policy Enforcement](https://dev.azure.com/OneCommercial/NoCode/_wiki/wikis/NoCode.wiki/37/Azure-Policy-Enforcement)

### Involved Components

- AKS cluster running a supported version
- AKS nodepool with NVIDIA GPU sku which supports time-slicing feature

## Implementation Steps

1. **Create a GPU nodepool**: We can use Azure Portal or cli to create a GPU nodepool by setting a spot instance and eviction policy to Delete. By default, **the GPU driver will be automatically installed.** We only need to install the device plugin via a DaemonSet.

    ```bash
    az aks nodepool add \
        --resource-group $RESOURCE_GROUP_NAME \
        --cluster-name $AKS_CLUSTER_NAME \
        --name a10s \
        --node-vm-size Standard_NV6ads_A10_v5 \
        --node-count 1 \
        --priority Spot --eviction-policy Delete --spot-max-price -1
    ```

2. **Check the GPU driver installed**: We can connect to the node and type `nvidia-smi` to see the GPU information.

    ```bash
    $ curl -LO https://github.com/kvaps/kubectl-node-shell/raw/master/kubectl-node_shell
    $ chmod +x ./kubectl-node_shell
    $ ./kubectl-node_shell aks-a10s-17165864-vmss000003
    root@aks-a10s-17165864-vmss000003:/# nvidia-smi
    ```

3. **Install K8s Device Plugin**: Download the following yaml and use kubectl apply command to deploy K8s device plugin the daemonset. This will make `nvidia.com/gpu` visible.
   [NVIDIA K8s Device Plugin Deployment](https://github.com/NVIDIA/k8s-device-plugin/blob/main/deployments/static/nvidia-device-plugin.yml)

   **[Important]** To schedule on the spot instance, please make sure to add the correct toleration in the spec:

    ```yaml
    spec:
      tolerations:
      - key: "kubernetes.azure.com/scalesetpriority"
        operator: "Equal"
        value: "spot"
        effect: "NoSchedule"
      nodeSelector:
        kubernetes.azure.com/accelerator: nvidia
    ```

4. **Setup Time-Slicing config**: Due to we do not use the NVIDIA GPU Operator, so that we need to manually setup the config file for the device plugin.
    - [Setup config file path in environment variable](https://github.com/NVIDIA/k8s-device-plugin?tab=readme-ov-file#as-command-line-flags-or-envvars)

    Deploy a ConfigMap as `config.yaml`, mount it to the device plugin pod, and use an environment variable to set the path.

    Key ConfigMap section for time-slicing:
    ```yaml
    data:
      config.yaml: |-
        version: v1
        flags:
          migStrategy: "none"
          failOnInitError: false
          nvidiaDriverRoot: "/"
          plugin:
            passDeviceSpecs: true
        sharing:
          timeSlicing:
            resources:
            - name: nvidia.com/gpu
              replicas: 8
    ```

    Once deployed, `kubectl describe node` should show `nvidia.com/gpu: 8`.

5. **Testing**: Deploy the time-slicing verification workload from NVIDIA documentation:
    - [Verifying the GPU Time-Slicing Configuration](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-sharing.html#verifying-the-gpu-time-slicing-configuration)

## References

- [NVIDIA K8s Device Plugin](https://github.com/NVIDIA/k8s-device-plugin/)
- [NVIDIA Official Docs about Time-Slicing](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-sharing.html#configuration)

### Appendix - NVIDIA GPU Operator

Alternatively, use `--skip-gpu-driver-install` (Preview) flag during node pool creation for manual driver + device plugin installation via NVIDIA GPU Operator.

- [NVIDIA GPU Operator on AKS](https://learn.microsoft.com/en-us/azure/aks/gpu-cluster?tabs=add-ubuntu-gpu-node-pool#use-nvidia-gpu-operator-with-aks)

**[Important]** If you want to control the installation of the NVidia drivers or use the NVIDIA GPU Operator, you can skip the default GPU driver installation. Microsoft doesn't support or manage the maintenance and compatibility of the NVidia drivers as part of the node image deployment.
