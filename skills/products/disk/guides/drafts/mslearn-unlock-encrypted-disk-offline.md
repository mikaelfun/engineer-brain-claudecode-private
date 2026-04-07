# Unlocking an ADE-Encrypted Disk for Offline Repair

**Source**: https://learn.microsoft.com/troubleshoot/azure/virtual-machines/windows/unlock-encrypted-disk-offline

## When to Use
- OS disk encrypted with Azure Disk Encryption (ADE/BitLocker) needs offline repair
- VM cannot boot and disk must be attached to a repair VM

## Prerequisites
- Determine ADE version: v1 (dual-pass) or v2 (single-pass)
- Determine if disk is managed or unmanaged
- Key Vault access with BEK/KEK permissions

## Method Selection

| Condition | Method |
|-----------|--------|
| ADE v2 + managed + public IP OK | Automated: `az vm repair create` |
| ADE v2 + managed + no public IP | Semi-automated: attach during VM creation |
| ADE v1 or unmanaged | Manual: retrieve BEK from Key Vault |

## Semi-Automated Steps (ADE v2)
1. Snapshot the encrypted OS disk
2. Create a disk from the snapshot (same region + AZ)
3. Create repair VM (Windows Server 2016+, same region/AZ)
4. **Attach the disk DURING VM creation** (not after) — BEK volume auto-appears
5. In Disk Management: assign drive letter to BEK volume
6. Find BEK file: `dir H: /a:h /b /s`
7. Unlock: `manage-bde -unlock G: -RecoveryKey H:\{GUID}.BEK`

## Manual Steps (ADE v1 / Unmanaged)
1. Install Az PowerShell module on repair VM
2. Retrieve BEK from Key Vault via PowerShell script
3. If BEK is "Wrapped", download and unwrap using KEK
4. Save BEK to C:\BEK\
5. Unlock: `manage-bde -unlock F: -RecoveryKey C:\BEK\{filename}.BEK`

## Important Notes
- Unlocking does NOT decrypt the disk — it remains encrypted
- After repair, swap OS disk back to original VM
- ADE is NOT available in 21Vianet (Mooncake)
