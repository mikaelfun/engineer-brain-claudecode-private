# Azure Blob Capacity Calculation Methods

## 1. Portal (Metrics)
- Storage Browser data comes from metrics
- Container count may be inaccurate (known bug, ICM filed)
- Blob count includes system containers ($logs, $blobchangefeed, etc.)

## 2. Storage Explorer
- Manual per-container statistics
- Can enumerate system containers ($log etc.)
- Shows: Active blobs (base), Snapshots (excl. deleted), Versions (excl. deleted), Deleted blobs (includes deleted versions/snapshots/blobs)

## 3. Blob Inventory
- Enumerates all containers automatically, minimum cycle = 1 day
- Capacity sum may exceed Portal if soft delete / versioning enabled
- Paid feature (low cost)

## 4. PowerShell Script
- Cannot enumerate system containers ($log) or deleted containers
- For millions of blobs: may take 4+ hours
- Run from Azure VM to reduce network latency
- Reference script: [AllBlob.ps1](https://github.com/Lickkylee/Azure-Customized-Resources/blob/master/AllBlob.ps1)
- Output includes per-container breakdown: base, version, snapshot, deleted, tier, type

## Key Notes
- Capacity from script/inventory may exceed Portal value when soft delete or versioning is enabled
- Portal metrics = approximation; Inventory/Script = precise enumeration
