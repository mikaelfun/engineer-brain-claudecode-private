---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Region-wise SDP release process"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Region-wise%20SDP%20release%20process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Region-wise SDP Release Process for Application Gateway

## What are Safe Deployment Practices?

Safe Deployment Practices (SDP) are guiding principles for rolling out changes to production safely. The most common cause of customer availability impact has been Live Site Incidents (LSIs) caused by deployments. SDP helps teams balance deployment agility and safety.

## Progressive Rollout Model

Deploys to incrementally larger footprints with "bake" times (monitoring periods) between increments.

### Rollout Phases

| Phase | Description |
|-------|-------------|
| **Canary** | First step to production. Non-critical customer workloads. |
| **Pilot** | Production region(s) with low-impact workloads; some diversity in traffic/resource types. |
| **Medium** | First regions with diversity in Azure offerings, medium traffic, low Vanguard impact. |
| **Heavy** | Regions with heavy traffic and high-impact workloads, continuing low Vanguard impact. |
| **Broad** | Remaining fleet regions, honoring region pairs (primary before secondary). |

Application Gateway follows a Phase 1–9 progressive rollout schedule (see wiki for region table).

## Relevance for Support
- If a customer reports a regression or new issue, check whether their region recently received a new deployment phase.
- SDP bake times mean some regions may be on different software versions simultaneously.
- Reference this process when investigating potential deployment-related LSIs.

## Contributors
- Jay Soni
- Gitanjali Verma
