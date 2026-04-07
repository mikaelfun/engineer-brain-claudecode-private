# Cross-Tenant Sync: Enable Automatic Redemption

> Source: OneNote - Case 2505150040001159
> Status: draft

## Scenario

Enable automatic redemption in cross-tenant access settings so that B2B guest users invited from target tenant automatically accept the invitation without manual consent.

## Steps

### 1. Source Tenant: Configure Outbound Trust Settings

1. Login to Azure Portal (source tenant)
2. Navigate to: Cross-Tenant Synchronization
3. Select the Mooncake target tenant (if not found, invite a guest user first)
4. Click "Edit Provisioning"
5. Configure **Outbound trust settings** - enable automatic redemption

### 2. Target Tenant: Configure Inbound Access

1. Login to Azure Portal (target tenant)
2. Navigate to: Inbound access settings
3. Under Cross-Tenant Sync: enable **"Allow users sync into this tenant"**

### 3. Provision Cross-Tenant Sync

1. Set up provisioning configuration in source tenant
2. Add users/groups to provisioning scope

### 4. Verify

1. From target tenant, invite a source tenant user
2. User status should automatically show as **"Accepted"** (no manual redemption needed)

## Notes

- Both source and target tenants must configure their respective settings
- Source = outbound trust, Target = inbound access + allow sync
- Works for Mooncake (21V) cross-cloud scenarios
