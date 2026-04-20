---
title: "Azure AD B2B Custom Redemption Flow"
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Account management/B2B/Features/Custom redemption flow and enabling SAML_Ws-Fed id.md"
product: entra-id
tags: [B2B, redemption, cross-tenant-access, SAML, WS-Fed, configurable-redemption]
21vApplicable: true
createdAt: "2026-04-18"
---

# Azure AD B2B Custom Redemption Flow

## Overview
Configurable redemption for B2B allows tenant admins to control how guest users redeem invitations. Also unlocks SAML/WS-Fed IdP redemption for AAD verified domains.

## What Changed
- Customers can prioritize federated configs over Azure AD verified domains
- Customers can disable MSA as a redemption option
- Customers can choose a single redemption option (MSA only at launch)
- Configurable redemption is part of **cross-tenant access settings**
- Only affects **new redemptions** post-configuration, not existing redeemed users

## Support Team
- External Identity Management: azidcomm-extidmgmt@microsoft.com

## Documentation
- ADO Wiki: `AzureAD/_wiki/wikis/AzureAD/1167552/Azure-AD-B2B-Custom-Redemption-Flow`
- MS Graph: `defaultInvitationRedemptionIdentityProviderConfiguration` resource type
- Feature docs: Cross-tenant access overview > Configurable redemption section
