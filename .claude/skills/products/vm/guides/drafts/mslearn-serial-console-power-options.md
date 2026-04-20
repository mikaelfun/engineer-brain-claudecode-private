---
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/serial-console-power-options
product: vm
type: reference-guide
21vApplicable: true
dateScanned: 2026-04-18
---

# Serial Console Power Options Reference

Azure Serial Console provides several power management tools for VMs and VMSS instances.

## Power Options Comparison

| Feature | Description | Use Case |
|---------|-------------|----------|
| **Restart VM** | Graceful restart (same as portal Overview restart) | Primary tool for most restart scenarios. Brief Serial Console interruption, auto-resumes. |
| **Reset VM** | Forceful power cycle by Azure platform | Immediate restart regardless of OS state. Risk of data loss. No Serial Console interruption. Useful for early boot commands (GRUB/Safe Mode). |
| **SysRq - Reboot (b)** | System request to force guest restart (Linux only) | Requires SysRq enabled in OS. Forces OS restart. |
| **NMI** | Non-maskable interrupt delivered to OS | Available for Windows and Linux. Causes system crash (configurable for memory dump). Useful for low-level debugging. |

## Key Decision Points

- **Normal restart needed** → Use Restart VM
- **OS unresponsive, need immediate restart** → Use Reset VM (accept data loss risk)
- **Linux OS hung, SysRq enabled** → Use SysRq Reboot
- **Need crash dump for debugging** → Configure NMI, then send NMI

## Prerequisites

- SysRq: Must be enabled in Linux OS
- NMI: Must be enabled; configure OS to create dump file on NMI receipt
