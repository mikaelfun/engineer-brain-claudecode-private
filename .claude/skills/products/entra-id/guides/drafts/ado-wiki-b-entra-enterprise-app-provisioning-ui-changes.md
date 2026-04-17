---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Entra Enterprise App Provisioning Options Moving To Dedicated Blades"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FEntra%20Enterprise%20App%20Provisioning%20Options%20Moving%20To%20Dedicated%20Blades"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra Enterprise App Provisioning Options Moving To Dedicated Blades

## Background

As part of the Entra provisioning and synchronization user experience transitioning from Knockout API to React API, in late October 2024, an update to the GUI for Entra Enterprise Apps / Provisioning blade was released. This new view moves the options on the provisioning blade to their own dedicated blades. This change includes a new Overview (Preview) blade, Connectivity blade, and Attribute Mapping blade. There are **no functional changes** with this update.

Initially, this update only affects custom enterprise applications / the non-gallery app. The initial release does not affect applications from the Enterprise Application Gallery. Over the following three months, the team rolled the change out to the rest of the Enterprise Applications in the gallery that support provisioning.

Administrators will see both the legacy and preview Overview page experiences on their application until January 2025. A banner on the new Overview (Preview) page informs Administrators of the upcoming changes.

## New Blade Structure

### Overview (Preview)
- **Get Started tab**: Guide administrators through configuring their new application
- **Overview tab**: View the status of provisioning configuration
- **Properties tab**: View and edit basic properties including:
  - Email notification recipients
  - Prevent accidental deletion
  - Accidental deletion threshold
  - Skip out of scope deletions
  - Provisioning Scope

### Connectivity (Preview)
The Provisioning / Admin Credentials section is moved to its own blade titled **Connectivity (Preview)**. This allows administrators to efficiently add or update the Tenant URL and Secret Token.

### Attribute Mapping (Preview)
The Provisioning / Mappings section is moved to its own blade titled **Attribute Mapping (Preview)**. This allows administrators to efficiently update attribute mappings.

## Customer Impact

- No functional changes — only UI reorganization
- Non-gallery / custom enterprise apps affected first
- Gallery apps included in rollout over subsequent months
- Both legacy and preview experiences available simultaneously until January 2025
