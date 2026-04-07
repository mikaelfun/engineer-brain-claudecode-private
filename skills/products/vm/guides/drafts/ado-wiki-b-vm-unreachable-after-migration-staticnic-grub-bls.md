---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Cant RDP SSH/TSGs/Isolation/VM Unreachable After On Premises Migration To Azure StaticNIC&Grub BLS misconfiguration_RDP SSH"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FCant%20RDP%20SSH%2FTSGs%2FIsolation%2FVM%20Unreachable%20After%20On%20Premises%20Migration%20To%20Azure%20StaticNIC%26Grub%20BLS%20misconfiguration_RDP%20SSH"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.TSG
- cw.RDP-SSH
- cw.Reviewed-02-2026
---

::: template /.templates/Processes/Knowledge-Management/MBI-NDA-Warning.md
:::

[[_TOC_]]

# Applies to

- Azure IaaS Linux Virtual Machines
- RHEL 9 / RHEL 10 (BLS-enabled GRUB)
- VMs migrated from on-premises to Azure

## What "BLS-Aware" Means (RHEL 9 / RHEL 10)

RHEL 9 and RHEL 10 use the Boot Loader Specification (BLS). With BLS enabled, kernel boot parameters are not sourced only from `/etc/default/grub` or `/boot/grub2/grub.cfg`. Instead, the effective kernel command line is assembled at boot time from multiple locations:

- **Per-kernel BLS entry files:** `/boot/loader/entries/*.conf`
- **Runtime kernel defaults:** `/boot/grub2/grubenv` (the `kernelopts` variable)

As a result:

- Updating `/etc/default/grub` alone is insufficient on RHEL 9/10
- Running `grub2-mkconfig` updates the GRUB menu but may not update the active kernel options
- Azure Serial Console parameters (for example, `console=ttyS0`) must be present in both the BLS entry files and the `kernelopts` value in `grubenv`

If these locations are not updated consistently, the VM may:
- Boot successfully
- Regain SSH connectivity
- Still have Azure Serial Console inaccessible

This troubleshooting guide is BLS-aware, meaning all remediation steps explicitly account for BLS behavior on RHEL 9 and RHEL 10.

## LabBox  Hands-On Reproduction (Training Only)

> ** Important:** LabBox environments are intended for internal training and validation only and must not be shared with customers. 

###   [**Azure VM Advanced  Connectivity | Module 3: Linux Advanced Lab 2**.](https://microsoft.sharepoint.com/:w:/t/CSSLearningTeamSite/IQCrqD7VXjQtRLidOQ16btdYAcjCeK-gAEeg_WdBAXLi3vQ?e=afsrGH)

This LabBox reproduces the same failure pattern described in this guide:
- Static NIC configuration (on-premises style)
- cloud-init networking disabled
- Azure Serial Console removed via GRUB and BLS entries

[![Deploy to Azure](/.attachments/SME-Topics/Cant-RDP-SSH/ARMDeploy_Deploy-ARM-JSON-to-Azure.png)](https://labboxprod.azurewebsites.net/api/Labbox?url=https://supportability.visualstudio.com/AzureIaaSVM/_git/Labbox?path=/SME/Connectivity/LinuxAdvancedLab2.json)


## Scenario Overview

After migrating a Linux VM from on-premises to Azure, the VM becomes unreachable:
- SSH connectivity fails
- Azure Serial Console does not provide a login prompt
- The VM appears **Running** in the Azure portal, but neither network nor serial access works

This typically happens when the VM was not prepared for Azure requirements before migration. This guide documents how to identify, confirm, and fix the issue using a Rescue VM based on a real lab scenario where:
- The NIC is configured with a static IP
- cloud-init networking is disabled
- Serial Console parameters were removed from GRUB (including BLS entries)

## Symptoms

You may observe one or more of the following:

**SSH connection times out:**
```
ssh user@<public-ip>
Connection timed out
```

**VM status shows Running in the Azure portal**

**Azure Serial Console shows:**
```
Connecting to the serial port of the VM...
If no login prompt is displayed, press ENTER.
```
But no login prompt ever appears.

**Inspect IaaS Disk diagnostics show:**
- No IPv4 address assigned to the NIC
- NetworkManager / cloud-init errors
- Kernel boot line missing `console=ttyS0`

## Root Causes

This issue is caused by incomplete or incorrect preparation before migration to Azure.

### 1. Static Network Configuration

- The NIC is configured with a static IP (on-premises style)
- Azure requires DHCP for VM networking
- cloud-init network configuration is disabled
- NetworkManager keyfile (`*.nmconnection`) is set to `ipv4.method=manual`
- Legacy `ifcfg-eth0` file exists with `BOOTPROTO=static`

### 2. Serial Console Removed from GRUB

- `console=ttyS0` and related parameters removed from:
    - `/etc/default/grub`
    - BLS entries in `/boot/loader/entries/*.conf`
    - `kernelopts` stored in `/boot/grub2/grubenv`
- GRUB regenerated without serial support

Without these settings, Azure Serial Console cannot attach to the VM.

## Resolution Overview

Because both SSH and Serial Console are unavailable, the fix must be performed using a Rescue VM:

1. Detach the OS disk from the affected VM
2. Attach it to a Rescue VM as a data disk
3. Mount the disk and fix:
     - NIC configuration (DHCP)
     - cloud-init networking
     - GRUB Serial Console settings (BLS-aware)
4. Reattach the disk and restart the original VM

## Step-by-Step Mitigation

### Step 1  Create / Use a Rescue VM

1. Stop the affected VM
2. Take a snapshot of the OS disk (recommended)
3. Detach the OS disk
4. Attach it to a Rescue VM as a data disk
5. SSH into the Rescue VM

### Step 2  Identify the Attached Disk

```bash
lsblk
```

Identify the disk corresponding to the affected VM (commonly `/dev/sdc`).

Example layout:
- `/dev/sda`  Rescue VM OS disk
- `/dev/sdb`  Azure temporary/platform disk
- `/dev/sdc`  Affected VM OS disk

### Step 3  Mount the Affected OS Disk

Use `lsblk` to determine whether the attached disk uses simple partitions or LVM.

#### Option A  Simple Partition Layout (No LVM)

If `lsblk` shows standard partitions (for example, `sdc1`, `sdc2`) with no LVM:

```bash
mkdir /rescue
mount /dev/sdc2 /rescue
```

Mount `/boot` if on a separate partition:
```bash
mount /dev/sdc1 /rescue/boot
```

#### Option B  LVM Layout (RHEL with rootvg)

If `lsblk` shows LVM members (for example, `sdc3` or `sdc4` of type `LVM2_member`), activate the volume group first:

```bash
vgscan --mknodes
vgchange -ay
lvscan
lsblk
```

Verify that the logical volumes (for example, `/dev/mapper/rootvg-rootlv`) are now visible, then mount them:

```bash
mkdir /rescue
mount /dev/mapper/rootvg-rootlv /rescue
mount /dev/mapper/rootvg-varlv /rescue/var
mount /dev/mapper/rootvg-homelv /rescue/home
mount /dev/mapper/rootvg-usrlv /rescue/usr
mount /dev/mapper/rootvg-tmplv /rescue/tmp
mount /dev/mapper/rootvg-optlv /rescue/opt
mount /dev/sdc2 /rescue/boot
mount /dev/sdc1 /rescue/boot/efi
```

> **Note:** Your volume group and logical volume names may differ. Use `lvscan` output to identify the correct paths. Not all VMs will have every logical volume listed above  mount only those present on the disk.

### Step 4  Prepare and Enter chroot Environment

The OS disk and all its partitions / logical volumes must already be mounted under `/rescue` (see Step 3). Now bind-mount the virtual filesystems and enter chroot:

```bash
mount -t proc /proc /rescue/proc
mount -t sysfs /sys /rescue/sys
mount -o bind /dev /rescue/dev
mount -o bind /dev/pts /rescue/dev/pts
mount -o bind /run /rescue/run
chroot /rescue
```

> **Reference:** [Chroot environment for Linux  RHEL/CentOS 7.x and 8.x with LVM](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/chroot-environment-linux#rhelcentos-7x-and-8x-with-lvm)

All commands from this point forward are executed **inside the chroot** and use normal filesystem paths (no `/rescue` prefix).

## Mitigation 1  Restore Azure-Compatible Network Configuration

### 1. Check cloud-init Networking (if cloud-init is installed)

On-premises VMs may not have cloud-init installed. If cloud-init **is** present, verify that networking is not disabled:

```bash
ls /etc/cloud/cloud.cfg.d/
```

If a file such as `99-disable-network-config.cfg` exists, remove it so cloud-init can manage networking in Azure:

```bash
rm -f /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
```

> **Note:** This file is uncommon on VMs migrated from on-premises. It is typically found on cloud images where cloud-init networking was explicitly disabled. If cloud-init is not installed, skip this step.

### 2. Fix Legacy ifcfg File (if present)

```bash
cd /etc/sysconfig/network-scripts/
cp ifcfg-eth0 ifcfg-eth0.bak
vi ifcfg-eth0
```

Change:
```
BOOTPROTO=static
```

To:
```
BOOTPROTO=dhcp
```

Remove static IP fields if present  these are not needed with DHCP and must be deleted (not replaced):

```
IPADDR=...
GATEWAY=...
NETMASK=...
DNS1=...
DNS2=...
```

The resulting file should look similar to:
```
DEVICE=eth0
ONBOOT=yes
BOOTPROTO=dhcp
TYPE=Ethernet
```

### 3. Fix NetworkManager Keyfile (RHEL 9/10)

```bash
ls /etc/NetworkManager/system-connections/
```

Edit the `.nmconnection` file:
```ini
[ipv4]
method=auto
```

Remove any `address1=`, `gateway=`, or static DNS entries.

## Mitigation 2  Restore Serial Console Configuration (BLS-Aware)

### Step 1  Fix /etc/default/grub

```bash
vi /etc/default/grub
```

Ensure at minimum:
```
GRUB_TIMEOUT=5
GRUB_CMDLINE_LINUX="rootdelay=300 console=tty1 console=ttyS0,115200n8 earlyprintk=ttyS0,115200"
GRUB_TERMINAL_OUTPUT="serial console"
GRUB_SERIAL_COMMAND="serial --speed=115200 --unit=0 --word=8 --parity=no --stop=1"
```

### Step 2  Fix BLS Entries (RHEL 9/10)

```bash
for f in /boot/loader/entries/*.conf; do
    sed -i 's/console=ttyS0[^ ]*//g' "$f"
    sed -i 's/earlyprintk=ttyS0[^ ]*//g' "$f"
    sed -i 's/^options .*/& console=ttyS0,115200n8/' "$f"
done
```

### Step 3  Fix grubenv kernelopts (if present)

Check whether `kernelopts` exists in `grubenv`:

```bash
grub2-editenv /boot/grub2/grubenv list
```

- If the output includes a `kernelopts=...` line, check whether it already contains `console=ttyS0,115200n8`.
- If `kernelopts` is listed but missing the console parameter, copy the full existing value, append `console=ttyS0,115200n8`, and set it. For example, if the current value is:

```
kernelopts=root=/dev/sda2 ro rootdelay=300
```

Then run:
```bash
grub2-editenv /boot/grub2/grubenv set "kernelopts=root=/dev/sda2 ro rootdelay=300 console=ttyS0,115200n8"
```

> **Warning:** Always use the actual `kernelopts` value from your system. Do not use placeholder text.

- If the output does **not** contain `kernelopts` at all (for example, on RHEL 10 you may only see `saved_entry` and `boot_success`), **skip this step**. On these systems, kernel options are managed entirely through BLS entry files, which were already updated in Step 2.

### Step 4  Regenerate GRUB

```bash
grub2-mkconfig -o /boot/grub2/grub.cfg
```

## Cleanup and Recovery

Exit chroot and unmount in reverse order.

#### If using Simple Partition Layout (Option A)

```bash
exit
umount /rescue/run
umount /rescue/dev/pts
umount /rescue/dev
umount /rescue/sys
umount /rescue/proc
umount /rescue/boot
umount /rescue
```

#### If using LVM Layout (Option B)

```bash
exit
umount /rescue/run
umount /rescue/dev/pts
umount /rescue/dev
umount /rescue/sys
umount /rescue/proc
umount /rescue/boot/efi
umount /rescue/boot
umount /rescue/opt
umount /rescue/tmp
umount /rescue/usr
umount /rescue/home
umount /rescue/var
umount /rescue
vgchange -an rootvg
```

> **Note:** Adjust the `umount` list to match the volumes you mounted in Step 3. Use `vgchange -an rootvg` to deactivate the volume group before detaching the disk.

Detach the disk from the Rescue VM and reattach it as the OS disk to the original VM. Start the VM.

## Validation

After the VM boots:

- SSH connectivity should work
- Azure Serial Console should display a login prompt
- NIC should receive an IP from Azure DHCP

## Prevention / Best Practices

Before migrating Linux VMs to Azure:

- Use DHCP, never static IPs
- Do not disable cloud-init networking
- Ensure Azure Linux Agent is installed
- Configure GRUB serial console before migration
- Validate with Azure Serial Console while still on-premises

## Related Documentation

- [Azure Serial Console for Linux](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/serial-console-linux)
- [Create and Upload a Linux VHD to Azure](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/create-upload-generic)

::: template /.templates/Processes/Knowledge-Management/RdpSsh-Feedback-Template.md
:::