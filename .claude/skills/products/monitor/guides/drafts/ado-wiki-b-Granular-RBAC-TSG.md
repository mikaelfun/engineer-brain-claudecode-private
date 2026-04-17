---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Granular RBAC"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FGranular%20RBAC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Granular RBAC (Preview) - Log Analytics Troubleshooting

## Public Docs
- [Granular RBAC Overview](https://learn.microsoft.com/azure/azure-monitor/logs/granular-rbac-log-analytics)
- [How to Configure](https://learn.microsoft.com/azure/azure-monitor/logs/granular-rbac-use-case)

Built on top of Azure ABAC mechanism.

## Key Considerations
- Effective permission = sum of RBAC + Granular RBAC role assignments (additive model)
- Must remove higher-privilege role assignments for Granular RBAC conditions to take effect
- Sentinel: replicated data (hunting, bookmarks, analytics, incidents) NOT protected by Granular RBAC conditions
- Granular RBAC only applies to calls to Log Analytics query API endpoint (api.loganalytics.io)

## Support Boundaries
- **Azure RBAC team owns**: UI controls/UX/blade, CRUD operations API for custom roles, role assignment issues
  - Collab path: Azure > Role Based Access Control (RBAC) for Azure Resources (IAM) > Problem with custom roles
- **Log Analytics team owns**: Attributes and conditions in the logic (when custom role created but doesn't work as expected)

## Troubleshooting

### Issue 1: Custom Role CRUD / UI / Assignment Issues
- Verify attributes and values are correct
- Collect HAR trace
- Engage Azure RBAC team

### Issue 2: Custom Role Created and Assigned but Not Working
1. Revisit attributes and values in custom role
2. Check for higher-privilege RBAC role taking precedence
3. Enable query auditing: https://learn.microsoft.com/azure/azure-monitor/logs/granular-rbac-log-analytics#audit-and-monitoring
4. Query `LAQueryLogs` table - check `ConditionalDataAccess` column (should show "Condition Applied")
5. From ASC, use draft telemetry:
```kql
dependencies
| where operation_ParentId == "<request-id>"
| where name == "Kusto"
| project condition = tostring(customDimensions.["LM.condition"])
```

### Issue 3: Error When Conditions Don't Match Column
- Error appears when condition references a column that doesn't exist in the queried table (e.g., condition on "Control Name" but querying Heartbeat table which lacks that column)

## PG Escalation
- SAP: Azure/Log Analytics/Query Execution and visualization/My Query does not return any results
- Follow Draft team escalation path
