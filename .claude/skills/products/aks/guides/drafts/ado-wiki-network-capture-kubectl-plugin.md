---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Network capture on AKS nodes with kubectl plugin"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FNetwork%20capture%20on%20AKS%20nodes%20with%20kubectl%20plugin"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Network packet capture on AKS Linux nodes with kubectl plugin

## Summary

kubectl plugin to facilitate network traffic capture on AKS Linux nodes with optional upload to a Storage Account Container through azcopy.

## Prerequisites

- Bash instance
- Working AKS cluster with kubectl configured
- SAS URL environment variable (`SAS`) with Write access for uploading results

## Implementation

The plugin deploys a privileged DaemonSet with an Alpine container that:
1. Uses `nsenter` to access the host network namespace
2. Downloads azcopy binary
3. Runs `tcpdump` for the specified duration
4. Uploads capture file to Storage Account via azcopy

Usage:
```bash
kubectl netdumps <nodeName> <captureTime(s)>
# Example:
kubectl netdumps akswin0001 30
```

The DaemonSet uses:
- `hostPID: true` and `privileged: true` security context
- `nsenter --target 1 --mount --uts --ipc --net --pid` to access host namespace
- Node selector: `kubernetes.io/os: linux`
- Tolerations for NoSchedule

## Notes

- Set SAS environment variable before running: `export SAS=yourSasUrl`
- To skip upload, set a dummy SAS value and comment out the azcopy line
