---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Azure Permissions"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Case%20Misroutes/Azure%20Permissions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Case Misroutes: Azure Permissions — Scope Determination

## Permissions for Alert Viewing

- Depends on what Alert is being viewed

## Scope Decision Tree

| Scenario | Action |
|----------|--------|
| **Privileged Identity Management (PIM)** | Cross-scope potential — collab/route accordingly |
| **B2B permissions** | Cross-scope potential |
| **Sync Issues** | Not our scope |
| **Broken RBAC / Legacy Permissions** | **In MDO scope** |
| **Gradual Delegated Admin Permissions (GDAP)** | Collab potential (~70%) — collab and verify |

## Notes

- For broken RBAC and legacy permission issues affecting Defender portal access → MDO owns.
- For GDAP-related issues → consider collab; verify with partner team before routing.
- For sync issues (Entra ID sync) → route to Entra ID / Azure AD team.

## Contributors

**Tara Doherty** — taradohery@microsoft.com  
**Sandra Ugwu** — sandraugwu@microsoft.com
