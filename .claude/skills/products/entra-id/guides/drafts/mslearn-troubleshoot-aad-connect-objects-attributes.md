---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/troubleshoot-aad-connect-objects-attributes
importDate: "2026-04-24"
type: guide-draft
---

# End-to-End Troubleshooting of Entra Connect Objects and Attributes

Comprehensive guide for troubleshooting when objects/attributes fail to sync and no errors are shown.

## Key Principle
Do NOT disable DirSync (onPremisesSyncEnabled=False) for troubleshooting - this triggers a lengthy backend operation (up to 72 hours). Instead, use Set-ADSyncScheduler -SyncCycleEnabled False to pause sync.

## Troubleshooting Flow

### Step 1: AD to ADCS (Import)
- Check which domain controller AADC contacts (Connection Status in Sync Service Manager)
- Verify AD Connector Account (ADCA/MSOL_ account) permissions
- Use ADConnectivityTool for connectivity diagnosis
- Check AD replication with RepAdmin tool
- Use Effective Access in AD Users and Computers to verify ADCA permissions

### Step 2: ADCS to Metaverse (Sync Rules)
- Check sync rules in Sync Rules Editor
- Verify attribute flow mappings
- Check scoping filters and join rules

### Step 3: Metaverse to AADCS (Export)
- Verify outbound sync rules
- Check attribute transformations

### Step 4: AADCS to Azure AD (Export)
- Check export errors in Sync Service Manager
- Verify AADCA permissions

## Common Issues
- Blocked inheritance on OU preventing ADCA from reading objects
- Explicit Deny ACLs on objects
- Stale domain controller data (replication lag)
- Custom ADCA without sufficient permissions
