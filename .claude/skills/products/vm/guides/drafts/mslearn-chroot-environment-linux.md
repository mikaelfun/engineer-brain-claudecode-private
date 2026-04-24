---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/chroot-environment-linux"
importDate: "2026-04-23"
type: guide-draft
---

# Chroot Environment in a Linux Rescue VM

Reference guide for setting up and using a chroot environment on a rescue VM to troubleshoot non-booting Linux VMs.

## Overview

When a Linux VM cannot boot, attach its OS disk to a rescue VM and use chroot to execute commands against the affected OS disk.

## Ubuntu

1. Create rescue VM (same generation, same OS version, same resource group)
2. Snapshot affected VM OS disk, create disk from snapshot, attach to rescue VM
3. Access as root: `sudo su -`
4. Find disk using `dmesg | grep SCSI` (typically /dev/sdc)
5. Mount and chroot:
   ```bash
   mkdir /rescue
   mount /dev/sdc1 /rescue
   mount /dev/sdc16 /rescue/boot
   mount /dev/sdc15 /rescue/boot/efi
   mount -t proc /proc /rescue/proc
   mount -t sysfs /sys /rescue/sys
   mount -o bind /dev /rescue/dev
   mount -o bind /dev/pts /rescue/dev/pts
   mount -o bind /run /rescue/run
   chroot /rescue
   ```
6. On newer Ubuntu images there is only one partition for /boot. Older images may error on /dev/sdc16 mount - safely ignorable.

## RHEL/CentOS/Oracle (RAW partitions)

1. Same rescue VM setup as Ubuntu
2. Mount with `-o nouuid`:
   ```bash
   mkdir /rescue
   mount -o nouuid /dev/sdc2 /rescue
   mount -o nouuid /dev/sdc1 /rescue/boot/
   mount -t proc /proc /rescue/proc
   mount -t sysfs /sys /rescue/sys
   mount -o bind /dev /rescue/dev
   mount -o bind /dev/pts /rescue/dev/pts
   mount -o bind /run /rescue/run
   chroot /rescue
   ```

## Cleanup (All Distros)

```bash
exit
umount /rescue/proc/
umount /rescue/sys/
umount /rescue/dev/pts
umount /rescue/dev/
umount /rescue/run
cd /
umount /rescue/boot/efi
umount /rescue/boot
umount /rescue
```

If "unable to unmount /rescue" error, use `umount -l /rescue`.

After unmounting, detach disk from rescue VM and perform disk swap with original VM.
