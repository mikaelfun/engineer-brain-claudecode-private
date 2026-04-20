---
title: "Decrease the Size of an Azure Data Disk Without Losing Data"
source: mslearn
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/downsize-data-disk-without-losing-data"
product: vm
type: guide
21vApplicable: true
date: "2026-04-18"
---

# Decrease the Size of an Azure Data Disk Without Losing Data

Azure 不支持直接缩小磁盘，需通过创建新小磁盘 + 数据迁移实现。

## 适用场景

- 数据盘（非 OS 盘）需要缩小容量
- 希望降低存储成本但保留数据

## 步骤

### 1. 创建新的较小数据盘

- Azure Portal → VM → Disks → Create and attach a new disk
- 设置合适的 LUN、名称、Storage type、Size

### 2. 在 VM 内初始化新盘

**Windows:**
- RDP 连接 → Disk Management → Initialize → 分配盘符

**Linux:**
- SSH 连接 → 挂载新磁盘

### 3. 数据迁移

**Windows:**
```cmd
robocopy x:\ y:\ /mir /z /w:5 /r:2 /mt
```

**Linux:**
```bash
rsync -avz /<source>/<directory>/ /<destination>/<directory>/
```

### 4. 验证数据完整性

确认所有数据已成功复制到新盘。

### 5. 分离并删除旧盘

- Azure Portal → VM → Disks → Detach 旧盘
- 确认数据无误后删除旧盘

## 注意事项

- 本文不涉及 OS 盘缩小
- 迁移前务必备份
- 大量数据迁移可能耗时较长
