# Linux VM Kernel Panic Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-kernel-panic-troubleshooting

## Prerequisites

- Serial Console enabled and functional

## Identification

Check serial console log via Boot diagnostics or AZ CLI. Kernel panic appears at end of log:

```
[  300.206297] Kernel panic - xxxxxxxx
[  300.207216] CPU: 1 PID: 1 Comm: swapper/0 Tainted: ...
```

## Common Panic Messages Reference

| Panic Message | Meaning |
|---|---|
| Oops: 0000 [#1] SMP | Dereferencing bad address |
| SysRq: Trigger a crashdump | User-initiated core dump (sysrq-c) |
| kernel BUG at file:line | Failed BUG check (assert) |
| not syncing: softlockup: hung tasks | CPU not scheduling watchdog within threshold |
| Watchdog detected hard LOCKUP | No hrtimer interrupts within threshold |
| hung_task: blocked tasks | Task uninterruptible beyond timeout |
| out of memory. panic_on_oom | OOM with panic_on_oom set |
| Out of memory and no killable processes | OOM, no processes left to kill |
| NMI occurred | Watchdog NMI |
| NMI IOCK error | IO check NMI, panic_on_io_nmi set |
| nmi watchdog | NMI with panic_on_timeout/oops set |
| Fatal Machine check | Fatal MCE event |
| Attempted to kill init! | Init process exited |
| VFS: Unable to mount root fs on unknown-block(0,0) | Missing initramfs |

## Scenario 1: Boot-Time Kernel Panic

Every boot fails. Common causes:
- Kernel upgrade/downgrade
- Kernel module changes
- OS config changes (GRUB, sysctl, SELinux)
- Missing files/directories/libraries
- Wrong file permissions
- Missing partitions

### Resolution

**Method 1: Serial Console** - Interrupt boot, select previous kernel version. Then fix:
- Reinstall/regenerate missing initramfs
- Reinstall problematic kernel
- Review loaded/missing kernel modules
- Review partitions

**Method 2: Offline (Rescue VM)** - `az vm repair create`, chroot, apply same fixes.

## Scenario 2: Runtime Kernel Panic

Unpredictable crashes after OS boots. Causes:
- Kernel upgrade/downgrade/module changes
- Application workload or dev bugs
- Possible kernel bugs
- Resource exhaustion

### Resolution

- Review resource usage (consider VM resize)
- Install latest updates
- Boot previous kernel version
- Configure kdump for core dump analysis

## Related Specific Scenarios

- 3.10-based kernel panic after host upgrade (see vm-mslearn-283)
- Kernel-related boot issues recovery guide
- initramfs regeneration procedures
