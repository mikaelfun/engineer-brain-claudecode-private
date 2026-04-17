---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Advisor/TSGs/Remediation takes long or fails_Advisor"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Advisor%2FTSGs%2FRemediation%20takes%20long%20or%20fails_Advisor"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Remediation Takes Long or Fails - Troubleshooting Guide

## Summary

Troubleshooting cases when remediation takes too long or fails to complete. Applies to both manual remediation and Quick-Fix button.

## Prerequisites - Roles and Access

Verify customer has necessary permissions:

- **Contributor access** on the target resource is typically required (remediation can include resize, deletion, SKU change, etc.)
- Reference: [Permissions in Azure Advisor](https://learn.microsoft.com/en-us/azure/advisor/permissions)
- Related TSG: [Cannot Postpone/Dismiss](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/1136238)

## Troubleshooting Steps

### 1. Check Error Message

Look for clear evidence in the error message:

- **Quota restriction** during resize: Not an Advisor issue, engage Quota team
- **Generic errors** like "Remediation wasn't successfully applied for resource" or "Request could not be completed in time" require deeper investigation

**Isolation test:** For batch operations (e.g., resize 40 VMs), test with a single resource first. Try the operation manually via Portal/CLI/PS to determine if it's an Advisor issue or an underlying service issue.

### 2. Check ARM Logs (Kusto)

Use Kusto queries to investigate ARM-side issues. Connect to cluster: `https://armprodgbl.eastus.kusto.windows.net`

**HttpIncomingRequests:**

```kql
macro-expand isfuzzy=true ARMProdEG as X
(
    let start = datetime(<START_DATE>);
    let end = datetime(<END_DATE>);
    let subid = "<SUBSCRIPTION_ID>";
    X.database('Requests').HttpIncomingRequests
    | where PreciseTimeStamp >= start and PreciseTimeStamp <= end
    | where subscriptionId == subid
    | where operationName !contains("GET")
    | where targetResourceProvider contains "advisor"
)
```

**Traces (with correlationId from above):**

```kql
macro-expand isfuzzy=true ARMProdEG as X
(
    let start = datetime(<START_DATE>);
    let end = datetime(<END_DATE>);
    let subid = "<SUBSCRIPTION_ID>";
    let correlationid = "<CORRELATION_ID>";
    X.database('Traces').Traces
    | where subscriptionId == subid
    | where TIMESTAMP >= start and TIMESTAMP <= end
    | where correlationId contains correlationid
    | project TIMESTAMP, operationName, message, exception, additionalProperties
    | order by TIMESTAMP asc
    | limit 1000
)
```

### 3. Check Azure Extension Analyzer

Another investigation tool for remediation error messages.

## Escalation

If root cause cannot be determined, escalate to Advisor PG team via ICM.
