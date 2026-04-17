---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access Fine Grained Policies for Guests and External Users"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Conditional%20Access%20Fine%20Grained%20Policies%20for%20Guests%20and%20External%20Users"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Conditional Access - Fine Grained Policies for Guests and External Users

## Feature Overview

Previously CA policies could only target a single "guest and external users" option. This feature allows admins to target policies to specific guest/external user types and specific tenants.

### Supported User Types

- B2B collaboration users (member and guest)
- B2B direct connect users
- Service provider users
- Other external users

### Key Benefits

- Reduces reliance on Named Locations for guest targeting
- Works with GDAP, Suzuka via Service provider external user type
- Reduces CA policy conflicts from broad guest targeting

## Typical Customer Scenarios

### Scenario 1: Block all external users except specific org

**Before (old approach):**
- Include: All guest and external users
- Exclude: Group (manually managed Contoso users group)
- Problem: Requires creating B2B users and managing group membership; cannot cover B2B direct connect users

**After (new feature):**
- Include: Guest or external users (all types selected, all organizations)
- Exclude: Guest or external users (B2B collaboration member + B2B direct connect types, contoso.com organization)
- Benefits: No group management needed; covers B2B direct connect users automatically

### Scenario 2: Target specific external user types

Admins can now create separate policies for:
- B2B collaboration guests (require MFA)
- B2B direct connect users (require compliant device)
- Service provider users (restrict to specific apps)

## Configuration

1. Create or edit a CA policy
2. Under Users > Include/Exclude, select "Guest or external users"
3. Select specific user types to target
4. Optionally specify external organizations (by domain)
5. Use Report-only mode first to validate behavior before enabling

## Troubleshooting Tips

- Verify the user type classification matches expectations (check sign-in logs for userType)
- External organization filtering uses the domain of the user's home tenant
- Policy conflicts may occur if multiple policies target overlapping user types
