---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/HostNode Technology/HostNode Error List_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FHostNode%20Technology%2FHostNode%20Error%20List_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags: [hostnode, error-codes, facility-codes, nodeservice, vmal, dal, blobcache, xdisk, xfe, ntstatus]
---

# [How It Works] HostNode Error Code List

## Introduction

When troubleshooting host node internal errors, error codes are composed of multiple parts (NTSTATUS structure). Reference:
- [Windows Error Code Introduction](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-erref/fbcc63c9-b0e3-40e5-b1ef-4e47880637d1)
- [NTSTATUS Structure](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-erref/87fba13e-bf06-450e-83b1-9241dc81e781)

## Source Code Access

Access to source code is limited to senior Microsoft engineers (EEs/SEEs/TAs) who are full-time employees. Others require a valid business justification.
- Policy: [Business Rule: Source Code Access](https://internal.evergreen.microsoft.com/en-us/topic/e0b6caeb-555c-f72a-a72a-ef8c4397e9e4)
- Permissions: [Azure DevOps Access Policy](https://aka.ms/azaccess)

> ⚠️ Do NOT copy/paste source code into case notes, ICM, or other systems.

## Error Code List (Facility Codes)

| Component | Facility Code | Source File Link |
|-----------|--------------|-----------------|
| **NodeService** | `0x154` — FACILITY_NODESERVICE_PROVIDER | [FabricError.mc](https://msazure.visualstudio.com/One/_git/Compute-Fabric-HostAgent?path=%2Fsrc%2Flib%2FFabricError%2FFabricError.mc) |
| **VMAL** | `0x351` — FACILITY_RDOS_VMAL_VM | [VmalErrors.mc](https://msazure.visualstudio.com/One/_git/Compute-Fabric-HostAgent?path=%2Fsrc%2FOS%2FVmal%2FVMALErrors%2FVmalErrors.mc) |
| **DAL** (Disk Abstraction Layer) | `0x356` — FACILITY_DISK_ABSTRACTION_LAYER | [DALError.mc](https://msazure.visualstudio.com/One/_git/Azure-Compute-Datapath?path=%2Fsrc%2FDiskAbstractionLayer%2FErrors%2FDalErrors.mc) |
| **BlobCache** | `0xABC` | [BlobCacheApi.h](https://msazure.visualstudio.com/One/_git/Azure-Compute-Datapath?path=%2Fsrc%2Fblobcache%2Fapi%2Fdll%2FBlobCacheApi.h) |
| **XDisk** | `0x170` — FACILITY_XDISK | [ntvhd.h](https://msazure.visualstudio.com/One/_git/Azure-Compute-Datapath?path=%2Fsrc%2Fvhddisk%2Fpublished%2Fntvhd.h) |
| **XFE** | `0x30B` — FACILITY_XFE | [XfeErrorsDef.h](https://msazure.visualstudio.com/One/_git/Storage-XStore?path=%2Fsrc%2Fbase%2FXfeNativeError%2Finc%2FXfeErrorsDef.h) |

## How to Use

1. Identify the **Facility Code** from the NTSTATUS value in the error.
2. Match it to the component table above.
3. Look up the specific error code in the corresponding source file (requires source code access).
4. Escalate to **EEE Host Node** with the error code and component identified.
