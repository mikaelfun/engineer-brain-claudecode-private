# AVD AVD ARM 部署 (Part 2) - Quick Reference

**Entries**: 9 | **21V**: partial
**Keywords**: arm-template, azure-monitor, configuration-workbook, connectivity, deployment, deployment-validation, dns, download
**Last updated**: 2026-04-07

> Note: avd-contentidea-kb-007 and avd-mslearn-043 have context-dependent differences (21v_conflict)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | "No workspace is associated with this email address" error when subscribing with... | DNS TXT record _msradc not configured for the user's email domain. The record is... | In O365 Admin Center > Settings > Domains > DNS records, add TXT record: Name=_m... | 🔵 7.5 | ADO Wiki |
| 2 📋 | RTT and bandwidth information missing from CloudPC Performance / Connection Qual... | Geneva Agent scheduled task is not running - either disabled, stopped, or blocke... | On affected CloudPC check: 1) Geneva Agent is installed. 2) Check EventViewer > ... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Customer cannot download or install Windows App because company blocks Microsoft... | Organization policy blocks Microsoft Store access, preventing standard Windows A... | Download Windows App directly from Microsoft Learn: https://learn.microsoft.com/... | 🔵 7.5 | ADO Wiki |
| 4 📋 | DSC extension fails to download Configuration.zip - catalogartifact.azureedge.ne... | Firewall/NSG/static route blocking download | Remove blocking network rules or download zip manually | 🔵 7.0 | MS Learn |
| 5 📋 | WVD Deployment failed with DSC extension error. User is not authorized to query ... | SPN was missing role assignment. | Create service principal role assignment per docs. | 🔵 6.5 | KB |
| 6 📋 | WVD ARM deployment fails: The template deployment vmCreation-linkedTemplate is n... | Azure subscription quota limit exceeded for a region or VM family. | Check detailed error by clicking error banner in Portal. Request quota increase ... | 🔵 6.5 | KB |
| 7 📋 | Ephemeral OS disk deployment fails in certain regions due to SKU rollout gaps | Incomplete rollout of supported SKUs or backend bugs cause regional deployment i... | Monitor Azure announcements for SKU availability updates; deploy to another regi... | 🔵 6.0 | MS Learn |
| 8 📋 | Azure Monitor configuration workbook for AVD fails with 'Deployment template val... | The Azure Monitor configuration workbook for AVD may pass incorrect parameter ty... | Instead of using the configuration workbook, manually configure performance coun... | 🔵 6.0 | OneNote |
| 9 📋 | Deployment fails Unauthorized - scale operation not allowed for subscription in ... | Subscription type (MSDN/Free/Education) lacks VM features in region | Change subscription type or deploy to different region | 🟡 4.5 | MS Learn |

## Quick Triage Path

1. Check: DNS TXT record _msradc not configured for the user `[Source: ADO Wiki]`
2. Check: Geneva Agent scheduled task is not running - eithe `[Source: ADO Wiki]`
3. Check: Organization policy blocks Microsoft Store access, `[Source: ADO Wiki]`
4. Check: Firewall/NSG/static route blocking download `[Source: MS Learn]`
5. Check: SPN was missing role assignment. `[Source: KB]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-deployment-arm-2.md#troubleshooting-flow)
