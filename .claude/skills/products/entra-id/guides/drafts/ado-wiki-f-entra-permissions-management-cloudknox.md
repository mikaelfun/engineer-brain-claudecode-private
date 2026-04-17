---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Identity Governance/Entra Permissions Management (formerly CloudKnox)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/GeneralPages/AAD/AAD%20Account%20Management/Identity%20Governance/Entra%20Permissions%20Management%20(formerly%20CloudKnox)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Entra Permissions Management (formerly CloudKnox) - Reference Guide

> **IMPORTANT**: Microsoft Entra Permissions Management is being retired on October 1, 2025. See the Retirement wiki for details.

## Feature Overview

Microsoft Entra Permissions Management (MEPM) is a multi-cloud/hybrid cloud CIEM platform that protects cloud infrastructure resources and identities by providing comprehensive visibility, automated remediation, and continuous monitoring of permissions (granted versus used).

**Three pillars**: Visualization, Remediation, Monitoring and alerting.

**Supported clouds**: Azure, Amazon Web Services (AWS), Google Cloud Platform (GCP).

## Key Abbreviations

| Acronym | Meaning |
|---------|---------|
| CIEM | Cloud Infrastructure Entitlement Management |
| PCI | Permission Creep Index |
| JEP | Just Enough Privileges |
| MEPM | Microsoft Entra Permissions Management |

## PIM for Groups Support (January 2024)

MEPM now provides visibility into Azure RBAC role assignments granted via eligible/active group membership through PIM for Groups.

### Key Scenarios

- **Groups Analytics**: See all PIM-managed Groups with Azure RBAC role assignment. New "Status" column shows: Active Permanent, Active (time-bound), Eligible, Eligible (Time-bound).
- **Users Analytics > Azure Roles**: See eligible, active, and permanent role assignment from PIM-managed Groups for each user.
- **Users Analytics > User Groups**: See (eligible, active, permanent) membership for PIM-managed Groups for each user.
- **User Explorer**: See all groups (where user has membership) including PIM-managed groups.
- **Nested Groups**: See user effective permissions when they are part of nested groups.

### PIM for Groups Member Types

- **Active Permanent**: Active member without expiry
- **Active (time-bound)**: Active member with start and end dates
- **Eligible**: Eligible to be member of the group
- **Eligible (time-bound)**: Eligible with start and end dates defined

## Case Handling

Supported by:
- MSaaS AAD - Account Management Professional
- MSaaS AAD - Account Management Premier

## Licensing

Requires a Permissions Management license or trial. Public preview environment ended October 7, 2022.

## ICM Escalation

- **Owning Service**: Cloud Infrastructure Entitlement Management Service (MCIEM)
- **Owning Team**: Incident Manager
- ICM escalations should be submitted using ASC Template and approved by Azure Identity TA.
