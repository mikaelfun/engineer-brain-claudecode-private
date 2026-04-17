---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Azure AD Authentication Method Policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FAzure%20AD%20Authentication%20Method%20Policies"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Azure AD Authentication Method Policies

## Summary

Covers the Default User Credential Policy and Managed Migration from legacy MFA/SSPR policies to the unified Authentication Methods Policy (AMP).

## Managed Migration States

| policyMigrationState | Value | Meaning |
|---------------------|-------|---------|
| Pre-Migration | 0 | Policy used for auth only. Legacy policies respected. |
| Migration in Progress | 1 | Policy used for auth + SSPR. Legacy policies respected. |
| Migration Complete | 2 | Policy used for auth + SSPR. Legacy policies disabled. |

**Note**: For tenants created after mid-2024, migration is set to complete by default (policyMigrationState appears as null). Manage migration option is not displayed.

## Legacy MFA to AMP Mapping

| Legacy MFA | New AMP |
|-----------|---------|
| Call to phone | Voice call (Enable, All Users, check Office) |
| Text message to phone | SMS (Enable, All Users, uncheck Use for sign-in for MFA/SSPR only) |
| Notification through mobile app | Microsoft Authenticator (Enable, All Users, Auth method: Any) |
| Verification code from mobile app/hardware token | Third party software OATH tokens + Microsoft Authenticator (OTP enabled) |

## Legacy SSPR to AMP Mapping

| Legacy SSPR | New AMP |
|------------|---------|
| Mobile app notification | Microsoft Authenticator (Any) |
| Mobile app code | Third party software OATH tokens + Microsoft Authenticator (OTP) |
| Email | Email OTP |
| Mobile phone | Voice call + SMS |
| Office phone | Voice call (check Office) |
| Security questions | Not yet available |

## Breaking Changes / Retirement Timeline

- **Sep 30, 2025**: Legacy MFA (Verification Options) and SSPR methods editing disabled
- **Sep-Oct 2025**: Exception requests accepted (valid until Jan 2026)
- **Nov 2025**: UX changes roll out (legacy editing disabled)
- **Jan 2026**: UX changes apply to all tenants
- **2026**: Auto-migration of remaining tenants

## Known Issues

### Issue 1: Blocked from Disabling Auth Methods in SSPR

**Symptom**: Error "Number of methods chose is less than number of methods required to reset", Save unavailable.

**Solution**: Change migration state to Migration in Progress (Security > Authentication methods > Manage migration).

### Issue 2: Users Still Registering OATH Tokens After Legacy MFA Disabled

**Symptom**: Users register authenticator apps as software OATH tokens despite disabling in legacy MFA.

**Solution**: Also disable Mobile app code/notification in SSPR Authentication Methods blade. If blocked, change migration to Migration in Progress first.

### Issue 3: Automated Guide Changes Authenticator Mode to Push

**Symptom**: After migration wizard, Authenticator mode becomes Push, breaking Passwordless.

**Solution**: Manually edit Authenticator policy to restore desired mode. Bug 3091679.

## CCE Policy API Error Messages

### Common Validation Errors

| Error | Cause |
|-------|-------|
| Invalid AuthenticationMethodState | State is not "enabled" or "disabled" |
| Credential policy ID cannot be null | Missing id property |
| Cannot Exclude individual users | User-targeting in Exclude targets |
| Include condition must have valid GUID or all_users | Invalid target id format |
| all_users can only be used with group condition | Wrong targetType for all_users |
| Cannot exclude all users | Attempted to exclude all_users |
| Same target cannot be both included and excluded | Duplicate target in include/exclude |

### Authenticator-Specific Errors

| Error | Cause |
|-------|-------|
| Cannot enable multiple targets for feature | Feature settings support only one include/exclude target |
| Must specify valid include/excludeTarget | Null targets in feature settings |
| Cannot be enabled targeting a single user | User targeting in feature targets |
| Cannot be excluded for all users, disabled instead | Attempting to exclude all_users in feature |

## Audit Log Changes (March 2026 GA)

Audit log entries now show only changed settings with Old/New values (instead of full policy payload). Rollout: Early-Late April 2026 (Worldwide), Late April-May 2026 (sovereign clouds).

- Service: Authentication Methods
- Category: PolicyManagement
- Activity: Authentication Methods Policy Update / Reset

## Troubleshooting via ASC

Check migration status in ASC. Use Graph Explorer for current policy state.
