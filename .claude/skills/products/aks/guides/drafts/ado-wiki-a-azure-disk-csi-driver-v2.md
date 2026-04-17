---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Preview Features/Azure Disk CSI Driver v2"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FPreview%20Features%2FAzure%20Disk%20CSI%20Driver%20v2"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure Disk CSI v2

[[_TOC_]]

## Intro

This page is the TSG for Azure Disk CSI Driver.

## Scope

**Note: We only support the managed version. We do not support the upstream OSS version.**

If customers use the upstream version, we can push back and send the following suggestions to the customer.

1. Following [the upstream TSG](https://github.com/kubernetes-sigs/azuredisk-csi-driver/blob/master/docs/csi-debug.md) to debug by themselves.  
2. Submit a github issue. <https://github.com/kubernetes-sigs/azuredisk-csi-driver/issues>

**How to distinguish these two versions**:

- For managed version, go to [ASI](https://azureserviceinsights.trafficmanager.net/) to see if managed version is enabled or not.
- If enabled, in Feature section, the status of it is blue check mark.

## Troubleshooting

### What is kind of issue?

There are 3 kinds mainly.

- Creation/Deletion -> Focus on csi-azuredisk-controller related containers which are in CCP namespaces.
- Attach/Detach -> Focus on csi-azuredisk-controller related containers and vm nodes.
- Mount/Unmount -> Focus on csi-azuredisk-node related containers which are in customer nodes, and kubelet logs.

### How to judge which kind?

1. Describe the error app pod. If there are some words related to Attach/Detach or Mount/Unmount, need to see corresponding logs: `kubectl describe pod <app-pod> -n <pod-namespace>`
2. Using kubectl to get PV or PVC to check if the azure disk is created or deleted successfully.

   ```bash
   kubectl get pvc -A
   kubectl get pv
   ```

### How to collect the related logs

#### Creation/Deletion Issues

```txt
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp > ago(1h)
| where ccpNamespace == "{ccp_Namespace}"
| where category contains "csi-azuredisk-controller" // or category contains "csi-provisioner-disk"
| extend Log = extractjson('$.log', properties , typeof(string))
| where Log matches regex "^E[0-9]{4} " // this regex is used to filter error logs.
| project PreciseTimeStamp, ccpNamespace, category, Log
| order by PreciseTimeStamp desc
```

- `csi-azuredisk-controller`: Main container for debugging. Handles logic, builds and sends request to Azure.
- `csi-provisioner-disk`: Common sidecar container. Handles `CreateVolume` and `DeleteVolume` from kube-apiserver.

#### Attach/Detach Issues

```txt
cluster("Aksccplogs.centralus").database("AKSccplogs").ControlPlaneEventsAll
| where PreciseTimeStamp > ago(1h)
| where ccpNamespace == "{ccp_Namespace}"
| where category contains "csi-azuredisk-controller" // or category contains "csi-attacher-disk"
| extend Log = extractjson('$.log', properties , typeof(string))
| where Log matches regex "^E[0-9]{4} " // this regex is used to filter error logs.
| project PreciseTimeStamp, ccpNamespace, category, Log
| order by PreciseTimeStamp desc
```

- `csi-azuredisk-controller`: Main container for debugging.
- `csi-attacher-disk`: Common sidecar. Handles `AttachVolume` and `DetachVolume` from kube-apiserver.

#### Mount/Unmount Issues

##### Get CSI AzureDisk Node Server Logs

Option 1:

1. Use (Lockbox)Customer Data > CustomerCluster - Get pods logs geneva action. Fill in the cluster details > Get Access > Add ICM details > Submit JIT request > Get approval > Run.
2. Logs will be downloaded as a zip file. Extract and check `csi_azuredisk_node_log.txt` for related logs.

Option 2:
Ask support to get the logs from customers by using following command: `kubectl logs <csi-azuredisk-node-xxxx> -c azuredisk`.

##### Get Kubelet Logs

Search the filter keywords--PV and PVC names in kubelet logs.

### csi-proxy troubleshooting (Windows)

- ssh to the windows node and run PowerShell:

  ```powershell
  cd c:\k
  ls csi-proxy.exe
  Get-Service csi-proxy
  cat C:\k\csi-proxy.err.log
  ```

- collect log and script files:
  - `C:\AzureData\CustomDataSetupScript.log`
  - `C:\AzureData\CustomDataSetupScript.ps1`

## PG Owner

Feature owner: Andy Zhang, AKS storage dev (aksstoragedev@microsoft.com)
