---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Linux Kernel Dump and Crash Analysis Setup"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers Wiki?pagePath=/Azure Kubernetes Service Wiki/AKS/How Tos/Compute/Linux/Linux Kernel Dump and Crash Analysis Setup"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to setup kdump on AKS Linux (Ubuntu) node and analyze crash dumps

## Scenario

AKS node OS crashes recurrently. Enable kdump to capture kernel dump for analysis. Contact Linux Escalation Team for deeper analysis.

## Prerequisites

- SSH access to AKS node (https://docs.microsoft.com/en-us/azure/aks/node-access or kubectl-exec/kubego tools)

## Setup Steps

### 1. Install kdump package

```bash
apt-get update && apt install linux-crashdump -y
# Select "YES" both times
```

### 2. Verify configuration

```bash
grep LOAD_KEXEC /etc/default/kexec        # Should be: LOAD_KEXEC=true
grep USE_KDUMP /etc/default/kdump-tools    # Should be: USE_KDUMP=1
```

### 3. Set crash dump target to temporary disk

```bash
mkdir -p /mnt/crash && chmod 777 /mnt/crash && chmod o+t /mnt/crash
sed -i 's/^KDUMP_COREDIR=.*/KDUMP_COREDIR=\"\/mnt\/crash\"/' /etc/default/kdump-tools
```

### 4. Increase reserved memory and update grub

```bash
sed -i 's/512M-:192M/512M-:256M/' /etc/default/grub.d/kdump-tools.cfg
update-grub
```

### 5. Reboot

```bash
init 6
```

### 6. Verify after reboot

```bash
kdump-config show
# Should show: current state: ready to kdump
```

### 7. Test (optional)

```bash
sudo sysctl -w kernel.sysrq=1
echo c > /proc/sysrq-trigger
# After reboot, check /mnt/crash/ for dump files
```

## Crash Analysis

### Install debug tools

```bash
echo "deb http://ddebs.ubuntu.com $(lsb_release -cs) main restricted universe multiverse
deb http://ddebs.ubuntu.com $(lsb_release -cs)-updates main restricted universe multiverse
deb http://ddebs.ubuntu.com $(lsb_release -cs)-proposed main restricted universe multiverse" | sudo tee -a /etc/apt/sources.list.d/ddebs.list

sudo apt install ubuntu-dbgsym-keyring

var=$(cat /proc/version)
var=${var#*version }
var=${var%-azure*}

apt-get update && apt-get install crash linux-image-$var-azure linux-image-$var-azure-dbgsym -y
```

### Analyze dump

```bash
crash /usr/lib/debug/boot/vmlinux-$var-azure /mnt/crash/[DATETIME]/dump.[DUMP_NUMBER]
```

## References

- https://ubuntu.com/server/docs/kernel-crash-dump
- https://www.kernel.org/doc/Documentation/kdump/kdump.txt
