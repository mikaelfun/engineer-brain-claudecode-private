---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/Check Network Connectivity for Container Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/Check%20Network%20Connectivity%20for%20Container%20Insights"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check Network Connectivity for Container Insights

## Required Endpoints

### Public Cloud
| Agent Resource | Port |
|--|--|
| *.ods.opinsights.azure.com | 443 |
| *.oms.opinsights.azure.com | 443 |
| dc.services.visualstudio.com | 443 |
| *.monitoring.azure.com | 443 |
| login.microsoftonline.com | 443 |

### Public Cloud - Managed Identity
| Agent Resource | Purpose | Port |
|--|--|--|
| global.handler.control.monitor.azure.com | Access control service | 443 |
| \<region\>.ingest.monitor.azure.com | Prometheus metrics ingestion (DCE) | 443 |
| \<region\>.handler.control.monitor.azure.com | Fetch DCRs for AKS cluster | 443 |

> If using **Private Link**, endpoints must be changed to corresponding Private Link endpoints.

## Process via kubectl exec

### Prerequisites
- Name of AMA pod
- Log Analytics Workspace ID

### Steps
1. Connect to the cluster via CLI
2. Get ama-logs pod name: `kubectl get pods -n kube-system | grep ama`
3. Exec into the pod: `kubectl exec -it ama-logs-* -n kube-system -c ama-logs -- /bin/bash`

### cURL Tests
```bash
curl -v https://global.handler.control.monitor.azure.com:443
curl -v https://<REGION>.handler.control.monitor.azure.com:443
curl -v https://<WORKSPACE_ID>.ods.opinsights.azure.com:443
```

### nslookup Tests
```bash
nslookup <WORKSPACEID>.ods.opinsights.azure.com
nslookup <WORKSPACEID>.oms.opinsights.azure.com
nslookup dc.services.visualstudio.com
nslookup login.microsoftonline.com
nslookup global.handler.control.monitor.azure.com
nslookup <REGION>.ingest.monitor.azure.com
nslookup <REGION>.handler.control.monitor.azure.com
```

### OpenSSL Tests
```bash
openssl s_client -connect <WORKSPACEID>.ods.opinsights.azure.com:443 -showcerts
openssl s_client -connect <WORKSPACEID>.oms.opinsights.azure.com:443 -showcerts
openssl s_client -connect dc.services.visualstudio.com:443 -showcerts
```
If connected but certificate is not a Microsoft one, customer needs to modify network to not perform HTTP/SSL inspection on these endpoints.

## Resources
- [Firewall Requirements](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-onboard#network-firewall-requirements)
