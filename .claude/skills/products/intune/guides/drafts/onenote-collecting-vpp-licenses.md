# Collecting VPP Licenses via PowerShell

> Source: OneNote MCVKB/Intune/iOS + IntuneWiki

## Purpose

Extract Apple VPP (Volume Purchase Program) license assignment data for troubleshooting VPP app deployment issues.

## Prerequisites

- PowerShell 6.2.3+ (not Windows PowerShell 5.x)
- VPP token file from customer
- Script: `vppGetLicenses.ps1` (available from internal scratch share)

## Steps

1. Download and install [PowerShell 6 (x86)](https://github.com/PowerShell/PowerShell/releases/download/v6.2.3/PowerShell-6.2.3-win-x86.msi)
2. Share `VppGetLicenses.ps1.txt` to customer; instruct to save as `.ps1`
3. Start command prompt, run:
   ```
   "C:\Program Files (x86)\PowerShell\6\pwsh.exe"
   ```
   > **Important**: Do NOT just launch PowerShell from Start Menu — must use this specific path
4. Verify version: `$PSVersionTable.PSVersion` → should be 6.2.3+
5. May need: `Set-ExecutionPolicy Unrestricted`
6. Run: `<path>\VppGetLicenses.ps1`
7. When prompted, select **R** (Run once)
8. Enter the VPP token file path (include full path + filename)
9. Copy output to a text file for analysis

## Reference

- [VPP App License TSG (IntuneWiki)](https://intunewiki.com/wiki/Vpp_App_License_TSG)
