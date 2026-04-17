# Windows Printer Deployment via Intune

> Source: Case 2307140040001598 | Device Config
> Status: draft (pending SYNTHESIZE review)

## Background

After KB5005652 (CVE-2021-34481), Windows restricts printer driver installation to administrators only by default. This impacts Intune-managed devices where end users need network printer access.

## Methods

### Option 1: PowerShell Script via Intune (Run as SYSTEM)

Deploy as Intune script (NOT as logon user):

```powershell
# Disable admin-only restriction
New-Item -Path "HKLM:\Software\Policies\Microsoft\Windows NT\Printers\PointAndPrint" -Force
New-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows NT\Printers\PointAndPrint" -Name "RestrictDriverInstallationToAdministrators" -Value "0"

# Create scheduled task to add printer as logged-in user
$Trigger = New-ScheduledTaskTrigger -atLogon
$Principal = New-ScheduledTaskPrincipal -UserId (Get-CimInstance -ClassName win32_computerSystem | Select-Object -ExpandProperty Username) -RunLevel Highest
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "Add-Printer -ConnectionName '\\PrintServer\PrinterName'"
Register-ScheduledTask -Action $Action -Force -Trigger $Trigger -TaskName 'AddNetworkPrinter' -Description 'Add network printer' -Principal $Principal
```

### Option 2: Elevated PowerShell as Logon User

Run elevated PowerShell:
```powershell
Add-Printer -ConnectionName '\\PrintServer\PrinterName'
```

### Option 3: Device Configuration Profile (User Group Only)

Use Device restriction settings > Printer:
- Reference: [Device restrictions for Windows 10/11 - Printer](https://learn.microsoft.com/en-us/mem/intune/configuration/device-restrictions-windows-10#printer)
- Note: Only works when targeted to user groups

## Key References

- [KB5005652 - Manage new Point and Print default driver installation behavior](https://support.microsoft.com/en-us/topic/kb5005652)
