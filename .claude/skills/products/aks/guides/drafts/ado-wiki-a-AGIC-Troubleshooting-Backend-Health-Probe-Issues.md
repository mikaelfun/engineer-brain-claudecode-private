---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting Backend Health Probe Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20Backend%20Health%20Probe%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Backend Health Probe Issues

Azure Application Gateway relies on health probes to monitor backend pool resources. This guide covers troubleshooting when probes fail and backends are marked Unhealthy.

## [1] Check backend health detailed status

- Azure Portal: Application Gateway > Monitoring > Backend health
- ASC: Backend Address Pools panel

## [2] Check if backend pods have liveness/readiness probes

```bash
kubectl describe pod <POD_NAME> -n <NAMESPACE>
```

CSS: Use Jarvis Action (LockboxCustomerClusterRunKubectlDescribe).

## [3] With liveness/readiness probes defined

AGIC infers health probe config from pod probes. Limitations:
- Only httpGet based probes supported
- Cannot probe on different port than exposed
- HttpHeaders, InitialDelaySeconds, SuccessThreshold not supported

**Fix**: Modify probe path to one returning 200-399, or modify application to respond correctly.

## [4] Without liveness/readiness probes

AGIC uses:
1. `appgw.ingress.kubernetes.io/backend-path-prefix` annotation (if set)
2. Path from ingress rule spec

**Fix**: Add/modify backend-path-prefix annotation. Use `health-probe-status-codes` annotation to accept additional codes (e.g. 404).

## [5] Health probe timeout

Priority: Pod liveness probe timeout > `health-probe-timeout` annotation > Default (30s).

## [6] VNET peering issues

Required when AKS and AppGW in different VNETs. Check: Provision State = Succeeded, Peering State = Connected.

## [7] NSG/routing issues

Use Connection troubleshoot: AppGW > Monitoring > Connection troubleshoot. Specify backend pod IP + port.
CSS: ASC > AppGW VM > Diagnostics > Test Traffic.
