---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Processes/Mapping for Purview Components at ICM"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FProcesses%2FMapping%20for%20Purview%20Components%20at%20ICM"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Mapping for Purview Components at ICM

## Note to CSS
AVA configuration is ongoing and some teams are not properly configured yet. Please reach your local EEE for help.

Copilot for DFM can be used to help find EM and PM for escalations.

## Classic Data Governance Experience

| Purview Team Map | IcM Owning Team | Component | PM | EM |
|---|---|---|---|---|
| Platform - Data Map | Security Platform Data Map\Data Map | Asset Updates, Assets Not Found, Duplicate Assets, Orphaned Assets, Lineage, Search, SDK/API in DataMap | | Sudheer |
| Platform - Ingestion | Purview Data Map\Data Map | Ingestion | pragyarathi | Sudheer Kumar |
| Platform - Integration Runtime | Kubernetes Runtime / WorkloadInfra | K8s SHIR, VNET IR V2, AWS IR, Managed PE and VNet | pragyarathi | hapal |
| Platform - Atlas Classification | Security Platform (Purview)/Classification | Custom Classifications (deprecated, use SITs) | vlrodrig | vimitta/subrahmanyam |
| Apps - Share | Azure Data Share | Data Share | sidontha | faisalaltell |
| Platform - Provisioning | MSG Tenant Provisioning | ADF/Synapse Lineage, Account Provisioning, Private Endpoint/VNET, Unified Portal quota | | Prateek Jain |
| Platform - Authorization | Sentinel Graph Gateway/Authorization | Collections, Access Control/RBAC, Unified Portal Domain | Sujith Narayanan / Amy Dang | Sharmadha Moorthy |
| Platform - Offline Tier | Security Platform (Purview)/Offline Tier | Resource Sets, Path Normalization, Deleted items | sidontha | nayenama |
| Platform - Labeling | Security Platform (Purview)/Analytics | Sensitivity Labeling | tothemel | piyug |
| Apps - Insights | Data Governance/Insights | Map & Discover, Classification/Labeling Reports, Data Estate Insights | mannan | dlacy/dubhatt |

## Data Security & Data Governance

| Purview Team Map | IcM Owning Team | Component | PM | EM |
|---|---|---|---|---|
| Apps - Data Quality | Purview Data Governance/Data Quality | Data Quality | mannan | dlacy |
| Apps - Discovery/Search | Purview Data Governance/Data Catalog/Management | Discovery, Understanding | sidontha | dlacy |
| Apps - Curation | Purview Data Governance/Data Catalog/Management | Biz Domains, Data Products, Glossary, OKRs, CDEs | sidontha/nayenama | dlacy |
| Apps - MDM | Purview Data Governance/Data Catalog/Management | MDM via 3p plugins | mannan | dlacy |
| Apps - Data Access | Purview Data Governance/Data Catalog/Management | Access | sidontha | dlacy |
| Apps - DEH | Purview Data Governance/Data Estate Health | DEH, Lineage | mannan | dlacy |
| Apps - Roles & Permissions | | Roles, Permissions | nidought | dlacy |
| Apps - AI & Copilot | | Copilot, AI | jife | dlacy |
| Apps - Policy | Purview/Policy sync | Data Policy, Self-Service Access, DevOps policies | Huong | |

## New Squad Structure

| Squad | ICM Queue | EM | PM |
|---|---|---|---|
| Catalog and Search | Purview Data Governance/Data Catalog/Management | Naga Krishna Yenamandra | Sita Dontharaju |
| Growth, Access, SRE, QA | Purview Data Governance/Data Estate Health + Insights + Data Access | Darren Lacy | Shafiq Mannan |
| Data Quality and UX | Security Platform UX + Purview Data Governance/Data Quality | Shibnath Mukherjee | Pragya Rathi |
| Connectors | Security Platform Data Scan + Data Sources | Nitin Dubey | Chinmaya Gupta |
| DataMap | Purview DataMap/Data Map | Sudheer Kumar | Blesson John |
