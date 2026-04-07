---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Post Breach/MDO Advanced hunting"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FPost%20Breach%2FMDO%20Advanced%20hunting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDO Advanced Hunting Reference

## Overview

Advanced Hunting (AH) is a query-based threat investigation capability in Microsoft Defender XDR using **Kusto Query Language (KQL)**. Ownership and support boundaries are determined by the data tables being queried.

## Table Ownership

| Table Prefix | Owning Team | Example Tables |
|---|---|---|
| Email*, Message* | MDO | EmailEvents, EmailUrlInfo, MessageEvents |
| Url* | MDO | UrlClickEvents |
| Campaign*, File* | MDO | CampaignInfo, FileMaliciousContentInfo |
| Device* | MDE | DeviceFileEvents, DeviceNetworkEvents |
| Cloud* | MDCA | CloudAppEvents |
| Identity* | Identity / Entra ID | IdentityLogonEvents |

**Guidance**: Queries using Email, Message, File, Campaign, or Url tables are MDO scope. Cross-table queries must be validated by each owning service. Misrouted cases should be redirected early.

## Permissions (Email & Collaboration)

- Requires appropriate **Microsoft Defender roles** + **MDO P2 license**
- **Read-only**: query execution and result visibility
- **Take Action (Remediation)**: requires URBAC permissions - Security data basic (read) + Response (manage) + Email & collaboration advanced actions (manage)

## Email and Collaboration Tables

### Email Tables
- **EmailEvents**: High-level metadata, delivery status, threat verdicts
- **EmailUrlInfo**: URL details from email bodies/subjects/attachments
- **EmailAttachmentInfo**: Attachment info including file hashes and verdicts
- **EmailPostDeliveryEvents**: Post-delivery actions (clicks, ZAP, remediation)
- **CampaignInfo**: Coordinated threat campaign metadata

### Collaboration Tables (Teams, SPO, ODB)
- **MessageEvents**: Teams message metadata at delivery
- **MessagePostDeliveryEvents**: Post-delivery Teams security events
- **MessageUrlInfo**: URLs shared in Teams messages
- **UrlClickEvents**: User URL interactions across email and collaboration

## Custom Detection Rules

Advanced Hunting supports custom detection rules for automated alerting based on KQL queries.

## Community Queries

- [Community queries for email threats](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/use-community-queries-to-hunt-more-effectively-across-email-and-collaboration-th/4254664)
- [KQL Detection & Threat Hunting](https://github.com/LearningKijo/KQL)
- [Defender for O365 Hunting Queries](https://github.com/HybridBrothers/Hunting-Queries-Detection-Rules/tree/main/Defender%20for%20Office365)

## Integration with Microsoft Sentinel

Advanced Hunting data can be integrated with Microsoft Sentinel for broader SIEM scenarios.
