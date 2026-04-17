---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Cross region disaster recovery"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Cross%20region%20disaster%20recovery"
importDate: "2026-04-05"
type: troubleshooting-guide
---

### Introduction

Windows 365 cross region disaster recovery is an optional service for Windows 365 Enterprise that protects Cloud PCs and data against regional outages. When properly licensed and activated, it creates geographically distant temporary copies of Cloud PCs that can be accessed in the selected backup region.

Admins must manually activate and deactivate cross region disaster recovery.

The ability to restore in an alternate region depends on available capacity in that region at the time of the outage.

### Kusto Query

```kql
cluster('cloudpc.eastus2.kusto.windows.net').database('CloudPC').CloudPCEvent
| union cluster('cloudpcneu.northeurope.kusto.windows.net').database('CloudPCProd').CloudPCEvent
| where ApplicationName == "snpt"
| where AccountId == "<tenant-id>"
| project env_time, ActivityId, ComponentName, RelatedActivityId, ColMetadata, Col1
| order by env_time asc
```

### DR Activation with ANC Switching Scenario

**Scenario**: Customer activates DR for 6 machines using ANC 1 (which only has IPs for 4), then wants to switch to ANC 2.

**Key Behavior**:
- Windows 365 evaluates the DR network (ANC) at activation time, per device
- Devices that already reached DR = Activated are NOT reprovisioned or rebalanced during subsequent activations
- A second activation only targets devices that are not yet activated (failed or pending)
- Result: 4 machines remain on ANC1, 2 machines newly provisioned on ANC2

### Recommended Approach: Move All Devices to New ANC

**Deactivate DR for all devices → Update backup region/ANC in user settings → Reactivate DR**

- DR deactivation deletes all temporary DR Cloud PCs (expected behavior)
- New activation provisions all machines fresh using the updated ANC
- All machines consistently land on the same ANC

**Important**: Before re-activating, ensure the customer has updated the backup region/ANC in user settings so the new activation uses the updated settings. Ensure ANC has enough available IPs.
