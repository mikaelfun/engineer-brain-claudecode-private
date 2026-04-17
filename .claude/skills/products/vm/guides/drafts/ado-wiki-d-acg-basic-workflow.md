---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Compute Gallery (ACG)/Workflows/Basic Workflow_ACG"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Compute%20Gallery%20(ACG)%2FWorkflows%2FBasic%20Workflow_ACG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Compute Gallery (ACG) Basic Troubleshooting Workflow

## Summary

Basic starting point for troubleshooting Azure Compute Gallery (ACG) issues. Use this to confirm the issue area, collect required details, perform ASC checks, and pivot to the correct deeper TSG.

**Resource Hierarchy**: Gallery > Image Definition > Image Version

## Scope Confirmation

First confirm the issue area:
- **ACG** — gallery, image definitions, image versions, sharing, deployment from ACG
- **AIB** — image build templates, customization steps, AIB pipeline → use AIB Basic Workflow
- **VM Applications** — VM App publishing, replication → use VM Applications guidance

## Required Information Collection

1. Clear issue description
2. Subscription ID
3. Resource group name
4. Gallery name
5. Image definition name (if applicable)
6. Image version name (if applicable)
7. Exact error message
8. Date and time frame of when the issue started
9. When was the last time this worked?
10. Has it ever worked properly?
11. Business impact
12. Approval to collect logs/diagnostics

### Helpful Information
- Source type: VM / managed image / snapshot / VHD / another image version
- Generalized or specialized image
- Target region(s)
- Same subscription / cross-subscription / cross-tenant
- Deploying VM or VMSS

## Troubleshooting Flow

```
Start
  └─ Is the issue with ACG, AIB, or VM Applications?
      ├─ AIB → AIB Basic Workflow
      ├─ VM Applications → VM Applications guidance
      └─ ACG → Collect minimum required details
           └─ Perform ASC basic checks
                └─ What is failing?
                    ├─ Gallery → Run basic gallery checks
                    ├─ Image Definition → Run basic definition checks
                    ├─ Image Version / Replication → Run basic version checks
                    ├─ VM / VMSS deployment → Run basic deployment checks
                    ├─ Sharing / Access → Run basic sharing checks
                    └─ Quota / Limits → Check current usage and limits
                         └─ Resolved?
                             ├─ Yes → Document findings and mitigation
                             └─ No → Pivot to deeper ACG TSG
```

## Troubleshooting Steps

### Step 1: Confirm the Issue Area
Confirm whether the issue is ACG, AIB, VM Applications, or something outside ACG entirely. Route to correct workflow early if not ACG.

### Step 2: Recheck the Exact Failure
Ask customer to rerun the failing command with debug enabled:
- Azure CLI: `--debug`
- PowerShell: `-Debug`

### Step 3: Perform ASC Basic Checks
- Review recent operations at the affected resource level (Gallery, Image Definition, or Image Version)
- Verify operations match customer-reported timestamp
- Review Insights / Solution Explorer in ASC
- Verify correct Support Area Path (SAP)

## Important Notes
- Customer sharing of credentials, storage keys, or publish settings files is **not allowed**
- Do not request this information
- If provided accidentally, follow internal security/privacy process
