---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Device Management/EntraId Soft Delete Devices"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FDevice%20Management%2FEntraId%20Soft%20Delete%20Devices"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entra ID Soft Delete Devices

## Overview

**Soft Delete Overview:** Soft deleting an Entra ID device is a recycle bin approach to device removal. When soft delete is triggered (e.g. an admin or owner deletes a device), the **device object is not permanently wiped**. Instead, Azure Device Registration Service (ADRS) initiates de-registration, then moves the device object into a **separate soft-deleted container** in the directory. This preserves critical data (like BitLocker recovery keys and LAPS passwords) that **must not be lost** during deletion. The device is removed from active device lists but remains recoverable until permanently deleted.

Only specific roles can initiate or finalize deletions (detailed below), and soft delete currently applies to **EntraId joined and registered devices** in preview; hybrid-joined devices will be supported soon. A soft-deleted device retains its unique identifier and key material in the background, allowing an **undelete (restore)** later if needed.

**Why Soft Delete?** Introduced to address stale device buildup and accidental deletions. Reduces risk of hitting tenant object quotas and provides an **undo option for device deletions** (similar to user undelete). Tombstone period: 30 days (may be shortened to 15 days).

**Key Behaviors:**
- Soft-deleted device **cannot authenticate or be modified**
- Compliance status and certain properties are reset on deletion
- Soft-deleted devices are hidden from Azure portal device list and Graph queries (return 404 Not Found)

---

## Limitations (Preview)

**Supported Scenarios:**
- ✅ Entra ID Joined (AADJ) devices
- ✅ Entra ID Registered (Workplace Join) devices
- ❌ Hybrid Entra ID Joined (HAADJ) — not yet supported, results in hard delete
- ❌ Devices with no recognized TrustType (created via Graph API directly) → hard-deleted immediately

**Role Requirements:**
- **Global Admins, Cloud Device Admins, Intune Admins** → can soft-delete, restore, or hard-delete any device
- **Device Owners** → can trigger soft delete on their own device only; cannot restore
- Custom RBAC roles → NOT supported for soft delete/restore

**Feature Availability:**
- Private Preview: ~50 selected prod tenants via allow-list; all tenants in PPE
- No public self-service toggle during preview
- Entra ID engineering must enable per tenant (opt-in via support/PM request)

**Excluded Device Types:**
- Hybrid-joined devices (HAADJ) — coming in later phase
- Intune synthetic/service devices
- Certain IoT/specialty types (SecureVM, non-persistent VDI, printers)

**AAD Connect + Quota Notes:**
- Soft-deleted devices still count toward directory quota (tombstone = 1/4 object weight)
- No public toggle in AAD Connect to control soft delete behavior during preview

---

## Common Scenarios

### 1. Admin/User Deletes a Cloud Device
- ADRS triggers de-register (disables auth tokens), moves object to soft-deleted container
- BitLocker and LAPS data preserved with the object
- Device cannot check in or re-register unless restored

### 2. Hybrid AD Join Sync Delete (Interim)
- Until hybrid support is fully live: sync-driven deletions are still immediate (hard delete)
- However: if AAD Connect tries to recreate a soft-deleted device (same deviceID), system now **auto-restores** instead of creating a duplicate

### 3. Device Reuse / Proactive Recreate
- Soft-deleted device DeviceID blocks new registration with same ID
- Admin must restore or permanently delete the old device before re-registration
- Error: "duplicate DeviceID" until soft-deleted object is resolved

### 4. Preview Rollout
- Workplace Joined (WPJ) + Cloud Domain Joined → in preview
- Hybrid support → next phase
- Opt-in required via product team

### 5. Autopilot and Edge Cases
- Autopilot-initiated deletions may not use soft delete (different service manages deletion)
- NonPersistent VDI devices excluded by design

---

## Portal UX and Restore Methods

**Current Portal Experience (Preview):**
- **No visible undelete UI** during private preview
- Soft-deleted devices simply disappear from Devices list
- Deleted Devices blade is built but hidden until GA

**Restore via PowerShell:**
```powershell
# Microsoft Graph PowerShell (beta)
# List deleted device objects:
GET https://graph.microsoft.com/beta/directory/deletedItems/microsoft.graph.device

# Restore a specific device:
Invoke-MgRestoreDirectoryDeletedItem -DirectoryObjectId <device-object-id>
```

**Restore via Graph API:**
```
POST https://graph.microsoft.com/beta/directory/deletedItems/<device-id>/restore
```

**Hard Delete (Permanent):**
- Delete a device twice: first delete → soft delete; second delete → permanent removal
- Or: delete the object from the `deletedItems` container
- Only Global Admin / Intune Admin / Cloud Device Admin can perform

---

## Known Issues and Quirks

### Device Appears as Gone (404 Errors)
- **Symptom:** Graph query or Intune returns HTTP 404 for the device
- **Cause:** Object is in soft-delete container, not active directory
- **Resolution:** Check via `GET /beta/directory/deletedItems/microsoft.graph.device`; if present, restore; if absent, was hard-deleted

### Compliance Status Stuck / Reset
- **Symptom:** After restore, device shows as non-compliant
- **Cause:** On soft-delete, ~5 device properties (including IsCompliant, IsManaged) are set to null/false (compliance reset)
- **Resolution:** Sync Intune compliance policy or wait for device to check in; MDM App ID is retained so Intune will resume management

### Device ID Uniqueness (Duplicate DeviceID Error)
- **Symptom:** New device registration or re-registration fails with duplicate DeviceID error
- **Cause:** Soft-deleted device with same DeviceID blocks new registration
- **Resolution:** Restore or hard-delete the soft-deleted object; check via deletedItems API

### AAD Connect Sync Conflict
- **Symptom:** Sync errors when AAD Connect tries to recreate soft-deleted device
- **Cause:** AWS (Admin Web Service) failed to detect the soft-deleted object; tried to create a duplicate
- **Resolution:** Verify soft delete restore logic is active for the tenant (preview); escalate to engineering if auto-restore not triggering

### Restored Device Properties Lag
- **Symptom:** After restore, `ApproximateLastLogonTimestamp` or compliance may not update immediately
- **Cause:** Properties reset at deletion remain null/false until MDM syncs or device checks in
- **Resolution:** Normal behavior; wait for device to report in or trigger manual Intune sync

### No Soft Delete for Certain Delete Paths
- Older Entra ID Graph API (not Microsoft Graph) may hard-delete the device
- Unsupported device types bypass soft delete → hard delete
- Always confirm how deletion was initiated (portal, Graph API, Intune) when investigating missing devices

---

## Key Properties Reference Table

| Aspect | Soft Delete State | On Restore | Who Can Act |
|--------|------------------|------------|-------------|
| Device object location | Soft-deleted container (hidden) | Back to active directory | — |
| BitLocker & LAPS keys | **Preserved** | Still available | Global/Device admins |
| Authentication | Disabled | Restored (may require re-sign-in) | (automatic) |
| CRUD operations | **Blocked** (read-only) | Allowed again | — |
| IsCompliant | Set to **False** (compliance reset) | False until MDM reports compliance | Intune/MDM |
| MDM App ID | **Retained** | Still associated | Intune |
| DeviceId (GUID) | Retained; blocks new registration | Same GUID continues | (enforced) |
| Trust Type (unsupported) | Hard-deleted immediately | No restore possible | — |
| Restore method | n/a (in soft-delete) | PowerShell / Graph API / Portal (GA) | Global/Intune/CDA admin |
| Hard delete | Not default (stays 30 days) | Explicitly purged | Global/Intune/CDA admin |
| Who can soft-delete | Device Owner (own device) or Global/Device/Intune Admin | — | As listed |

---

## Troubleshooting Guidance

### Step 1: Verify Soft-Delete State
```powershell
# List all soft-deleted device objects
GET https://graph.microsoft.com/beta/directory/deletedItems/microsoft.graph.device

# If device appears → soft-deleted, can restore
# If device absent → hard-deleted or soft delete not active for device type
```

### Step 2: Check Logs
- **Entra ID Audit Logs:** Look for "Delete device" activity with actor/timestamp
- **LogsMiner/Kusto (internal):** Compliance reset events, AWS restore attempts; query by DeviceId or objectId
- **ADRS logs:** SoftDelete operation codes and restore errors

### Step 3: Post-Restore Compliance Issues
- Trigger Intune compliance check from Intune portal
- For 3rd-party MDM: push policy update manually; engage MDM vendor team

### Step 4: Client-Side After Restore
- User may see "Cannot connect to EntraId" → sign out/in or reboot to refresh session
- Run `dsregcmd /status` on Windows 10+ to verify join state

### Step 5: Re-registration Blocked by Soft-Delete
- Find DeviceID from Windows: Settings > Accounts > Access work or school > Info
- Check deletedItems for matching ID; restore or hard-delete the conflicting object

### Step 6: Escalation Triggers
- Device that should be soft-deleted was hard-deleted (or vice versa)
- Restore fails or Graph returns error
- BitLocker key missing after restore
- Intune cannot retire devices due to soft delete conflicts
- Tenant not in preview but needs recovery

---

## ICM & Support Boundaries

- **Owning Service:** Microsoft Entra ID — EntraId Devices engineering
- **Known PM/Dev Owner:** Justin Ploegert (feature PM for soft delete)
- **Always include:** Device ObjectID + Tenant ID in escalations

**What support will do:**
- ✅ Help recover a soft-deleted device if customer cannot
- ❌ Will NOT hard-delete without explicit customer instruction
- ❌ Cannot extend feature to unsupported tenants (preview only)
- ❌ Custom role for device restore not supported yet

**Escalation:** Route to Entra ID Devices engineering (not Intune); coordinate with Intune if compliance issues involved.
