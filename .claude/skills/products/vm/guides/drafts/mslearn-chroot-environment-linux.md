---
title: Chroot Environment in Linux Rescue VM
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/chroot-environment-linux
product: vm
21vApplicable: true
---

# Chroot Environment in Linux Rescue VM

Procedures per distro (Ubuntu, RHEL/CentOS RAW, SLES, Oracle) for setting up chroot on rescue VM to fix boot issues. Key: mount OS disk partitions, bind proc/sys/dev/pts/run, chroot, fix, exit, umount, swap disk back.
