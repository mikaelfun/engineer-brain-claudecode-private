---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Windows GPU"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FWindows%20GPU"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# GPUs on Windows Nodes

[[_TOC_]]

# Overview

Windows GPU is a feature that enables the use of GPU resources in an AKS Windows cluster. It is automatically enabled meeting certain requirements such as upgrading to k8 version of at least **"1.29.0"** and cluster configuration. This feature can be disabled using a flag upon nodepool creation for custom scenarios.

*Note to upgrade k8 Version see <https://learn.microsoft.com/en-us/azure/aks/upgrade-aks-cluster?tabs=azure-cli>

# Limitations

The current architecture installs a specific GPU Driver for each VM size. **Workload and Driver Compatibility Matter! Please verify the workload is compatible with the driver installed to the VM Size**

|VM Size | Driver Type |
|--|--|
| NC, ND | CUDA |
| NV | GRID |

Grid Version: 537.13_grid_win10_win11_server2019_server2022_dch_64bit_international_azure_swl.exe

Cuda Version: 473.47-data-center-tesla-desktop-winserver-2019-2016-international.exe

# Enablement

- k8 version >= **1.29.0**
- VM with GPU (size of NC, NV, or ND)
- Must use a Windows node

 Customer can opt out of auto configuration and driver installation using `--skip-gpu-driver-install` flag

i.e. `az aks nodepool add --os-type windows --node-vm-size <GPU vm size> --skip-gpu-driver-install`

# Troubleshooting: First step to debug

- ##Check node has directX capacity _and_ allocatable enabled
Geneva Action "
Run kubectl describe" to describe the nodes
![geneva1.png](/.attachments/geneva1-9dd3482b-a3aa-4e8f-8ddf-33cd206c5950.png)

OR

   ```bash
   kubectl describe node {node_name}
   ```

   (`microsoft.com/directx:` should not be 0)

   ![describe.png](/.attachments/describe-19143c06-d3d4-4175-84da-c97e27095f7d.png)

    The capacity "microsoft.com/directx" represents the number of available directx gpu resource. It should be greater than zero and equal to the number of gpus on the node. 

    The allocatable "microsoft.com/directx" represents the number of allocatable directx gpu resource. It should be the number of the capacity "microsoft.com/directx" minus the number of gpu resource that is being used. 

    If capacity and allocatable "microsoft.com/directx" is not shown anywhere, the device plugin add-on is not deployed correctly.

# Troubleshooting: Device Plugin Add-on

- ##Ensure `directx-device-plugin` daemonset pods are running

    Check status with

   Geneva Action "CustomerCluster - Run kubectl command"
   ![geneva2.png](/.attachments/geneva2-71a2d0fa-525f-4b92-ac57-9c77c5321794.png)
OR

    ```bash
    kubectl get pods -A
    ```

   ![getpods.png](/.attachments/getpods-d3e21e2d-f9bf-45b0-bf5a-7922fb9370c1.png)

- ## Check device plugin pod logs

    ```bash
    kubectl logs -n kube-system directx-device-plugin-{pod-guid}
    ```

    You should see something like

    ```log
    kubectl logs -n kube-system directx-device-plugin-5t7dc
    ERROR: logging before flag.Parse: I0505 19:10:39.046785    5076 main.go:98] GPU NVIDIA Tesla M60 id: PCI\VEN_10DE&DEV_13F2&SUBSYS_115E10DE&REV_A1\6&2B78CA89&0&0
    ERROR: logging before flag.Parse: W0505 19:10:39.096589    5076 main.go:90] 'Microsoft Hyper-V Video' doesn't match  'nvidia', ignoring this gpu
    ERROR: logging before flag.Parse: I0505 19:10:39.096589    5076 main.go:101] pluginSocksDir: /var/lib/kubelet/device-plugins/
    ERROR: logging before flag.Parse: I0505 19:10:39.096589    5076 main.go:103] socketPath: /var/lib/kubelet/device-plugins/directx.sock
    2022/05/05 19:10:40 Starting to serve on /var/lib/kubelet/device-plugins/directx.sock
    2022/05/05 19:10:40 Deprecation file not found. Invoke registration
    2022/05/05 19:10:40 ListAndWatch
    ```

# Troubleshooting: CSE Driver Installation

## Steps using ASC

In ASC, navigate to the VMSS instance, Diagnostics -> Guest Agent VM logs -> Create Report. After the report is created, download to the local machine,  the report is in a zip file with name pattern akswinp1_1-GuestVMLogs-aiyoo5wf.liw_801554ed04.zip,  open the zip file and navigate to the path  Logs\GuestAgentLogs\VMLogs\<GUID>\GALogs.zip\RuntimeAndAgent\aks CustomDataSetupScript.log, in the log, we can see the logs related to Windows GPU driver installation.
![asc.png](/.attachments/asc-3dc06613-9c78-440b-bda1-496f9fbcec0c.png)
![disk-logs.png](/.attachments/disk-logs-4b12c0fc-8b09-4c6b-b08b-3fe3e41dd88d.png)

## Steps to access cse log and nvidia gpu driver install log from the vm

### Accessing the CSE Log

1.
    - Open Command Prompt or PowerShell.
    - Run `cd C:\AzureData`.
    - To open the CSE log, execute `type CustomDataSetupScript.log`.
    - Search for the keyword "ConfigGPUDriverIfNeeded", it's the beginning of the gpu driver installation.
    - If you can't find the keyword "ConfigGPUDriverIfNeeded", it's probably the cse execution breaks before the gpu driver installation begin.

### Checking the Nvidia GPU Log

2.
    - In the same directory, run `cd NvidiaInstallLog`.
    - List all files with `ls`.
    - Open a log file with, e.g., `type <logfilename>.log`.

## Setting `driverType` Property in GPUProfile

### Understanding the `driverType` Property

When creating a Windows agent pool in Azure Kubernetes Service (AKS) with GPU support, you have the option to explicitly specify the type of GPU driver using the `driverType` property within the `GPUProfile`. The available options are:

- **GRID**: For applications requiring virtualization support.
- **CUDA**: Optimized for computational tasks in scientific computing and data-intensive applications.

### Risk of Compatibility Issues

**Important**: When you explicitly set the `driverType` property, you assume responsibility for ensuring that the selected driver type is compatible with the specific VM size and configuration of your node pool.

While AKS attempts to validate compatibility, there are scenarios where the node pool creation might fail due to incompatibilities between the specified driver type and the underlying VM or hardware.

### Recommendations

- **Pre-Deployment Validation**: Before setting the `driverType` property, thoroughly review the compatibility of the GPU drivers with your chosen VM size and configuration. Refer to [Azure VM sizes for GPU](https://docs.microsoft.com/azure/virtual-machines/sizes-gpu) for detailed information.
- **Test in a Small Scale in a Staging Environment**: Always start by testing the configuration in a small scale within a staging environment. This approach helps to identify and address any issues early on without the risk of large-scale failures, which could significantly impact your operations and require extensive troubleshooting by on-call engineers.
- **Monitoring**: After deploying the node pool, closely monitor the nodes to ensure that GPU drivers are functioning correctly and that there are no issues with workloads that depend on GPU resources.

### Troubleshooting Steps

If you encounter issues with node pool creation:

1. **Check Compatibility**: Review the VM size and driver compatibility. Ensure that the selected driver type is supported for your VM size.
2. **Adjust Driver Type**: If compatibility issues are detected, consider to remove the `driverType` to use the default setup. Or you may use the `--skip-gpu-driver-install` flag to skip AKS's GPU driver and device plugin setup. This allows you to manually configure the GPU-related setup to match your specific requirements.
3. **Review Logs**: Examine the logs mentioned in above section for any error messages related to GPU driver installation or initialization.

# References

[PG TSG](https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/623065/AKS-Windows-GPU-TSG)

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Jordan Harder <joharder@microsoft.com>

