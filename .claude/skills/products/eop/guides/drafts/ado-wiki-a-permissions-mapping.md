---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/MDO Permissions/Permissions Mapping"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FMDO%20Permissions%2FPermissions%20Mapping"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Admin Permissions Mapping for Defender Portal Activities

Centralized mapping of permissions required for admin activities in the Microsoft Defender portal, covering:
- Microsoft Entra ID Roles
- Legacy RBAC roles from Defender portal
- Unified RBAC (URBAC) / Microsoft XDR permissions

## Key Permissions Mapping

| Action | Required Entra Role | Required Old Permission | Required URBAC Permission |
|--------|-------------------|----------------------|--------------------------|
| Incidents/Alerts (MDO, read) | Security Reader, Global Reader, Security Admin, Security Operator | View-Only Manage Alerts | Security operations > Security data basic (read) |
| Incidents/Alerts (MDO, manage) | Security Admin, Security Operator | Manage Alerts | Security operations > Alerts (manage) |
| Advanced Hunting (Email) | Security Reader, Security Operator, Security Admin | Advanced Hunting | Security operations > Security data basic (read) |
| Explorer/Email Entity (read metadata) | Security Reader, Security Operator, Security Admin | View-Only Recipients | Security operations > Email message metadata (read) |
| Explorer/Email Entity (email content) | Security Admin, Security Reader | Preview | Security operations > Email content (read) |
| Explorer (remediation) | Security Admin | Search and Purge | Security operations > Email advanced actions (manage) |
| Action Center MDO (read) | Security Reader, Global Reader, Exchange Admin | - | Security operations > Security data basic (read) |
| Action Center MDO (manage) | Security Admin, Security Operator | Search & Purge | Security operations > Email advanced actions (manage) |
| Submissions (read) | Security Admin, Security Operator | View-Only Recipients | Security operations > Email advanced actions (manage) |
| Submissions (submit to MS) | Security Reader, Global Reader | View-Only Recipients | Security operations > Security data basic (read) |
| Quarantine (read) | Security Reader, Global Reader | - | Security operations > Email advanced actions (manage) |
| Quarantine (release) | Security Admin / Org Management | Search & Purge | Security operations > Email advanced actions (manage) |
| Restricted Entities (read) | Security Reader, Global Reader | Organization Management, Quarantine Admin | Security operations > Security data basic (read) |
| Restricted Entities (manage) | Security Admin, Exchange Admin | Quarantine Admin | Security operations > Email quarantine (manage) |
| Preset Security Policies (read) | Security Reader, Security Admin, Exchange Admin | Hygiene Management | Authorization > Security setting > read-only |
| Preset Security Policies (manage) | Security Admin, Security Operator | Hygiene Management | Authorization > Security setting > All permissions |
| Attack Simulation Training (manage) | Attack Simulation Admin, Security Admin | View-Only Recipients | Not supported by URBAC |
