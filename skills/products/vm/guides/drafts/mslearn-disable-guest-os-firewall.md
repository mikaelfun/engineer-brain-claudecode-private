# Disable Guest OS Firewall in Azure VM

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/disable-guest-os-firewall-windows

## When to Use

Guest OS firewall is filtering partial or complete traffic to VM, causing RDP or other connectivity failures.

## Online Solutions (VM accessible via another VM in same VNET)

### Mitigation 1: Custom Script Extension / Run Command

**Local firewall:**
```powershell
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\DomainProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\PublicProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\Standardprofile' -name "EnableFirewall" -Value 0
Restart-Service -Name mpssvc
```

**AD policy firewall (temporary):**
```powershell
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall\DomainProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall\PublicProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\WindowsFirewall\StandardProfile' -name "EnableFirewall" -Value 0
Restart-Service -Name mpssvc
```

### Mitigation 2: Remote PowerShell
```powershell
Enter-PSSession (New-PSSession -ComputerName "<HOSTNAME>" -Credential (Get-Credential) -SessionOption (New-PSSessionOption -SkipCACheck -SkipCNCheck))
netsh advfirewall set allprofiles state off
Restart-Service -Name mpssvc
exit
```

### Mitigation 3: PSTools
```cmd
psexec \\<DIP> -u <username> cmd
netsh advfirewall set allprofiles state off
psservice restart mpssvc
```

### Mitigation 4: Remote Registry
Navigate to `<TARGET>\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\{Profile}\EnableFirewall` → set to 0 for each profile (Domain, Public, Standard).

## Offline Solution

1. Attach OS disk to recovery VM
2. Load SYSTEM and SOFTWARE hives
3. Set EnableFirewall=0 for all profiles in both local policy and AD policy paths
4. Also clear AD policy: `HKLM:\BROKENSOFTWARE\Policies\Microsoft\WindowsFirewall\{Profile}\EnableFirewall` → 0
5. Unload hives, detach disk, recreate VM

## Important Notes
- Microsoft best practice: keep Windows Firewall enabled, fix rules instead of disabling entirely
- AD policy firewall: disabling locally is temporary; policy reapplication will re-enable
- This is a workaround; focus on fixing firewall rules correctly
