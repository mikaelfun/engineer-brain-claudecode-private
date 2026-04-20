---
title: Azure Managed Disks FAQ - Key Facts for Troubleshooting
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/azure-iaas-vm-disks-managed-unmanaged
product: vm
21vApplicable: true
---

# Azure Managed Disks FAQ - Key Facts for Troubleshooting

## Managed vs Unmanaged Disks
- Cannot mix managed and unmanaged disks on the same VM or in an availability set
- Managed Disks is the default in Azure portal
- Unmanaged disks still supported but managed recommended for new workloads

## Disk Size & Pricing
- Charged by provisioned capacity, not actual data size
- Resizing up supported, shrinking NOT supported
- Cannot break a lease on a disk (prevents accidental deletion)
- Max 50,000 managed disks per region per disk type per subscription

## Ultra Disks Limitations
- Data disks only (cannot be OS disk)
- No caching support (set to None)
- No snapshots
- No Azure Backup support
- No availability set support
- No Azure Site Recovery support
- Cannot convert existing disk to ultra disk

## Host Caching
- Supported only on disks < 4 TiB (up to 4095 GiB)
- Disks >= 4096 GiB do NOT support host caching

## GPT Partitioning
- Gen1 VMs: GPT only on data disks, OS must use MBR (max 2 TiB usable for OS)
- Gen2 VMs: GPT supported on both OS and data disks, up to 4 TiB OS disk

## Migration to Managed Disks
- Background copy may cause higher read latency (up to 24h)
- No effect on write latency
- Azure Backup and Site Recovery continue to work after migration
- Cannot create managed disk from page blob snapshot taken before migration

## Disk Reservations
- 1-year term, Premium SSD only (P30-P80)
- Region + SKU specific, cannot share across regions
- Reservation is per disk count, not capacity
