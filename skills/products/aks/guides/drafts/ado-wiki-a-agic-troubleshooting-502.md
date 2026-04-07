---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting 502 Bad Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20502%20Bad%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGIC: Troubleshooting 502 Bad Gateway

## Overview

HTTP 502 in AGIC/AppGW setup: Application Gateway cannot reach any healthy backend to handle the request.

## Workflow

```
Request → 502 Bad Gateway
  ├─ Are there healthy backend pool members?
  │   ├─ YES → Is this during rolling deployments?
  │   │   ├─ YES → Implement "Minimizing Downtime During Deployments" recommendations
  │   │   └─ NO → Troubleshoot backend application issues
  │   └─ NO → Troubleshoot backend health probe issues
```

## Check Backend Health

### Azure Portal (Customer)
Application Gateway → **Monitoring | Backend health** dashboard

### Azure Support Center (CSS)
Application Gateway → **Backend Address Pools** panel

## Minimize Downtime During Deployments

For 502 errors during rolling updates, follow:
https://azure.github.io/application-gateway-kubernetes-ingress/how-tos/minimize-downtime-during-deployments/

## Related Guides

- [AGIC Backend Application Issues](./ado-wiki-a-agic-backend-application-issues.md)
