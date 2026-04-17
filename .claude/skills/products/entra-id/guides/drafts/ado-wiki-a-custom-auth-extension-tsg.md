---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Troubleshooting/Azure AD Custom authentication extension TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Troubleshooting/Azure%20AD%20Custom%20authentication%20extension%20TSG"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Custom Authentication Extension — Comprehensive TSG

**Supported by:** MSaaS AAD - Applications Premier → Entra ID Authentication Team - Application Experience  
**ICM Escalation:** Service: CPIM, Team: CRI-Triage

## Feature Overview

Custom Authentication Extensions allow customizing the Entra ID authentication pipeline via REST APIs hooked to pipeline events:

| Scenario | Event | Possible Actions |
|---|---|---|
| Add custom claims to tokens from external data store | `OnTokenIssuanceStart` | ProvideClaimsForToken |
| Call API before collecting user attributes on Sign-Up | `OnAttributeCollectionStart` | Continue, ModifyAttributesToCollect, ShowBlockPage |
| Validate user data on Sign-Up submission | `OnAttributeCollectionSubmit` | Continue, ShowValidationError, ShowBlockPage, ModifyCollectedAttributes |
| Custom email provider for OTP | `OnEmailOtpSend` | Call external API (SendGrid, ACS, MailJet, etc.) |

### Key Concepts

- **Custom Extension** = Customer's REST API that receives Entra ID event, performs business logic, returns action
- **Event Listener** = Configuration binding an event + conditions (appId filter) to a handler; highest priority wins if multiple match
- **2-second timeout with ONE retry** — sequential 2s failures = error
- **FQDN matching** = App ID URI FQDN must match targetUrl FQDN (security requirement)
- **Middle layer API** is virtually always required
- Error behavior differs: SAML → AAD-hosted error page; OIDC → redirect back to app with error (no token)
- In production: configure Easy Auth on Azure Function to validate incoming tokens

## Step 1: Identify the Error

### From user-facing error message

- **OAuth error**: Redirect to app with error parameter (no token)
- **SAML error**: Sign-in UI shows error page

### From Sign-In Logs

1. Navigate to **Entra ID → Sign-in logs** for the tenant
2. Filter to the failing application
3. Click on the failed sign-in → **Additional Details** tab → look for event listener error codes

### From Kusto

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

### From ASC Graph Explorer

```
GET https://graph.microsoft.com/beta/identity/authenticationEventListeners
GET https://graph.microsoft.com/beta/identity/customAuthenticationExtensions
```

## Step 2: Error Code Reference

| ESTS Code | Error Name | Description & Action |
|---|---|---|
| 1003000 | EventHandlerUnexpectedError | Unexpected error processing event handler |
| 1003001 | CustomExtensionUnexpectedError | Unexpected error calling custom extension API |
| 1003002 | CustomExtensionInvalidHTTPStatus | API returned invalid HTTP status code; OR Content-Type not 'application/json' → set Content-Type header |
| 1003003 | CustomExtensionInvalidResponseBody | Response body parsing failed; '@odata.type' required field missing → add '@odata.type' to response |
| 1003004 | CustomExtensionThrottlingError | Too many custom extension requests; throttle limit reached |
| 1003005 | CustomExtensionTimedOut | API did not respond within 2s timeout → see performance troubleshooting below |
| 1003006 | CustomExtensionInvalidResponseContentType | Response Content-Type is not 'application/json' |
| 1003007 | CustomExtensionInvalidResponseEventType | API response eventType doesn't match the called event |
| 1003008 | CustomExtensionInvalidResponseApiSchemaVersion | API response apiSchemaVersion doesn't match |
| 1003009 | CustomExtensionNoResponse | API response body was null |
| 1003010 | CustomExtensionInvalidNumberOfActions | Wrong number of actions in response for this extension type |
| 1003011 | CustomExtensionNotFound | Custom extension associated with event listener not found |
| 1003012 | CustomExtensionInvalidActionType | Invalid action type returned for this extension type |
| 1003014 | IntermediateAccessTokenFQDNValidationFailed | ResourceId must be in format `api://{fqdn}/{appid}` |
| 1003015 | IntermediateAccessTokenFQDNValidationFailed | FQDN in ResourceId must match FQDN of targetUrl → update App ID URI first, then change targetUrl |
| 1003016 | PrincipalNotFoundWithIdSpecified | appId in ResourceId doesn't correspond to a real service principal in the tenant |
| 1003017 | PrincipalNotFoundWithIdSpecified | Entra ID Authentication Extensions service principal not found in tenant |
| 1003018 | InvalidResourceServicePrincipalDisabled | Entra ID Authentication Extensions service principal is disabled in tenant |
| 1003019 | PrincipalNotFoundWithIdSpecified | ResourceId not found in app's IdentifierUris or is disabled |
| 1003021 | CustomExtensionPermissionNotGrantedToServicePrincipal | Service principal missing admin consent for `CustomExtensionsPayload.Receive.All` (MS Graph) |
| 1003022 | CustomExtensionMsGraphServicePrincipalNotFoundOrDisabled | MS Graph service principal not found or disabled in tenant |
| 1003027 | ExternalApiDnsResolutionError | DNS resolution failed for targetUrl hostname → verify URL is correct and hostname is resolvable |

## Step 3: Performance Troubleshooting (Timeout: 1003005)

Common causes and mitigations:

| Issue | Mitigation |
|---|---|
| API cold-start (non-warm tier) | Use Azure Functions Premium (always warm) or pre-warm tier |
| No caching of access tokens | Cache tokens for downstream service calls |
| MS Graph calls on every request | Cache non-real-time data (groups, directory schema extensions) |
| Serial downstream calls | Make calls parallel/async instead of sequential |
| No performance monitoring | Add App Insights to Azure Function to time and monitor calls |

**Performance testing method:** ROPC + Postman

## Step 4: Security Configuration Checklist

- [ ] Application ID URI format: `api://{fqdn}/{appid}` or `https://{fqdn}/{appid}`
- [ ] FQDN in App ID URI matches targetUrl FQDN exactly
- [ ] Service principal has **CustomExtensionsPayload.Receive.All** (MS Graph) with admin consent
- [ ] In production: Easy Auth configured on Azure Function to validate Entra ID tokens
- [ ] Client app ID vs resource app ID: most customers should use resource app ID when doing logic based on target app

## Step 5: OTP Fallback Configuration (OnOtpSendCustomExtension)

To configure fallback to Microsoft built-in OTP email provider on error:

```
PATCH https://graph.microsoft.com/beta/identity/authenticationEventListeners/{customListenerObjectId}

{
    "@odata.type": "#microsoft.graph.onEmailOtpSendListener",
    "handler": {
        "@odata.type": "#microsoft.graph.onOtpSendCustomExtensionHandler",
        "configuration": {
            "behaviorOnError": {
                "@odata.type": "#microsoft.graph.fallbackToMicrosoftProviderOnError"
            }
        }
    }
}
```
Requires: **EventListener.ReadWrite.All** delegated permission.

## When to Guide Customers Away from Token Augmentation

- → Custom security attributes (if token claim not required)
- → Entra ID Connect/Sync (for migrating off AD FS / on-prem AD)
- → Directory schema extensions (store attributes in directory itself)
- → SCIM / user provisioning / Graph APIs (for user migration)

## External Documentation

- Custom authentication extensions overview: https://learn.microsoft.com/en-us/azure/active-directory/develop/custom-extension-overview
- Troubleshoot custom claims provider API: https://learn.microsoft.com/en-us/entra/identity-platform/custom-extension-troubleshoot
