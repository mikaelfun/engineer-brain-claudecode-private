# CN1/CE1 CosmosDB Cross-Region Migration via Geo-Replication Failover

**Source**: OneNote — CN1/CE1 Migration 防坑指南 - CosmosDB Migration Guide (PG Approved)
**Status**: draft

## Overview
For Cosmos DB accounts in CN1/CE1, use built-in geo-replication for zero data loss, zero downtime migration.

## Prerequisites
- Confirm current region configuration
- Identify target region (CN3 or CE3 recommended)

## Steps

### Step 1: Add a Non-CN1/CE1 Region
- Portal → Cosmos DB → Replicate data globally → + Add region → select CN3
- **Wait for AddRegion operation to complete before proceeding**

### Step 2: Failover Write Region
- Replicate data globally → Change write region → select new region
- Confirm this is NOT during a service outage

### Step 3: Remove CN1/CE1 Regions
- Replicate data globally → trash icon next to CN1/CE1
- **For single-region accounts**: must complete Step 1 + 2 before removing old region

## Verification
1. Verify region configuration (write region is target)
2. Verify database connection by querying data
3. Verify all dependent applications

## References
- [Relocate Azure Cosmos DB NoSQL](https://docs.azure.cn/en-us/azure-resource-manager/management/relocation/relocation-cosmos-db)
- [Add/remove regions](https://docs.azure.cn/en-us/cosmos-db/how-to-manage-database-account#addremove-regions-from-your-database-account)
