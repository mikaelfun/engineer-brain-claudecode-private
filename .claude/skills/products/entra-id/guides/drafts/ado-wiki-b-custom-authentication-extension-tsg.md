---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Troubleshooting/Azure AD Custom authentication extension TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FAuthentication_flows%20SAML_and_OAuth%2FTroubleshooting%2FAzure%20AD%20Custom%20authentication%20extension%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure AD Custom Authentication Extension TSG

## Feature Overview

Custom Authentication Extensions allow customizing authentication experiences beyond out-of-box capabilities by integrating with external databases, cloud services, and APIs.

### Supported Events

| Event | Actions |
|-------|---------|
| onTokenIssuanceStart | ProvideClaimsForToken |
| OnAttributeCollectionStart | Continue, ModifyAttributesToCollect, ShowBlockPage |
| OnAttributeCollectionSubmit | Continue, ShowValidationError, ShowBlockPage, ModifyCollectedAttributes |
| OnEmailOtpSend | Custom email provider for OTP codes |

### Architecture Components

1. **Events** - Triggered at specific steps in authentication pipeline
2. **Event Listeners** - Evaluated based on filters (e.g., application ID), invoke handlers when matched
3. **Event Handlers** - Either custom extensions (customer API) or managed handlers (Entra ID built-in)

## OnOtpSendCustomExtension (Oct 2024)

Allows using custom email provider for OTP codes in sign-up, sign-in, and password reset flows.

### Sign-up Audit Logging

```
https://graph.microsoft.com/beta/auditLogs/signUps?$top=10&$filter=signUpStage+eq+'credentialCollection'
```

Look for `eventType: "emailOtpSend"` in `appliedEventListeners`.

### Fallback to Microsoft Provider

Configure via Graph API PATCH:
```
PATCH https://graph.microsoft.com/beta/identity/authenticationEventListeners/{customListenerObjectId}
```
Set `behaviorOnError` to `fallbackToMicrosoftProviderOnError`.

## Case Handling

- Support queue: MSaaS AAD - Applications Premier
- Team: Entra ID Authentication Team - Application Experience
- SAP: Azure/Microsoft Entra App Integration and Development/Issues Signing In to Applications

## Common Conceptual Gotchas

- Middle layer API is virtually always required
- Error behavior differs: SAML (AAD hosted error page) vs OIDC (redirect back to app with error, no token)
- 2-second timeout with one retry (sequential failures trigger error)
- Most customers should use resource app id, not client app id, for API logic
- In prod, configure Azure Function Authentication blade (Easy Auth) to validate tokens
- FQDN matching between Application Resource Identifier and target URL

## Common Performance Issues

- Not using always-warm tier for API hosting
- Not caching access tokens for downstream services
- Slow downstream services - add App Insights logging
- Cache MS Graph data that doesn't need real-time updates
- Serial calls that could be multi-threaded/async

## Security Requirements

- **FQDN matching**: Application ID URI must match targetUrl FQDN
- Application ID URI format: `api://{fqdn}/{appid}` or `https://{fqdn}/{appid}`
- Service principal must have `CustomAuthenticationExtensions.Receive.Payload` (Microsoft Graph) application permission with admin consent

## Viewing Configuration via ASC

```
https://graph.microsoft.com/beta/identity/authenticationEventListeners
https://graph.microsoft.com/beta/identity/customAuthenticationExtensions
```

## Troubleshooting

### Identifying the Error

1. Check error message on sign-in page (SAML shows on UI, OIDC redirects with error)
2. Check sign-in logs > Additional Details tab for Applied Event Listeners
3. Use Kusto to find correlation IDs:

```kusto
let startTime = ago(2h);
let endTime = now();
cluster('estswus2.kusto.windows.net')
.database("ESTS")
.AllPerRequestTable()
| where env_time between (startTime .. endTime)
| where TenantId == "<tenantId>"
| where ApplicationId == "<appId>"
| where ErrorCode in ("StsPipelineEventUserError", "StsPipelineEventFailed")
| project env_time, CorrelationId, RequestId, env_cloud_deploymentUnit
```

## Error Codes Reference

| Code | Name | Description |
|------|------|-------------|
| 1003000 | EventHandlerUnexpectedError | Unexpected error processing event handler |
| 1003001 | CustomExtensionUnexpectedError | Unexpected error calling custom extension API |
| 1003002 | CustomExtensionInvalidHTTPStatus / ExternalApiResponseStatusNotSuccess | Invalid status code or unsupported response (check Content-Type = application/json) |
| 1003003 | CustomExtensionInvalidResponseBody / ExternalApiResponseParsingError | Response parsing failed (missing @odata.type or malformed JSON) |
| 1003004 | CustomExtensionThrottlingError | Throttling limits reached |
| 1003005 | CustomExtensionTimedOut | API did not respond within configured timeout |
| 1003006 | CustomExtensionInvalidResponseContentType | Response Content-Type is not application/json |
| 1003007 | CustomExtensionInvalidResponseEventType | Response eventType doesn't match called event |
| 1003008 | CustomExtensionInvalidResponseApiSchemaVersion | Response apiSchemaVersion doesn't match |
| 1003009 | CustomExtensionNoResponse | Response body was null |
| 1003010 | CustomExtensionInvalidNumberOfActions | Wrong number of actions in response |
| 1003011 | CustomExtensionNotFound | Custom extension not found |
| 1003012 | CustomExtensionInvalidActionType | Invalid action type |
| 1003014 | IntermediateAccessTokenFQDNValidationFailed | ResourceId format invalid |
| 1003015 | IntermediateAccessTokenFQDNValidationFailed | FQDN in resourceId doesn't match targetUrl |
| 1003016 | PrincipalNotFoundWithIdSpecified | AppId in resourceId has no matching service principal |
| 1003017 | PrincipalNotFoundWithIdSpecified | AAD Authentication Extensions SP not found in tenant |
| 1003018 | InvalidResourceServicePrincipalDisabled | AAD Authentication Extensions SP is disabled |
| 1003019 | PrincipalNotFoundWithIdSpecified | ResourceId not in IdentifierUris or is disabled |
| 1003021 | CustomExtensionPermissionNotGrantedToServicePrincipal | Missing CustomAuthenticationExtensions.Receive.Payload permission |
| 1003022 | CustomExtensionMsGraphServicePrincipalNotFoundOrDisabled | MS Graph SP not found or disabled |
| 1003027 | ExternalApiDnsResolutionError | DNS resolution failed for target URL |

## ICM Escalation

- Service: CPIM
- Team: CRI-Triage

## External Documentation

- [Custom authentication extensions overview](https://learn.microsoft.com/en-us/azure/active-directory/develop/custom-extension-overview)
- [Troubleshoot your custom claims provider API](https://learn.microsoft.com/en-us/entra/identity-platform/custom-extension-troubleshoot)
