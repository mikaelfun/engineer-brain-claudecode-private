# Collecting VPP License Data

## Overview
Use PowerShell script to collect VPP (Volume Purchase Program) license information from Apple VPP token for troubleshooting VPP app assignment and sync issues.

## Prerequisites
- PowerShell 6+ (6.2.3 or above)
- VPP token file from Apple Business Manager
- Internal script: `vppGetLicenses.ps1`

## Steps

1. Get the script `vppGetLicenses.ps1` (internal: `\\ecm\teams\scratch\matgates\vpp\scripts\vppGetLicenses.ps1`)
2. Share as `VppGetLicenses.ps1.txt` to customer
3. Customer downloads and installs [PowerShell 6 x86](https://github.com/PowerShell/PowerShell/releases/download/v6.2.3/PowerShell-6.2.3-win-x86.msi)
4. Save `.ps1.txt` locally as `VppGetLicenses.ps1`
5. Start command prompt, run: `"C:\Program Files (x86)\PowerShell\6\pwsh.exe"`
   - **Important:** Do NOT just launch PowerShell from command prompt
6. Verify version: `$PSVersionTable.PSVersion` → must be 6.2.3+
7. Run: `<path>\VppGetLicenses.ps1`
   - May need: `Set-ExecutionPolicy Unrestricted`
8. When prompted, select **R** (run once)
9. Enter the VPP token file path (include full path + filename)
10. Copy output to text file

## Reference
- [VPP App License TSG](https://intunewiki.com/wiki/Vpp_App_License_TSG)

## Source
- OneNote: MCVKB/Intune/iOS/Collecting VppLicenses.md
