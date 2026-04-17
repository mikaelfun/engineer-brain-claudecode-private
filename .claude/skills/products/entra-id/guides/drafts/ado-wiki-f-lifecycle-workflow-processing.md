---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra ID Lifecycle Workflows/Self-help/Processing"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Identity%20Governance/Entra%20ID%20Lifecycle%20Workflows/Self-help/Processing"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Lifecycle Workflows - Processing & Reporting

## Workflow History

LCW provides dedicated reporting APIs and a Workflow History blade in the portal. The history gives insights from three perspectives:

1. **Users** - Identify if a problem is limited to a specific group of users
2. **Tasks** - Identify if a problem is limited to a specific task
3. **Runs** - Identify if a problem is limited to a specific run (default: workflow runs every 3 hours)

### Detailed Execution View

From any perspective, you can drill down to the detailed execution of a task for a particular user, which includes:
- **Processing status** - Current state of the task
- **Failure reason** - Essential for error analysis

### Reporting APIs

- Graph API: [Lifecycle Workflows reporting overview](https://learn.microsoft.com/graph/api/resources/identitygovernance-lifecycleworkflows-reporting-overview?view=graph-rest-beta)
- Portal: [Check the status of a workflow](https://learn.microsoft.com/azure/active-directory/governance/check-status-workflow)

## Built-in Tasks and Limitations

Built-in tasks automate common lifecycle management scenarios but are subject to limitations that can lead to workflow execution errors in rare cases.

Reference: [Lifecycle Workflow built-in tasks](https://learn.microsoft.com/azure/active-directory/governance/lifecycle-workflow-tasks)
