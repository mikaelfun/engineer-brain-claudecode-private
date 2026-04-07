---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra ID Lifecycle Workflows/Lifecycle Workflows - Administration Unit Scoping"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FIdentity%20Governance%2FEntra%20ID%20Lifecycle%20Workflows%2FLifecycle%20Workflows%20-%20Administration%20Unit%20Scoping"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Lifecycle Workflows - Administration Unit Scoping

> This is an unreleased product. Documentation still in development.

## Overview

Delegated Workflow Management using Administrative Units (AUs) enables organizations to assign workflows to specific AUs and delegate management to scoped admins. Scoped Workflow Admins can only view/manage workflows within their assigned AUs.

## Capabilities

| Capability | LCW Administrator | Workflow Administrator |
|---|---|---|
| Create Workflow | Yes | No |
| Edit Workflow | Yes | Yes (only assigned) |
| Custom Task Extensions | Yes | No |
| Delete Workflow | Yes | Yes (only assigned) |
| Restore Workflow | Yes | Yes (only assigned) |
| View workflow history | Yes | Yes (only assigned) |
| Run on-demand | Yes | Yes (only assigned) |
| Scope Workflows | Yes | No |

## Prerequisites

1. Lifecycle Workflows Administrator or Global Administrator role
2. Microsoft Entra ID Governance or Entra Suite license
3. At least one existing Administrative Unit

## Configuration

1. Sign in to Entra admin center
2. Create workflow > Basics tab > Administration Scope picker
3. Select one or more AUs (searchable)
4. Complete workflow config and save

## Updating Existing Workflows

1. Navigate to workflow Properties or Administration Scopes Assigned column
2. Use context pane to add/remove AUs
3. Save/Discard to confirm

## Limitations

- Cannot create/edit/delete AUs from this feature
- No per-AU workflow scheduling customization
- RMAU (Restricted Managed Admin Units) not supported in preview
- If all scoped AUs deleted, workflow applies to entire tenant

## Troubleshooting

Use standard LCW troubleshooting tools and TSGs. In ASC, use Graph Explorer:
- All workflows: `/identityGovernance/lifecycleWorkflows/workflows`
- Specific workflow: `/identityGovernance/lifecycleWorkflows/workflows/[Workflow ID]`
- Check `administrationScopeTargets` attribute for AU assignments
