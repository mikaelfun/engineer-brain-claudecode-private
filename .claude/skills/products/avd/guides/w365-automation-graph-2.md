# AVD W365 Graph API 自动化 (Part 2) - Quick Reference

**Entries**: 3 | **21V**: all applicable
**Keywords**: application-group, assigned-user, auto-scaling, automation, createorupdateazautoaccount, dns-resolution, host-pool, location-mismatch
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Cannot delete assigned user from personal AVD session host via Azure portal. No ... | Azure portal does not provide UI option to remove assigned user from personal de... | Use PowerShell: 1. New-AzWvdRegistrationInfo to create token. 2. Get-AzWvdSessio... | 🟢 8.0 | OneNote |
| 2 📋 | New-AzWvdApplicationGroup fails with 'must be in same location as associated Hos... | Application group being created in different location than the host pool | Retrieve host pool location and create application group in the same location. A... | 🔵 7.0 | MS Learn |
| 3 📋 | AVD auto scaling script (CreateOrUpdateAzAutoAccount.ps1) fails with 'Invoke-Web... | The AVD auto scaling setup script references the Global Azure ODS endpoint (.ods... | 1. Verify the Log Analytics workspace endpoint uses .azure.cn suffix for Mooncak... | 🔵 6.5 | OneNote |

## Quick Triage Path

1. Check: Azure portal does not provide UI option to remove `[Source: OneNote]`
2. Check: Application group being created in different locat `[Source: MS Learn]`
3. Check: The AVD auto scaling setup script references the G `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-automation-graph-2.md#troubleshooting-flow)
