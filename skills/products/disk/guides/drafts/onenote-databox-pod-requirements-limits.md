# Data Box POD Requirements and Limits Reference

> Source: OneNote — Mooncake POD Support Notebook / Data Box POD / Requirements and limits
> Quality: guide-draft (pending SYNTHESIZE review)

## Supported Client OS

| OS | Versions | Notes |
|---|---|---|
| Windows Server | 2016 RS1+, 2019 RS5+ | Earlier editions: RoboCopy `/B` mode can't copy ADS/EA ACL files |
| Windows | 7, 8, 10 | — |
| Linux | — | — |

## Supported Transfer Protocols

| Protocol | Versions | Notes |
|---|---|---|
| SMB | 3.0, 2.0 | — |
| NFS | Up to 4.1 | AIX host with IBM DB2 Export tool NOT supported |

## Storage Account Support Matrix (Import)

| Account Type | Block Blob | Page Blob | Azure Files | Access Tiers |
|---|---|---|---|---|
| Classic Standard | ✅ | ✅ | ✅ | — |
| GPv1 Standard | ✅ | ✅ | ✅ | Hot, Cool |
| GPv1 Premium | ❌ | ✅ | ❌ | — |
| GPv2 Standard | ✅ | ✅ | ✅ | Hot, Cool |
| GPv2 Premium | ❌ | ✅ | ❌ | — |
| Premium FileStorage | ❌ | ❌ | ✅ | — |
| Blob Storage Standard | ✅ | ❌ | ❌ | Hot, Cool |

## Key Caveats

- **Import**: Does NOT support Queue, Table, Disk storage types
- **Export**: Does NOT support Queue, Table, Disk, ADLS Gen2
- **Append blobs**: NOT supported
- **NFS 3.0 protocol in Azure Blob**: NOT supported
- **Page blobs**: Must be 512-byte aligned (e.g. VHDs)
- **Export limit**: Max 80 TB per order
- **Archive blobs**: Must rehydrate to hot/cool before export
- **File history/blob snapshots**: NOT exported
- **ADLS Gen2**: Supported for import only, NOT export
