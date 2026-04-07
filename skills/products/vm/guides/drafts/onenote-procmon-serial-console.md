# Procmon Collection via Azure Serial Console

> Source: Mooncake POD Support Notebook / VM / Tools / 10. Procmon using the Azure Serial Console

## When to Use

When you need to collect Process Monitor (Procmon) traces on a Windows VM without GUI/RDP access. Useful for troubleshooting application-level issues, permission errors, or file access problems.

## Prerequisites

- Boot diagnostics must be enabled for the VM
- A password-based user account must exist in the VM
- Azure account must have Virtual Machine Contributor role for both VM and boot diagnostics storage account
- ARM deployment model (classic not supported)
- Storage account key access must be enabled
- VM must have internet access to download Procmon (or Procmon files already present)

## Steps

1. Navigate to VM in Azure Portal → Serial Console
2. Run `cmd` then `ch -si 0001` to switch channels
3. Press Enter, then authenticate with local admin credentials (leave domain empty for local accounts)
4. Switch to PowerShell: `powershell` → `cd C:\`
5. Download and extract Procmon:

```powershell
Invoke-WebRequest https://download.sysinternals.com/files/ProcessMonitor.zip -OutFile ProcessMonitor.zip
Expand-Archive -LiteralPath ProcessMonitor.zip
cd ProcessMonitor
```

6. Start trace:

```powershell
.\procmon64.exe -accepteula /backingfile c:\procmonLog.pml /quiet
```

7. Reproduce the issue
8. Stop trace:

```powershell
.\procmon64.exe /terminate
```

9. Procmon log saved at `C:\procmonLog.pml`

## Important Notes

- **Do NOT use Run Command** for this - it's slow and non-persistent (wipes data between runs)
- Procmon capture files always save to `C:\` regardless of executable location
- Download link may change - check [Sysinternals Procmon page](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon)
- Some VMs may have restrictions preventing remote command execution
- If commands fail, try a different account or restart the server

## Related

- [Serial Console Prerequisites](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/serial-console-overview#prerequisites-to-access-the-azure-serial-console)
- [ADO Wiki: Procmon using Azure Serial Console](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1032037/Procmon-using-the-Azure-Serial-Console)
