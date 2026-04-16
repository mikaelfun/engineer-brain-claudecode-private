# AKS PV/PVC 与卷管理 — daemonset — 排查工作流

**来源草稿**: ado-wiki-linking-linux-azure-kernel-ubuntu-versions.md, ado-wiki-linux-kernel-dump-crash-analysis.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Link Between Linux-Azure Kernel Versions and Upstream Ubuntu Kernel Versions
> 来源: ado-wiki-linking-linux-azure-kernel-ubuntu-versions.md | 适用: 适用范围未明确

### 排查步骤

#### Link Between Linux-Azure Kernel Versions and Upstream Ubuntu Kernel Versions

#### Scenario

Some customers want to understand how an AKS Linux-Azure kernel version (which has a completely different version number or naming convention than the upstream Ubuntu kernel version) is linked or tied together to identify CVEs.

#### Documentation of CVEs Fixes in Linux-Azure Kernel Versions & Ubuntu Kernel Version

To find which Ubuntu kernel fixes are included in a Linux Azure kernel version, refer to Ubuntu's CVE pages. The linux-azure kernel versions that contain specific CVE fixes are tracked on these pages.

For example, for CVE-2024-36016, visit the Ubuntu CVE page and scroll down to the linux-azure section:
https://ubuntu.com/security/CVE-2024-36016

The page shows the version of the linux-azure derivative kernel with the fix. For AKS, the 22.04 LTS version has the fix in 5.15.0-1070.79 for this example CVE.

#### Linking Ubuntu Kernel Version and Azure Kernel Versions

The link between Ubuntu kernel versions and Linux Azure kernel versions is included in the changelogs for new Linux Azure kernels.

Example: linux-azure (5.15.0-1078.87) is built on generic kernel Ubuntu: 5.15.0-130.140, and the previous linux-azure (5.15.0-1077.86) was built on Ubuntu: 5.15.0-128.138. The latter linux-azure kernel 1078 also contains the CVE fixes described under section for 1077.

Changelog: https://launchpad.net/ubuntu/+source/linux-azure/5.15.0-1078.87

#### Accessing Changelogs via CLI

Changelogs can be accessed through CLI from an instance running the kernel of interest:

```bash
apt changelog linux-headers-<kernel_version>-azure
```

For example, on an instance running the 6.8 kernel:

```bash
apt changelog linux-headers-6.8.0-1020-azure
```

---

## Scenario 2: How to setup kdump on AKS Linux (Ubuntu) node and analyze crash dumps
> 来源: ado-wiki-linux-kernel-dump-crash-analysis.md | 适用: 适用范围未明确

### 排查步骤

#### How to setup kdump on AKS Linux (Ubuntu) node and analyze crash dumps

#### Scenario

AKS node OS crashes recurrently. Enable kdump to capture kernel dump for analysis. Contact Linux Escalation Team for deeper analysis.

#### Prerequisites

- SSH access to AKS node (https://docs.microsoft.com/en-us/azure/aks/node-access or kubectl-exec/kubego tools)

#### Setup Steps

##### 1. Install kdump package

```bash
apt-get update && apt install linux-crashdump -y
#### Select "YES" both times
```

##### 2. Verify configuration

```bash
grep LOAD_KEXEC /etc/default/kexec        # Should be: LOAD_KEXEC=true
grep USE_KDUMP /etc/default/kdump-tools    # Should be: USE_KDUMP=1
```

##### 3. Set crash dump target to temporary disk

```bash
mkdir -p /mnt/crash && chmod 777 /mnt/crash && chmod o+t /mnt/crash
sed -i 's/^KDUMP_COREDIR=.*/KDUMP_COREDIR=\"\/mnt\/crash\"/' /etc/default/kdump-tools
```

##### 4. Increase reserved memory and update grub

```bash
sed -i 's/512M-:192M/512M-:256M/' /etc/default/grub.d/kdump-tools.cfg
update-grub
```

##### 5. Reboot

```bash
init 6
```

##### 6. Verify after reboot

```bash
kdump-config show
#### Should show: current state: ready to kdump
```

##### 7. Test (optional)

```bash
sudo sysctl -w kernel.sysrq=1
echo c > /proc/sysrq-trigger
#### After reboot, check /mnt/crash/ for dump files
```

#### Crash Analysis

##### Install debug tools

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

##### Analyze dump

```bash
crash /usr/lib/debug/boot/vmlinux-$var-azure /mnt/crash/[DATETIME]/dump.[DUMP_NUMBER]
```

#### References

- https://ubuntu.com/server/docs/kernel-crash-dump
- https://www.kernel.org/doc/Documentation/kdump/kdump.txt

---
