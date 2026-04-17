---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Administration (Provisioning & RBAC)/Purview Upgrade and Migration/Migration from Managed Storage to Ingestion Storage"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FPurview%20Upgrade%20and%20Migration%2FMigration%20from%20Managed%20Storage%20to%20Ingestion%20Storage"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Migration from Managed Storage to Ingestion Storage

Author: Yazan Abu Sair

## Background

- Accounts created **before Dec 15, 2023**: Blob/Queue private endpoints linked to **managed storage account** (visible in Azure portal).
- Accounts created **after Dec 15, 2023** (or API version 2023-05-01-preview+): Blob/Queue private endpoints linked to **ingestion storage** (hosted in Microsoft internal tenant, not visible to customers).

## FQDN Change

Old (managed storage): `<StorageAccountName>.blob.core.windows.net` / `.queue.core.windows.net`
New (ingestion storage): `ingestioneus2eastusksqky.z29.blob.storage.azure.net`

## Migration Process

Migration is conducted by the **platform team** (not self-service).

### Important
- Small downtime during migration (handled by PG)
- Additional downtime post-migration if using private endpoints / managed VNet IR / SHIR with proxy
- Portal access NOT affected

### Preparation Checklist
Gather for each Purview account:
1. Screenshot from networking settings
2. Screenshot from networking private endpoint
3. Screenshot from networking ingestion private endpoint
4. Types of Integration Runtime used in scans (Autoresolve/Managed VNet/SHIR)
5. Whether proxy is used with SHIR + bypass list config
6. Whether domain whitelisting is done on customer firewall
7. ADF/Synapse connection details to Purview for lineage

### Post-Migration Steps
- Managed VNet IR → recreate and update all scans
- Recreate existing ingestion private endpoints
- Recreate ADF/Synapse ingestion private endpoints from ADF/Synapse side
- SHIR proxy bypass list → update system files with new FQDN
- Update firewall rules for new FQDN

### DNS Zones
Ingestion PE remains in same private DNS zone: `privatelink.blob.core.windows.net` and `privatelink.queue.core.windows.net`

### Limitation
Synapse with Data Exfiltration Protection (DEP) enabled will NOT work with ingestion private endpoint.
