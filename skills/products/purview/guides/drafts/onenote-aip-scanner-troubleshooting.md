# AIP Scanner Setup & Troubleshooting (21Vianet)

> Source: OneNote — Mooncake POD Support Notebook / Information Protection (AIP) / AIP Scanner
> Status: draft (from onenote-extract)

## Prerequisites

- SQL Server Express: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
  - Connection string: `Server=localhost\SQLEXPRESS;Database=master;Trusted_Connection=True;`
- SSMS (SQL Server Management Studio) for SQL management
- Assign **sysadmin** role to the AIP Scanner service account in SQL
- Grant "Allow log on locally" to the service account via Group Policy:
  - `Computer Configuration\Policies\Windows Settings\Security Settings\Local Policies\User Rights Assignment`

## 21Vianet-Specific Configuration

### CloudEnvType Registry Key (Required)
AIP Scanner on 21Vianet requires the CloudEnvType registry key:
- Path: `HKLM\SOFTWARE\Microsoft\MSIPC`
- Key: `CloudEnvType` = `6` (REG_DWORD)
- Without this, `Set-AIPAuthentication` will fail with: "Unable to authenticate and setup Microsoft Azure Information Protection"
- Reference: https://learn.microsoft.com/en-us/microsoft-365/admin/services-in-china/parity-between-azure-information-protection?view=o365-21vianet#step-4-configure-aip-apps-on-windows

### Service Principals
- Azure Information Protection: AppId `00000012-0000-0000-c000-000000000000`
- Microsoft Information Protection Sync Service: AppId `870c4f2e-85b6-4d43-bdda-6ed9a579b725`
  - May need manual creation: `New-AzADServicePrincipal -ApplicationId 870c4f2e-85b6-4d43-bdda-6ed9a579b725`

## Key PowerShell Cmdlets

| Cmdlet | Purpose |
|--------|---------|
| `Start-AIPScan` | Start scanning |
| `Stop-AIPScan` | Stop scanning |
| `Get-AIPScannerStatus` | Check scanner status |
| `Set-AIPScannerContentScanJob` | Configure content scan job |
| `Get-AIPScannerContentScanJob` | View content scan job |
| `Add-AIPScannerRepository` | Add repository to scan |
| `Set-AIPScannerRepository` | Configure repository |
| `Get-AIPScannerRepository` | View repository config |
| `Set-AIPScannerConfiguration` | Set scanner configuration |
| `Get-AIPScannerConfiguration` | View scanner configuration |
| `Start-AIPScannerDiagnostics` | Run scanner diagnostics |

Reference: https://docs.microsoft.com/en-us/azure/information-protection/deploy-aip-scanner-configure-install#list-of-cmdlets-for-the-scanner

## Log Collection

### Standard Logs
```
Export-AIPLogs -File "C:\path\filename.zip"
```

### Manual Log Collection
- If logged in as scanner account: `%localappdata%\Microsoft\MSIP` (zip entire directory)
- Otherwise: `C:\Users\{scanner_account}\AppData\Local\Microsoft\MSIP`

### Enable Trace-Level Logging
1. Open Registry Editor as administrator
2. Navigate to `HKEY_CURRENT_USER\Software\Microsoft\MSIP`
3. Add key: `LogLevel` (REG_SZ) = `Trace`
4. Subsequent scanner runs will write detailed data to `msipscanner.iplog`

## Reports Location
```
%localappdata%\Microsoft\MSIP\Scanner\Reports
```

## Sample Files for Testing
Sample files with sensitive info: https://github.com/InfoProtectionTeam/Files/blob/master/Scripts/docs.zip
