# Purview 账户区域变更与迁移 -- Quick Reference

**Entries**: 1 | **21V**: all-applicable | **Confidence**: low
**Last updated**: 2026-04-07

## Symptom Lookup
| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer wants to move Purview account across subscriptions or resource groups. Or error when trying... | Move across subscriptions/resource groups within same tenant: Supported. Move ac... | For sub/RG move: Azure portal → Resource Group → Select resource → Move. Prerequisites: both subs mu... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FAdministration%20(Provisioning%20%26%20RBAC)%2FPurview%20Upgrade%20and%20Migration%2FManaging%20Enterprise%20Accounts%3A%20Transfers%20Between%20Subscriptions%2C%20Resource%20Groups%2C%20and%20Regions) |

## Quick Troubleshooting Path

1. For sub/RG move: Azure portal → Resource Group → Select resource → Move. Prerequisites: both subs must be active, same Entra tenant, destination regis... `[source: ado-wiki]`