# Storage Account Recovery (Mooncake)

> Source: MCVKB 6.0.1 | Verified: 2025-06-12

## Overview
Procedure to recover deleted ARM storage accounts in Mooncake (21V environment).

## Prerequisites
- Since Jul 2022, customers can recover storage accounts from Azure Portal (preferred method)
- Account deleted >14 days ago cannot be recovered
- Do NOT recreate storage account with the same name before recovery
- Resource group must exist

## Step 1: Confirm Deletion
- `nslookup <account>.blob.core.chinacloudapi.cn` - should fail if deleted
- Check Azure Support Center for deletion record

## Step 2: Gather Details via Kusto
```kql
// ARM activity logs - find deletion record
cluster('armmcadx.chinaeast2.kusto.chinacloudapi.cn').database('armmc').EventServiceEntries
| where PreciseTimeStamp >= datetime(YYYY-MM-DD HH:MM) and PreciseTimeStamp <= datetime(YYYY-MM-DD HH:MM)
| where subscriptionId == "<sub-id>"
| where properties contains "<storage-account-name>"
| where operationName contains "Microsoft.Storage/storageAccounts/delete"
| sort by PreciseTimeStamp asc
| project PreciseTimeStamp, operationName, correlationId, status, subStatus, properties, resourceUri
```

Use **correlationId** to query SRP logs in Jarvis to get **Stamp**, **Region**, and **creation time**.

### Region-Stamp Mapping
| Region | Stamp Prefix |
|--------|-------------|
| chinaeast | SHA2; SHA3 |
| chinanorth | BJB |
| chinaeast2 | SHA20 |
| chinanorth2 | BJS20 |
| chinaeast3 | NTG |
| chinanorth3 | ZQZ |

## Step 3: Submit ICM
- **SEV2**: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=h3R3c1 (21V & CSS)
- **SEV3**: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=g2Qo2A (CSS only)
- Team: xstore/triage
- Note: ICM may be transferred to "xstore/mooncake staging" - manually transfer back to xstore/triage

### Required Information
- Business Reason + CSS Case #
- Subscription ID, Resource Group, Storage Account Name
- Primary Stamp Name, Region
- Account creation time, Deletion time
- Justification: "CSS/WADE lack SRP RestoreStorageAccount JIT permission in Mooncake"

## Step 4: ARM Sync (After PG Restores)
Run ARM Sync in Jarvis Actions: Azure Resource Manager > Resource Synchronization > Synchronize resource state
- Critical: customer can only see ARM resources in portal
- DNS resolution alone does not guarantee portal visibility

## Step 5: Confirm Recovery
Use ASC to verify account appears in ARM.
