---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra ID Lifecycle Workflows/Self-help/Logic Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Identity%20Governance/Entra%20ID%20Lifecycle%20Workflows/Self-help/Logic%20Apps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Lifecycle Workflows - Logic Apps Integration

## Custom Task Extensions with Logic Apps

Lifecycle Workflows allow creating custom task extensions to call out to Azure Logic Apps when built-in tasks are insufficient.

### Prerequisites for Creating Custom Task Extension

- Azure Subscription required
- One of these role assignments:
  - Logic App contributor
  - Contributor
  - Owner

### Creating a Custom Task Extension

LCW provides an experience that creates a compatible Logic App and the corresponding custom task extension automatically.

Reference: [Create a custom task extension](https://learn.microsoft.com/azure/active-directory/governance/trigger-custom-task)

### Using a Previously Created Logic App

An existing Logic App must be made compatible before use with LCW. A compatible Logic App requires:

1. **Trigger configuration** - Proper trigger setup
2. **Enabled system assigned managed identity**
3. **Authorization policies** - Correct auth policies
4. **Callback action** - Only applicable to the callback scenario

Reference: [Configure a Logic App for Lifecycle Workflow use](https://learn.microsoft.com/azure/active-directory/governance/configure-logic-app-lifecycle-workflows)

### Deployment Scenarios

Reference: [Lifecycle workflow extensibility](https://learn.microsoft.com/azure/active-directory/governance/lifecycle-workflow-extensibility)
