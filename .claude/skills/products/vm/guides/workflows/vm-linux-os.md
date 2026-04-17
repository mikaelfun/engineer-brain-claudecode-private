# VM Linux OS — 排查工作流

**来源草稿**: ado-wiki-a-Best-Practices-Managing-extensions-enabled-Linux.md, ado-wiki-b-Linux-GA-Guide.md, ado-wiki-b-Linux-Security-Cases-Process.md, ado-wiki-b-Unlock-Encrypted-Linux-Disk.md, ado-wiki-c-monitoring-extension-linux-manual-upgrade.md, ado-wiki-capture-linux-ga-callstack.md, mslearn-collect-perf-metrics-linux.md, mslearn-cpu-perf-troubleshoot-linux.md, mslearn-create-swap-file-linux-vm.md, mslearn-linux-grub-rescue-troubleshooting.md, mslearn-linux-kernel-panic-troubleshooting.md, mslearn-linux-support-scope.md, mslearn-memory-perf-troubleshoot-linux.md, mslearn-performance-bottlenecks-linux.md, mslearn-redeploy-linux-vm-new-node.md, mslearn-reset-linux-password.md, onenote-clamav-linux-vm.md, onenote-enable-cuda-on-nv-series-linux.md, onenote-linux-perf-commands-reference.md, onenote-linux-slow-network-troubleshooting.md
**Kusto 引用**: (无额外 Kusto 查询文件)
**场景数**: 7
**覆盖子主题**: vm-linux-os
**生成日期**: 2026-04-07

---

## Scenario 1: Linux Ga Guide
> 来源: ado-wiki-b-Linux-GA-Guide.md | 适用: Mooncake \u2705

### 排查步骤
## Troubleshooting Outdated Agent
1. Check current version with `waagent --version`
2. Search GitHub issues: https://github.com/Azure/WALinuxAgent/issues
3. If a matching issue is resolved, identify which release contains the fix
4. Update guide: https://docs.microsoft.com/en-us/azure/virtual-machines/linux/update-agent

---

## Scenario 2: Step 1: Check Service Status and Get PID
> 来源: ado-wiki-capture-linux-ga-callstack.md | 适用: Mooncake \u2705

### 排查步骤
## Step 1: Check Service Status and Get PID
Run:
```bash
service waagent status

`[来源: ado-wiki-capture-linux-ga-callstack.md]`

---

## Scenario 3: Step 2: Get Process Status
> 来源: ado-wiki-capture-linux-ga-callstack.md | 适用: Mooncake \u2705

### 排查步骤
## Step 2: Get Process Status
```bash
ps -fL <PID>
```

`[来源: ado-wiki-capture-linux-ga-callstack.md]`

---

## Scenario 4: Boot-Time Kernel Panic
> 来源: mslearn-linux-kernel-panic-troubleshooting.md | 适用: Mooncake \u2705

### 排查步骤
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

---

## Scenario 5: Runtime Kernel Panic
> 来源: mslearn-linux-kernel-panic-troubleshooting.md | 适用: Mooncake \u2705

### 排查步骤
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

---

## Scenario 6: Enable Cuda On Nv Series Linux
> 来源: onenote-enable-cuda-on-nv-series-linux.md | 适用: Mooncake \u2705

### 排查步骤
### Steps
```bash

`[来源: onenote-enable-cuda-on-nv-series-linux.md]`

---

## Scenario 7: Linux Slow Network Troubleshooting
> 来源: onenote-linux-slow-network-troubleshooting.md | 适用: Mooncake \u2705

### 排查步骤
## Troubleshooting Steps
### 1. Verify Application is Running
```bash
ps -eaf | grep -i apache | grep -v grep
```
### 2. Verify Port Binding
```bash
lsof -iTCP -sTCP:LISTEN -P -n | grep -i apache

`[来源: onenote-linux-slow-network-troubleshooting.md]`

---

## 关联已知问题

| 症状 | 方案 | 指向 |
|------|------|------|
| - Batch mode for top: `top -b -n 5 -d 1 > top_output.txt` - WALinuxAgent process | 见详情 | → onenote-linux-perf-commands-reference.md |
