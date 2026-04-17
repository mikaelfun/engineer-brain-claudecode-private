---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Security Policy/[TSG] Security Azure Policy - TIPS"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FSecurity%20Policy%2F%5BTSG%5D%20Security%20Azure%20Policy%20-%20TIPS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Security Azure Policy - TIPS

## TIP-1: Force Policy Evaluation

We can force Azure Policy reevaluations so we don't have to wait a 24-hour cycle.

**Steps:**
1. Navigate to Azure > Policy > Compliance > ASC Default policy
2. Check **Last Evaluated** on any policies with resources
3. Use Azure RM PowerShell to force a new policy scan:

```powershell
# Force on-demand policy compliance scan
$job = Start-AzPolicyComplianceScan -AsJob
$job  # Check status
```

Or use REST API:
- Reference: https://docs.microsoft.com/en-us/azure/governance/policy/how-to/getting-compliance-data

> **Note:** Always code review (read line by line) before pasting into execution. Subscription ID is required in the URL.

This is useful for speeding up repros on customer issues with Azure Policy.

## TIP-2: Steps to run PCE (Azure Policy Compliance Evaluator)

PCE is a tool to speed up policy testing - evaluates policies on demand instead of waiting 24h.

**Steps:**
1. Download the PCE ZIP file from https://github.com/prchanda/pce/releases
2. Extract the ZIP file and locate the PCE application
3. Open CMD, navigate to the folder and run:

```bash
# Subscription scope evaluation
pce.exe -s "91897ffb-xxxx-xxxx-xxxx-4bb03c62ca8b"

# Resource Group scope evaluation
pce.exe -s "91897ffb-xxxx-xxxx-xxxx-4bb03c62ca8b" -rg "<RG Name>"
```

This triggers the evaluation cycle immediately, and you can check compliant/non-compliant resources from the portal.

Reference: https://techcommunity.microsoft.com/t5/azure-paas-blog/steps-to-run-pce-azure-policy-compliance-evaluator/ba-p/828508
