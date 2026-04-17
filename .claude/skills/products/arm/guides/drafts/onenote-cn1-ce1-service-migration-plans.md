# CN1/CE1 Service Migration Plans

**Source**: OneNote — CN1/CE1 Migration 防坑指南 - Migration Plan - Service Related
**Status**: draft
**Contact**: Frances.hu@microsoft.com (first contact before reaching PG)

## Event Hub
- **Option 1**: Delete + recreate namespace (no rollback, offset resets to 0)
- **Option 2**: PG internal namespace move feature (PoC, keeps metadata + SAS Key + offset)
- PG Contact: Hiu-Ming.Eric.Lam@microsoft.com, PM: aschhabria@microsoft.com

## Service Bus
- **Option 1**: Standard→Premium migration (keeps metadata, no endpoint change; cannot downgrade after)
- **Option 2**: Delete + recreate (no rollback)
- **Option 3**: Standard cross-region replication (under development)
- PG Contact: skarri@microsoft.com, PM: egrootenboer@microsoft.com

## Storage Account
- **Option 1**: ADF/AzCopy traditional copy
- **Option 2**: PG backend cross-region migration (minimal customer impact, LRS only, ~100TB/month)
- PG Contact: Graham.Tiplady@microsoft.com

## IoT Hub
- Export + Import IoTHub (delete old hub to preserve connection string)
- Performance: S3 tier, 1M devices import in ~10 minutes
- PG Contact: Sandeep.Pujar@microsoft.com

## SQL Database
- See dedicated SQL Migration Guide (Active Geo-Replication)
- Downtime ~5 seconds for empty databases

## ContainerApps
- Only rebuild option available
- VNET Integration: no Resource Mover support
- PG Contact: bowan@microsoft.com

## VM
- Use AzCopy or ASR for migration
