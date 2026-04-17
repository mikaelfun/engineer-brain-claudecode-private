# Purview Sovereign Cloud 工具与访问 -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Drafts fused**: 4 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-css-alias-sovereign-cloud.md](..\guides/drafts/ado-wiki-a-css-alias-sovereign-cloud.md), [ado-wiki-a-jit-access-gov-cloud.md](..\guides/drafts/ado-wiki-a-jit-access-gov-cloud.md), [ado-wiki-gov-cloud-overview.md](..\guides/drafts/ado-wiki-gov-cloud-overview.md), [ado-wiki-sovereign-cloud-faqs.md](..\guides/drafts/ado-wiki-sovereign-cloud-faqs.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-jit-access-gov-cloud.md, ado-wiki-a-css-alias-sovereign-cloud.md

1. Team level Access `[source: ado-wiki-a-css-alias-sovereign-cloud.md]`
2. Pre-Requisite `[source: ado-wiki-a-jit-access-gov-cloud.md]`
3. Access Fairfax logs via escort - accessing Azure Government Kusto logs `[source: ado-wiki-a-jit-access-gov-cloud.md]`
4. 1) Log into MSVPN `[source: ado-wiki-a-jit-access-gov-cloud.md]`
5. 2) Navigate to Fairfax JIT portal `[source: ado-wiki-a-jit-access-gov-cloud.md]`
6. 3) Request Escort session `[source: ado-wiki-a-jit-access-gov-cloud.md]`
7. 4) JIT approval `[source: ado-wiki-a-jit-access-gov-cloud.md]`
8. 5) Open the RDP `[source: ado-wiki-a-jit-access-gov-cloud.md]`
9. 6) Open Kusto - Add connection - Add Clusters `[source: ado-wiki-a-jit-access-gov-cloud.md]`
10. Gov Cloud Overview `[source: ado-wiki-gov-cloud-overview.md]`

### Phase 2: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Engineer cannot access Purview Kusto logs in Mooncake sovereign cloud using stan... | Sovereign clouds require dSTS-Federated authentication and s... | 1) Join security group 'Redmond\Mooncake DB PoD access' via IdWeb. 2) In Kusto E... |
| Self-hosted integration runtime (SHIR) fails to connect in Azure Government (Fai... | Azure Government and Azure China sovereign clouds use differ... | Configure SHIR firewall rules to allow sovereign-cloud-specific endpoints on por... |
| Engineers unable to access Purview tools (Kusto, Geneva, subscription resources)... | Sovereign clouds block Microsoft.com domain access; special ... | 1) Join AME security group TM-Babylon-CSS; 2) Use SAW device with AME credential... |
| Cannot access Purview tools or Microsoft domain resources in Sovereign clouds (F... | Microsoft.com domain is blocked in Sovereign cloud environme... | Use JIT & Escort sessions for all tool access (Kusto, Geneva, Subscriptions). Re... |
| Geneva Actions operations fail with Corp credentials; unable to publish packages... | dSTS service enforces blocking of Corp account (Microsoft.co... | 1) Extension owners: remove Corp claim mappings in dSCM before deadline; 2) User... |
| Geneva Actions operations fail with Corp credentials after dSTS enforcement; pub... | dSTS service enforcement blocks Corp account (microsoft.com)... | Use production identities (*ME or Torus) with SAW device for all Geneva Actions ... |
| Unable to access EU DFM (EU Data Boundary DFM) after Nov 18th policy change. Acc... | EU Data Boundary compliance requirement changed starting Nov... | For FTEs not using SAW: 1) Request EUDB_AVD membership through CoreIdentity. 2) ... |
| Engineer needs to access Purview/ADF Kusto logs in Fairfax sovereign cloud for t... | Fairfax (Gov) cloud requires government clearance (SAVM memb... | 1) Get SAVM membership via https://cloudmfa-support.azurewebsites.net/SawSupport... |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Engineer cannot access Purview Kusto logs in Mooncake sovereign cloud using standard connection meth... | Sovereign clouds require dSTS-Federated authentication and specific cluster URLs... | 1) Join security group 'Redmond\Mooncake DB PoD access' via IdWeb. 2) In Kusto Explorer, add connect... | 🔵 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FSovereign%20Cloud%2FMooncake%20-%20Kusto%20logs%20%26%20ASC%20access) |
| 2 | Self-hosted integration runtime (SHIR) fails to connect in Azure Government (Fairfax) or Azure China... | Azure Government and Azure China sovereign clouds use different service endpoint... | Configure SHIR firewall rules to allow sovereign-cloud-specific endpoints on port 443 (1433 for SQL)... | 🔵 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FSovereign%20Cloud%2FUSNAT%20%26%20Fairfax%20-%20Government%20Access%20%26%20Requirements) |
| 3 | Engineers unable to access Purview tools (Kusto, Geneva, subscription resources) in Sovereign clouds... | Sovereign clouds block Microsoft.com domain access; special security group membe... | 1) Join AME security group TM-Babylon-CSS; 2) Use SAW device with AME credentials; 3) Access tools v... | 🔵 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTraining%2FSovereign%20Cloud%20TSG%2FCSS%20alias%20for%20Sovereign%20Cloud) |
| 4 | Cannot access Purview tools or Microsoft domain resources in Sovereign clouds (Fairfax/Mooncake) | Microsoft.com domain is blocked in Sovereign cloud environments by design. All a... | Use JIT & Escort sessions for all tool access (Kusto, Geneva, Subscriptions). Require SAW + AME + AM... | 🔵 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTraining%2FSovereign%20Cloud%20TSG%2FCSS%20alias%20for%20Sovereign%20Cloud) |
| 5 | Geneva Actions operations fail with Corp credentials; unable to publish packages or execute operatio... | dSTS service enforces blocking of Corp account (Microsoft.com) claims for Geneva... | 1) Extension owners: remove Corp claim mappings in dSCM before deadline; 2) Users: switch to product... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FSecurity%20Policies%20%26%20AME%20%20requirements%20for%20CSS%20delivery%2FPolicy%20Change%20-%20Removing%20Corp%20Access%20to%20Geneva%20Actions) |
| 6 | Geneva Actions operations fail with Corp credentials after dSTS enforcement; publishing new GA exten... | dSTS service enforcement blocks Corp account (microsoft.com) access to Geneva Ac... | Use production identities (*ME or Torus) with SAW device for all Geneva Actions operations. Extensio... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTools%2FSecurity%20Policies%20%26%20AME%20%20requirements%20for%20CSS%20delivery%2FPolicy%20Change%20-%20Removing%20Corp%20Access%20to%20Geneva%20Actions) |
| 7 | Unable to access EU DFM (EU Data Boundary DFM) after Nov 18th policy change. Access denied when not ... | EU Data Boundary compliance requirement changed starting Nov 18th, requiring SAW... | For FTEs not using SAW: 1) Request EUDB_AVD membership through CoreIdentity. 2) Download and install... | 🔵 7.0 | ado-wiki |
| 8 | Engineer needs to access Purview/ADF Kusto logs in Fairfax sovereign cloud for troubleshooting | Fairfax (Gov) cloud requires government clearance (SAVM membership) and JIT acce... | 1) Get SAVM membership via https://cloudmfa-support.azurewebsites.net/SawSupportServices/SAVM (selec... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FSovereign%20Cloud%2FGet%20JIT%20Access%20to%20Gov%20Kusto%20Logs) |