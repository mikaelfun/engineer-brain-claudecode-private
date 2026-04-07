---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/Troubleshooting/Check SQL MemorySettings"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FTroubleshooting%2FCheck%20SQL%20MemorySettings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## SQL Server Memory Baseline Triage Script

## Overview

This script provides a **read-only, production-safe baseline health snapshot** of a SQL Server 2019 (15.x) instance supporting **Microsoft Identity Manager (MIM) 2016 SP2**.

It is designed for **initial triage, troubleshooting, and support evidence collection** and does **not** make any configuration or data changes. It is suitable for routine triage, escalation scenarios, and support workflows, and aligns with established MIM SQL troubleshooting practices.

The script uses **only supported SQL Server 2019 DMVs** and avoids deprecated views or dynamic schema logic.

Safe to run during business hours.

---

## Intended Use

- SQL health assessment for MIM environments
- Performance investigations (latency, waits, memory, CPU)
- Microsoft CSS / Support escalation evidence collection
- Baseline comparison prior to remediation

> Diagnostic only - not a tuning or remediation script.

---

## Data Reported

### 1. Instance Identity
- SQL Server version, edition, and engine
- Confirms platform supportability

### 2. Core Server Configuration
- Max / Min Server Memory
- MAXDOP
- Cost Threshold for Parallelism
- Optimize for Ad Hoc Workloads

### 3. Database Sizing
- Total size per **user database** (MB / GB)
- System databases excluded
- Useful for tracking MIM database growth trends

### 4. Data vs. Log Breakdown
- Separates data and log file sizes
- Identifies log growth or recovery model issues
- Relevant to MIM Service and Sync databases

### 5. Memory Utilization
- Top memory clerks by consumption
- Uses SQL Server 2019 supported `pages_kb`
- Highlights dominant consumers (e.g., buffer pool, query memory)

### 6. CPU Scheduler Health
- Scheduler topology overview
- Identifies offline, idle, or imbalanced schedulers

### 7. Wait Statistics Snapshot
- Top cumulative waits since last SQL Server restart
- Identifies trends related to: CPU pressure, Memory pressure, I/O latency, Locking / blocking, Parallelism

### 8. I/O Latency by Database File
- Read / write latency (ms per I/O) for MDF and LDF files
- Uses `sys.dm_io_virtual_file_stats`
- Helps identify storage bottlenecks affecting MIM databases and TempDB

---

## Safety and Compatibility

- No DBCC commands
- No configuration changes
- No deprecated views
- Validated for **SQL Server 2019 (15.x)**
- Suppresses benign warnings and restores session settings
- Safe for production execution

---

## Connecting to SQL Server

### Steps

1. **Log on to the server** using an `sa` account for the SQL Server. You can also log on with NT Authentication using an account with `sa` role.
2. **Launch** SQL Management Studio.
3. **Click on** *Connect to the SQL Server*.
4. **Right-click** on the DB Server name > **New Query**.
5. **Paste the following query** into the query window:

```sql
-- ============================================================
-- Microsoft Identity Manager (MIM) 2016 SP2
-- SQL Server 2019 (15.x) Baseline Triage Script
-- READ-ONLY / Production Safe
-- ============================================================

SET NOCOUNT ON;
SET ANSI_WARNINGS OFF;
GO

-- 0. Instance Identity / Build Verification
SELECT
  @@SERVERNAME AS ServerName,
  CAST(SERVERPROPERTY('ProductVersion') AS nvarchar(50)) AS ProductVersion,
  CAST(SERVERPROPERTY('ProductLevel') AS nvarchar(50)) AS ProductLevel,
  CAST(SERVERPROPERTY('Edition') AS nvarchar(100)) AS Edition,
  CAST(SERVERPROPERTY('EngineEdition') AS int) AS EngineEdition;
GO

-- 1. Core Server Configuration (Memory / CPU Baseline)
SELECT
  name AS ConfigurationName,
  value AS ConfiguredValue,
  value_in_use AS EffectiveValue,
  description
FROM sys.configurations
WHERE name IN (
  'max server memory (MB)',
  'min server memory (MB)',
  'max degree of parallelism',
  'cost threshold for parallelism',
  'optimize for ad hoc workloads'
)
ORDER BY name;
GO

-- 2. Database Size Summary (User Databases Only)
SELECT
  d.name AS DatabaseName,
  CAST(SUM(mf.size) * 8.0 / 1024 AS decimal(12,2)) AS TotalSize_MB,
  CAST(SUM(mf.size) * 8.0 / 1024 / 1024 AS decimal(12,2)) AS TotalSize_GB
FROM sys.master_files AS mf
JOIN sys.databases AS d
  ON d.database_id = mf.database_id
WHERE d.database_id > 4
GROUP BY d.name
ORDER BY d.name;
GO

-- 3. Data vs Log Breakdown
SELECT
  d.name AS DatabaseName,
  CAST(SUM(CASE WHEN mf.type_desc = 'ROWS' THEN mf.size ELSE 0 END) * 8.0 / 1024 AS decimal(12,2)) AS Data_MB,
  CAST(SUM(CASE WHEN mf.type_desc = 'LOG' THEN mf.size ELSE 0 END) * 8.0 / 1024 AS decimal(12,2)) AS Log_MB,
  CAST(SUM(mf.size) * 8.0 / 1024 AS decimal(12,2)) AS Total_MB
FROM sys.master_files AS mf
JOIN sys.databases AS d
  ON d.database_id = mf.database_id
WHERE d.database_id > 4
GROUP BY d.name
ORDER BY d.name;
GO

-- 4. Top Memory Clerks (SQL Server 2019)
SELECT TOP (20)
  mc.type,
  mc.name,
  CAST(SUM(mc.pages_kb) / 1024.0 AS decimal(12,2)) AS Pages_MB
FROM sys.dm_os_memory_clerks AS mc
GROUP BY mc.type, mc.name
ORDER BY Pages_MB DESC;
GO

-- 5. Scheduler / CPU Topology
SELECT
  parent_node_id,
  scheduler_id,
  cpu_id,
  status,
  is_online,
  is_idle
FROM sys.dm_os_schedulers
WHERE scheduler_id < 255
ORDER BY parent_node_id, scheduler_id;
GO

-- 6. Wait Statistics Snapshot
SELECT TOP (30)
  wait_type,
  waiting_tasks_count,
  wait_time_ms,
  signal_wait_time_ms,
  (wait_time_ms - signal_wait_time_ms) AS resource_wait_time_ms
FROM sys.dm_os_wait_stats
WHERE wait_type NOT LIKE 'SLEEP%'
ORDER BY wait_time_ms DESC;
GO

-- 7. I/O Latency by Database File (MDF / LDF)
SELECT
  DB_NAME(vfs.database_id) AS DatabaseName,
  mf.type_desc AS FileType,
  mf.physical_name,
  vfs.num_of_reads,
  CAST(
    CASE
      WHEN vfs.num_of_reads = 0 THEN 0
      ELSE vfs.io_stall_read_ms * 1.0 / vfs.num_of_reads
    END AS decimal(10,2)
  ) AS Read_ms_per_IO,
  vfs.num_of_writes,
  CAST(
    CASE
      WHEN vfs.num_of_writes = 0 THEN 0
      ELSE vfs.io_stall_write_ms * 1.0 / vfs.num_of_writes
    END AS decimal(10,2)
  ) AS Write_ms_per_IO
FROM sys.dm_io_virtual_file_stats(NULL, NULL) AS vfs
JOIN sys.master_files AS mf
  ON mf.database_id = vfs.database_id
 AND mf.file_id = vfs.file_id
ORDER BY Read_ms_per_IO DESC, Write_ms_per_IO DESC;
GO

SET ANSI_WARNINGS ON;
GO
```

### Results

1. **Take a screenshot** of the results.
2. Continue your troubleshooting and analysis.

---

## Interpretation Notes

- Wait statistics and I/O latency are **cumulative since last SQL Server restart**
- High buffer pool memory usage is expected and not inherently a problem
- Latency values reflect **historical pressure**, not necessarily current activity
- Results should be correlated with: MIM synchronization cycles, SQL error logs, Windows performance counters, MIM Service and Sync logs

## Follow-Up Analysis (Out of Scope)

- Blocking chain analysis
- Active request inspection
- TempDB allocation contention (PAGELATCH_UP / GAM / SGAM)
- Query-level memory grant analysis
