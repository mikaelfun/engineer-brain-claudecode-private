---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Compute/Windows/Windows Node Troubleshooting Tips"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Compute/Windows/Windows%20Node%20Troubleshooting%20Tips"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Windows Node Troubleshooting Tips

## Garbage Collection Thresholds
- Location: `/var/lib/kubelet/kubeadmn-flags.env`
- Keys: `image-gc-low-threshold`, `image-gc-high-threshold`

## Finding Disk Space Usage (OS Disk) — du.exe from Sysinternals
Download in PowerShell session:
1. `curl -Uri https://download.sysinternals.com/files/DU.zip -UseBasicParsing -OutFile DU.zip`
2. `Expand-Archive .\DU.zip`
3. `.\du.exe /accepteula`
4. Check directory size: `.\du.exe -l 1`

## Log and Config Locations on Windows Nodes
- containerd: `C:\ProgramData\containerdoot`
- Kubelet and related logs: `C:\k`

## Correlating Snapshot ID to Container
Reference file: `C:\ProgramData\containerdoot\io.containerd.snapshotter.v1.windows\metadata.db`
Maps snapshot IDs to specific containers.
