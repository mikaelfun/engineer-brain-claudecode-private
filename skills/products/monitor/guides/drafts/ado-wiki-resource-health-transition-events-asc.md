---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Alerts/How-To/Resource health/How to get resource health transition events sent by resource providers to GHS from Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAlerts%2FHow-To%2FResource%20health%2FHow%20to%20get%20resource%20health%20transition%20events%20sent%20by%20resource%20providers%20to%20GHS%20from%20Azure%20Support%20Center"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Get Resource Health Transition Events from Azure Support Center

This refers to resource health events **sent by each individual resource provider to Geneva Health System (GHS)**. The Resource Health page in the portal queries for the resource health state from data available in GHS endpoint.

## Steps

1. Open ASC from the support request
2. Navigate to **Resource Explorer**
3. Locate the desired Azure resource from the left-hand navigation:
   - Use **Resource Group** structure, OR
   - Select providers and expand the relevant provider based on resource type
4. Click on the desired resource and copy the resource ID
5. Navigate to the **Health** tab
6. Choose the relevant timeframe and click **Run**
7. Observe data in the **Resource Events** section for health transition events
