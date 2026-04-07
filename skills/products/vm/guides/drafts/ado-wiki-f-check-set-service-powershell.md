---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Check or Set Windows Service Over PowerShell_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCheck%20or%20Set%20Windows%20Service%20Over%20PowerShell_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check or Set Windows Service Over PowerShell

## Summary

How to check or change a Windows service startup type remotely via PowerShell on an Azure VM.

## Instructions

### 1. Set Variables

```powershell
$vmname = "<full VM name>"
# or
$vmname = "<hostname.cloudapp.net>"
$servicename = '<Service name>'
```

### 2. Connect Remotely (External)

```powershell
Enter-PSSession -ComputerName $vmname -UseSSL -Credential (Get-Credential) -SessionOption (New-PSSessionOption -SkipCaCheck -SkipCnCheck)
```

### 3. Query Service Status

```powershell
Get-WmiObject Win32_Service -Filter "name = '$servicename'"
```

### 4. Change Startup Type to Automatic

```powershell
Set-Service $servicename -StartupType Automatic
```

### 5. List All Auto-Start Services

```powershell
Get-WmiObject Win32_Service | Format-Table Name, StartMode -Auto
```
