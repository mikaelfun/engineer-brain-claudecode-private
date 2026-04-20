---
title: "通过 Azure Portal 挂载 OS 盘到恢复 VM 排查 Linux 启动问题"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/troubleshoot-recovery-disks-portal-linux"
product: vm
date: 2026-04-18
21vApplicable: true
---

# 通过 Azure Portal 挂载 OS 盘到恢复 VM

## 适用场景
Linux VM 遇到启动或磁盘错误（如 /etc/fstab 无效条目），需要直接操作 VHD 排查。

## 流程概览
1. 停止故障 VM
2. 为 OS 盘创建快照
3. 从快照创建新磁盘
4. 将新磁盘作为 data disk 挂载到另一台 Linux VM
5. 在排查 VM 上修复问题
6. 卸载并分离磁盘
7. 通过 Swap OS Disk 替换原 VM 的 OS 盘

## 关键步骤

### 确定启动问题
Azure Portal → VM → Support + Troubleshooting → Boot diagnostics 查看控制台日志和截图。

### 挂载数据盘
```bash
dmesg | grep SCSI  # 确认新挂载的盘符（通常 /dev/sdc）
sudo mkdir /mnt/troubleshootingdisk
sudo mount /dev/sdc1 /mnt/troubleshootingdisk
```

### 修复完成后
```bash
cd / && sudo umount /dev/sdc1
```
Portal 中分离数据盘 → Swap OS Disk 替换。

## 注意事项
- 加密磁盘需参考 offline repair 专门文档
- 不适用于 unmanaged disk
- 排查 VM 和 OS 盘必须在同一 region
