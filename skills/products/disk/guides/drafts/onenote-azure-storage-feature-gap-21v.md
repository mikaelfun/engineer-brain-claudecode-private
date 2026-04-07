# Azure Storage Feature Gap: Global vs China (21v)

> Source: OneNote — Mooncake POD Support Notebook > STORAGE > Azure Storage Basic Understanding > Feature Gap
> Last updated: 2025-05-28

## PM Contacts
- Azure Disks PM: azuredisksPM@microsoft.com
- Azure File Share PM: AzureFilesPM@microsoft.com / xsmb@microsoft.com
- XStore features (non-disk): Angshuman Nayak / Eric Spooner

## Storage Account Features

| Feature | Global | China (21v) |
|---------|--------|-------------|
| Advanced Threat Protection | GA (May 2019) | Not available |
| Minimum TLS version | GA (Oct 2020) | GA (Oct 2020) |
| AllowSharedKeyAccess | Private Preview (Aug 2020) | GA |
| AllowBlobPublicAccess | GA (Jul 2020) | GA (Oct 2020) |
| Private Endpoints | GA (Mar 2020) | GA |
| Customer-initiated failover | GA (Jun 2020) | GA (Nov 2020) |
| Storage account recovery via portal | GA (Dec 2020) | GA (Jul 2022) |
| Copy Blob over private endpoints | GA (Jan 2021) | GA |
| Resource instance rules | GA (Sep 2022) | In Preview |
| Prevent Shared Key authorization | GA (May 2021) | Partial |
| Key rotation/Expiration Policies | GA (Jun 2021) | GA |

## Usage Notes
- When customer asks about a feature availability in 21v, check this table first
- For features not listed, check Azure China docs or engage PM
- Feature Gap list is maintained by the POD team; check OneNote for latest updates
