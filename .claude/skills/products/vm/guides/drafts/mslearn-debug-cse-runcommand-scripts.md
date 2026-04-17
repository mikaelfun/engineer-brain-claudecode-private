# Debug CSE / Run Command PowerShell Scripts

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/debug-customscriptextension-runcommand-scripts

## Diagnostic Approach

### 1. Check StdOut/StdErr Substatus
- Portal: VM > Extensions + applications > Select extension > View detailed status
- PowerShell: `Get-AzVM -ResourceGroupName <rg> -Name <vm> -Status`
- CLI: `az vm get-instance-view --resource-group <rg> --name <vm> --query instanceView.extensions`

### 2. Test Script Manually on VM
- Run from admin PowerShell console
- If works manually, test with PsExec under Local System:
  ```cmd
  psexec -accepteula -nobanner -s powershell.exe -NoLogo -NoProfile -File <script.ps1>
  ```
- If failure reproduces with psexec -s, CSE/RunCommand is not the cause

### 3. Enable Detailed Logging
1. Increase event log max size to 100MB:
   ```powershell
   wevtutil set-log "Security" /ms:104857600
   wevtutil set-log "Microsoft-Windows-PowerShell/Operational" /ms:104857600
   ```
2. Enable process creation auditing (Event ID 4688/4689)
3. Enable PowerShell transcription (output to C:\Transcripts)
4. Enable module logging (Event ID 4103)
5. Enable script block logging (Event ID 4104)

### 4. Export Events for Analysis
- Use provided PowerShell script to export Security + PowerShell/Operational events to CSV
- Filter by Local System SID (S-1-5-18)

## Common Errors
- **Nonzero exit code**: Script returned non-zero, CSE treats as failure
- **Change is in conflict (409)**: Extension name mismatch - use same name or remove first
- **Invalid file URI configuration**: FileUris in both public and protected settings
