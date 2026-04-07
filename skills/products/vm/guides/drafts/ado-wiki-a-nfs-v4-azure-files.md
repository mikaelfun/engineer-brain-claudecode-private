---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/Network File System (NFS)/NFS v4 for Azure Files_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/Workflows/Network%20File%20System%20(NFS)/NFS%20v4%20for%20Azure%20Files_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# NFS v4.1 for Azure Files - Comprehensive Guide

## NFS v4.1 Public Endpoint Maintenance Window (Active)

Storage engineering is conducting hardware upgrades. NFS shares on public endpoints face permanent disconnection during migration (unlike SMB which auto-recovers).

**Deadline: August 16, 2025** - customers must act or accounts migrated regardless.

### Options:
1. **Private Endpoint** (preferred): Remount via PE before maintenance. Static IP, transparent during future upgrades. Note: [pricing implications](https://azure.microsoft.com/en-us/pricing/details/private-link/).
2. **Schedule Downtime**: Submit [form](https://forms.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbRz4YEihHKohAswU-gK8j5O9URVVHR1NLTVkyT0JaWUU4UUFJSkxXRVhUTi4u) for weekend maintenance window.

### Kusto: Check public/private endpoint usage
Use the Kusto query from the wiki to determine if customer uses public endpoints, private endpoints, or both.

## Overview
NFS 4.1 with full POSIX semantics on Premium FileStorage accounts. Linux clients only. Port 2049 only.

## Limitations
- Optional NFS 4.1 features not supported (delegations, Kerberos auth/encryption)
- Metadata-heavy workloads have higher latency
- Does not support Storage Explorer < v1.41.0, Data Box, or AzCopy (use rsync/fpsync)
- Windows NFS client NOT supported
- Premium tier only (LRS and ZRS)
- No multi-protocol (share is either NFS or SMB, not both)
- Numeric UID/GID only (disable ID mapping)

## Prerequisites
- Premium FileStorage storage account
- Private endpoint OR restricted public endpoint
- Secure transfer DISABLED (required for NFS)
- Microsoft.Storage/AllowNfsFileShares registered on subscription

## Networking
- Port: 2049 only (no portmap needed)
- Supported: Private Endpoint, Azure VPN (P2S/S2S), ExpressRoute, Restricted Public Endpoint
- Verify PE: `nslookup <storage>.file.core.windows.net` should return privatelink FQDN + private IP

## Mount

### Install NFS client
```bash
# Debian/Ubuntu
sudo apt update && sudo apt install nfs-common
# CentOS/RHEL
sudo yum install nfs-utils
```

### Mount command
```bash
sudo mkdir -p /mnt/<sa>/<share>
sudo mount -t nfs <sa>.file.core.windows.net:/<sa>/<share> /mnt/<sa>/<share> -o vers=4,minorversion=1,proto=tcp,sec=sys
```

### Permanent mount (fstab)
```
<sa>.file.core.windows.net:/<sa>/<share> /mnt/<sa>/<share> nfs vers=4,minorversion=1,proto=tcp,sec=sys 0 0
```

## Common Mount Errors

### Access Denied
1. Secure transfer enabled -> Disable it
2. VNET not whitelisted in storage firewall -> Add VNET
3. Parallel public+private mount -> Choose one

### Connection Timed Out
- Port 2049 blocked -> Check NSG/firewall
- Share doesn't exist -> Verify share name

### Remote I/O Error
- Share is SMB not NFS -> Verify share type in ASC

### Bad Option
- NFS client not installed -> Install nfs-common/nfs-utils

### NFS Version Not Supported
- Private endpoint DNS misconfigured -> Verify nslookup returns correct PE IP

### Stale File Handle
- Key vault deleted with CMK -> Recover KV or copy data

### Heavy Load Errors
- Worker thread exhaustion -> Escalate to PG via ICM

## rsync chown Invalid Argument (22)
NFS v4 sends alphanumeric UID/GID. Disable ID mapping:
```bash
echo "options nfs nfs4_disable_idmapping=1" > /etc/modprobe.d/99-nfs.conf
# Or on-the-fly:
echo 1 > /sys/module/nfs/parameters/nfs4_disable_idmapping
```

## Performance
- Based on provisioned share size (IOPS/throughput proportional to GiB)
- When throttled: check [CSS Wiki for storage performance](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495816)
- Metadata-heavy workloads have inherently higher latency

## Data Transfer
- AzCopy not supported for NFS
- Use cp, rsync, or fpsync for migration
- fpsync recommended for Linux file server migration

## Storage Explorer (v1.41.0+)
Full NFS support: transfer between NFS/SMB shares, preserve symlinks, view POSIX properties.

## Escalation
- Teams: Azure OneVM > STG - Files All topics (AVA)
- Email: NFSCSS@microsoft.com
- NFS cases discussed in daily NA Files FDR calls
