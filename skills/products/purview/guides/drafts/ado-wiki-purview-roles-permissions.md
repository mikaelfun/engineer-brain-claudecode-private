---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Security and Access Control/Roles and Permissions in Microsoft Purview/Access control and Credentials"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSecurity%20and%20Access%20Control%2FRoles%20and%20Permissions%20in%20Microsoft%20Purview%2FAccess%20control%20and%20Credentials"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purview Roles and Permissions Reference

## Data Plane RBAC Roles

- **Account Creator**: Automatically gets all data plane permissions regardless of assigned roles
- **Purview Data Reader**: Portal access, read all content except scan bindings
- **Purview Data Curator**: Portal access, read all, edit asset info, classifications, glossary terms
- **Purview Data Source Administrator**: No direct portal access (needs Data Reader/Curator too), manages scanning
- **Owner + Data Curator**: Can add External Sources + other Curator capabilities. Owner alone cannot see portal button
- **Owner + Data Curator + Data Source Admin**: Can create Data Sources + add External Sources + full capabilities

## External Connections (ADF & Data Share)

To **view** External Connections in Management Center: must be **Subscription Owner**

To **view** Data Factory connections, need one of:
- Contributor
- Owner
- Reader
- User Access Administrator

To **add/remove** Data Factory connections, need one of:
- Owner
- User Access Administrator

Additional requirement: ADF role of Owner or Contributor

Reference: [Catalog Permissions](https://docs.microsoft.com/en-us/azure/purview/catalog-permissions)
