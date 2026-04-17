---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/Sensitivity Labels/Upcoming Features: Sensitivity Labels/Protection Policies/Protection policy support for Fabric"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FSensitivity%20Labels%2FUpcoming%20Features%3A%20Sensitivity%20Labels%2FProtection%20Policies%2FProtection%20policy%20support%20for%20Fabric"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Protection Policy support for Fabric

_Applies to_: Microsoft Purview Information Protection

This extended Protection Policy support will allow organizations to protect data assets labeled in Fabric workspaces via access control. Administrators can now create and assign a label to be used in Fabric workspaces that applies retain "Allow read" and/or "Allow full access" protection.

## Timeline

| Milestone | Date |
| --------- | ---- |
| Preview | Oct 2024 |
| Worldwide | June 2025 |
| GCC | TBD |
| GCC High | TBD |
| DoD | TBD |

## Pre-requisites

1. M365 E5 license (or equivalent) is required in the tenant and assigned to users.
2. Organization is already using the new Purview portal (purview.microsoft.com).
3. Microsoft Fabric is available (trial license can be obtained).

## Label & Label policy creation

**NOTE:** If the tenant already has labels published with "Files & other data assets" scope, and Access control protection turned on, skip this section.

1. Go to https://purview.microsoft.com with administrator account.
2. Navigate to "Information Protection" solution page.
3. Ensure labels are scoped to **"Files & other data assets"** (may still show as "Files" in some tenants during UX rollout).
4. Ensure label has **"Control access"** (Access control) protection turned on.
5. Publish the label via a Label publishing policy. See: https://learn.microsoft.com/en-us/purview/create-sensitivity-labels#publish-sensitivity-labels-by-creating-a-label-policy

## Creating a Protection policy scoped to Fabric

1. Navigate to "Protection policies (preview)" page under Information Protection.
2. Create a new protection policy.
3. Select the label (must have "Files & other data assets" scope AND "Access Control" protection).
4. Scope the label to Microsoft Fabric all workspaces.

**IMPORTANT:** Microsoft Fabric is mutually exclusive and cannot be used in conjunction with Azure and Amazon data sources. Create a separate Protection policy for other data sources.

5. Select access control protection type:
   - Allow users to retain read access
   - Allow users to retain full control
6. Turn the protection policy "on" to start protecting labeled assets.
7. Review configuration and create.

## Fabric Configuration (Required)

Before protection policies can be applied, enable these admin settings:

1. **Fabric Admin portal** (app.powerbi.com/admin-portal): Enable "Information Protection > Allow users to apply sensitivity labels for content".
2. **Fabric Admin portal**: Enable all Microsoft Fabric settings:
   - Data Activator
   - Users can create Fabric items
   - Users can create Fabric environments
3. Ensure tenant has Fabric license or trial enabled.

## Key Troubleshooting Points

- If labels don't appear when creating Protection Policy → verify label scope includes "Files & other data assets" and "Access Control" is enabled.
- If protection not applying to Fabric items → verify Fabric Admin portal settings are enabled.
- Cannot combine Fabric with Azure/Amazon data sources in one policy → create separate policies.
- "Files" vs "Files & other data assets" label scope → same thing, UX string update rolling out.
