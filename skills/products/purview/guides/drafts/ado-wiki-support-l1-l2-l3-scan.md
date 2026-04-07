---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Support L1-L2-L3 Scan"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSupport%20L1-L2-L3%20Scan"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Support L1/L2/L3 Scan Levels

## Background

Based on VIP customer feedback, Purview supports different scan levels for various scenarios:
- Pre-calculate metrics before starting a full scan on large systems
- Allow specifying levels of scan for auto-attach scenarios
- Support L1/L2 only when customers already have 3P L3 classification

## Scan Levels

| Scan Level | Description | Content |
|--|--|--|
| Level-1 | Extract basic info and metadata (file name, size, FQN) | Metadata |
| Level-2 | Extract schema for structured file types and database tables | Metadata + Schema |
| Level-3 | Extract schema and apply system/custom classification rules | Metadata + Schema + Classification |
| AutoDetect | Apply highest level supported by the source | Depends on data source capability |

## Important Behaviors

- **Upgrade** (low → high, e.g. L1 → L3): Automatically triggers one-time full scan so existing assets get new functionality
- **Downgrade** (high → low, e.g. L3 → L1): Schema and classification from existing assets will NOT be removed
- **AutoDetect**: Automatically applies new scan improvements/features in existing and scheduled scans

## Feature Scope

Currently enabled only within:
- Purview public Azure Integration Runtime
- VNet Integration Runtime

**Not yet supported**: Self-hosted Integration Runtime (SHIR) - ongoing development.
