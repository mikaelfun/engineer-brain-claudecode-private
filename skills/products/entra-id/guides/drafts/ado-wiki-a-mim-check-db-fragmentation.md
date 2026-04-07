---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/Troubleshooting/Check DB Fragmentation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FTroubleshooting%2FCheck%20DB%20Fragmentation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# CHECK FOR 30%+ Fragmentation of SQL Databases

## SQL Query

For FIMService

```sql
USE FIMService
GO
SELECT OBJECT_NAME(i.OBJECT_ID) AS TableName,
       OBJECT_NAME(i.OBJECT_ID) AS TableName,
       i.name AS IndexName,
       i.name AS IndexName,
       indexstats.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED') indexstats
INNER JOIN sys.indexes i
ON i.OBJECT_ID = indexstats.OBJECT_ID
WHERE indexstats.avg_fragmentation_in_percent > 30
AND i.index_id = indexstats.index_id
```

For FIMSynchronizationService

```sql
USE FIMSynchronizationService
GO
SELECT OBJECT_NAME(i.OBJECT_ID) AS TableName,
       OBJECT_NAME(i.OBJECT_ID) AS TableName,
       i.name AS IndexName,
       i.name AS IndexName,
       indexstats.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED') indexstats
INNER JOIN sys.indexes i
ON i.OBJECT_ID = indexstats.OBJECT_ID
WHERE indexstats.avg_fragmentation_in_percent > 30
AND i.index_id = indexstats.index_id
```
