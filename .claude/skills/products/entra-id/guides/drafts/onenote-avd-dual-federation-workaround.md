# AVD Dual-Federation Workaround for 21V (Mooncake)

## Overview

When customers need to use Azure Virtual Desktop in 21V (Mooncake) but are blocked by dual-federation restrictions (same domain registered in both Global Azure and 21V), this workaround avoids the dual-federation requirement.

## Background

- Cross cloud B2B was near public preview as of late 2021, and dual-federation is being retired
- AVD does NOT support B2B guest users, so cross-cloud B2B cannot solve AVD scenarios
- IMPORTANT: Do NOT tell CSAM/CSA to just wait for cross-cloud B2B if they need AVD in dual-federation

## Option 1: Different Verified Domain (Recommended)

Uses separate DNS suffixes for Global Azure and 21V Cloud, avoiding dual-federation entirely.

### Steps

1. Add separate DNS suffixes for Global Azure and 21V Cloud
2. Configure AAD Connect with customized sync rules to map local domain UPN to 21V cloud domain UPN (e.g., `user@contoso.local` → `user@contoso.cn`)
3. Ensure `OnPremisesSecurityIdentifier` attribute is synced (maps local `objectSid`)
   - AVD uses `sidFromToken` extracted from `OnPremisesSecurityIdentifier` for UPN/SID matching
4. Can use Password Hash Sync or separate AD FS for 21V federation authentication

### Key Technical Detail

AVD authentication flow:
1. First tries UPN match (`user@contoso.cn` vs local domain) → fails
2. Falls back to SID match using `OnPremisesSecurityIdentifier` → succeeds

### Limitation

- When signing into AVD endpoint, use `user@contoso.cn`
- When logging into session host desktop, use `user@contoso.local`

## Option 2: Account Mapping (Legacy)

Creates a local fake account mapping to the 21V cloud account with AVD assignment.

### Steps

1. Create AVD pool with session hosts joined to on-premise domain
2. Add required users to remote desktop users/Administrators group on host VMs
3. Create cloud-native user in 21V for AVD assignment (or sync from on-prem with different verified domain)
4. Add DNS suffix in local domain matching 21V AVD user domain suffix
5. Create matching local user account with same UPN suffix as 21V cloud domain
6. Can disable this local account (only needed for UPN check)

### Limitations

- Must manually control AVD host VM remote access
- Hard to track AVD usage per local domain user unless creating multiple 21V cloud accounts

## References

- [Azure AD Connect: Supported topologies](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/plan-connect-topologies#multiple-azure-ad-tenants)
- [Azure Virtual Desktop authentication](https://docs.microsoft.com/en-us/azure/virtual-desktop/authentication#hybrid-identity)
- [Deploy Azure AD joined VMs](https://docs.microsoft.com/en-gb/azure/virtual-desktop/deploy-azure-ad-joined-vm)

## Source

- OneNote: Mooncake POD Support Notebook / AVD / How To / Workaround to cross dual-federation requirement
