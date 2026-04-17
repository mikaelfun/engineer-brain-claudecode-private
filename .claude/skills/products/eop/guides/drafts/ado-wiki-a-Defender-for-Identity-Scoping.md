---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Defender for Identity: Scoping"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FCase%20Misroutes%2FDefender%20for%20Identity%3A%20Scoping"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Defender for Identity: Scoping

SAP: Azure/Microsoft Defender for Identity

Former Names:
- Azure Advanced Threat Protection (Azure ATP) 2017-2020
- Microsoft Advanced Threat Analytics (ATA) 2015-2017

Supported by Cloud Protection - Threat Analytics Team (SCIM Team)

Acronyms: MDI (Microsoft Defender for Identity), ITDR (Identity Threat Detection and Response), XDR (Extended Detection and Response)

## Support Topics

- Identify and investigate suspicious user activities and advanced attacks
- Monitor users, entity behavior, and activities with learning-based analytics
- Protect user identities and credentials stored in Active Directory
- Provide clear incident information on a simple timeline for fast triage

## Sensors

Issues: Disconnection, senseidentity issues. Room for collab with MDE but main case is for MDI.

## Portal

- User page issues XDR (Page not loading, rendering issues) → MDI
- Identities Settings Pages → MDI

## Devices

| Scenario | Team |
|----------|------|
| Timeline issues (e.g., device timeline not loading) | MDE (Endpoint feature) |
| Missing specific identity activity (e.g., logons not showing) | MDI (identity signals from MDI sensor) |

## Search Bar

- User search → MDI
- URL/device search → XDR (with MDI involvement for devices if sensor involved)

## XDR Product Scope

| Product | Focus |
|---------|-------|
| MDE | Endpoint protection (most device search issues) |
| MDI | Identity-based threat detection (device search with sensors) |
| MDO | Email and collaboration security (URLs sourced from MDO) |
| MDA | SaaS app security |

## ITDR Dashboard

Dashboard and data containing the widget and the dashboard are under MDI.

## Entra Risk in Identities Inventory

| Aspect | Team |
|--------|------|
| UI issues (grid/columns don't render, delayed values, paging/export) | MDI (Threat Analytics) |
| Risk logic (Why is this user risky? How is risk calculated?) | Entra team (Identity Protection) |

## Remediations

- XDR Actions: Revoke sessions, disable/enable users, confirm compromise
- Manual Remediation (M365): Confirm user compromised, require sign-in again, suspend user in app → MDA

## Azure Sign-in MDI related topics

- User Sign in queries (not user compromise investigation - that's CIRT)
- User locked out due to Risky Sign-in (MDI)
- MFA Prompt Not Triggering (MDI)
- Sign-In Failure with Correlated Alerts (MDI)
- Risky IP sign in (MDA)
