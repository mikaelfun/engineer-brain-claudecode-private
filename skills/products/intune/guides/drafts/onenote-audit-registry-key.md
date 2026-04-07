# Audit Registry Key Changes on Windows

## Purpose
Track which process or user modifies specific registry keys on Intune-managed Windows devices.

## Steps

1. **Enable Audit Policies** via `gpedit.msc`:
   - Navigate to: Computer Configuration > Windows Settings > Security Settings > Local Policies > Audit Policy
   - Enable: `Audit object access` = Success
   - Enable: `Audit process tracking` = Success

2. **Refresh Group Policy**:
   ```cmd
   gpupdate /force
   ```

3. **Set Registry Auditing**:
   - Open Registry Editor, locate the target key (e.g., `HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment`)
   - Right-click > Permissions > Advanced > Auditing
   - Add entry: Principal = **Everyone**, Type = **Success**
   - Check the desired access types to audit

4. **Monitor Security Event Log**:
   - Once the registry key is modified, events will appear in Windows Security log
   - Look for Event ID 4657 (Registry value modified) and related audit events

## Deployment via Intune
- Can deploy audit policy via Intune Device Configuration Profile (Administrative Templates)
- Or deploy a PowerShell script that configures auditing via `auditpol.exe`

## Notes
- This approach works for both GPO-managed and Intune-managed devices
- Ensure security log size is sufficient to capture events before they roll over
