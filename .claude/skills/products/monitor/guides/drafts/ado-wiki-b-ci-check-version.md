---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/Check Container Insights Version"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/Check%20Container%20Insights%20Version"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check Container Insights Agent Version

## Via kubectl
1. Get the replicaset pod name:
   ```bash
   kubectl get pods -n kube-system -o custom-columns=NAME:.metadata.name | grep -E ama-logs-rs
   ```
2. Get the image version:
   ```bash
   kubectl describe pod PODNAME -n kube-system | grep -E Image
   ```
   The result will show the image version.

## Via Azure Portal
Navigate to **AKS cluster -> Insights -> Containers** and click on one of the 'ama-logs' containers. The sidebar will show the agent version.

## Compare Version
Compare against the current [release notes](https://github.com/microsoft/Docker-Provider/blob/ci_prod/ReleaseNotes.md). If running an older version, recommend updating via Azure CLI.
