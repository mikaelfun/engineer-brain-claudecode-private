---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Management Groups/Start Here"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Management%20Groups%2FStart%20Here"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

![Management Groups Icon](/.attachments/10011-icon-Management%20Groups-General-34fd1ec0-7157-47c1-aa4c-e327696d5885.svg)

## What is Azure Management Groups?
If your organization has many subscriptions, you may need a way to efficiently manage access, policies, and compliance for those subscriptions. Azure management groups provide a level of scope above subscriptions. You organize subscriptions into containers called "management groups" and apply your governance conditions to the management groups. All subscriptions within a management group automatically inherit the conditions applied to the management group. Management groups give you enterprise-grade management at a large scale no matter what type of subscriptions you might have. All subscriptions within a single management group must trust the same Azure Active Directory tenant.

For example, you can apply policies to a management group that limits the regions available for virtual machine (VM) creation. This policy would be applied to all management groups, subscriptions, and resources under that management group by only allowing VMs to be created in that region.

## Where do I get started learning?
Go to the [Azure Management Groups Training](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623655/) page.

## Where do I get started troubleshooting?
Review the [Support scope and collaboration scenarios](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623651/).

## Permissions required
### Public cloud
Troubleshooting Azure Management Groups does not require any additional permissions.

## SME channel
[[TEAMS] [ARM] Azure Management Groups](https://teams.microsoft.com/l/channel/19%3ae164f84ad6de4a968ffdebe292944a01%40thread.skype/%255BARM%255D%2520Azure%2520Management%2520Groups?groupId=8a6a0fe1-0d7d-41a0-93f0-0fd7af9ac2c8&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

## Daily triage calendar invites
| Region | Schedule (UTC) | Download |
|--------|---------------|---------|
| APAC | Mon–Fri 07:30 | [ICS](https://dev.azure.com/Supportability/31c9a1d6-c6c7-468d-9891-b00c860342c4/_apis/git/repositories/2f1f8c37-192b-4daf-8d21-a201255ddd1b/items?path=%2FAzureDev%2F%5BARM%5D-Azure-Resource-Manager-(ARM)%2FAPAC-Triage.ics&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0&download=true) |
| EMEA | Mon–Fri 10:00 | [ICS](https://dev.azure.com/Supportability/31c9a1d6-c6c7-468d-9891-b00c860342c4/_apis/git/repositories/2f1f8c37-192b-4daf-8d21-a201255ddd1b/items?path=%2FAzureDev%2F%5BARM%5D-Azure-Resource-Manager-(ARM)%2FEMEA-Triage.ics&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0&download=true) |
| AMER | Mon–Fri 15:30 | [ICS](https://dev.azure.com/Supportability/31c9a1d6-c6c7-468d-9891-b00c860342c4/_apis/git/repositories/2f1f8c37-192b-4daf-8d21-a201255ddd1b/items?path=%2FAzureDev%2F%5BARM%5D-Azure-Resource-Manager-(ARM)%2FAMER-Triage.ics&versionDescriptor%5BversionOptions%5D=0&versionDescriptor%5BversionType%5D=0&versionDescriptor%5Bversion%5D=master&resolveLfs=true&%24format=octetStream&api-version=5.0&download=true) |

## IcM paths
| Description | Path/Link |
|-------------|-----------|
| IcM for Management Groups issues (Sev 3 & 4) | [[IcM] Support/EEE-ARM](http://aka.ms/EEECRI-ARM) |
| IcM for Management Groups issues (Sev 2 & 1) | [[IcM] Windows Azure Operations Center/WASU](http://aka.ms/CXPCRI-ARM) |

## Contacts
- [CSS] TAs and SMEs: see wiki page for current contact aliases
- [PG] EEEs: see wiki page for current contact aliases
