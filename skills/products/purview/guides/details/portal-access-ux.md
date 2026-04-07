# Purview 门户访问与 UX -- Comprehensive Troubleshooting Guide

**Entries**: 8 | **Drafts fused**: 5 | **Kusto queries fused**: 0
**Source drafts**: [ado-wiki-a-getting-access-new-purview-unified-portal.md](..\guides/drafts/ado-wiki-a-getting-access-new-purview-unified-portal.md), [ado-wiki-a-new-purview-portal-trainings.md](..\guides/drafts/ado-wiki-a-new-purview-portal-trainings.md), [ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md](..\guides/drafts/ado-wiki-c-portal-cant-be-opened-via-private-endpoint.md), [ado-wiki-check-entity-payload-from-ux.md](..\guides/drafts/ado-wiki-check-entity-payload-from-ux.md), [ado-wiki-faq-new-purview-enterprise-portal.md](..\guides/drafts/ado-wiki-faq-new-purview-enterprise-portal.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-getting-access-new-purview-unified-portal.md

1. Getting Access to New Purview Unified Portal (CSS Internal) `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
2. Option 1: Ninja Environment (Tenant-level / Enterprise-tier scenarios) `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
3. **Request Access** via: https://myaccess.microsoft.com/@seccxpninja.onmicrosoft.com#/access-packages `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
4. Select the appropriate package: `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
5. Wait **up to 24 hours** for PG review and approval. `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
6. If not approved within 24 hours, email: `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
7. Once approved, access Ninja environment at: https://aka.ms/purviewninja (use Microsoft credentials) `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
8. Option 2: CSS Test Tenant (Quick Testing) `[source: ado-wiki-a-getting-access-new-purview-unified-portal.md]`
9. New Purview Unified Portal — Trainings `[source: ado-wiki-a-new-purview-portal-trainings.md]`
10. Overview of new product strategy and demo of the new experience `[source: ado-wiki-a-new-purview-portal-trainings.md]`

### Phase 2: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Error "Could not create the marketplace item" when creating Microsoft Purview ac... | Azure portal marketplace rendering issue prevents direct Pur... | Workaround: Navigate to Subscription → Resource Group → click Create → search "M... |
| Purview Governance Portal shows compliance popup or fails to load in Incognito/I... | Browser/device compliance policy blocks access in Incognito ... | Ensure device enrolled. Allow popups for web.purview.azure.com. Install latest O... |
| Request failed with status code 500 when opening Purview Governance Portal espec... | Known issue - error 500 when user logged into multiple Purvi... | Verify in cleared cache/InPrivate. Open ICM with Gateway PG: screenshot, user ro... |
| Assets deleted via Purview API still appear in the Purview portal. Clicking dele... | Search store and underlying data store went out of sync. Lar... | As immediate mitigation, make a GET request to each deleted asset from the Purvi... |
| Purview Portal displays in a foreign language even after user switches to Englis... | Purview inherits language settings from Microsoft 365, not f... | Redirect to Microsoft 365/Compliance team. Direct user to change display languag... |
| Login error when first accessing a newly deployed external Azure subscription fo... | IPv6 connectivity issue prevents first-time login to newly p... | Temporarily disable IPv6 in Network adapter settings (Control Panel > Network an... |
| Purview portal fails to load in Chrome v142+ or Edge v142+. Browser Local Networ... | Chrome/Edge v142+ enabled Local Network Access (LNA) setting... | Temporarily disable LNA setting in browser. Chrome: see https://developer.chrome... |
| Business assets Description shows raw HTML code (div, span, p tags) instead of r... | - | Attach case to ICM 51000000889887. ETA for fix was Feb 23. |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error "Could not create the marketplace item" when creating Microsoft Purview account directly from ... | Azure portal marketplace rendering issue prevents direct Purview account creatio... | Workaround: Navigate to Subscription → Resource Group → click Create → search "Microsoft Purview" → ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FMicrosoft%20Purview%20Administration%2FCreate%20or%20delete%20an%20Microsoft%20Purview%20instance%2FError%20Creating%20Purview%20Account%20Could%20not%20create%20the%20marketplace%20item) |
| 2 | Purview Governance Portal shows compliance popup or fails to load in Incognito/InPrivate mode | Browser/device compliance policy blocks access in Incognito mode where complianc... | Ensure device enrolled. Allow popups for web.purview.azure.com. Install latest OS updates. For Chrom... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Security%20and%20Access%20Control/Opening%20Microsoft%20Purview%20Governance%20Portal/Browser%20Compat%20and%20Incognito%20mode) |
| 3 | Request failed with status code 500 when opening Purview Governance Portal especially with multiple ... | Known issue - error 500 when user logged into multiple Purview accounts while no... | Verify in cleared cache/InPrivate. Open ICM with Gateway PG: screenshot, user role assignments, clea... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Troubleshooting%20Guides%20(TSGs)/Security%20and%20Access%20Control/Opening%20Microsoft%20Purview%20Governance%20Portal/Request%20failed%20with%20status%20code%20500) |
| 4 | Assets deleted via Purview API still appear in the Purview portal. Clicking deleted assets shows no ... | Search store and underlying data store went out of sync. Large volume of delete ... | As immediate mitigation, make a GET request to each deleted asset from the Purview Portal — this tri... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FUX%2FDeleted%20assets%20showing%20up%20on%20the%20Purview%20portal) |
| 5 | Purview Portal displays in a foreign language even after user switches to English in MyAccount setti... | Purview inherits language settings from Microsoft 365, not from MyAccount direct... | Redirect to Microsoft 365/Compliance team. Direct user to change display language in M365 settings: ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FUX%2FPurview%20Portal%20Showing%20in%20Foreign%20Language) |
| 6 | Login error when first accessing a newly deployed external Azure subscription for Purview testing/re... | IPv6 connectivity issue prevents first-time login to newly provisioned external ... | Temporarily disable IPv6 in Network adapter settings (Control Panel > Network and Internet > Network... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FRequest%20Azure%20Subscription) |
| 7 | Purview portal fails to load in Chrome v142+ or Edge v142+. Browser Local Network Access (LNA) setti... | Chrome/Edge v142+ enabled Local Network Access (LNA) setting by default, which b... | Temporarily disable LNA setting in browser. Chrome: see https://developer.chrome.com/blog/local-netw... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |
| 8 | Business assets Description shows raw HTML code (div, span, p tags) instead of rendered content (Feb... | - | Attach case to ICM 51000000889887. ETA for fix was Feb 23. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/%5BNew%20wiki%20structure%5DPurview%20Data%20Governance/Processes/Known%20Issues) |