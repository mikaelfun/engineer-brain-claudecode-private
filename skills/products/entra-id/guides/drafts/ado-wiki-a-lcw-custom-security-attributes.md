---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra ID Lifecycle Workflows/Lifecycle Workflows - Custom Security Attributes"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FEntra%20ID%20Lifecycle%20Workflows%2FLifecycle%20Workflows%20-%20Custom%20Security%20Attributes"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Lifecycle Workflows - Custom Security Attributes (CSA) Trigger Scope

## Overview

IT admins can leverage existing Custom Security Attributes as trigger scope in Lifecycle Workflows. CSAs like payGrade, clearanceLevel, or terminationReason can be used to determine which users a workflow applies to.

## Key Components

- CSA-based trigger scope for joiner, mover, leaver workflows
- Masking of CSA values from users without appropriate permissions
- Applies to: scope config, rule syntax editor, version details, audit logs, APIs

## Licensing

Microsoft Entra ID Governance licenses required.

## Configuration

### New Workflow
1. Sign in to Entra admin center (use https://aka.ms/LCWCSAScope during private preview)
2. Create workflow > select non-real-time template
3. Configure Trigger > Next: Configure scope
4. Select CSA from Property list
5. Complete tasks and create

### Existing Workflow
1. Select workflow > Execution conditions > Scope details
2. Select CSA from Property list

### API Example
```json
"executionConditions": {
  "@odata.type": "#microsoft.graph.identityGovernance.triggerAndScopeBasedConditions",
  "scope": {
    "@odata.type": "microsoft.graph.identityGovernance.ruleBasedSubjectSet",
    "rule": "(customSecurityAttributes/Set1/PayGrade eq 'P3')"
  }
}
```

## Troubleshooting

### RBAC Role Requirements
Admin needs **Attribute Assignment Reader** or **Attribute Assignment Administrator** role IN ADDITION to standard LCW roles. Global Admin and Privileged Role Admin do NOT have CSA permissions.

Without CSA role, admin:
- Cannot view/edit scope rules
- Cannot edit triggers
- Cannot see CSA in Property list
- CAN still delete workflow, disable workflow, edit tasks

### Deactivated CSA
- If CSA used in workflow scope is deactivated → workflow stops running
- Error shown: "This rule contains invalid properties"
- Fix: Re-activate the CSA or update workflow scope

### ASC Troubleshooting
Use Graph Explorer: `/identityGovernance/lifecycleWorkflows/workflows/[Workflow ID]`
Check `executionConditions.scope.rule` for CSA references.
