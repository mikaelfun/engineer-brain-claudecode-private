---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/enable-disable-firewall-rule-guest-os
importDate: "2026-04-24"
type: guide-draft
---

# Enable or Disable Firewall Rule on Azure VM Guest OS

Reference for enabling/disabling specific firewall rules (e.g., RDP) when guest OS firewall rule configuration blocks traffic.

## Online Methods

### Method 1: Custom Script Extension
```cmd
REM Enable RDP rule:
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=yes

REM Disable RDP rule:
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=no
```

### Method 2: Remote PowerShell
```powershell
Enter-PSSession (New-PSSession -ComputerName "<HOSTNAME>" -Credential (Get-Credential) -SessionOption (New-PSSessionOption -SkipCACheck -SkipCNCheck))
Enable-NetFirewallRule -DisplayName "RemoteDesktop-UserMode-In-TCP"
exit
```

### Method 3: PSTools
```cmd
psexec \<DIP> -u <username> cmd
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=yes
```

### Method 4: Remote Registry
Connect via regedit > Connect Network Registry, navigate to:
`SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules\RemoteDesktop-UserMode-In-TCP`

Change `Active=FALSE` to `Active=TRUE` (or vice versa).

## Offline Method
Attach OS disk to recovery VM, load BROKENSYSTEM hive, find the correct ControlSet, modify FirewallRules RemoteDesktop-UserMode-In-TCP Active flag, unload hive, recreate VM.

## Notes
- Same methods can be applied to any firewall rule by changing the rule name
- If firewall is set via Group Policy, local changes will be overridden on next policy refresh
- Microsoft best practice: keep Windows Firewall enabled, configure rules rather than disabling entirely
