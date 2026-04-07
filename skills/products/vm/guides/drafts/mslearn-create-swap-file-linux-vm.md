# Create SWAP Partition for Azure Linux VM

**Source**: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/create-swap-file-linux-vm)

## Overview

SWAP should be created on the ephemeral (resource) disk (`/mnt`), not on OS or data disks. The resource disk is temporary storage — data is wiped on VM move/stop/deallocate.

## Prerequisites

Disable SWAP in waagent.conf first (cloud-init handles it):

```ini
# /etc/waagent.conf
ResourceDisk.Format=n
ResourceDisk.EnableSWAP=n
ResourceDisk.MountPoint=/mnt
ResourceDisk.SWAPSizeMB=0
```

Restart Azure Linux Agent after changes.

## Option 1: Per-boot Script

Create `/var/lib/cloud/scripts/per-boot/swap.sh`:

```bash
#!/bin/sh
PCT=0.3  # 30% of ephemeral disk
LOCATION=/mnt

if [ ! -f ${LOCATION}/swapfile ]; then
    size=$(/bin/df -m --output=target,avail | /usr/bin/awk -v percent="$PCT" -v pattern=${LOCATION} '$0 ~ pattern {SIZE=int($2*percent);print SIZE}')
    /bin/dd if=/dev/zero of=${LOCATION}/swapfile bs=1M count=$size
    /bin/chmod 0600 ${LOCATION}/swapfile
    /sbin/mkswap ${LOCATION}/swapfile
fi
/sbin/swapon ${LOCATION}/swapfile
/sbin/swapon -a
```

Make executable: `chmod +x /var/lib/cloud/scripts/per-boot/swap.sh`

## Option 2: Cloud-init (Resource Disk)

```bash
sudo echo 'DefaultEnvironment="CLOUD_CFG=/etc/cloud/cloud.cfg.d/00-azure-swap.cfg"' >> /etc/systemd/system.conf
```

```yaml
# /etc/cloud/cloud.cfg.d/00-azure-swap.cfg
#cloud-config
disk_setup:
  ephemeral0:
    table_type: mbr
    layout: [66, [33, 82]]
    overwrite: True
fs_setup:
  - device: ephemeral0.1
    filesystem: ext4
  - device: ephemeral0.2
    filesystem: swap
mounts:
  - ["ephemeral0.1", "/mnt"]
  - ["ephemeral0.2", "none", "swap", "sw,nofail,x-systemd.requires=cloud-init.service,x-systemd.device-timeout=2", "0", "0"]
```

Stop and start VM after configuration.

## Key Notes

- Large temp disk VMs: reduce PCT/partition size accordingly
- Resource disk data is ephemeral — never store persistent data
- 21V (Mooncake): applicable, same procedure
