---
title: Linux Kernel Panic Troubleshooting Guide
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/linux-kernel-panic-troubleshooting
product: vm
date: 2026-04-18
21vApplicable: true
---

# Linux Kernel Panic Troubleshooting Guide

## Identification
Use Azure portal serial console log / Boot Diagnostics / AZ CLI to find kernel panic string at end of serial log:
```
[  300.206297] Kernel panic - xxxxxxxx
[  300.207216] CPU: 1 PID: 1 Comm: swapper/0 Tainted: ...
```

## Common Kernel Panic Messages Reference

| Panic Message | Reason |
|---|---|
| Oops: 0000 [#1] SMP | Dereferencing a bad address |
| SysRq: Trigger a crashdump | User-initiated core dump (sysrq-c) |
| kernel BUG at <path>:<line>! | Failed BUG check (ASSERT-like) |
| not syncing: softlockup: hung tasks | CPU hasn't scheduled watchdog task within threshold |
| Watchdog detected hard LOCKUP on cpu | CPU hasn't received hrtimer interrupts within threshold |
| not syncing: hung_task: blocked tasks | Task in uninterruptible state beyond timeout |
| not syncing: out of memory | OOM with panic_on_oom selected |
| Out of memory and no killable processes | OOM, all processes killed, none left |
| An NMI occurred | Watchdog intercepted NMI |
| NMI IOCK error: Not continuing | IO check NMI, kernel.panic_on_io_nmi set |
| Fatal Machine check | Machine check exception for fatal condition |
| Attempted to kill init! | Init process exited unexpectedly |
| VFS: Unable to mount root fs on unknown-block(0,0) | No initramfs to mount rootfs |

## Scenario 1: Kernel Panic at Boot Time
Happens every boot, prevents OS startup. Common causes:
- Recent kernel upgrade/downgrade
- Kernel module changes
- OS config changes (GRUB, sysctl, SELinux)
- Missing files/directories/libraries
- Wrong file permissions
- Missing partitions

### Resolution Methods
1. **Serial Console**: Interrupt boot at GRUB, select previous kernel version
2. **Offline Repair**: Create rescue VM with az vm repair, chroot, fix kernel issues
3. Then: Reinstall/regenerate initramfs, reinstall kernel, review modules, fix partitions

## Scenario 2: Kernel Panic at Runtime
Triggered unpredictably after OS starts. Additional causes:
- Application workload/development changes
- Possible kernel bugs
- Performance/resource issues

### Resolution
- Review resource usage (may need VM resize)
- Install latest updates (known bugs)
- Boot to previous kernel version
- Configure kdump for core dump analysis

## Related Articles
- kernel-related-boot-issues: Specific kernel boot recovery
- linux-kernel-panics-upgrade: 3.10 kernel panic after host upgrade
