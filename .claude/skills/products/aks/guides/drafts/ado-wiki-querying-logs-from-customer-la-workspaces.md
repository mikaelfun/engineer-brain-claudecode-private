---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Monitoring/Querying logs from customer Log Analytics workspaces"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FMonitoring%2FQuerying%20logs%20from%20customer%20Log%20Analytics%20workspaces"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Querying customer Log Analytics using ASC

## Summary

When customers have Container Insights or diagnostic logging enabled for their cluster, the data can be stored in a Log Analytics workspace. This data can be queried using Azure Support Center (ASC) using the following steps.

> **Note**: Please make sure to inform the customer or get their approval before using this feature as workspaces can sometimes have confidential customer data.

## Details

1. Open ASC and open the Resource Explorer view. While viewing the AKS cluster in question for the case, check the "Addon Profiles" section for `Omsagent Config` and copy the resource ID for the Log Analytics workspace configured for the cluster.

2. Navigate to the Log Analytics workspace in the Resource Explorer and open the "Query Customer Data" tab.

3. You can now use the Kusto query language to query the customer's Log Analytics workspace. For example, the following query will return the last 10 records from the `ContainerLog` table:

   ```kusto
   ContainerLog
   | limit 10
   ```

   It's better to draft your queries in a full-fledged editor, such as your own Log Analytics workspace; this provides syntax highlighting and autocomplete. You can then copy the query into ASC and run it to gather the correct data.
