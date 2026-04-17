# AVD W365 删除与防欺诈 - Quick Reference

**Entries**: 2 | **21V**: all applicable
**Keywords**: 403, clb, customer-lockbox, dms-client, oce, permission, torus
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | DMS Client command not recognized error (XXXX is not recognized) when running Cu... | DMS Client version is outdated and does not support the required CLB commands | Upgrade DMS client using Update-TorusClient -Version 16.01.2079.008, then re-ope... | 🔵 7.5 | ADO Wiki |
| 2 📋 | 403 Permission Insufficient error when running Customer Lockbox (CLB) OCE operat... | The OCE does not have the CLB elevated claim for the target tenant, or the eleva... | Request CLB elevated claim via DMS client: Set-MyWorkload Windows365, then Reque... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: DMS Client version is outdated and does not suppor `[Source: ADO Wiki]`
2. Check: The OCE does not have the CLB elevated claim for t `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-deletion-fraud.md#troubleshooting-flow)
