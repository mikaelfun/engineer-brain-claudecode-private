---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Storage/[FAQ] - Defender for Storage v2 - Internal FAQ"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Storage%2F%5BFAQ%5D%20-%20Defender%20for%20Storage%20v2%20-%20Internal%20FAQ"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Defender for Storage v2 - Internal FAQ

> **Internal use only.** This FAQ covers the transition from Defender for Storage (classic) to the new Defender for Storage plan.

## Overview

- **Defender for Storage (classic)**: Legacy plan before March 28, 2023. Only includes activity monitoring (ATP). Priced at per resource ($10/SA/month) or per transaction ($0.02/10K transactions/month).
- **Defender for Storage (new)**: Default plan after March 28, 2023. Includes activity monitoring + Malware Scanning + Sensitive data threat protection + Granular protection controls + Detection of entities without identities (SAS tokens). Priced at $10/SA/month with overage charge of $0.1492/1M transactions exceeding 73M threshold.

## Key Differences (New vs Classic)

| Feature | Classic | New Plan |
|---------|---------|----------|
| Activity monitoring (ATP) | Yes | Yes |
| Malware Scanning (on-upload) | No | Yes |
| Sensitive data threat protection | No | Yes |
| Granular protection controls | No | Yes |
| SAS token anomaly detection | No | Yes |
| Future capabilities | No | Yes |

## Pricing & Cost Estimation

- **No price change** from per-resource pricing ($10/SA/month)
- **Cost estimation tools**:
  1. GitHub community workbook (recommended) - estimates both pricing plans
  2. Defender for Cloud built-in Cost Estimation workbook
  3. PowerShell scripts (parallel version recommended for large environments)
- **Malware Scanning** excluded from 30-day trial; usage leads to charges

## Migration FAQ

- **Required?** No, customers can stay on classic until deprecation. Migration recommended for new capabilities.
- **Auto-migration?** No, customers must manually enable the new plan.
- **Rollback?** Yes, but cannot return to classic via Azure Portal. Not recommended.
- **Exclude storage accounts?** Yes, new plan supports per-storage-account exclusion.
- **Enable methods**: Azure Portal (Getting Started or Environment Settings), Azure built-in policy, Bicep/ARM templates, REST API.

## Classic Plan Deprecation

- Classic will be deprecated in the future with advance notice
- Classic will NOT receive product updates
- Classic will continue to be supported until deprecated

## Per-Transaction → New Plan

- Customers on per-transaction pricing need to migrate to access new features
- Migration changes pricing model to per-resource ($10/SA/month)
