---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Collaboration Guides/Escalating to the Azure Log Analytics product group/Escalating issues to the Log Analytics Ingestion team"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FCollaboration%20Guides%2FEscalating%20to%20the%20Azure%20Log%20Analytics%20product%20group%2FEscalating%20issues%20to%20the%20Log%20Analytics%20Ingestion%20team"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Escalating Issues to the Log Analytics Ingestion Team

## Important Notes
- **For Azure resource logs issues, always follow the Resource Log troubleshooting guide first.**
- Ingestion log rotation is up to 15 days. Report issues ASAP near the occurrence timeframe.
- The two main Ingestion team components are **ODS** and **InMeM**.

## Recommended Data to Collect
Attach the output of this query when engaging the Ingestion team:
```kql
<Table_Name>
| project _ItemId, TimeGenerated, _TimeReceived, ingestion_time(), TenantId, Type, _ResourceId
```

## Azure Resource Logs (Diagnostic Logs and Metrics) - Data Missing or Incomplete

### Troubleshooting Checklist
- [ ] Confirm data reached InMeM (How-to: Check if Diagnostics data arrived in InMem)
  - If data not in InMeM, check ODS to identify if quota is full
- [ ] If custom field limit reached in AzureDiagnostics table (AzureDiagnostics collection mode):
  - Validate custom fields limit (How-to: Validate if custom fields limit is being reached)
  - If reached, consider increasing the limit (How-to: Increase custom fields limit on a table)
- [ ] Check for ingestion errors (HT: How to check for ingestion errors)
  - If errors found, engage the Ingestion team
- [ ] Check for Invalid Data Format in AzureDiagnostics ingestion
  - If invalid data found, involve the Resource Provider team

## Escalation Path
- If cannot follow steps above: reach out to TA for help
- If TA cannot help: reach out to swarming channel or Log Analytics SMEs (loganalyticssmes@microsoft.com)
