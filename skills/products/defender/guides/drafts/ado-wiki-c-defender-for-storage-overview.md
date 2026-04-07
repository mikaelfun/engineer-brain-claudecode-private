---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Storage/Defender for Storage overview and training"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Storage%2FDefender%20for%20Storage%20overview%20and%20training"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Defender for Storage

## Summary

Microsoft Defender for Storage, formerly known as Azure Storage ATP, is designed to protect storage accounts from potential threats. It integrates with Microsoft Defender for Cloud, providing alerts about suspicious activities, detailing subscription, resource, user-agent, storage type, authentication method, possible causes, and offering investigation and remediation steps.

[Introduction to Azure Defender for Storage](https://docs.microsoft.com/en-us/azure/security-center/defender-for-storage-introduction)

## Pricing models

The pricing model transitioned from a transaction-based to an account-based model starting November 1, 2022.

## Integration with MDC

Like any other alerts in Microsoft Defender for Cloud (MDC), all the information about the detected suspicious activity appears in the alert.
Subscription, Resource, User-Agent, Storage Type, Authentication method, possible causes, investigation and remediation steps.
Security alerts are also sent via email to subscription administrators.

## Supported Storage services

* The following storage types are supported:
    * [Blob Storage](https://azure.microsoft.com/products/storage/blobs/) (Standard/Premium StorageV2, including Data Lake Gen2) Activity monitoring, Malware scanning, Sensitive data discovery.
    * Azure Files (over REST API and SMB): Activity monitoring.

More information: [Availability](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-storage-introduction#availability)

## Plan exclusion

**Important notes:**
- Customers using the legacy "Per transaction" pricing plan can exclude a specific Storage account.
- Customers on the "Per-storage-account plan" (new) cannot exclude Storage Accounts as by design it can be enabled per-resource level.

### Checking eligibility

Use Azure Resource Graph (ARG) query:
```
securityresources
| where type == "microsoft.security/pricings"
```
Look for the Storage Account option in Properties to determine if it is Free, Standard on per transaction or per storage account.

### Exclude a Storage Account from Per-transaction plan

1. Assign tag to the storage account:
   - Name: **AzDefenderPlanAutoEnable**
   - Value: **off**

2. Disable Azure Defender using one of:
    - Turn bundle OFF then ON at subscription level (caution: may trigger plan migration)
    - PowerShell: `Disable-AzSecurityAdvancedThreatProtection -ResourceId <resourceId>`
    - Manually disable from each storage account UI

## Enabling Diagnostic Logs to investigate Alerts

The most useful tool to investigate Defender for Storage alerts are the diagnostics logs. These are not enabled by default and must be turned on in the storage account.

Note: Azure Files does not yet support diagnostic logs.

[Configure diagnostic logs](https://learn.microsoft.com/en-us/azure/storage/common/manage-storage-analytics-logs?tabs=azure-portal#configure-monitoring-for-a-storage-account)

## Storage ATP (for old per-transaction plan only)

The old Defender for Storage uses hash reputation scan (not actual file scanning).

### Hash reputation scan limitations (old plan):

- Uses hash reputation analysis supported by Microsoft Threat Intelligence
- Does NOT scan uploaded files directly; analyzes storage telemetry and compares hashes
- **Unsupported scenarios for hash reputation:**
  - SMB file-sharing protocol
  - Blobs created using Put Block and Put Block List operations

### New plan advantages:
The new Defender for Storage plan provides proper on-upload malware scanning with full file scan capability.

## Related Articles
- [Microsoft Defender for Cloud pricing](https://azure.microsoft.com/pricing/details/azure-defender)
- [Azure Defender for Storage Configuration](https://docs.microsoft.com/en-us/azure/storage/common/azure-defender-storage-configure?tabs=azure-portal)
