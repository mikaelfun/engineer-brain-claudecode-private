---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/Microsoft Defender for Cloud Billing and Usage workflow/MDC resource-based usage calculation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/Microsoft%20Defender%20for%20Cloud%20Billing%20and%20Usage%20workflow/MDC%20resource-based%20usage%20calculation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDC Resource-Based Usage Calculation

## Overview

This guide explains how to calculate MDC usage for MOBO (Managed On Behalf) resources - Databricks and VMSS Uniform - to support refund requests.

## Problem Statement

MOBO devices have RO permissions, protected by RBAC Deny Assignment or Azure Policy locked assignment. Customers are limited in performing MDC operations (remediate recommendations, manage policies, dismiss/suppress alerts). This also prevents granular P1/P2 pricing configuration.

> **Note**: MDC support should not negotiate billing cases by currency ($$) - instead, talk "usage" by units.

## Calculating Usage for Databricks and VMSS

```kusto
let subs = pack_array(
    "subscriptionId01",
    "subscriptionId02",
    "subscriptionIdLast"
);
let _startTime = datetime(yyyy-MM-dd);
let _endTime = datetime(yyyy-MM-dd);
let resourcesList =
cluster("rometelemetrydata.kusto.windows.net").database("RomeTelemetryProd").GetComputeUsageDaily()
    | where Timestamp between (_startTime .. _endTime)
    | where SubscriptionId in (subs)
    | where SourceImageType == "Azure Databricks"
    //| where IsVMScaleSet == bool(False)  // uncomment for VMSS
    | extend ArmId = tolower(ArmId)
    | distinct ArmId;
let BundleMeters =
cluster("https://rometelemetrydata.kusto.windows.net").database('RomeTelemetryProd').BillingMetersKnown()
    | where Bundle == "VirtualMachines"
    | where PricingTier != "Standard Trial"
    | where Enabled == true;
(cluster("RomeTelemetryData").database("RomeTelemetryProd").BillingReportsRawArchive
    | where UsageTime between (_startTime .. _endTime)
    | where SubscriptionId in (subs)
    | extend ResourceUri = tolower(ResourceUri)
    | join kind=inner BundleMeters on MeterId)
| join kind=inner resourcesList on $left.ResourceUri == $right.ArmId
| summarize ["Total Units"]=sum(Units) by MeterId, ArmId
```

### Query Parameters

- `let subs`: subscription IDs to analyze (must be enabled)
- `let resourcesList`: filter by resource type:
  - Databricks: `| where SourceImageType == "Azure Databricks"`
  - VMSS: `| where IsVMScaleSet == bool(False)`
  - **Only one clause should be active at a time**

## Requesting the Refund

Use IcM template: [C4462u](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=C4462u)

Also mapped to 'Pricing, Billing and Usage' support topic for ASC escalate button.
