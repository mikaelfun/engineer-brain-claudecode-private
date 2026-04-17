---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting 404 Not Found"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20404%20Not%20Found"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGIC: Troubleshooting 404 Not Found

## Workflow

```
Request → 404 Not Found
  ├─ Is request routed to correct backend? (see routing verification guide)
  │   ├─ NO → Troubleshoot wrong backend application reached
  │   └─ YES → Is backend application returning 404?
  │       ├─ YES → Troubleshoot backend application issues (see backend guide)
  │       └─ NO → Solve request path issues (see below)
```

## Request Path Issues

When the 404 is caused by path mismatch, consider:

1. **Fix the request URL** to match application's expected paths
2. **Reconfigure the application** to listen on the requested path (customer dev team responsibility)
3. **Use `backend-path-prefix` annotation** to rewrite the path:
   ```yaml
   annotations:
     appgw.ingress.kubernetes.io/backend-path-prefix: "/actual-app-path"
   ```
   This maps external URLs to internal application paths. See: https://learn.microsoft.com/en-us/azure/application-gateway/ingress-controller-annotations#backend-path-prefix

## Related Guides

- [AGIC Request Routing Verification](./ado-wiki-a-agic-request-routing-verification.md)
- [AGIC Backend Application Issues](./ado-wiki-a-agic-backend-application-issues.md)
