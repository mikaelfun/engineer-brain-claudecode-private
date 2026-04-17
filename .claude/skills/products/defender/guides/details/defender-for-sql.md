# DEFENDER Defender for SQL — Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-d-sql-va-legacy-faq.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Sql Va
> Sources: ado-wiki

**1. Customer cannot configure email notifications for SQL Vulnerability Assessment (VA) Express configuration. Internal scheduler does not send email reports.**

- **Root Cause**: The built-in internal scheduler for email notifications only works for SQL VA Classic mode, not Express mode. Express configuration does not have native email notification support.
- **Solution**: Create a Logic App to receive email notifications for SQL VA findings using Express mode. Use the ARM template from GitHub: https://github.com/Azure/Microsoft-Defender-for-Cloud/tree/main/Workflow%20automation/Notify-SQLVulnerabilityReport. Alternatively, consider reverting to Classic configuration if email notifications via internal scheduler are required.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer cannot directly access SQL VA scan results storage account or wants to know where baselines are stored in Express configuration**

- **Root Cause**: In SQL VA Express configuration, scan results and baselines are stored in a Microsoft-managed storage account in the same region as the Azure SQL Server. The customer does not have direct access to this storage account.
- **Solution**: Data can be accessed via API. For Classic configuration with firewall/VNet restrictions, refer to MS docs on storing VA scan results in accessible storage accounts. For on-demand scans: use Start-AzSqlInstanceDatabaseVulnerabilityAssessmentScan (SQL MI) or Start-AzSqlDatabaseVulnerabilityAssessmentScan (Azure SQL).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer cannot configure email notifications for SQL Vulnerability Assessment (VA) Express confi... | The built-in internal scheduler for email notifications only works for SQL VA Classic mode, not E... | Create a Logic App to receive email notifications for SQL VA findings using Express mode. Use the... | 🟢 8.5 | ADO Wiki |
| 2 | Customer cannot directly access SQL VA scan results storage account or wants to know where baseli... | In SQL VA Express configuration, scan results and baselines are stored in a Microsoft-managed sto... | Data can be accessed via API. For Classic configuration with firewall/VNet restrictions, refer to... | 🟢 8.5 | ADO Wiki |
