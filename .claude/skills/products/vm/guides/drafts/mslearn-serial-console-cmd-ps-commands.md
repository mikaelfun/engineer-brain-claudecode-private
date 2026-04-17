# Azure Serial Console: CMD & PowerShell Commands Reference

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/serial-console-cmd-ps-commands
> Quality: guide-draft | ID: vm-mslearn-206

## Overview
Reference for common CMD and PowerShell commands used in SAC (Special Administration Console) via Azure Serial Console for Windows VM troubleshooting.

## Key Notes
- SAC is limited to 80x24 screen buffer with no scroll back — use `| more`
- Paste shortcut: `SHIFT+INSERT`
- Remove PSReadLine before running PowerShell commands: `Remove-Module PSReadLine`
- SAC connects to running OS via serial port (unlike WinRE which boots minimal OS)

## Common Tasks

### RDP Troubleshooting (CMD)
```cmd
# Check RDP status
reg query "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections

# Enable RDP
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0
```

### Service Management (CMD)
```cmd
sc query termservice
sc config termservice start= demand
net start termservice
```

### Network (CMD)
```cmd
netsh interface show interface
netsh interface ip show config
netsh advfirewall set allprofiles state off    # Temporarily disable firewall
netsh advfirewall set allprofiles state on     # Re-enable
```

### Firewall Rules (PowerShell)
```powershell
get-netfirewallrule -name RemoteDesktop-UserMode-In-TCP
get-netfirewallportfilter | where {$_.localport -eq 3389} | foreach {Get-NetFirewallRule -Name $_.InstanceId}
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

### Connectivity Testing
```cmd
ping 8.8.8.8
dism /online /Enable-Feature /FeatureName:TelnetClient
telnet bing.com 80
nslookup bing.com
```

```powershell
test-netconnection -ComputerName bing.com -Port 80
resolve-dnsname bing.com
```

### File System
```cmd
sfc /scannow
dism /online /cleanup-image /scanhealth
wmic datafile where "drive='C:' and path='\\windows\\system32\\drivers\\' and filename like 'netvsc%'" get version /format:list
```

### Event Log (CMD)
```cmd
wevtutil qe system /c:10 /f:text /q:"Event[System[Level=2]]" | more
wevtutil qe system /c:1 /f:text /q:"Event[System[EventID=11]]" | more
```

### Instance Metadata (PowerShell)
```powershell
$im = invoke-restmethod -headers @{"metadata"="true"} -uri http://169.254.169.254/metadata/instance?api-version=2017-08-01 -method get
$im | convertto-json
```
