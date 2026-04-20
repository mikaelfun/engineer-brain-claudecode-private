---
title: Azure Serial Console for Windows - Quick Reference
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/serial-console-windows
product: vm
21vApplicable: false
---

# Azure Serial Console for Windows - Quick Reference

> **21V Note**: Serial Console is NOT available in Azure China cloud as of this writing.

## Prerequisites
- Boot diagnostics must be enabled on the VM
- User needs Virtual Machine Contributor role or higher

## Enabling SAC (Special Administration Console)
- Newer Windows Server images (post Feb 2018) have SAC enabled by default
- SAC not available on client OS (Windows 10/8/7)
- Enable manually: `bcdedit /ems {current} on` + `bcdedit /emssettings EMSPORT:1 EMSBAUDRATE:115200` + reboot
- Offline enable: attach disk as data disk, use `bcdedit /store <mountedvolume>ootcd /ems {default} on`

## Using CMD/PowerShell in Serial Console
1. Connect → SAC> prompt
2. Type `cmd` to create CMD channel
3. `ch -si 1` or Esc+Tab to switch to CMD channel
4. Enter admin credentials
5. Type `PowerShell` in CMD to start PS session

## NMI (Non-Maskable Interrupt)
- Use keyboard icon in command bar → Send NMI
- Configure Windows to create crash dump on NMI receipt

## Known Issues
- Windows 10 VMs: EMS not enabled, no sign-in prompt
- SAC may not fill entire browser area
- Kernel debugging enabled → cannot type at SAC prompt (fix: `bcdedit /debug {current} off`)
- PSReadLine causes character duplication when pasting (fix: `Remove-Module PSReadLine`)
- Max paste length: 2048 characters

## Common Scenarios
- Fix firewall rules blocking RDP
- Filesystem corruption recovery
- RDP configuration issues
- Network lockdown system management
- Boot loader (BCD) interaction

## Storage Account Firewall
- If custom boot diagnostics storage has firewall, must add Serial Console service IPs
- Use SerialConsole service tag for IP list
- Not supported in geographies with single region (e.g. Italy North)
