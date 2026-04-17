---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGIC Troubleshooting Guide (Main Workflow)

Entry point for all Application Gateway Ingress Controller troubleshooting.

## [1] Troubleshoot AKS cluster issues first

Use AppLens, Azure Service Insights, ASC TSGs, AKS Ava Teams channel.

## [2] Determine AGIC deployment type

- **AKS Addon**: Portal > AKS > Networking > "Enable ingress controller". ASC: Addon Profiles > Ingress Application Gateway Enabled. Pod label: `kubernetes.azure.com/managedby=aks`
- **Helm**: No managed-by label. Customer manages installation, identities, updates.

## [3] Helm deployment issues

See: Azure Networking Pod Wiki - Troubleshooting Helm, AGIC GitHub Troubleshooting Guide.

## [4] Is AGIC pod healthy?

```bash
kubectl get pod -l app=ingress-appgw -n kube-system
```

Check: READY=1/1, STATUS=Running, RESTART count stable.

## [5] AGIC pod not healthy

See: [TSG] AGIC Troubleshooting AGIC Pod Not Healthy

## [6] Is AppGW receiving config updates from AGIC?

See: [TSG] AGIC Is The AppGW Receiving Configuration Updates From AGIC

## [7] AGIC/AppGW integration issues

See: [TSG] AGIC Troubleshooting AGIC AppGw Integration Issues

## [8] SSL configuration issues

See: Troubleshooting SSL Configuration Issues workflow

## [9-11] HTTP error codes

- [9] 404 Not Found workflow
- [10] 502 Bad Gateway workflow
- [11] 504 Gateway Timeout workflow

## [12] Frontend connectivity

- nslookup/dig: Verify FQDN resolves to AppGW IP
- telnet/netcat: Verify port reachability

## [13-14] Backend routing

Check if request reaches correct backend. See routing verification workflow.

## [15] Backend application issues

See: Troubleshooting Backend Application Issues

## [16] Sanity check with test workload

Deploy google-samples/hello-app:2.0 with AGIC ingress to isolate AGIC vs application issues.
