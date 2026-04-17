---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Pricing, Billing and Usage/MDC Servers plan resources exclusion"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/MDC%20Pricing%2C%20Billing%20and%20Usage/MDC%20Servers%20plan%20resources%20exclusion"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDC Servers Plan Resources Exclusion

MDC supports granular (resource-level) pricing for Defender for Servers, allowing exclusion of individual resources (VMs, VMSS, Azure Arc machines).

## Method 1: Resource-Level Configuration via REST API

### Disable Defender for Servers on a Resource (VM)

PUT request:
```
https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{machineName}/providers/Microsoft.Security/pricings/virtualMachines?api-version=2024-01-01
```

Body to disable:
```json
{
  "properties": {
    "pricingTier": "Free"
  }
}
```

### Remove Resource-Level Configuration

Send DELETE request to same endpoint - reverts to subscription-level setting.

**Notes:**
- Only P1 subplan supported for resource-level enablement
- If parent subscription enforces pricing, set subscription Enforce field to false first

## Method 2: Azure Policy Assignments (using Tags)

### Exclude Resources by Tag

1. Azure Portal > Policy > Definitions
2. Search: "Configure Microsoft Defender for Servers to be disabled for resources (resource level) with the selected tag"
3. Assign to scope, specify tag name/values
4. Create Remediation Task for existing + new resources

**Key Policy Definition IDs:**
| Definition | ID |
|---|---|
| Disable for all resources | `f6ff485a-7630-4730-854d-cd3ad855435e` |
| Disable for resources with selected tag | `080fedce-9d4a-4d07-abf0-9f036afbc9c8` |

## Method 3: PowerShell Scripts for Bulk Operations

Download from: [Defender for Servers on resource level PowerShell scripts](https://github.com/Azure/Microsoft-Defender-for-Cloud/tree/main/Powershell%20scripts/Defender%20for%20Servers%20on%20resource%20level)

## Troubleshooting

| Error | Solution |
|---|---|
| ScopeId not valid | Use valid Azure subscription or resource ID |
| Plan name not supported | Not all plans support granular pricing |
| Parent subscription enforces pricing | Set subscription Enforce field to false |
| Only P1 subplan supported | Resource-level pricing limited to P1 |
