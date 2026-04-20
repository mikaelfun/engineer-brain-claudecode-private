---
title: Troubleshooting BitLocker Policies - Client Side
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-bitlocker-policies
product: intune
type: troubleshooting-guide
---

# Troubleshooting BitLocker Policies - Client Side

## Encryption Flow
1. Admin configures BitLocker policy in Intune
2. Policy saved to Intune service
3. MDM client syncs and processes settings
4. BitLocker MDM policy Refresh scheduled task runs
5. Encryption initiated

## Key Event Logs
- MDM agent: DeviceManagement-Enterprise-Diagnostics-Provider Admin
- BitLocker-API: BitLocker Management log
- System: TPMProvisioningService or TPM-WMI errors
- Task Scheduler: BitLocker MDM policy Refresh task

## Diagnostic Tools
- MDM Diagnostics Report: C:\Users\Public\Documents\MDMDiagnostics
- MSINFO32: Hardware prerequisites
- TPM.msc: TPM version and status
- Get-Tpm cmdlet: PowerShell TPM verification
- manage-bde -status: Encryption status and method
- reagentc /info: WinRE status

## Registry Locations
- Policy: HKLM\SOFTWARE\Microsoft\PolicyManager\current\device\BitLocker
- BitLocker: HKLM\SOFTWARE\Policies\Microsoft\FVE

## Common Failures
- TPM not present or disabled
- WinRE not enabled (reagentc /enable)
- UEFI BIOS not enabled for TPM 2.0
- Conflicting startup key/PIN settings for silent encryption
- DMA-capable device detected
