# AVD AVD 监控与诊断 - Quick Reference

**Entries**: 8 | **21V**: all applicable
**Keywords**: alphanumerical-sort, asc, asc-tracing, auto-scaling, avdi, azure-ad-ds, contentidea-kb, data-collection-rule, dcr, dfm-eu, diagnostic-settings, diagnostics, dns-resolution, error-retrieving-data, insights
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Error retrieving data when loading Diagnostics tab in DfM EU ASC for Cloud PC | DfM EU region data retrieval limitation in Azure Support Center | Use a Global (WW) DFM case to load the VM in ASC instead of the EU DFM case | 🟢 8.0 | ADO Wiki |
| 2 📋 | AVD Insights workbook (new, not Insights Legacy) not selecting the expected Data... | The default Insights workbook selects DCR based on naming convention 'microsoft-... | Ensure the desired DCR name follows the 'microsoft-avdi-*' naming convention. Th... | 🟢 8.0 | ADO Wiki |
| 3 📋 | AVD Insights workbook not selecting the expected Log Analytics workspace – showi... | Default Insights workbook selects LA workspace based on alphanumerical sort of D... | Rename/recreate the desired Diagnostic Setting to appear first in alphanumerical... | 🟢 8.0 | ADO Wiki |
| 4 📋 | Need to verify if Relative Mouse is being triggered successfully in an AVD sessi... |  | Use ASC Tracing tab with connection Activity ID (filter Task Name = RelativeMous... | 🟢 8.0 | ADO Wiki |
| 5 📋 | AVD Insights workbook (new, not Insights Legacy) displays unexpected or incorrec... | Default Insights workbook selects DCR based on 'microsoft-avdi-*' naming convent... | 1. Ensure DCR name follows 'microsoft-avdi-*' naming convention (the configurati... | 🟢 8.0 | ADO Wiki |
| 6 📋 | User session UPNs not displayed in AVD portal user sessions list; UPN column is ... | User subscribes to the AVD workspace with one set of credentials (e.g. User1@dom... | 1) Get ActivityID for an affected connected user session. 2) Run Kusto query on ... | 🟢 8.0 | ADO Wiki |
| 7 📋 | Logging in to VM joined to Azure AD DS with an Azure AD user sourced from Window... | By design: strict enforcement on UPN to enable reliable re-connections and no du... | Organizations using Azure AD DS for their AVD environment need users created dir... | 🔵 6.5 | ContentIdea |
| 8 📋 | AVD auto scaling script fails with 'The remote name could not be resolved' for *... | Log Analytics workspace ODS ingestion endpoint DNS not resolvable. Workspace may... | Re-run the script after Log Analytics workspace is fully provisioned. Verify DNS... | 🟡 5.5 | OneNote |

## Quick Triage Path

1. Check: DfM EU region data retrieval limitation in Azure Support Cen... `[Source: ADO Wiki]`
2. Check: The default Insights workbook selects DCR based on naming co... `[Source: ADO Wiki]`
3. Check: Default Insights workbook selects LA workspace based on alph... `[Source: ADO Wiki]`
4. Check:  `[Source: ADO Wiki]`
5. Check: Default Insights workbook selects DCR based on 'microsoft-av... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-monitoring-diagnostics.md#troubleshooting-flow)