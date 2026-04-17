---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Tools and Processes/Security Groups (SGs)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Tools%20and%20Processes/Security%20Groups%20(SGs)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Security Groups (SGs)

_Date of Last Full Review: 17/07/25_

## Background

### Security Group
A security group is a way to collect user accounts, computer accounts, and other groups into manageable units. Used to assign permissions to shared resources in Active Directory.

## Identity and Access Management Tools

### IDWeb
Legacy identity service for managing distribution and security groups within the **corporate forest** (Redmond, NTDEV). Used to set up email lists and manage access within the corporate network.

### OneIdentity
Modern identity tool for managing user accounts, security groups, and service accounts across **non-corp domains** (AME, GME, USME, PXE, PME, MSSTORE). Provides self-service management of domain objects.

### CoreIdentity
Designed to **replace IDWeb** for managing corporate access to resources via security groups and service accounts. Offers better access reviews and automatic user removals from entitlements.

### Summary
- **IDWeb / CoreIdentity**: Corporate network (corp forest)
- **OneIdentity**: Non-corp domains (AME, GME, etc.)
- No current plans to merge into a single identity service

## Security Groups Reference
See [azure_adaptive_cloud_dls_sgs_teams.xlsx](https://microsofteur.sharepoint.com/:x:/r/teams/AdaptiveCloudFY26OrgPlanning/Shared%20Documents/) for details.

## References
- [About IDWeb](https://microsoft.sharepoint.com/sites/Identity_Authentication/SitePages/IDWeb/Overview.aspx)
- [OneIdentity Overview](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/OneIdentity-Information.aspx)
- [About CoreIdentity](https://microsoft.sharepoint.com/sites/Identity_Authentication/SitePages/CoreIdentity/Overview-of-CoreIdentity.aspx)
- [AME Security Groups Naming Convention](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/AME-Security-Groups.aspx)
