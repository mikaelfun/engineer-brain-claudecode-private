---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Files All Topics/Workflows/Managed File Shares/Managed File Shares Overview_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=/SME%20Topics/Azure%20Files%20All%20Topics/Workflows/Managed%20File%20Shares/Managed%20File%20Shares%20Overview_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Managed File Shares (MFS) Overview

> Product is in Preview

## What is MFS?
Top-level Azure resource (Microsoft.FileShares RP) for NFS file shares. Eliminates manual storage account management. Each file share gets a dedicated, hidden storage account.

## Key Features
- Protocol: NFS only (SMB planned post-GA H2 2026)
- Tier: SSD (Premium) only
- Networking: Private Endpoints, Service Endpoints
- Encryption in Transit supported
- Up to 1,000 shares/subscription/region (preview), 10,000 at GA

## How It Works
1. MFS RP pre-provisions a pool of storage accounts
2. Customer requests a file share
3. MFS assigns a pre-provisioned account (fast provisioning)
4. xStore creates the file share
5. Account associated with customer subscription
- Customers interact only with file share resource, not storage accounts

## Limitations (Preview)
- NFS only; no SMB, Azure File Sync, Azure AD, Kerberos
- No firewall integration for NFS
- No REST API for NFS at GA (fast-follow)
- SSD only (no HDD)
- Provisioned model only (no pay-as-you-go)
- No CMK or soft delete until GA
- Cannot access underlying storage accounts

## Roadmap

| Milestone | Date | Features |
|-----------|------|----------|
| Public Preview | Aug 2025 | NFS, PE, Snapshots, Encryption in Transit, Provisioned V2 |
| GA | Mar 2026 | CMK, Soft Delete |
| Post-GA | H2 2026 | SMB, REST API for NFS, OAuth/RBAC |

## ASC
- [ASC Resource Explorer Guide for MFS](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-storage/azure-file-storage/managed-files/managed-files-documentation/guides/asc/mfs-asc-guide)

## Escalation
- [Managed File Share ICM Template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=r17v3U)
