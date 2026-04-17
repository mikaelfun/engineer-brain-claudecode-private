---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting 504 Gateway Timeout"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20504%20Gateway%20Timeout"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGIC: Troubleshooting 504 Gateway Timeout

## Overview

Application Gateway enforces a request timeout. If backend does not respond within the timeout, HTTP 504 is returned to client.

## Workflow

```
Request → 504 Gateway Timeout
  ├─ Check configured request timeout
  │   ├─ Is 504 response time ≈ configured timeout?
  │   │   ├─ YES → Backend is too slow, troubleshoot backend app
  │   │   └─ NO → Investigate other network/infra issues
```

## Check Request Timeout

### Kubernetes Ingress Annotation
```bash
kubectl describe ingress <INGRESS_NAME> -n <NAMESPACE>
```
Look for: `appgw.ingress.kubernetes.io/request-timeout` (default: 30 seconds)

### Azure Portal
Application Gateway → **Backend Settings** → Request timeout value

### Azure Support Center (CSS)
Application Gateway → **Backend HTTP Settings Collections** → Request timeout

## Diagnosis

Compare the 504 response time (time from request to 504 response) with the configured timeout:
- **Match** → Timeout is working as expected; backend is genuinely slow
- **Mismatch** → Investigate network path or AppGW configuration issues

## Resolution

- Increase `request-timeout` annotation if backend legitimately needs more time
- Or investigate and fix backend application slowness

Ref: https://azure.github.io/application-gateway-kubernetes-ingress/annotations/#request-timeout
