---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Trainings and Resources/PG Delivered Trainings/102925 - REST API for Unified Catalog"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTrainings%20and%20Resources%2FPG%20Delivered%20Trainings%2F102925%20-%20REST%20API%20for%20Unified%20Catalog"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# CSS Training: Purview Unified Catalog REST APIs (Oct 21, 2025)

Meeting Recording: [Recap: CSS Training: Purview Unified Catalog APIs Tuesday, October 21](https://teams.microsoft.com/l/meetingrecap?driveId=b%211ei1YSLbVESF3_q1llKAcYqap04xb7ZGjqa45aaFO_w5L0eK1hNEQruK1ybCejNF&driveItemId=013JNAJWBHLAMKQORIDVHYUIKIQKQZY7OG)

## Overview

Anil Kumar (PG) provided a walkthrough of the Unified Catalog APIs. Six main API categories:

1. **Objectives**
2. **Business Domains**
3. **Critical Data Elements (CDE)**
4. **Data Products**
5. **Terms**
6. **Data Access Policies**

## Authentication

- Create a **Service Principal** in Azure Portal (obtain client ID + client secret)
- Exchange credentials for a token → use token in API calls
- Required role: **Data Governance Administrator** (for creating domains, accessing certain APIs)

## API Testing Tool

- Use **Insomnia** for local API testing (Postman is noncompliant)
- PG can share a pre-configured JSON collection for import into Insomnia

## Key API Operations

### Domain Management
- `GET /businessDomains` — list domains for tenant
- `POST /businessDomains` — create new domain (requires Data Governance Administrator)
- `PUT /businessDomains/{id}` — update domain
- `DELETE /businessDomains/{id}` — delete domain

### Policy Management
- `GET /policies` — returns up to 100 policies per call; paginate via skip tokens
- `PUT /policies` — update domain access policies (specify object IDs, assign reader/owner roles)

### Data Assets, Terms, Relationships
- GET/POST APIs for data assets (specify domain ID for proper association)
- Terms support parent-child hierarchical structure
- Query relationships between data assets and data products

## Known Limitations

| Limit | Value |
|-------|-------|
| Max business domains per region | 200 |
| API timeout | 90 seconds (408 error if exceeded) |

## Known Issues

- **Policy updates not reflecting in UI**: `PUT /policies` returns 200 but changes not visible in portal or backend — PG investigating with FTS team.

## ICM Case Handling

- Catalog-related cases should be filed under the **catalog** category (no DQ or DH APIs involved)

## Follow-up Tasks from Training

- Share documented limits for domains, terms, assets (Sita)
- Confirm API log access for troubleshooting with FTS team (Anil Kumar)
- Resolve policy update not reflecting issue (Anil Kumar)
- Share Insomnia JSON configuration collection (Anil Kumar)
