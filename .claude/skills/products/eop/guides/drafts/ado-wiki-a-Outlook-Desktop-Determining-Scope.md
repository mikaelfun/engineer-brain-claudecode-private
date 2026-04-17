---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Outlook Desktop: Determining Scope"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FCase%20Misroutes%2FOutlook%20Desktop%3A%20Determining%20Scope"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Outlook Desktop: Determining Scope

SAP: Office Products/Outlook/Outlook for Microsoft 365/

## Report Message Button missing

MDO Scope: Confirm that they have it configured correctly in the admin center.

**Hint:** Confirm who it is impacting (tenant-wide or user).

### Routing Matrix

| Scenario | Outlook Desktop | OWA | Route To |
|----------|----------------|-----|----------|
| Not working in Desktop; Working in OWA | Not working / Missing | Working / Present | Outlook Desktop team |
| Working in Desktop; Not working in OWA | Working / Present | Not working / Missing | Exchange Online team |
| Working in all clients | Working / Present | Working / Present | MDO Team |
| Not working in all clients | Not working / Missing | Not working / Missing | MDO Team |

## Outlook Desktop Scope

They support things in Outlook Desktop:
- Profile creation
- Authentication prompts
- Connectivity issues
- Feature problems
- IM issues
- Sync Issues (only in Outlook Desktop)

## Outlook Developer Support Team

Separate SAP. Developer Messaging troubleshooting code development for Outlook add-ins or applications that connect to Exchange Online. The Developer team doesn't do custom scripting for customers.
