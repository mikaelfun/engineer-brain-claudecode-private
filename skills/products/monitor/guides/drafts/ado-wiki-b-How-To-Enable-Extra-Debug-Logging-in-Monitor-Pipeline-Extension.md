---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Monitor Pipeline/How-To/How To Enable Extra Debug Logging in Monitor Pipeline Extension"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FMonitor%20Pipeline%2FHow-To%2FHow%20To%20Enable%20Extra%20Debug%20Logging%20in%20Monitor%20Pipeline%20Extension"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How To Enable Extra Debug Logging in Monitor Pipeline Extension

## Result

After performing these steps, the stateful set in the cluster which accepts observability data from the edge will emit many more logs. Please be aware that this might be unscalable depending on the customer workload.

## Prerequisites

- Helm and kubectl are installed
- You have a connected cluster with the Azure Monitor Pipeline Edge extension installed. Note down:
  - **Extension name**: found under connected cluster > Extensions blade
  - **Extension namespace**: found under "Extension scope" on the right side of the extension detail page
  - **Extension version**: found on the right under "Version"
- You have logged into your cluster using kubectl
- The extension version must be at least **0.53.4-preview**

## Steps

1. Run `helm get values <extension name> -n <extension namespace> > values.yaml`
2. Open values.yaml and add the following lines under "USER-SUPPLIED VALUES":
   ```yaml
   controllerManager:
     manager:
       env:
         debug: true
   ```
3. Run:
   ```bash
   helm upgrade <extension name> -n <extension namespace> \
     oci://mcr.microsoft.com/azuremonitor/helmchart/pipeline-operator \
     --version <extension version> -f values.yaml
   ```
4. Debug mode is now turned on. It can take a few minutes for the extension to be updated and start logging additional information.

## Reverting

To revert, simply follow the same steps, but remove the entries from values.yaml instead of adding them.
