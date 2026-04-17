---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/M365 Admin Center Mandatory MFA"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FM365%20Admin%20Center%20Mandatory%20MFA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# M365 Admin Center Mandatory MFA

## Feature Overview

As part of the Secure Future Initiative (SFI), Microsoft requires all customers to sign in to Microsoft 365 Admin Center using MFA. This is in addition to the Azure Core services requirement. The rollout applies to Enterprise subscription tenants first.

### Update 6/9/25: MFA Proof-up - Skip for now

Customers can temporarily skip the proof-up process when signing into M365 Admin Center. This only applies to users in tenants currently targeted for Mandatory MFA for M365 MAC. Users who already configured MFA methods are not impacted.

### Update 1/30/25: Grace period deadline extended

Microsoft allows customers with complex environments or technical barriers to postpone enforcement until **September 30, 2025**. Global Administrators can go to the Azure portal to select the start date of enforcement. GA must elevate access before postponing.

## Scope of Enforcement

### User Accounts
All users signing into M365 Admin Center (https://admin.microsoft.cloud/, https://admin.microsoft.com/, https://admin.office.com/) will require MFA. End users accessing apps/websites/services hosted in Microsoft 365 but not signing into M365 Admin Center are NOT subject to this requirement.

### URLs Impacted

| URL | App ID | MFA Enforced? |
|-----|--------|---------------|
| https://portal.office.com/adminportal/home | 00000006-0000-0ff1-ce00-000000000000 | Yes |
| https://admin.cloud.microsoft | 00000006-0000-0ff1-ce00-000000000000 | Yes |
| https://admin.microsoft.com | 00000006-0000-0ff1-ce00-000000000000 | Yes |
| https://portal.office.com | 4765445b-32c6-49b0-83e6-1d93765276ca | No |
| https://www.microsoft365.com | 4765445b-32c6-49b0-83e6-1d93765276ca | No |
| https://portal.microsoftonline.com | 4765445b-32c6-49b0-83e6-1d93765276ca | No |
| https://portal.office.com/account | 00000006-0000-0ff1-ce00-000000000000 | No |

### Implementation
MFA is implemented by MAC portal itself. Sign-in logs show **App requires multifactor authentication** under Authentication Details > Authentication Policies Applied. Sign-in diagnostic shows **MFA is explicitly enforced by the client application Browser**.

This requirement is on top of existing CA policies or security defaults.

### Available MFA Methods
All supported MFA methods available. External authentication methods (public preview) can satisfy the requirement. Deprecated Conditional Access Custom Controls preview will NOT satisfy the requirement.

### Break Glass Accounts
Recommend FIDO2 or certificate-based authentication (configured as MFA) instead of relying only on long passwords.

## Case Handling

Supported by **M365 Cloud Identity community** (also supportable by **Identity Security and Protection** community).

**SAP**: Microsoft 365/Authentication and Access/Setup and Use Multifactor Authentication/Unexpected MFA prompt
**Internal Title**: [Portal Enforcement]
**Root Cause**: Root Cause - CID O365 Auth and Access/Multifactor Authentication (MFA)/Mandatory MFA for M365 Admin Portal

## Grace Period (Extensions)

- Use same process as Azure MFA enforcement: https://aka.ms/managemfaforazure
- If already requested extension for Azure, it auto-applies to M365 Admin Center
- Grace period ends September 30, 2025
- GA must have elevated access (https://aka.ms/enableelevatedaccess)
- Multi-tenant orgs: must perform action for each tenant
- Retroactive grace periods supported (tenant can request after being targeted, MFA stops within 24 hours)

## ICM Escalation Scenarios

### Collecting Session ID (Azure Portal)
- Method 1: Ctrl+Alt+D → record Session ID from diagnostics box
- Method 2: Developer Tools (Ctrl+Shift+I) → Console tab → find "Session:" value

### Scenario: Customer needs more time
No IcM needed. Customer accesses https://aka.ms/manageazuremfa and requests postponement (requires GA + elevated access). Allow 24 hours.

### Scenario: Error requesting grace period
Confirm GA with elevated access. If still failing → IcM template: https://aka.ms/postponemfaicm. Include Session ID + HAR file.

### Scenario: Grace period requested but still MFA prompted
1. Verify grace period was requested
2. ASC check: "MFA is explicitly enforced by the client application 'Microsoft Office 365 Portal'" + SourcesOfMfaRequirement = "Request"
3. If confirmed → IcM via ASC template: **[ID] [M365] [MAC] - Manage Users, Groups, and Domains**. Include Correlation ID, Timestamp, portal URL, HAR file.

### Scenario: Bulk grace period (40+ tenants)
For strategic customers (S500, CSS/CSD, Azure ACE). IcM template: https://aka.ms/postponemfaicm with CSV of tenant IDs.

## Regions
- Public: Rolling out
- Fairfax/Arlington: TBD
- Gallatin/Mooncake: TBD

## References
- [M365 Admin MFA Blog Post](https://aka.ms/M365-admin-MFA)
- [Azure Portal MFA Enforcement Wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1509472/Azure-Portal-MFA-Enforcement)
