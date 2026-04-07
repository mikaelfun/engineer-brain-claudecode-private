---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD MFA/MFA Server Migration Utility"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Authentication/Azure%20AD%20MFA/MFA%20Server%20Migration%20Utility"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MFA Server Migration Utility

> Full content (52K+ chars) available at source wiki page.

## Summary

Facilitates synchronizing MFA data from on-premises Azure MFA Server to Azure MFA (cloud). After migration, users leverage cloud-based MFA without re-registration.

## Key Concepts

- One-way copy from on-premises MFA Server DB to Azure AD user objects
- Staged Migration tool allows targeting single users or groups
- MFA methods updated based on migrated data; default method set
- Server tracks last migration timestamp, only re-migrates on settings change
- Staged Rollout policy controls WHERE user performs MFA

## Requirements

- MFA Server build must be installed on Primary MFA Server
- DO NOT update WebSDK or User Portal even if prompted
- Full upgrade required for versions below 6.1.0
- Configure-MultiFactorAuthMigrationUtility.ps1 creates app registration in Azure AD

## Common Issues

- Migration utility not syncing methods
- Staged Rollout policy conflicts
- Domain federation settings changes during migration
- Method mapping discrepancies between server and cloud
- Migrate Default Methods checkbox behavior
- Version compatibility issues
