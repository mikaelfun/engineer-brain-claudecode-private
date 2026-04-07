# Azure SQL Database Cross-Region Migration via Active Geo-Replication

**Source**: OneNote — CN1/CE1 Migration 防坑指南 - SQL Migration Guide
**Status**: draft

## Overview
Use Active Geo-Replication for online migration with near-zero data loss. Creates async readable secondary in target region, then promotes it.

## Prerequisites
- Source and target SQL Servers in respective regions
- Compatible service tiers
- Network connectivity (firewall/PE)
- Contributor or SQL Server Contributor role
- Mooncake: `az cloud set --name AzureChinaCloud`

## Step-by-Step

### 1. Establish Active Geo-Replication
```sql
-- Verify replication status (on SOURCE)
SELECT partner_server, replication_state_desc, replication_lag_sec
FROM sys.dm_geo_replication_link_status;
```
Wait until `replication_state_desc = CATCH_UP` and `replication_lag_sec` consistently low.

### 2. Sync Server-Level Logins (SID Matching)
**Critical**: Geo-replication does NOT copy server-level Logins.
```sql
-- Export logins with SIDs (on SOURCE master)
SELECT sp.name, CONVERT(VARCHAR(MAX), sp.sid, 1) AS sid_hex,
  'CREATE LOGIN [' + sp.name + '] WITH PASSWORD = ''<ChangeMe>'', SID = ' + CONVERT(VARCHAR(MAX), sp.sid, 1) + ';'
FROM sys.sql_logins sp
WHERE sp.name NOT LIKE '##%' AND sp.name NOT LIKE 'CloudSA%' AND sp.name <> 'sa';
```
Execute generated scripts on TARGET. For Entra ID: ensure same admin configured.

### 3. Stop Application & Terminate Sessions

### 4. Confirm Replication Caught Up
**Do NOT proceed until `replication_lag_sec = 0`**. Check 2-3 times.

### 5. Set Source READ_ONLY
```sql
ALTER DATABASE [YourDatabase] SET READ_ONLY WITH ROLLBACK IMMEDIATE;
```

### 6. Break Geo-Replication (Promote Secondary)
**Irreversible** — ensure lag = 0 and source is read-only.
```bash
az sql db replica set-primary --name <DB> --resource-group <TargetRG> --server <TargetServer>
```

### 7. Verify Data Integrity
Row count comparison + write test on new primary.

### 8. Update Connection Strings
```
# Before: tcp:<SourceServer>.database.chinacloudapi.cn,1433
# After:  tcp:<TargetServer>.database.chinacloudapi.cn,1433
```
Update: appsettings, Key Vault, App Service env vars, CI/CD, ETL tools.
If using PE: create PE for target server + update Private DNS Zone.

### 9. Validation & Decommission
Keep original 1-2 weeks. Deleted DBs recoverable within retention period.

## Rollback
- **Before breaking replication**: set source READ_WRITE, restart app with original conn strings, delete replica
- **After breaking**: create new geo-replication target→source, re-sync, break, revert
