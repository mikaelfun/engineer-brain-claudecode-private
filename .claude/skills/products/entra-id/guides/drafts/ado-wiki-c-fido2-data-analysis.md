---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Data analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/FIDO2%20passkeys/FIDO2%3A%20Data%20analysis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# FIDO2 / Passkey Data Analysis Guide

## How to Approach Data Analysis

The most common scenarios to troubleshoot are:

1. **User impacted**
   - Unable to provision/delete credentials at aka.ms/mysecurityinfo
   - Unable to provision credentials in MS Authenticator app
   - Unable to logon in a browser and access a webapp
   - Unable to access app on iOS/Android device
   - Unable to interactively logon to Windows

2. **Admin impacted**
   - Unable to configure passkeys as an auth method in Entra portal or via MS Graph API
   - Questions on interpreting reports, audit logs, signin logs

3. **Developer impacted**
   - Why is passkey logon not working/possible in my app?

Troubleshooting will require proving where fault lies:
1. Entra ID
2. Browser or Broker App
3. OS
4. Security key

## Using Kusto

### DRS Kusto Log Analysis

| User Activity Region | DRS KQL Cluster | Database |
|:---|---|---|
| EU | idsharedneueudb | ADRS |
| US | idsharedscus | ADRS |
| Australia | auscentralgds | ADRS |
| Japan | jpneastgds | ADRS |

**Enrolment attempts query:**
```kusto
let queryTimestamp = datetime(06/19/2025 23:04:00);
let queryTimespan = time(3m);
let start = queryTimestamp - queryTimespan;
let end = queryTimestamp + queryTimespan;
KeyProvisioningEvent
| where env_time > start and env_time < end
| where usage == "FIDO"
| where operationName in ("CreatePublicKeyCredential","CreatePublicKeyCredentialForCce")
| project env_time, correlationId, operationName, resultType, accountId, aaGuid, authenticatorDescription, additionalInfo, resultSignature
```

### IAMK8S Kusto Log Analysis

| KQL Cluster | Database |
|---|---|
| idsharedscus | IAMK8s |

**Overview of requests:**
```kusto
let queryTimestamp = datetime(06/19/2025 23:04:00);
let queryTimespan = time(3m);
let start = queryTimestamp - queryTimespan;
let end = queryTimestamp + queryTimespan;
AllRequestEvent
| where env_time > start and env_time < end
| where user_objectId == "replace with user objectid as appropriate"
| project env_time, operation_name, operation_id, gateway_request_id, request_responseCode, user_objectId
```

**Diagnostic events (by correlation ID):**
```kusto
let queryTimestamp = datetime(06/19/2025 23:04:00);
let queryTimespan = time(3m);
let start = queryTimestamp - queryTimespan;
let end = queryTimestamp + queryTimespan;
AllDiagnosticEvent
| where env_time > start and env_time < end
| where ContainerName == "myaccess-container"
| where operation_id == "replace with x-ms-correlation-id header value if available"
| project env_time, operation_id, gateway_request_id, RequestPath, user_objectId, user_tenantId, message, FormattedMessage
```

### AllMfaceLogEvents Kusto Log Analysis

| KQL Cluster | Database |
|---|---|
| idsharedwus | IDMfaceWUS |

**Passkey deletion failure analysis:**
```kusto
let queryTimestamp = datetime(2025-07-30 03:42:17.8278085);
let queryTimespan = time(1m);
let start = queryTimestamp - queryTimespan;
let end = queryTimestamp + queryTimespan;
AllMfaceLogEvents
| where env_time > start and env_time < end
| where correlationId == "correlation-id-from-audit-logs"
| project env_time, correlationId, internalCorrelationId, operationName, ServiceName, ServiceComponentName, ControllerName, ActionName, Message, resultType, resultSignature, ExceptionToString
```

## iOS/macOS sysdiagnose Logs Review

Collect via: [Gather sysdiagnose logs](https://support.apple.com/guide/platform-support/supd3f43814e)

Review on macOS:
```bash
log show --info --debug --archive system_logs.logarchive \
  --start '2025-06-12 15:07:50' --end '2025-06-12 15:08:00' \
  --predicate '(sender = "CFNetwork") Or (composedMessage CONTAINS "caBLE") OR (composedMessage CONTAINS "FIDO")'
```

## Diagnosing Errors Returned by the Key

Check the WebAuthN event log (`Microsoft-Windows-WebAuthN/Operational`) for CTAP responses. CBOR-encoded responses can be decoded at cbor.me.

Key CTAP2 error codes:
- `0x2E` — CTAP2_ERR_NO_CREDENTIALS: No valid credentials on key for this RP
- PIN retries response `{3: 0}` — PIN locked, key must be reset (WARNING: erases all credentials)

Reference: [FIDO CTAP2 error responses](https://fidoalliance.org/specs/fido-v2.2-rd-20241003/fido-client-to-authenticator-protocol-v2.2-rd-20241003.html#error-responses)

## Enumerate User Enrolled Keys

1. ASC → Azure AD Explorer → User blade → "user authentication methods" tab → "fido2" dropdown
2. Or Graph API: `GET /users/{id|UPN}/authentication/fido2Methods`

Note: `displayName` is user-entered text; `model` column contains vendor-supplied model details.

## Validating Security Key Capabilities

### Test with demo site
- Navigate to [webauthn.io](https://webauthn.io), register a test credential
- If registration fails, key may be defective

### Query key capabilities
1. Windows Settings > Accounts > Sign-in options > Security key > Manage
2. If "This security key can't be used" → not a valid FIDO2 key
3. Check Event Viewer → `Applications and Services/Microsoft/Windows/WebAuthn/Operational` → Event 2102 (getinfo)
4. Decode CBOR payload to reveal key capabilities per [CTAP2.1 spec](https://fidoalliance.org/specs/fido-v2.1-ps-20210615/fido-client-to-authenticator-protocol-v2.1-ps-20210615.html#authenticatorGetInfo)
