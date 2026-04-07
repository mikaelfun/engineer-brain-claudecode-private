# AVD App Attach Troubleshooting Guide

> Source: [Troubleshoot app attach in Azure Virtual Desktop](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-desktop/troubleshoot-app-attach)

## Validating File Share Access for MSIX Images

Session hosts access MSIX images as the SYSTEM account. To validate:

### Steps
1. Install [PsExec](https://learn.microsoft.com/en-us/sysinternals/downloads/psexec) on a session host
2. Open PowerShell as admin, start SYSTEM context:
   ```powershell
   PsExec.exe -s -i powershell.exe
   ```
3. Verify context: `whoami` → should output `nt authority\system`
4. Mount MSIX image manually:

   **For .vhdx format:**
   ```powershell
   Mount-DiskImage -ImagePath \\fileshare\msix\MyApp.vhdx
   ```

   **For .cim format:**
   ```powershell
   If (!(Get-Module -ListAvailable | ? Name -eq CimDiskImage)) {
       Install-Module CimDiskImage
   }
   Import-Module CimDiskImage
   Mount-CimDiskImage -ImagePath \\fileshare\msix\MyApp.cim -DriveLetter Z:
   ```

5. If mount succeeds → file share access is correct
6. Dismount after testing:
   - .vhdx: `Dismount-DiskImage -ImagePath \\fileshare\msix\MyApp.vhdx`
   - .cim: `Get-CimDiskImage | Dismount-CimDiskImage`

### Key Points
- Must test as SYSTEM account (not user account)
- Both .vhdx and .cim formats supported
- CimDiskImage PowerShell module required for .cim format
