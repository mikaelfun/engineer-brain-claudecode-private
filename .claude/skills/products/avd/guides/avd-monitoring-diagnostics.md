# AVD AVD 监控与诊断 - Quick Reference

**Entries**: 6 | **21V**: all applicable
**Keywords**: adfs, alphanumerical-sort, asc, asc-tracing, avdi, azure-ad-ds, cookie, data-collection-rule
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Error retrieving data when loading Diagnostics tab in DfM EU ASC for Cloud PC | DfM EU region data retrieval limitation in Azure Support Center | Use a Global (WW) DFM case to load the VM in ASC instead of the EU DFM case | 🔵 7.5 | ADO Wiki |
| 2 📋 | AVD Insights workbook (new, not Insights Legacy) not selecting the expected Data... | The default Insights workbook selects DCR based on naming convention 'microsoft-... | Ensure the desired DCR name follows the 'microsoft-avdi-*' naming convention. Th... | 🔵 7.5 | ADO Wiki |
| 3 📋 | AVD Insights workbook not selecting the expected Log Analytics workspace – showi... | Default Insights workbook selects LA workspace based on alphanumerical sort of D... | Rename/recreate the desired Diagnostic Setting to appear first in alphanumerical... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Need to verify if Relative Mouse is being triggered successfully in an AVD sessi... | - | Use ASC Tracing tab with connection Activity ID (filter Task Name = RelativeMous... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Logging in to VM joined to Azure AD DS with an Azure AD user sourced from Window... | By design: strict enforcement on UPN to enable reliable re-connections and no du... | Organizations using Azure AD DS for their AVD environment need users created dir... | 🔵 6.5 | KB |
| 6 📋 | AVD users see ADFS login prompt for session host RDP sign-in even though AAD gat... | AAD cookie is still valid allowing silent sign-in to AVD gateway, but ADFS cooki... | This is expected behavior when ADFS cookie expires before AAD cookie. After user... | 🔵 6.0 | OneNote |

## Quick Triage Path

1. Check: DfM EU region data retrieval limitation in Azure S `[Source: ADO Wiki]`
2. Check: The default Insights workbook selects DCR based on `[Source: ADO Wiki]`
3. Check: Default Insights workbook selects LA workspace bas `[Source: ADO Wiki]`
4. Check: Unknown `[Source: ADO Wiki]`
5. Check: By design: strict enforcement on UPN to enable rel `[Source: KB]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-monitoring-diagnostics.md#troubleshooting-flow)
