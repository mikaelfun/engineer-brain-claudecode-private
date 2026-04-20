---
title: Chroot with LVM on Linux Rescue VM
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/chroot-logical-volume-manager
product: vm
21vApplicable: true
---

# Chroot with LVM on Linux Rescue VM

Troubleshooting when OS disk uses LVM and Serial Console unavailable. Use rescue VM with RAW partitions to avoid duplicate VG conflicts. If same LVM image, use vgimportclone to rename VG. Common scenarios: boot from different kernel, kernel update failures, swap misconfiguration.
