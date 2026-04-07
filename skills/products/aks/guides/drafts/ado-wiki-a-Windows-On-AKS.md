---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Windows/Windows On AKS"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20On%20AKS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Windows On AKS — Comprehensive Guide

> Windows Server 2019 deprecated March 13, 2023 (EoL March 13, 2026).
> Docker on Windows deprecated March 2023, removed May 1, 2023.
> Containerd is the only supported container runtime for Windows nodes since May 1, 2023.

## Checklist

1. **Is Windows deployed?** Use `Cluster Health Summary` detector in AppLens.

2. **Are containers built with compatible Windows version?**
   - SSH into Windows node: `ver` to see OS version
   - `crictl images` to list all images
   - `crictl inspecti --output go-template --template 'Name: {{.status.repoTags}}, OS Version {{index .info.imageSpec "os.version"}}' <imageId>`

3. **Node selector set correctly?**
   - `kubectl get pods -o wide`
   - `kubectl describe node <nodename>` and `kubectl describe deployment <deployment>` to verify labels match selectors

4. **Windows nodes healthy?**
   - `Get-Service *containerd*` → should return Running
   - `Get-Process *containerd*` → ensure process running
   - Same for kubelet and kube-proxy
   - ⚠️ Do NOT restart kubelet or kube-proxy directly on Windows — restart the node instead (extra cleanup scripts run at node restart)

5. **Is it Supported?** Check https://kubernetes.io/docs/setup/production-environment/windows/intro-windows-in-kubernetes/#supported-functionality-and-limitations

## Key File Locations

| Purpose | Path |
|---------|------|
| Setup script log | `C:\AzureData\CustomDataSetupScript.log` |
| Kubernetes binaries | `C:\k` |
| Configuration/logs | `C:\AzureData`, `C:\k`, `C:ar` |

## Escalation Path

1. Create CRI to `Azure Kubernetes/RP` using the ICM template
2. If RP determines Windows team escalation needed → create collab from Service Desk

## Collecting Windows Logs

```powershell
Invoke-WebRequest -UseBasicParsing https://raw.githubusercontent.com/Azure/aks-engine/master/scripts/collect-windows-logs.ps1 | Invoke-Expression
```

Copy from Windows node to local machine via Linux debug pod + SCP + kubectl cp.

## Not Currently Supported (as of 2023-12-11)
- Pod Identity (use Workload Identity instead)
- Kubenet
- Rotating Service Principals (use MSI or create new nodepool)

## Exit Codes Reference
- Windows pod exit codes: https://windowsinternalservices.azurewebsites.net/Static/Errors/
