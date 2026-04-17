---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Windows/Troubleshooting AKS WIndows Nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCompute%2FWindows%2FTroubleshooting%20AKS%20WIndows%20Nodes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Windows Nodes in AKS Clusters

## Summary

kubectl plugin to automate Windows log collection and optional network capture on AKS Windows nodes. Deploys a privileged HostProcess container that runs the default Windows logs collector script, optionally captures network traces, and uploads results to Azure Storage via azcopy.

## Prerequisites

- Bash environment with kubectl configured
- AKS cluster with Windows nodes
- Storage Account SAS URL with Write permission (set as `SAS` environment variable)

## Usage

```bash
# Basic log collection
kubectl winlogs <nodeName>

# With network capture
kubectl winlogs <nodeName> --netcap
```

## How It Works

1. Deploys a privileged Windows pod (`windows-debug-17263`) on the target node
2. Downloads azcopy binary
3. Runs `C:\k\debug\collect-windows-logs.ps1` (built-in Windows log collector)
4. Uploads resulting zip to Storage Account via azcopy
5. Pod auto-cleans after completion

### Optional: Network Capture (`--netcap`)

When `--netcap` flag is provided:
- Runs `C:\k\debug\startpacketcapture.ps1 -NoPrompt`
- Stops capture with `Stop-NetEventSession HnsPacketCapture`
- Network captures must be manually downloaded via `kubectl cp`

### Manual Log Extraction

```bash
kubectl cp default/windows-debug-17263:/k/debug/yourLogsFile.zip ./localFileName
```

## Key Configuration

- Image: `ghcr.io/jsturtevant/windows-debug:v1.0.0`
- `hostProcess: true` / `runAsUserName: NT AUTHORITY\SYSTEM`
- `hostNetwork: true`
- Sleep: 660s (allows manual intervention before cleanup)
