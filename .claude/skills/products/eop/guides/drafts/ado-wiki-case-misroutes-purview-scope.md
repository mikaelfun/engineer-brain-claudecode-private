---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Purview: Determining Scope"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Case%20Misroutes/Purview%3A%20Determining%20Scope"
importDate: "2026-04-05"
type: routing-guide
---

# Case Misroutes: Purview vs MDO Scope

SAP: Security/Microsoft Purview Compliance

## Microsoft Purview Scope

### Insider Risk Management
High risk account tag in emails or alerts comes from Purview Insider Risk Management.
- Customer asks why tag is there → transfer to Purview with screenshot

### Journaling
Owned by Compliance (previously Exchange Online).

### Data Loss Prevention (DLP)
- DLP Alerts (collabable) — depends on customer's question
- DLP Policy Tips/Mail Tips (collabable)
- Anything else DLP → transfer to Purview

### Mass Email Deletion Recovery
If customer accidentally deleted 30K emails in Defender for Office 365 → goes to Purview for recovery.

### Purview Support Topics
| Topic | Description |
|-------|-------------|
| Compliance Score | How it's calculated, improvement actions |
| Audit | Access/review audit logs, setting policies |
| Compliance Manager | Assess compliance posture |
| Data Lifecycle/Records Management | Retention, deletion policies |
| eDiscovery | Search, hold, export content |
| Communication Compliance | Detect risky communication |
| Compliance Portal | Navigation, finding data |
| Priva Privacy Risk Management | Privacy risk identification |
| Priva Subject Rights Requests | Data access/deletion requests |
| Journaling | Configure journaling rules |

## Purview and MDO: Auditing (Grey Area)
- High collab potential
- Is it related to MDO? Yes → continue to own and/or collab
- Thing they are trying to find in audit log is not MDO-related → transfer to Purview
- Not everything in MDO is audited — questions about this are good for escalation
- There may be backend logging that Purview audit logs can't pick up
- In most cases, collaborate with Purview
