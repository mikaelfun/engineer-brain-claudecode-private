# TPM Attestation Troubleshooting Guide

> Source: OneNote — Mooncake POD Support Notebook/Intune/Windows logs/TPM.md
> Status: draft

## When to Use

When a Windows device fails TPM attestation during Autopilot pre-provisioning or enrollment, and you need to diagnose the TPM state.

## Step 1: Check EK Certificate Status

```powershell
get-tpmendorsementkeyinfo
```

## Step 2: Check TPM Attestation Readiness

```powershell
TpmTool.exe getdeviceinformation
```

Key fields to verify:
- **Ready For Attestation: True**
- **Is Capable For Attestation: True**
- **Maintenance Task Complete: True**

If `Ready For Attestation` is `False`, additional diagnostic info will be displayed.

## Step 3: Check Registry for EK Certificate

Verify certificate exists in EKCertStore:

```
HKLM\SYSTEM\CurrentControlSet\Services\TPM\WMI\Endorsement
HKLM\SYSTEM\CurrentControlSet\Services\TPM\WMI\Endorsement\EKCertStore\Certificates
HKLM\SYSTEM\CurrentControlSet\Services\TPM\WMI\TaskStates
```

## Step 4: TPM Maintenance Task

The TPM maintenance task triggers automatically during attestation checks and writes the certificate to registry. Can be manually triggered via Task Scheduler.

## Step 5: TpmDiagnostics Tool (requires installation)

```powershell
.\TpmDiagnostics.exe isreadyinformation
TpmDiagnostics ekinfo
TpmDiagnostics ekchain
```

## Step 6: Manually Request AIK Certificate

Request Attestation Identity Key (AIK) from Microsoft AIK service (microsoftaik.azure.net):

```powershell
certreq -enrollaik -config ""
```

## Log Collection

1. Procmon logs (collect while running TPM Maintenance task)
2. TPM ETL logs:
   - Save the `.wprp` profile (contains TPM, AAD, MDM, enrollment trace providers)
   - `mkdir c:\temp` and save .wprp there
   - Start trace: `wpr.exe -start c:\temp\file.wprp`
   - Trigger TPM Maintenance task or run Autopilot pre-provisioning
   - Stop trace: `wpr.exe -stop C:\file.etl`

## Quick Checks

```powershell
# CPU info
gwmi win32_Processor

# TPM attestation readiness
tpmtool getdeviceinformation
# Verify: Ready For Attestation = True
```
