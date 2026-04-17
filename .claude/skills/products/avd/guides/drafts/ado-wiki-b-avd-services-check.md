---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Workflows/Host or AVD Agent/Health Check Failures/SxSStack/AVD Services Check"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/465045"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AVD Services Check (SxSStack Health Check)

## Determine if WVD Agent service is running on local computer

### Option 1: Services
- Start -> Run -> services.msc -> verify Remote Desktop Agent Loader, TermService, and UmRdpService services are running

### Option 2: PowerShell
- Open PowerShell as administrator and enter command `Get-Service RdAgentBootLoader`

## Determine if WVD Agent service is running on remote computer

### Option 1: Remote PowerShell
(Computer must be configured to accept remote PS connections)
- Open PowerShell as administrator and enter commands:
   ```
   Enter-PSSession -ComputerName <computer name>
   ```
   ```
   Get-Service RdAgentBootLoader
   ```
   ```
   Get-Service TermService
   ```
   ```
   Get-Service UmRdpService
   ```

### Option 2: psexec
- Download [psexec](https://live.sysinternals.com/psexec.exe) and copy to desired location (e.g. c:\temp)
- Open command prompt as administrator -> Change Directory to location of psexec.exe then enter commands:
   ```
   psexec /AcceptEula \\<computer name> cmd
   ```
   ```
   powershell Get-Service RdAgentBootLoader
   ```
   ```
   powershell Get-Service TermService
   ```
   ```
   powershell Get-Service UmRdpService
   ```

## Solutions
- If any of the services are not running then start service and wait 10 seconds then refresh to confirm is still running.
- If RdAgentBootLoader service starts then stops typically means registration failure:
   - Invalid Token
   - NAME_ALREADY_REGISTERED
- If service crashes collect process dump using procdump:
   - Download [procdump](https://live.sysinternals.com/procdump.exe) and copy to desired location (e.g. c:\temp)
   - Open command prompt as administrator -> Change Directory to location of procdump.exe then enter command `procdump -accepteula -i -ma`
   - The above command will configure procdump as default post-mortem debugger so when process crashes the dump file will be generated in same location of procdump
      - If RdAgentBootLoader is crashing → create ICM and provide process dump to PG
      - If TermService or UmRdpService is crashing → send collab to GES and provide process dump to debug engineer
