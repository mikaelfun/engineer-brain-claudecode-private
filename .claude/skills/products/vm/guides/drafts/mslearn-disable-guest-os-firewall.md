---
source: mslearn
sourceRef: null
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/disable-guest-os-firewall-windows
importDate: "2026-04-24"
type: guide-draft
---

# Disable Guest OS Firewall in Azure VM

Workaround reference when guest OS Windows Firewall blocks all traffic (including RDP) to a VM.

## Online Solutions (VM accessible via another VM in same VNET)

### Mitigation 1: Custom Script Extension / Run Command

If Azure agent is working, use CSE or Run Command to remotely execute:

**Locally-set firewall:**
```powershell
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\DomainProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\PublicProfile' -name "EnableFirewall" -Value 0
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\services\SharedAccess\Parameters\FirewallPolicy\Standardprofile' -name "EnableFirewall" -Value 0
Restart-Service -Name mpssvc
```

**AD policy-set firewall (temporary):**
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
psexec \<DIP> -u <username> cmd
netsh advfirewall set allprofiles state off
psservice restart mpssvc
```

### Mitigation 4: Remote Registry
Connect via regedit > File > Connect Network Registry, set EnableFirewall=0 for Domain/Public/Standard profiles, restart mpssvc via Remote Services Console.

## Offline Solution
Attach OS disk to recovery VM, load SYSTEM and SOFTWARE hives, set EnableFirewall=0 for all profiles in both local and policy paths, unload hives, recreate VM.
