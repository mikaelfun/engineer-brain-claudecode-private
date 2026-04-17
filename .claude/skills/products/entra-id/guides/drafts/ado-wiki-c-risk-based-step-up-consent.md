---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_Consent_Experiences/How to/Risk Based Step Up Consent"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FHow%20to%2FRisk%20Based%20Step%20Up%20Consent"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Risk Based Step-up Consent

## Background

Microsoft recommends restricting user consent to allow end-user consent only for apps from verified publishers and only for permissions you select. One reason for restricting end-user consent is to minimize the risk of consent phishing attacks.

However, some organizations choose to keep end-user consent enabled. **Risk Based Step-up Consent helps reduce the risk of illicit app compromise in those organizations.**

## Overview

When Risk Based Step-up Consent is enabled, Microsoft evaluates permissions requests made by applications to non-admin users. If a given request is deemed risky the user will not be allowed to consent.

*Note: if end-user consent to apps is already disabled, this feature will not have any impact.*

## Functional Behavior Changes

### Consent Screen

When an end user tries to consent to a risky app, the consent screen shows:

*Need admin approval - \<App Name> needs permission to access resources in your organization that only an admin can grant.*

Error codes: **AADSTS90094** or **AADSTS90095**

If admin consent workflow is enabled, users can send a request to their admin.

### Audit Logs

An event is emitted in Azure AD Audit logs when a user is blocked:

- **Activity Type**: Consent to application
- **Category**: ApplicationManagement
- **Status**: Failure
- **Status Reason**: Risky application detected

**Note**: Status reason may show as `Microsoft.Online.Security.UserConsentBlockedForRiskyAppsException` instead.

### Monitoring Query

```kql
AuditLogs
| where ResultDescription contains "Risky application detected"
    or ResultDescription contains "Microsoft.Online.Security.UserConsentBlockedForRiskyAppsException"
| project TargetedUsers = InitiatedBy, TimeGenerated, TargetResources
```

### Internal Log Searches

Check DPX/MSODS Kusto logs for `UserConsentBlockedForRiskyAppsException`:

```kql
let _start = datetime(2020-04-20 12:15:00);
let _end = datetime(2020-04-20 12:20:00);
GlobalIfxUlsEvents
| where env_time between (_start .. _end)
| where env_cloud_role == "restdirectoryservice"
| where internalCorrelationId == "<correlationId>"
| where tagId == "03jo"
| project env_time, internalCorrelationId, correlationId, contextId, tagId, message
```

Also available in `GlobalIfxRestBusinessCommon`:
```kql
GlobalIfxRestBusinessCommon
| where env_time between (_start .. _end)
| where env_cloud_role == "restdirectoryservice"
| where internalCorrelationId == "<correlationId>"
| project env_time, internalCorrelationId, correlationId, operationName, contextId, applicationId, httpStatusCode, exceptionType
```

## Developer FAQ

**My app is getting flagged as risky. What should I do?**
- Verify the developer is legitimate (not a bad actor trying to bypass)
- After September 2023: guide developers to apply Publisher Verification
- If the issue persists after Publisher Verification, the customer tenant may have restricted consent policy
- **Internal**: Details of the September 2023 backend change cannot be disclosed publicly (security improvement)
- For immediate resolution: tenant admin can evaluate and grant tenant-wide admin consent
- Developers can reduce risk by completing [Publisher Verification](https://docs.microsoft.com/en-us/azure/active-directory/develop/publisher-verification-overview)

## IT Admin FAQ

**Users are blocked from consenting. What do I do?**
- Make sure you understand how to manage consent and evaluate consent requests
- If apps are not malicious: grant tenant-wide admin consent
- If developer's apps are inadvertently flagged: have developer contact Microsoft support
