---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/SSPR - Self Service Password Reset/SSPR - Cloud Users"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/SSPR%20-%20Self%20Service%20Password%20Reset/SSPR%20-%20Cloud%20Users"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# SSPR - Cloud Users Troubleshooting Guide

Supported by Microsoft Entra ID Management team.

## Prerequisites and Licensing
- Authentication Policy Administrator role required for configuration
- Licensing: see [SSPR licensing requirements](https://docs.microsoft.com/en-us/azure/active-directory/authentication/concept-sspr-licensing)
- Without proper licensing, SSPR won't work and no data in reports

## SSPR Flow
Users trigger SSPR via portal or https://passwordreset.microsoftonline.com. System checks:
1. User has SSPR enabled
2. User has required auth methods defined per admin policy
3. For admin roles: strong two-gate policy enforced

## Authentication Methods (Post-Migration)
Since September 30, 2025, legacy MFA/SSPR policies deprecated. Manage via [Authentication Methods blade](https://portal.azure.com/#view/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/~/AdminAuthMethods).

| Legacy SSPR Method | New Auth Method Policy |
|---|---|
| Mobile app notification | Microsoft Authenticator |
| Mobile app code | Authenticator + Software OATH |
| Email | Email OTP |
| Mobile phone | Voice calls + SMS |
| Office phone | Voice calls |
| Security questions | Not yet available (retiring March 2027) |

## Administrator Special Conditions
- Strong two-gate policy (cannot be changed)
- Requires 2 pieces of auth data
- Security questions prohibited for admins
- Office/mobile voice calls prohibited for free/trial Entra ID
- Admin SSPR policy operates independently of Authentication Methods policy

## TSG: "Password reset isn't turned on for your account"

### Scenario 1: SSPR Policy Not Configured
- Kusto TraceCode 12854: "Tenant is not setup for SSPRU policy"
- Fix: Configure SSPR to enable users to reset passwords

### Scenario 2: User Not in Scoped Access Group
- Kusto TraceCode 12854: "User is not a member of scoped access group"
- Fix: Add user to SSPR security group, or set SSPR scope to "Everyone"

### Scenario 3: User Not Licensed
- Check if user has required SSPR license
- Fix: Assign appropriate license

## Kusto Troubleshooting
See [TSG: SSPR Service Side Logs](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/356009/TSG-SSPR-Service-Side-Logs) for Kusto query guidance using correlationId and timestamp.
