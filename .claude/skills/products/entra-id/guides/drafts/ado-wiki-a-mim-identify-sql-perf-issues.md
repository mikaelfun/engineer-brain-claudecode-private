---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/Troubleshooting/Identify SQL perf issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FTroubleshooting%2FIdentify%20SQL%20perf%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Identifying and Diagnosing SQL Server Performance Problems in Microsoft Identity Manager (MIM) 2016

---

## Purpose
This article documents proven SQL diagnostic queries and methodologies to identify and analyze performance bottlenecks in the MIM Service and MIM Synchronization Service databases. It is designed for escalation engineers, field engineers, and administrators who need to troubleshoot MIM latency, job stalls, or degraded performance during nightly maintenance windows.

---

## Overview
The MIM Service and Sync engines are highly dependent on SQL Server for all transactional state, workflow processing, and reporting. When performance degrades, the issue often lies not within the MIM binaries themselves, but in SQL resource contention - commonly due to:

- Memory pressure or suboptimal server-level settings
- Index fragmentation and stale statistics
- I/O latency on MDF or TempDB
- Blocking and excessive waits during maintenance jobs
- Poor query plans due to parameter sniffing or missing stats

---

## 1. Server-Level Configuration & Resource Posture

```sql
-- Core server knobs
SELECT name, value, value_in_use
FROM sys.configurations
WHERE name IN (
 'max server memory (MB)',
 'min server memory (MB)',
 'cost threshold for parallelism',
 'max degree of parallelism',
 'optimize for ad hoc workloads',
 'backup checksum default'
)
ORDER BY name;

-- Database file sizes (excludes system dbs)
SELECT d.name,
       ROUND(SUM(CAST(mf.size AS bigint)) * 8 / 1024.0, 0) AS Size_MB,
       CAST(SUM(CAST(mf.size AS bigint)) * 8 / 1024.0 / 1024.0 AS DECIMAL(10,2)) AS Size_GB
FROM sys.master_files AS mf
JOIN sys.databases    AS d ON d.database_id = mf.database_id
WHERE d.database_id > 4
GROUP BY d.name
ORDER BY d.name;

-- Memory clerks
SELECT TOP(20) mc.type, mc.name, SUM(mc.pages_kb) AS pages_kb
FROM sys.dm_os_memory_clerks AS mc
GROUP BY mc.type, mc.name
ORDER BY SUM(mc.pages_kb) DESC;

-- NUMA and scheduler overview
SELECT parent_node_id, status, is_online, scheduler_id, cpu_id
FROM sys.dm_os_schedulers
WHERE scheduler_id < 255
ORDER BY parent_node_id, scheduler_id;

-- Page Life Expectancy (PLE)
SELECT object_name, counter_name, instance_name, cntr_value AS PLE
FROM sys.dm_os_performance_counters
WHERE counter_name = 'Page life expectancy';
```

### Interpretation
- **Max/Min Memory:** Leave ~4-6 GB free for OS and other services.
- **Cost Threshold for Parallelism (CTFP):** Start at 40-50; higher values reduce unnecessary parallelism.
- **MAXDOP:** Set to the number of cores per NUMA node, capped at 8.
- **Ad-hoc optimization:** Should be ON.
- **Page Life Expectancy:** Below 300 per NUMA node may indicate memory churn.

---

## 2. Disk I/O Latency and File Throughput

```sql
WITH io AS (
  SELECT DB_NAME(mf.database_id) AS db_name,
         mf.type_desc,
         mf.physical_name,
         vfs.num_of_reads,
         vfs.io_stall_read_ms,
         vfs.num_of_writes,
         vfs.io_stall_write_ms,
         vfs.num_of_reads + vfs.num_of_writes AS total_io
  FROM sys.dm_io_virtual_file_stats(NULL, NULL) AS vfs
  JOIN sys.master_files AS mf
    ON mf.database_id = vfs.database_id AND mf.file_id = vfs.file_id
)
SELECT db_name, type_desc, physical_name,
       CASE WHEN num_of_reads  > 0 THEN (1.0*io_stall_read_ms  / num_of_reads)  ELSE 0 END AS read_ms_per_io,
       CASE WHEN num_of_writes > 0 THEN (1.0*io_stall_write_ms / num_of_writes) ELSE 0 END AS write_ms_per_io,
       total_io
FROM io
ORDER BY read_ms_per_io DESC, write_ms_per_io DESC;
```

### Interpretation
- **<10 ms per read/write:** Excellent
- **10-20 ms:** Acceptable
- **>20 ms sustained:** Likely bottleneck

---

## 3. Index Fragmentation and Statistics Posture

```sql
USE FIMService;
SELECT
  sch.name AS [Schema],
  tbl.name AS [Table],
  ix.name  AS [Index],
  ips.page_count,
  ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'SAMPLED') ips
JOIN sys.indexes ix   ON ix.object_id = ips.object_id AND ix.index_id = ips.index_id
JOIN sys.tables tbl   ON tbl.object_id = ips.object_id
JOIN sys.schemas sch  ON sch.schema_id = tbl.schema_id
WHERE ips.page_count > 1000
ORDER BY ips.avg_fragmentation_in_percent DESC;
```

### Guidance
- **10-30%:** Reorganize
- **>30%:** Rebuild (off-hours)
- After major data churn, run: `EXEC sp_updatestats;`

---

## 4. SQL Agent Job Duration Trends

```sql
SELECT
  j.name AS JobName,
  CONVERT(datetime, STUFF(STUFF(CAST(h.run_date AS char(8)),7,0,'-'),5,0,'-')) AS RunDate,
  TIMEFROMPARTS(h.run_time/10000, (h.run_time%10000)/100, h.run_time%100, 0, 0) AS RunTime,
  TIMEFROMPARTS(h.run_duration/10000, (h.run_duration%10000)/100, h.run_duration%100, 0, 0) AS RunDuration
FROM msdb.dbo.sysjobhistory h
JOIN msdb.dbo.sysjobs j ON h.job_id = j.job_id
WHERE h.step_id = 0
  AND j.name LIKE 'FIM_%'
ORDER BY RunDate DESC, RunTime DESC;
```

---

## 5. Blocking and Waits Analysis

```sql
SELECT
  r.session_id,
  r.blocking_session_id,
  r.status,
  r.wait_type,
  r.wait_time,
  r.wait_resource,
  DB_NAME(r.database_id) AS db_name,
  r.command,
  s.host_name,
  s.program_name,
  s.login_name,
  t.text AS sql_text
FROM sys.dm_exec_requests r
JOIN sys.dm_exec_sessions s ON s.session_id = r.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE r.session_id <> @@SPID
ORDER BY r.blocking_session_id DESC, r.wait_time DESC;
```

---

## 6. Top Resource-Consuming Queries

```sql
SELECT TOP(20)
  qs.total_worker_time/1000.0 AS total_cpu_ms,
  qs.execution_count,
  (qs.total_worker_time/1000.0)/NULLIF(qs.execution_count,0) AS avg_cpu_ms,
  DB_NAME(st.dbid) AS db_name,
  SUBSTRING(st.text, (qs.statement_start_offset/2)+1,
            CASE WHEN qs.statement_end_offset = -1
                 THEN LEN(CONVERT(nvarchar(MAX), st.text)) - (qs.statement_start_offset/2) + 1
                 ELSE (qs.statement_end_offset - qs.statement_start_offset)/2 + 1 END) AS stmt_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY total_cpu_ms DESC;
```

---

## 7. TempDB and Contention Health

```sql
-- Tempdb latch waits
SELECT wait_type, waiting_tasks_count, wait_time_ms
FROM sys.dm_os_wait_stats
WHERE wait_type LIKE 'PAGELATCH_%'
ORDER BY wait_time_ms DESC;

-- Tempdb file info
SELECT name, type_desc, physical_name, size*8/1024 AS size_mb
FROM tempdb.sys.database_files
ORDER BY type_desc, name;
```

### Best Practices
- Create 1 data file per logical core (up to 8), equal sizes.
- Place TempDB on fastest storage.

---

## 8. Maintenance Recommendations

| Task                     | Frequency       | Command / Notes                      |
|--------------------------|---------------|--------------------------------------|
| Index rebuild / reorg    | Weekly        | ALTER INDEX ... REBUILD or REORGANIZE|
| Update statistics        | Weekly        | EXEC sp_updatestats;                |
| DBCC CHECKDB             | Monthly       | Validate consistency                |
| Review wait stats        | During issue  | Delta capture                       |
| Review Agent job durations| Weekly       | Detect degradation trends           |

---

## 9. Quick Reference: Key Performance Signals

| Symptom                          | Likely Root Cause                  | Diagnostic Area |
|---------------------------------|------------------------------------|-----------------| 
| Jobs running longer nightly     | Index fragmentation or stale stats | Section 3       |
| Frequent blocking between workflows| Missing indexes or poor plans    | Section 5       |
| Server CPU > 80% during hierarchy calc| Parallelism too low or hot query| Section 1 / 6   |
| SQL waits dominated by PAGEIOLATCH_*| Disk latency                     | Section 2       |
| TempDB spikes                   | PAGELATCH contention or undersized files| Section 7 |

---

## 10. Summary
MIM's SQL workload pattern is transactional, metadata-heavy, and sensitive to schema fragmentation. Most "MIM slowness" incidents trace back to:

- SQL configuration drift
- Fragmented or outdated index/statistics posture
- Disk contention (often on TempDB or reporting DBs)
- Unbounded parallelism or low CTFP
- Nightly job overlap between Sync and Service DBs

By running the above diagnostics systematically and trending results, you can isolate performance degradation within minutes.
