---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Image Cleaner"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FImage%20Cleaner"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Image Cleaner (Eraser)

## Overview

Based on the [Eraser Project](https://github.com/Azure/eraser). Removes unused or vulnerable images cached on AKS nodes. When enabled, an `eraser-controller-manager` pod is deployed on each node, using ImageList CRD to determine unreferenced and vulnerable images (via trivy scan with LOW/MEDIUM/HIGH/CRITICAL classification).

## Identifying Image Cleaner

### From ASC/ASI
Check for Image Cleaner in security features section.

### From ManagedCluster Property
```json
"securityProfile": {
    "imageCleaner": {
      "enabled": true,
      "intervalHours": 24
    }
}
```

## How to Check Logs

```bash
kubectl get pods --all-namespaces
kubectl logs -n kube-system collector-{vmss}-dpkqt -c eraser
kubectl logs -n kube-system collector-{vmss}-dpkqt -c trivy-scanner
```

## Collector Status NotReady

Scan or erase tasks may take a while depending on number of images. `2/3` Ready with `NotReady` status is **expected** during processing. Once scanner finishes and eraser removes images, status changes to `Completed`.

## References

- [Upstream issues](https://github.com/Azure/eraser/issues)
- [Public Docs](https://learn.microsoft.com/en-us/azure/aks/image-cleaner?tabs=azure-cli)
