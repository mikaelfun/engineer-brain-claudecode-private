# DEFENDER Defender for SQL — Troubleshooting Quick Reference

**Entries**: 2 | **21V**: all applicable
**Sources**: ado-wiki | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/defender-for-sql.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer cannot configure email notifications for SQL Vulnerability Assessment (VA) Express confi... | The built-in internal scheduler for email notifications only works for SQL VA Classic mode, not E... | Create a Logic App to receive email notifications for SQL VA findings using Express mode. Use the... | 🟢 8.5 | ADO Wiki |
| 2 | Customer cannot directly access SQL VA scan results storage account or wants to know where baseli... | In SQL VA Express configuration, scan results and baselines are stored in a Microsoft-managed sto... | Data can be accessed via API. For Classic configuration with firewall/VNet restrictions, refer to... | 🟢 8.5 | ADO Wiki |

## Quick Troubleshooting Path

1. Create a Logic App to receive email notifications for SQL VA findings using Express mode. Use the ARM template from GitHub: https://github.com/Azure/Microsoft-Defender-for-Cloud/tree/main/Workflow%... `[Source: ADO Wiki]`
2. Data can be accessed via API. For Classic configuration with firewall/VNet restrictions, refer to MS docs on storing VA scan results in accessible storage accounts. For on-demand scans: use Start-A... `[Source: ADO Wiki]`
