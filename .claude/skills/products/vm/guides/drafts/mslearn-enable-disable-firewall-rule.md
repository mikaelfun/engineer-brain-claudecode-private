# Enable or Disable Firewall Rule on Azure VM Guest OS

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/enable-disable-firewall-rule-guest-os

## When to Use

Need to enable/disable specific firewall rules (e.g., RDP) rather than disabling entire firewall. Guest OS firewall is filtering partial traffic.

## Online Methods

### Custom Script Extension
```cmd
# Enable RDP rule
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=yes

# Disable RDP rule
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=no
```

### Remote PowerShell
```powershell
Enter-PSSession (New-PSSession -ComputerName "<HOSTNAME>" -Credential (Get-Credential) -SessionOption (New-PSSessionOption -SkipCACheck -SkipCNCheck))
# Enable
Enable-NetFirewallRule -DisplayName "RemoteDesktop-UserMode-In-TCP"
# Disable
Disable-NetFirewallRule -DisplayName "RemoteDesktop-UserMode-In-TCP"
exit
```

### PSTools
```cmd
psexec \\<DIP> -u <username> cmd
netsh advfirewall firewall set rule dir=in name="Remote Desktop - User Mode (TCP-In)" new enable=yes
```

### Remote Registry
Navigate to: `<TARGET>\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules\RemoteDesktop-UserMode-In-TCP`

Change `Active=FALSE` to `Active=TRUE` (or vice versa) in the rule string.

## Offline Method

1. Attach OS disk to recovery VM
2. Load SYSTEM hive as BROKENSYSTEM
3. Find current ControlSet from `HKLM\BROKENSYSTEM\Select\Current`
4. Navigate to `ControlSet00X\Services\SharedAccess\Parameters\FirewallPolicy\FirewallRules\RemoteDesktop-UserMode-In-TCP`
5. Change Active=FALSE to Active=TRUE
6. Unload hive, detach disk, recreate VM
