---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Administration (Provisioning & RBAC)/New Purview Unified Portal scenarios/Getting access to new Purview Unified Portal"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20%28TSGs%29%2FAdministration%20%28Provisioning%20%26%20RBAC%29%2FNew%20Purview%20Unified%20Portal%20scenarios%2FGetting%20access%20to%20new%20Purview%20Unified%20Portal"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Getting Access to New Purview Unified Portal (CSS Internal)

> Access to the new Purview UX is currently restricted to limited users as PG enables it in a phased manner.

## Option 1: Ninja Environment (Tenant-level / Enterprise-tier scenarios)

For testing or reproducing customer issues in the new Unified Portal:

1. **Request Access** via: https://myaccess.microsoft.com/@seccxpninja.onmicrosoft.com#/access-packages

2. Select the appropriate package:
   - **Contoso Demos Users** — access to Contoso Demo environment
   - **Contoso Demos Users - Elevated** — limited write operations in Contoso Demo (7 days)
   - **Purview Access** (MSFT ONLY) — Purview Admin access (PurviewVteam + PurviewDataReader roles)
   - **Purview Data Curator Access** (MSFT ONLY) — Data Curator access
   - **Tier 1 Analysts** — SecurityDemoT1 + PurviewDataReader roles

3. Wait **up to 24 hours** for PG review and approval.

4. If not approved within 24 hours, email:
   - [Purview EEEs](mailto:azurepurvieweees@microsoft.com)
   - [Kevin McKinnerney](mailto:kemckinn@microsoft.com)

5. Once approved, access Ninja environment at: https://aka.ms/purviewninja (use Microsoft credentials)

For queries/feedback: [Purview EEEs](mailto:azurepurvieweees@microsoft.com)

---

## Option 2: CSS Test Tenant (Quick Testing)

Engineers can use the following link for direct testing & repro:

**URL:** https://purview.microsoft.com/home?tid=4f1dc10a-df9b-4f93-be0c-504b04f6309d

**Username:** purviewcss@Msftpurviewtest001.onmicrosoft.com

> **NOTE:** This information is only for CSS use. Do NOT share with customers or anyone outside CSS org.
