# Win32 / IME / PowerShell Script TSG

## Log Files

| Name | Description | Location |
|------|-------------|----------|
| IntuneManagementExtension.log | Main IME client log, infrastructure logging | %ProgramData%\Microsoft\IntuneManagementExtension\Logs |
| AppWorkload.log | Main app log, search "[Win32App]" and "[WinGetApp]" | %ProgramData%\Microsoft\IntuneManagementExtension\Logs |
| AgentExecutor.log | WPM library orchestration for user context actions | %ProgramData%\Microsoft\IntuneManagementExtension\Logs |
| WPM-{timestamp}.txt | WinGet logs | %TEMP%\winget\defaultState |
| Operational Event logs | UWP installer logs (search by PFN) | Event viewer > Application and Service Logs > Microsoft\Store\operational |
| installed.db | SQLite cache of installed data | %localappdata%\Microsoft\WinGet\State\defaultState\StoreEdgeFD |

## Win32 App Delivery Flow
1. Intune service delivers Win32 app to device via CDN
2. Grant access to endpoints per tenant location
3. .intunewin file contains: Contents (installer) + Metadata (Detection.xml with encryption info)
4. Rename .intunewin to .zip to inspect contents

## Network Endpoints
- See: [Network requirements for PowerShell scripts and Win32 apps](https://learn.microsoft.com/en-us/mem/intune/fundamentals/intune-endpoints#network-requirements-for-powershell-scripts-and-win32-apps)

## References
- Win32 app management: https://learn.microsoft.com/en-us/mem/intune/apps/apps-win32-app-management
- Internal TSG: https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/clientapps/windows/sidecaragent/tsgs/sidecarintunemanagementextensiontsg

## Source
- OneNote: Mooncake POD Support Notebook > Intune > Windows TSG > Win32_IME_PowerShell Script TSG
