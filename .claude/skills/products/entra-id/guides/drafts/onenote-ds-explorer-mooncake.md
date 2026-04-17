# DS Explorer (Mooncake) Guide

## Overview
DS Explorer is an internal tool for querying MSODS directory data in Mooncake/21V. **None of the data collected via DS Explorer can be shared with customer or field team.**

## Access URL
https://dsexplorer.dds.msidentity.cn/company — requires VPN, login with CME account.

## Permission

### CME Account
Mooncake members added to `CME\CSS-MooncakeCME` group already have access.

Additional access: In SAW, login https://oneidentity.core.windows.net with CME account → Create/Modify security group → search `CME\pso-clm_MSODSDSExplorer-Reader` → add your CME account as member → wait for approval. Contact Chris Dodson <cdodson@microsoft.com> if no response.

### AME Account
Need one of the following claims:
- `DSE-CN-PlatformServiceViewer`
- `SFM-CN-PlatformServiceViewer`

## Usage
1. In Search block, input tenant GUID or domain name and search
2. Use **Browse Objects** if you know the object type
3. Use **Search Objects** if you only have object ID

## Source
OneNote: Mooncake POD Support Notebook > Troubleshooting Tools > General Tools > DS Explorer
