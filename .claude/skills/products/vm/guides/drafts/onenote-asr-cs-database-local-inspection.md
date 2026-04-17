---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======12. ASR=======/12.17 How to inspect customer CS database locally.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# ASR V2A：如何在本地检查 Configuration Server (CS) MySQL 数据库

支持工程师指南——从客户 SDP 日志中还原 CS 数据库到本地 MySQL，用于深度排查 V2A 问题。

## 适用场景

需要比较 CS 本地数据库与云端 SRS 数据库数据差异时（如重复注册条目、进程服务器映射错误等）。

## 步骤

### 1. 获取数据库备份文件

在客户 SDP 日志 zip 包中找到：
```
ASR-Home-Svsystems-Files.zip\cs_db_backup\<latest>.sql
```

### 2. 安装本地 MySQL

1. 从 https://dev.mysql.com/downloads/installer/ 下载 MySQL Installer for Windows
2. 选择 **Server only** 安装
3. 安装完成后确认服务已启动

### 3. 导入数据库

```sql
-- 连接后执行：
CREATE DATABASE svsdb1;
USE svsdb1;
SOURCE <path-to-sql-file>;   -- 替换为 .sql 文件完整路径（约需 1 小时）
SHOW TABLES;                  -- 验证导入成功
```

### 4. 常用查询

```sql
-- 列出所有进程服务器
SELECT h.id, h.name, h.ipaddress 
FROM hosts h, processserver ps 
WHERE ps.processserverid = h.id;

-- 列出所有主机（含 CS、PS、受保护 VM）
SELECT id, name, ipaddress FROM hosts;

-- 查找受保护 VM
SELECT id, name, ipaddress FROM hosts WHERE name LIKE '%<VM_NAME>%';

-- 查找某 VM 对应的进程服务器
SELECT sourcehostid, processserverid 
FROM srclogicalvolumedestlogicalvolume 
WHERE sourcehostid = '<HOST_ID>';
```

### 5. 清理

```sql
DROP DATABASE svsdb1;
```
然后卸载 MySQL，删除 `C:\ProgramData\MySQL\MySQL Server 8.0\Data`。

## 对应 Kusto 查询（云端 SRS 数据库）

**获取 Vault Resource ID：**
```kusto
-- Cluster: asradxclusmc.chinanorth2.kusto.chinacloudapi.cn / ASRKustoDB
TelemetryPerVaultInfo 
| where PreciseTimeStamp > ago(1d)
| where SubscriptionId == "<sub>" and VaultArmId contains "<vault-name>"
| distinct ResourceId, VaultArmId
```

**从 ResourceId 获取受保护 VM 列表（含 infrastructureVMID ↔ hostID 映射）：**
```kusto
TelemetryPEToProvider
| where PreciseTimeStamp > ago(1d)
| where SubscriptionId == "<sub>" and ResourceId == "<resource-id>"
| distinct VmId, VmName, HostId
```

**从 Subscription + VaultName 获取所有受保护 VM：**
```kusto
let subscription = "<sub>";
let vaultName    = "<VAULT-NAME>";
SRSShoeboxEvent
| where PreciseTimeStamp > ago(6h)
| where category == "AzureSiteRecoveryReplicatedItems"
| where resourceId contains subscription and resourceId contains vaultName
| extend Json            = parse_json(properties)
| extend hostid          = tostring(Json.id)
| extend VMname          = tostring(Json.name)
| extend processServerName = tostring(Json.processServerName)
| distinct VMname, processServerName, hostid
| sort by hostid asc
```

> 注意：CS 本地数据库使用 `hostID`，SRS 云数据库使用 `infrastructureVMID`，两者 1:1 映射。
