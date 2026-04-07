---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/SAP/SAP agentless/Agentless Migration"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Data%20Ingestion%20-%20Connectors/Third%20Party%20Connectors/SAP/SAP%20agentless/Agentless%20Migration"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# SAP Agent to Agentless Migration - CSS Support Guide

---

## Overview

The agent-based SAP connector reaches end of support **September 16, 2026** (Log Analytics V1 end of life). Migration typically takes 2-4 hours with no cost impact (same per-SID pricing).

**Official Migration Guide**: [Microsoft Learn - Migrate SAP Agent to Agentless](https://learn.microsoft.com/en-us/azure/sentinel/sap/sap-agent-migrate)

---

## Migration Process (High-Level)

**Step 1: Pre-requisites**
Customer needs SAP Cloud Connector, SAP Integration Suite (BTP), and appropriate roles configured. Run the Pre-requisite Checker tool before deploying.

**Step 2: Deploy Agentless**
Follow the [official migration guide](https://learn.microsoft.com/en-us/azure/sentinel/sap/sap-agent-migrate). Install from Content Hub, import Integration Suite package, configure DCE/DCR, and deploy the Data Collector Integration Flow.

**Step 3: Validate**
Check SAP Integration Suite (Monitor > Integrations > Monitor Message Processing) for successful runs. In Sentinel, run KQL queries to verify data ingestion:

```kusto
SAPAuditLog | where TimeGenerated > ago(1h) | take 10
```

**Step 4: Parallel Run & Decommission**
For production: run both connectors in parallel for 24-48 hours. After validation, stop the agent and clean up infrastructure. Agent remains supported until Sept 16, 2026 if rollback needed.

---

## Common Issues

**Pre-requisite checker fails**: Check RFC permissions, missing function modules (RFC_READ_TABLE on older systems), or network connectivity. See Known Issues in main TSG.

**No data in Sentinel**: Verify DCE/DCR config, check managed identity has `Monitoring Metrics Publisher` role on DCR and `Log Analytics Contributor` on workspace.

**Lower data volume**: Compare configuration parameters between agent and agentless. Check `excluded-audit-users`, `max-rows`, and collection flags match the original agent config.

**SAP performance issues**: Adjust `offset-in-seconds` (delay collection), reduce `max-rows`, or increase `ingestion-cycle-days`. Work with SAP BASIS team.

---

## Customer Quick Answers

**Migration time?** 2-4 hours deployment + validation. Add 24-48 hours parallel running for production.

**Issues after migration?** Full CSS support provided. Can run both in parallel. Agent supported until Sept 16, 2026 for rollback.

**Custom detections?** Most work unchanged. Test during parallel run. Minor KQL adjustments may be needed for agent-specific fields.

**SIEM integrations?** No changes needed. Same workspace and tables.

---

## When to Escalate

Escalate to PG (Connectors Acceleration / Triage) when: pre-requisite checker consistently fails, complex multi-SID issues persist, data parity problems continue after config adjustments, or errors not documented in TSG.

**IcM Include**: Agent config details, pre-req checker results, SAP Integration Suite logs (trace enabled), screenshots, data volume comparison.

---

## Resources

- **[Migration Guide](https://learn.microsoft.com/en-us/azure/sentinel/sap/sap-agent-migrate)** - Start here
- [Agentless Troubleshooting TSG](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/10639/-TSG-SAP-Agentless)
- [Deprecation Notice](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/13511/Agent-Deprecation)
- [E2E Tutorial (YouTube)](https://www.youtube.com/watch?v=PbO1S1E29Yk)

---

**Contributor**: Will King | **Date**: 03/02/2026
