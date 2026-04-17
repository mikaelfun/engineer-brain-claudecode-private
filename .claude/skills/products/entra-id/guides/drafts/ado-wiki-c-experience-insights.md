---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Experience Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FExperience%20Insights"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Experience Insights (Preview) Dashboard

## Feature Overview

The Experience insights (preview) dashboard shows data across usage and sentiment to give a fuller view of the organization's experience with Microsoft 365. It helps understand and improve users' experience with Microsoft 365.

Key capabilities:
- **Overview page**: Feedback and help article views
- **Suggested training**: Top viewed articles, trending across organizations, commonly viewed together
- **Apps and services data**: Unified view across usage and sentiment
  - Active users count
  - Product usage percentage
  - In-product feedback volume
  - NPS survey response volume
  - Help article views

## Case Handling
This feature is supported by the **M365 Cloud Identity** community.

## Licensing
This feature is only available to tenants with **2000 or more M365/O365 licenses**.

## Regions
- Public
- Fairfax/Arlington: TBD
- Gallatin/Mooncake: TBD

## Troubleshooting

- Verify user has correct role:
  - Global admin
  - Global reader
  - Reports reader
  - User experience success manager
- Verify tenant has at least 2000 M365/O365 licenses
- Test another browser
- Clear browser cache
- Test using in-private/incognito (if CA policies allow)
- Collect a [HAR](https://learn.microsoft.com/en-us/azure/azure-web-pubsub/howto-troubleshoot-network-trace) file trace

## ICM Escalations

First determine if the issue is with the **portal** or the **data**.

### Portal Issues
ICM template: **[ID] [M365] [MAC] - Manage Users, Groups, and Domains**

### Data Issues
Data issues start with the **Idea team** (responsible for collecting and consolidating data from individual products). They may redirect to source data team (e.g., Teams data issue -> Teams support -> Teams PG).

ICM template: **[ID] [M365] [MAC] - Customer Insights and Analysis**

## Public Documentation
- [Microsoft 365 Experience insights dashboard](https://learn.microsoft.com/en-us/microsoft-365/admin/misc/experience-insights-dashboard?view=o365-worldwide)
