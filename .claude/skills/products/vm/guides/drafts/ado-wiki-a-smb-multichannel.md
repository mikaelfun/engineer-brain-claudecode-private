---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/SMB Multichannel_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/Workflows/SMB%20Multichannel_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SMB Multichannel for Azure Files

## Overview
SMB Multichannel enables SMB 3.x clients to establish multiple network connections to premium file shares. Max 4 channels. No additional cost.

**Since July 2024**: Enabled by default for all newly created storage accounts in select regions. Existing accounts NOT affected.

## Requirements
- Premium file shares (FileStorage account kind) only
- Windows clients with SMB 3.1.1
- Not supported/recommended for Linux clients
- Windows 2012/2012 R2: **NOT SUPPORTED** (data loss bug, Azure Files blocks multichannel)

## Enable/Verify

### Service-side (storage account)
Portal: Storage Account > File shares > File share settings > SMB Multichannel

### Client-side (Windows)
```powershell
Get-SmbClientConfiguration | select EnableMultichannel
```

### Verify multichannel is active
```powershell
Get-SmbMultichannelConnection | fl
# Check MaxChannels and CurrentChannels (should show 4)
```

## Troubleshooting

### 1. Option not visible in Portal
- Check subscription registered for feature
- Check storage account in supported region
- Verify Premium File Storage LRS account

### 2. Multichannel not triggered
- After config changes: unmount, **wait 60 seconds**, remount
- Client OS needs QD >= 8 to trigger; Server OS needs QD >= 1
- Check SMB Client event logs: Application & Services Logs > Microsoft > Windows > SMBClient

### 3. Windows 2012/2012 R2
Known data loss bug. Azure Files blocks multichannel. Client sees "server does not support multichannel". No fix planned. Contact azurefiles@microsoft.com with business justification if needed.

## Performance Guidelines
- Multi-threaded/multiple files: 2x-4x improvement. Enable multichannel.
- Multi-threaded/single file (IO > 16k): Benefits from multichannel.
- Single-threaded: ~10% degradation possible. Consider disabling.
- With multichannel: expect ~60k IOPS (vs ~20k single-channel) for properly sized shares.

### Performance test:
```
diskspd.exe -W300 -C5 -r -w100 -b4k -t8 -o8 -Sh -d60 -L -c2G -Z1G z:\write0.dat ... z:\write9.dat
```

## Optimization Tips
- Colocate storage account and client in same Azure region
- Use multi-threaded applications
- Performance bound by provisioned share size and VM network limits
