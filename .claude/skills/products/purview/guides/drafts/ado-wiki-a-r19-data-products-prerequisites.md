---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Apps - Data Governance/Troubleshooting Guides/Data Products/Prerequisites and handling errors in Data Product"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=/Apps%20-%20Data%20Governance/Troubleshooting%20Guides/Data%20Products/Prerequisites%20and%20handling%20errors%20in%20Data%20Product"
importDate: "2026-04-21"
type: guide-draft
---

# Data Products - Prerequisites and Troubleshooting

## Prerequisites

### Viewing Data Products
Requires one of: Governance Domain Owner, Data Catalog Reader, Data Steward, Data Product Owner.
Navigate to: Data Catalog > Catalog Management > Governance Domains > [domain] > Roles > add users.

### Managing or Editing Data Products
Requires Data Product Owner permissions.
Navigate to: Data Catalog > Catalog Management > Governance Domains > [domain] > Roles > add to Data Product Owner.

### Adding Assets to Data Products
Data product owners and data stewards also need data map permissions to read data assets.
See: [Domain and collection level permissions](https://learn.microsoft.com/en-us/purview/governance-roles-permissions#domain-and-collection-permissions)

### Removing Assets from Data Products
- Assets can only be removed from unpublished data products
- Assets cannot have Data Quality history; DQ Steward must delete DQ history first
- Required roles: Data Product Owner + Data Quality Reader

## Common Issues

### Cannot Move Data Products Between Domains
Not currently supported. Delete and recreate in target domain.

### Published Data Products Not Found in Discovery Search
1. Verify Data Product is published and exists in the domain
2. Collect: account name, Governance Domain name, Data Product name
3. Capture screenshot + HAR file when refreshing the tab
4. Raise an AVA

### Missing Data Products Within Governance Domain
1. Provide names of missing Data Products
2. Capture HAR file for the listing data products API call
3. Raise an AVA

### Cannot Add Data Assets - Invalid Characters Error
Status 400: "The name contains invalid character(s)."
Cause: Table schema contains forbidden characters (line feed, tab, non-printable ASCII).
Fix: Edit schema in Data Map to remove invalid characters.

## Limitations
- Bulk delete of assets from Data Product is not currently supported (on roadmap)
