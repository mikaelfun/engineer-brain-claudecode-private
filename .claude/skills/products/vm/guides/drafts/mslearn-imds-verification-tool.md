---
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/windows-vm-imds-tool
product: vm
type: diagnostic-tool-guide
21vApplicable: true
dateScanned: 2026-04-18
---

# Azure VM IMDS Verification Tool

PowerShell script for diagnosing Azure Instance Metadata Service (IMDS) issues on Windows VMs.

## Key Features

- Confirms that 169.254.169.254 is reachable
- Validates IMDS certificate presence and correctness
- Identifies certificate-related IMDS failures
- Suggests corrective steps

## When to Use

- VM cannot reach IMDS endpoint (169.254.169.254)
- IMDS-dependent features failing (activation, managed identity, etc.)
- Certificate errors related to IMDS attestation
- Activation watermark appearing on Azure Edition VMs

## How to Run

### Option 1: Download from GitHub
Download from [Azure Support Scripts](https://github.com/Azure/azure-support-scripts/blob/master/RunCommand/Windows/Windows_IMDSValidation) and run manually on the VM.

### Option 2: Azure Run Command
Azure Portal → VM → Operations → Run Command → Select IMDS script from list.

### Option 3: CLI/PowerShell
Use az vm run-command or Invoke-AzVMRunCommand.

## Diagnostic Workflow

1. Run IMDS Cert Check to verify activation status and detect common issues
2. Apply suggested fixes or refer to official docs for advanced troubleshooting

## Common Warning Output



Indicates missing or expired attestation certificate — follow corrective steps in tool output.

## Related Issues

- IMDS connection failures → check proxy/firewall config, ensure 169.254.169.254 not blocked
- IMDS certificate issues → run this tool for diagnosis
- Activation watermark → often caused by IMDS connectivity problems
