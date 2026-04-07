---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra ID Lifecycle Workflows/Self-help/Scheduling"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Identity%20Governance/Entra%20ID%20Lifecycle%20Workflows/Self-help/Scheduling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Lifecycle Workflows - Scheduling

## Execution Types

LCW supports two execution types:

### On-demand Execution (Manual)

- Test workflows before scheduling
- Time-critical executions that cannot wait for next automatic run
- Can run for any user regardless of execution conditions
- **Note**: Workflow schedule does not need to be enabled, but the workflow itself must be enabled

### Scheduled Execution (Automatic)

- Default interval: every 3 hours
- Configurable: 1 hour to 24 hours
- Users must meet both trigger and scope to be included

## Execution Conditions

### Trigger

- Time-based attribute: `employeeHireDate` or `employeeLeaveDateTime`
- Offset: -60 to +60 days from the attribute date
- Example: employeeHireDate with offsetInDays=-1 triggers one day before hire date

### Scope

- Narrows down users for workflow execution
- Supports [rich set of user properties](https://learn.microsoft.com/graph/api/resources/identitygovernance-rulebasedsubjectset?view=graph-rest-beta#supported-user-properties-and-query-parameters)

## Important Scheduling Notes

1. **Post-processing window**: Users meeting conditions after trigger date are post-processed up to 3 days later
2. **Schedule must be enabled** for periodic workflow execution
3. **employeeHireDate**: Set time at beginning of day (e.g., 5am) to allow workflow execution before user starts
4. **employeeLeaveDateTime**: Set time at end of day (e.g., 11pm) to ensure access is not revoked before last day
5. **Time zone**: Account for user time zones when setting time-based attributes

## Synchronizing Time-based Attributes

Methods to update employeeHireDate and employeeLeaveDateTime:
- Azure AD Connect Sync
- Azure AD Connect Cloud Sync
- HR-driven provisioning

**Note**: Additional permissions required for employeeLeaveDateTime. For delegated scenarios, the admin must also have the Global Administrator role.

Reference: [Synchronize attributes](https://learn.microsoft.com/azure/active-directory/governance/how-to-lifecycle-workflow-sync-attributes)
