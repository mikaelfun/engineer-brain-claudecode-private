---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Processes/Supportability for Restricted CRIs (rCRI)"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FProcesses%2FSupportability%20for%20Restricted%20CRIs%20(rCRI)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Supportability for Restricted CRIs (rCRI)

Restricted CRI (rCRI) is the communication channel between delivery and product teams for escalating incidents. rCRI restricts visibility and access to support data to only those necessary for resolving the incident.

## Key Features
1. **Access Control List (ACL)**: Only authorized employees can access the incident
2. **Just-In-Time (JIT) Access**: Access granted only when necessary and for limited time
3. **Compliance**: Helps Microsoft comply with data handling commitments

> **rCRI cannot be used for managing Outages.**

## Creating rCRI

### Via ASC (Recommended)
Use Azure Support Center (ASC EU or ASC WW) to escalate as ICM of type RCRI.

### Via IcM Portal (Fallback)
Only if ASC is down. Select incident type as Restricted CRI in IcM portal.

## Managing Access

### ACL Behavior
| Action | ACL Behavior |
|---|---|
| Incident creation | Creator + assigned IcM team added to ACL |
| Incident transfer | Target IcM team added to ACL |
| Request Assistance acknowledgment | Acknowledger added to ACL |
| Auto-invite acknowledgment | Acknowledger added to ACL |

### ACL Roles
| Role | Permission |
|---|---|
| Reader | Read incident contents |
| Contributor | Modify incident |
| Owner | Change ACL members |

### Requesting Access
When opening an incident not on your ACL, a dialog allows you to request access. Requests go to the owning IcM Team's Distribution List (NOT to ACL owners).

## Auto Invite Rules
Service admins can configure Auto Invite rules in Tenant Manager > Manage Services > Auto Invite Management tab.

## Kusto Access for rCRI

### Databases
1. **IcMDataWarehouse** - Redacted data
2. **IcMDataWarehouseRestricted** - Unredacted data (requires Kusto Restricted View)

### Identifying Restricted Incidents
| Column | Description |
|---|---|
| IsRestricted | Incident is Restricted |
| IsCustomerSupportEngagement | Incident is a Restricted CRI |

### Redacted Fields
**Incidents/IncidentHistory**: CommsMgrEngagement*, Component, CustomerName, ImpactedScenarios, Keywords, Summary, Tags, TsgId, TsgOutput
**IncidentDescriptions**: Text
**PostIncidentReports**: Title, all Impact/Description fields, PublicSummary/RootCause/NextSteps

### Getting Unredacted Access
Request a Kusto Restricted View via [ADO task template](https://msazure.visualstudio.com/One/_workitems/create/Task?templateId=85de9f72-977a-454b-a32f-268fb730a584).

## Known Issues

1. **EU DfM + WW ICM**: Cross-boundary access fails for transferred case owners (bugs 35507191, 35507130)
2. **New Case Owner / JIT**: Log out and back into ICM portal to force access refresh
3. **Multiple Cases**: Design limitation - 1:1 relationship only between rCRI and DFM case
4. **ASC with TSE/MID/AME**: UPN format bug prevents ACL addition (bugs 35715517, 35743502). Ask EEE to add explicitly.
5. **Impact Assessment**: Close and reopen browser tab to see newly linked cases

## Training Resources
- [Fabric CSS Training Sessions](https://microsoftapc.sharepoint.com/:f:/t/CSSTridentReadinessLibrary/EuXpHU4OmSFFtcz5Ql1V9coBXtu15iXOE-_SrWiyNEVhLw)
- [Restricted CRI Onboarding](https://eng.ms/docs/products/icm/workflows/incidents/rcri/rcri_onboarding)
- [Kusto Access and Reporting](https://eng.ms/docs/products/icm/reporting/kusto-ri)
