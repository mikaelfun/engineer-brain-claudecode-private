# Intune BitLocker 加密管理 — 排查工作流

**来源草稿**: ado-wiki-Bitlocker-Recovery-Key.md, onenote-mbam-bitlocker-migration-to-mem.md
**Kusto 引用**: (无)
**场景数**: 9
**生成日期**: 2026-04-07

---

## Portal 路径

- `2. In Endpoint Manager admin center > Endpoint Security > Disk Encryption > Create Policy`

## Scenario 1: Prerequisites
> 来源: ado-wiki-Bitlocker-Recovery-Key.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Enrolled Windows device in Intune
- Ability to log into Company Portal website (https://portal.manage.microsoft.com/)
- Permission to view BitLocker recovery key (if one exists in Entra ID)

## How It Works
1. Open Company Portal website
2. Navigate to Devices > select enrolled Windows device
3. Click "Get recovery key"
4. If multiple keys, click "Show recovery key" under the device with the needed key ID

## Entra ID Settings

## Scenario 2: Restrict Recovery Key Access
> 来源: ado-wiki-Bitlocker-Recovery-Key.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Location: Entra ID > Devices > Device settings
- Default: 'No' (all users can recover keys)
- 'Yes': restricts non-admin users from seeing BitLocker keys
- If restricted, users see: "Recovery key could not be retrieved"

## Scenario 3: Audit Recovery Key Access
> 来源: ado-wiki-Bitlocker-Recovery-Key.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Entra ID > Audit Logs > Key Management category
- Activity type: "Read BitLocker key"
- Logs include UPN and key ID

## Scenario 4: Step 1: Export Recovery Keys from MBAM SQL Server
> 来源: onenote-mbam-bitlocker-migration-to-mem.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Open SQL Management Studio
- Expand `MBAM_Recovery_and_Hardware` database
- Query `RecoveryAndHardwareCore.Keys` table
- Export RecoveryKeyID and RecoveryKey columns
- Modify `SELECT TOP nnnnn` for large datasets

## Scenario 5: Step 2: Configure MEM BitLocker Policy
> 来源: onenote-mbam-bitlocker-migration-to-mem.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

1. Create two device groups: "BitLocker GPO devices" and "BitLocker MEM devices"
2. In Endpoint Manager admin center > Endpoint Security > Disk Encryption > Create Policy
3. Configure settings:
   - BitLocker Base Settings (full disk encryption, storage card encryption)
   - Fixed Drive Settings
   - OS Drive Settings (client-driven recovery password rotation)
   - Removable Drive Settings
4. Assign policy to "BitLocker MEM devices" group
5. Migrate devices batch by batch between groups

## Scenario 6: Step 3: Export Recovery Keys from Azure AD via Graph API
> 来源: onenote-mbam-bitlocker-migration-to-mem.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

## Scenario 7: Step 4: Force Current Devices to Escrow Keys to AAD
> 来源: onenote-mbam-bitlocker-migration-to-mem.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Deploy PowerShell script `Invoke-EscrowBitlockerToAAD` via Intune
- Reference: MSEndpointMgr - "How to migrate Bitlocker to Azure AD"

## Scenario 8: Step 5: Compare and Reconcile
> 来源: onenote-mbam-bitlocker-migration-to-mem.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

- Compare MBAM SQL export with Azure AD Graph API export
- Manually escrow any missing recovery keys
- Verify counts match before cutoff

## Scenario 9: Step 6: Decommission MBAM
> 来源: onenote-mbam-bitlocker-migration-to-mem.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

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

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
