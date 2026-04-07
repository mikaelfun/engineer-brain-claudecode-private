---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/How Tos/Check or Set Windows Service through Registry_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FHow%20Tos%2FCheck%20or%20Set%20Windows%20Service%20through%20Registry_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Check or Set Windows Service through Registry

## Summary

How to check or change a Windows service startup type via the registry, including offline scenarios when PowerShell/RDP is not available.

## Registry Path

`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\<ServiceName>` -> **Start** value

## Startup Type Values

| Setting | Registry Value |
|---------|---------------|
| Automatic | Start=2, DelayedAutostart=0 |
| Automatic (Delayed Start) | Start=2, DelayedAutostart=1 |
| Manual | Start=3 |
| Disabled | Start=4 |

Any change requires a service restart.

## Methods (With Connectivity)

### PowerShell (Remote PSSession)

```powershell
$Skip = New-PSSessionOption -SkipCACheck -SkipCNCheck
Enter-PSSession -ComputerName "<<CLOUDSERVICENAME.cloudapp.net>>" -Port "<<PUBLIC PORT>>" -Credential (Get-Credential) -UseSSL -SessionOption $Skip
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\netlogon' -Name "Start" -Value 2
```

### Custom Script Extension (CSE)

```powershell
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\netlogon' -Name "Start" -Value 2
```

### Remote Registry (GUI)

1. Open Regedit -> Connect to remote VM
2. Browse to `<<DIP>>\SYSTEM\CurrentControlSet\services\<ServiceName>`
3. Change **Start** key to desired value

### PsExec

```cmd
PsExec \\<<DIP>> -u "<<userName>>" -s cmd
REG add "HKLM\SYSTEM\CurrentControlSet\services\netlogon" /v Start /t REG_DWORD /d 2 /f
```

## Methods (Without Connectivity - Offline)

### Using CSE

```powershell
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\netlogon' -Name "Start" -Value 2
```

### Offline Mode (Rescue VM)

1. Delete VM and attach OS disk to a troubleshooting/rescue VM
2. Make safe copy of `\windows\system32\config`
3. Open regedit, highlight HKLM
4. Mount `\windows\system32\config\SYSTEM` as **BROKENSYSTEM**
5. Check which ControlSet is active: `HKLM\BROKENSYSTEM\Select\Current`
6. Navigate to `HKLM\BROKENSYSTEM\ControlSet00x\services\<ServiceName>\Start` and change value
7. Unmount the BROKENSYSTEM hive
8. Detach OS disk and recreate VM
