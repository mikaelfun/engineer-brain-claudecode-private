---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Is Request Being Routed To The Correct Backend Application"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Is%20Request%20Being%20Routed%20To%20The%20Correct%20Backend%20Application"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AGIC: Is Request Being Routed To The Correct Backend Application?

## Purpose

Confirm if a given request is being routed by Application Gateway to the correct backend pod(s).

## Method 1: Azure Portal (Customer-Facing)

1. Enable Diagnostic Settings for the Application Gateway
2. Navigate to **Monitoring/Logs** and run:
   ```kql
   AzureDiagnostics
   | where requestUri_s == "<PATH>"
   | project serverRouted_s
   ```
3. Result shows IP:port of the backend pod
4. Identify pod by IP:
   ```bash
   kubectl get pods -A -o wide --field-selector status.podIP=<IP_ADDRESS>
   ```

## Method 2: CSS Tooling (Internal)

1. Open Application Gateway in **Azure Support Center** → Diagnostics
2. Click **[MDM Logs] Request Response** under Diagnostic Links
3. Opens DGrep (Jarvis) dashboard with pre-loaded query (last 15 min)
4. Find request by timestamp/client IP/URI → check `serverRouted` column
5. Use Jarvis kubectl Action to list pods and match IP:
   ```
   get pod --all-namespaces -o wide
   ```
