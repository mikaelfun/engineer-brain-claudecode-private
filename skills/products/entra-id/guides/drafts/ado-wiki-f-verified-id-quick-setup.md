---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Verified ID/How to/Verified ID Quick Setup"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Verified%20ID/How%20to/Verified%20ID%20Quick%20Setup"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Verified ID Quick Setup

## Summary

Quick setup removes several configuration steps with a single click on **Get started**. It handles signing keys, DID registration, domain verification, and creates a Verified Workplace Credential.

**IMPORTANT:** If quick setup doesn't meet requirements, use [Advanced setup](https://learn.microsoft.com/en-us/entra/verified-id/verifiable-credentials-configure-tenant).

## Key Differences from Advanced Setup

- **Shared signing key** (managed by Microsoft, shared across tenants in a region) - No Azure Key Vault needed
- **validityInterval limited to 6 months** (due to shared key)
- **Custom domain required** - uses registered domain for verification (no did-configuration.json upload needed)
- **Tenant branding** picked up for VerifiedEmployee credential (logo, background color)
- **DID format:** `did:web:verifiedid.entra.microsoft.com:tenantid:authority-id`

If no custom domain is registered, setup defaults to advanced setup experience.

## Requirements

- Global Administrator or Authentication Policy Administrator (+ Application Administrator for app registration/consent)
- Custom domain registered in tenant

## Setup Steps

1. Sign in to Microsoft Entra admin center as Global Administrator
2. Select **Verified ID** → **Setup**
3. Click **Get started**
4. Select domain (if multiple registered)
5. Setup creates default Verified Workplace Credential

## Issue Credentials via MyAccount

Users can go to [myaccount.microsoft.com](https://myaccount.microsoft.com/) → **Get my Verified ID** to self-issue a Verified Workplace Credential.

Admins can:
- Remove the MyAccount option and create custom issuance app
- Restrict to specific groups
- Allow some minutes for config changes to take effect

## ASC (Azure Support Center)

Verified ID is exposed in ASC. Quick setup authorities are distinguishable by the **absence of a Key Vault**.
