---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Manual attestation policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FManual%20attestation%20policies"
importDate: "2026-04-05"
type: troubleshooting-guide
---

> **Public Preview**

## Introduction

To fully cover Regulatory Compliance requirements, customers need the ability to report compliance results on procedural or documentation requirements such as *"security awareness training"*, *"contingency plan and testing"*, and *"water and fire protection on physical environments"*. For example, 14 out of 17 domains in NIST 800 have elements that require manual attestation.

## Functionality

Manual policies are represented by the `manual` policy effect (see [[LEARN] Understand Azure Policy Effects - Manual - Preview](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effects#manual-preview)). The `if` section of the policy is evaluated normally; if it is **true**, the resource is determined applicable for manual attestation.

## Compliance

Users use the **`Microsoft.PolicyInsights/attestations`** extension resource to set the compliance state of a scope (resource / resource group / subscription) for a specific policy assignment.

- If no attestation is provided, the compliance state defaults to **Unknown** or **NonCompliant** (based on the definition configuration)
- When the attestation is created or changed, a compliance record is updated **immediately**, and metadata about who changed the state and when is stored
- Users can provide a link to additional evidence if needed

See [[LEARN] Azure Policy attestation structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/attestation-structure) for additional information.

## UI access requirements (Preview limitation)

| User type | Can access attestation UI? |
|-----------|---------------------------|
| Microsoft Defender for Cloud (MDC) **Premium** tier | ✅ Yes — UI available in MDC |
| MDC **non-premium** users | ❌ No UI — must use REST API |

The attestation UI is currently **only available to premium tier MDC users**. Non-premium MDC users can still use manual effect policies, but they must create the attestation resource through the **Azure REST API**.

## Creating attestations via REST API (for non-premium MDC users)

REST API reference: [Attestations REST API](https://learn.microsoft.com/en-us/rest/api/policy/attestations)

**PowerShell:**
```powershell
Invoke-AzRestMethod ...
```
Reference: [[PS] Invoke-AzRestMethod](https://learn.microsoft.com/en-us/powershell/module/az.accounts/invoke-azrestmethod?view=azps-9.0.0)

**CLI:**
```bash
az rest ...
```
Reference: [[CLI] az rest](https://learn.microsoft.com/en-us/cli/azure/reference-index?view=azure-cli-latest#az-rest)
