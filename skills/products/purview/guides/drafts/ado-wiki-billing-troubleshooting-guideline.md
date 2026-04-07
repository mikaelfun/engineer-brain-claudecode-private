---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Billing/Billing Troubleshooting Guideline"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FBilling%2FBilling%20Troubleshooting%20Guideline"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Billing Troubleshooting Guideline (Classic Purview)

## Note
Classic Billing Model applies only to users still using Classic Microsoft Purview who have not consented to the New Billing Model. For New Billing Model, refer to: https://learn.microsoft.com/en-us/purview/data-governance-billing

## Classic Billing Overview

Purview billing components:
- **Storage** - ~$300 for every 10 GB metadata storage
- **Scanning** - Longer scan duration = more charges
- **Asset Search and Update** - REST API calls, SDKs, lineage extraction
- **Resource Sets** - Enabling "Advanced Resource Sets" incurs more costs

4 Kusto components: Scanning Service, Insights Service, Ingestion Service, Data Map

## Information Needed for Escalation
- CU and Storage Size Monitoring UI from Purview in Azure Portal
- Cost Analysis from Cost Management Center Portal
- Resource ID
- Specific meter ID causing the issue

## Billing Service Query

```kusto
BillingLogEvent
| where ResourceId == "<customer_ResourceId>"
| summarize sum(Quantity) by Component
| order by Component
```

## Breakdown by Day

```kusto
let accountName = "<account_name>";
let billingMonth = datetime(2025-01-01);
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').BillingLogEvent
| where tolower(ResourceId) endswith tolower(accountName)
| where todatetime(EventDateTime) > billingMonth and todatetime(EventDateTime) < datetime_add('month', 5, billingMonth)
| summarize sum(Quantity), count() by MeterId, bin(['time'], 1d)
```

## Action Plan: High Data Map Quantity (CU)
- Check metadata storage size in Azure Portal (Purview account > Overview)
- 1 CU = 10GB metadata, ~$300/month per CU
- If metadata is root cause -> advise customer to reduce by deleting assets

## Action Plan: High Ingestion Service Quantity
Ingestion affected by:
- **Scanning** - More assets discovered = more ingestion
- **Lineage** - Source can be scan or ADF/Synapse

### Troubleshooting ADF/Synapse Ingestion

```kusto
BillingLogEvent
| where MeterId == "811e3118-5380-5ee8-a5d9-01d48d0a0627"
| where SubscriptionId == "<sub_id>"
| where AccountId == "<account_id>"
| extend Source = tostring(parse_json(AdditionalProperties).Source), Month = monthofyear(['time'])
| summarize sum(todouble(Quantity)) by Month, Source, Component
```

### Troubleshooting Lineage Charges
1. Check Monitor Links in Purview portal for asset/relationship ingestion counts
2. If high ingestion found, check ADF/Synapse connection to Purview
3. Customer can stop lineage by disconnecting the connection

## Q&A
- **Pricing vs Billing**: Pricing questions -> PM/BP team. Billing charge questions -> Engineering team.
- **Identifying ADF jobs causing charges**: Only Copy Activity and Data Flow Activity push lineage. Check ADF Monitor > Pipeline Run, or use Monitor Links in Purview.
- **Synapse connection check**: Synapse > Manage > Microsoft Purview
