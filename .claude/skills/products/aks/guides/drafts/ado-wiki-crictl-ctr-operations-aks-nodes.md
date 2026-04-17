---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Other/crictl and ctr in AKS nodes"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FOther%2Fcrictl%20and%20ctr%20in%20AKS%20nodes"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# crictl and ctr operations in AKS nodes

## Summary

This document introduces crictl and ctr operations for managing container images in AKS nodes. Useful when customers face image pulling issues from registries (auth or connectivity) or want to export/import images.

## crictl vs ctr

- **crictl**: Manages containers through the Container Runtime Interface (CRI). Works with any CRI-compatible runtime.
- **ctr**: Manages containers directly through containerd. Containerd-specific.

## Operations Reference

| Operation | crictl | ctr (k8s.io namespace) |
|---|---|---|
| List images | `crictl images` | `ctr -n k8s.io images ls` |
| Show image details | `crictl inspecti <imageID>` | N/A |
| Pull images | `crictl pull --creds '<user>:<pass>' <imageRef>` | `ctr -n k8s.io images pull <imageRef> -u <user>:<pass>` |
| Push images | N/A | `ctr -n k8s.io images push <imageRef> --platform <type> -u <user>:<pass>` |
| Export images | N/A | `ctr -n k8s.io images export <file> <imageRef>` |
| Import images | N/A | `ctr -n k8s.io images import <file>` |
| Retag images | N/A | `ctr -n k8s.io tag <source> <target>` |
| Delete images | `crictl rmi <imageID>` | `ctr -n k8s.io images rm <imageRef>` |
| Delete unused images | `crictl rmi --prune` | N/A |
| List containers | `crictl ps` | `ctr -n k8s.io container ls` |
| List pods | `crictl pods` | N/A |
| Delete containers | `crictl rm <containerID>` | `ctr -n k8s.io container rm <containerID>` |
| Container details | `crictl inspect <containerID>` | `ctr -n k8s.io container info <containerID>` |
| Container log | `crictl logs <containerID>` | N/A |
| Image filesystem info | `crictl imagefsinfo` | N/A |
| Runtime/CNI info | `crictl info` | N/A |

## Key Notes

- All kubernetes pod images are in the `k8s.io` namespace for ctr
- `crictl imagefsinfo` shows the containerd snapshotter overlay filesystem usage
- `crictl info` shows RuntimeReady, NetworkReady status and CNI configuration

## References

- [Kubernetes - Debug with crictl](https://kubernetes.io/docs/tasks/debug/debug-cluster/crictl/)
- [GitHub - crictl](https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md)
- [GitHub - containerd](https://github.com/containerd/containerd)
