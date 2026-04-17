---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Just In Time Password Migration to Microsoft Entra External ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FJust%20In%20Time%20Password%20Migration%20to%20Microsoft%20Entra%20External%20ID"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Just-In-Time (JIT) Password Migration to Microsoft Entra External ID

## Overview

JIT Password Migration enables seamless credential migration from legacy identity providers to Entra External ID during sign-in. User credentials are securely transferred as part of the authentication flow, eliminating bulk password resets.

**Important**: This is for password migration, NOT validation. The legacy system is only used during the first sign-in. After that, passwords are stored and validated directly in Entra External ID.

## Prerequisites

- Active External ID tenant
- Legacy identity provider access for credential validation
- Roles: Application Administrator, User Administrator, Authentication Extensibility Password Administrator (role ID: `0b00bede-4072-4d22-b441-e7df02a1ef63`)

## How JIT Migration Works

1. **User signs in** with legacy credentials
2. **Migration flag check**: If password does not match Entra record and custom extension property indicates migration needed, invokes OnPasswordSubmit listener. If password matches, user is silently marked as migrated.
3. **Password encryption**: Entra ID encrypts password using RSA JWE public key (private key in Azure Key Vault)
4. **Custom extension invocation**: Entra calls Azure Function with encrypted payload
5. **Decryption and validation**: Function decrypts and validates against legacy IDP
6. **Response actions**:
   - `MigratePassword`: Valid password; store in Entra, set migration flag to false
   - `UpdatePassword`: Correct but weak password; force password reset
   - `Retry`: Incorrect password; allow retry
   - `Block`: Authentication blocked (e.g., locked account)
7. **Complete**: Subsequent sign-ins bypass the custom extension

## Implementation Steps

### 1. Bulk Migrate Users

- Define directory extension property for tracking migration status
- Generate temporary passwords for pre-created user accounts
- Create user accounts with migration flag via Graph API

### 2. Set Up Custom Authentication Extension

- Create Azure Function to handle password validation
- Configure Key Vault for password decryption
- Register custom authentication extension in Entra

### 3. Configure OnPasswordSubmit Listener

- Wire custom extension to authentication flow
- Test with sample users

## Troubleshooting Tips

- Verify migration flag (`extension_{appId}_requirePasswordMigration`) is set correctly
- Check Azure Function logs for decryption/validation errors
- Ensure Key Vault access policies allow the function to read the private key
- Verify custom authentication extension is properly registered and linked
- Check Conditional Access policies are not blocking the migration flow

## ICM Escalation

Queue: CPIM/CIAM-CRI-Triage (via ASC, reviewed by TAs/PTAs first)
