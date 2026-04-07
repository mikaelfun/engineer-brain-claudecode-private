# MBAM to Microsoft Endpoint Manager (MEM) BitLocker Migration

> Source: OneNote (Mooncake POD Support Notebook / Intune / Windows TSG)
> Status: draft

## Overview

Guide for migrating BitLocker management from Microsoft BitLocker Administration and Monitoring (MBAM) servers to Microsoft Endpoint Manager (Intune). MBAM extended support ends 4/14/2026.

## Migration Steps

### Step 1: Export Recovery Keys from MBAM SQL Server
- Open SQL Management Studio
- Expand `MBAM_Recovery_and_Hardware` database
- Query `RecoveryAndHardwareCore.Keys` table
- Export RecoveryKeyID and RecoveryKey columns
- Modify `SELECT TOP nnnnn` for large datasets

### Step 2: Configure MEM BitLocker Policy
1. Create two device groups: "BitLocker GPO devices" and "BitLocker MEM devices"
2. In Endpoint Manager admin center > Endpoint Security > Disk Encryption > Create Policy
3. Configure settings:
   - BitLocker Base Settings (full disk encryption, storage card encryption)
   - Fixed Drive Settings
   - OS Drive Settings (client-driven recovery password rotation)
   - Removable Drive Settings
4. Assign policy to "BitLocker MEM devices" group
5. Migrate devices batch by batch between groups

### Step 3: Export Recovery Keys from Azure AD via Graph API

**Prerequisites:**
- Register App in Azure AD with BitLocker read permissions
- Delegate permission for signed-in user
- User needs: Global Admin, Cloud Device Admin, Helpdesk Admin, Intune Service Admin, Security Admin/Reader, or Global Reader

**Graph API call:**
```
GET https://graph.microsoft.com/beta/bitlocker/recoverykeys
Headers:
  Ocp-client-name: {app-name}
  Ocp-client-version: 1
```

- JSON result limited to 999 items per page
- For 1000+ items: use PowerShell script from MSEndpointMgr GitHub

### Step 4: Force Current Devices to Escrow Keys to AAD
- Deploy PowerShell script `Invoke-EscrowBitlockerToAAD` via Intune
- Reference: MSEndpointMgr - "How to migrate Bitlocker to Azure AD"

### Step 5: Compare and Reconcile
- Compare MBAM SQL export with Azure AD Graph API export
- Manually escrow any missing recovery keys
- Verify counts match before cutoff

### Step 6: Decommission MBAM
- Shutdown MBAM servers after verification

## End User Recovery Key Access

| Method | Portal | Steps |
|--------|--------|-------|
| Azure Portal | portal.azure.com | Users > {user} > Devices > {device} > BitLocker Keys |
| Endpoint Manager | endpoint.microsoft.com | Devices > {device} > Monitor > Recovery Keys |
| Company Portal (macOS) | portal.manage.microsoft.com | Devices > {macOS device} > Get recovery key |

## Key Considerations

- BitLocker recovery key rotation requires Windows 10 1909+
- AADJ and HAADJ devices supported for key rotation
- Key rotation replaces ALL existing recovery passwords with a single new one
- Client-driven rotation only replaces the used recovery password
- Windows 11 22H2+ automatically removes old keys from AAD after rotation
- Windows 10: old keys remain visible in AAD
