---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure AD B2C Troubleshooting/Azure AD B2C - How to locate B2C correlation ID and logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20B2C%2FAzure%20AD%20B2C%20Troubleshooting%2FAzure%20AD%20B2C%20-%20How%20to%20locate%20B2C%20correlation%20ID%20and%20logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to locate B2C correlation ID and logs

Below is a walkthrough on how to identify a B2C correlation ID and timestamp from a customer's repro trace. You can follow these steps after customer has used https://aka.ms/hartrace or Fiddler capture (w/https decryption on) to record a repro trace of their issue.

## Steps to identify the B2C correlation ID from a HAR or Fiddler trace

1. Request customer reproduce issue and collect/provide a HAR trace (https://aka.ms/hartrace) or Fiddler trace (w/https decryption enabled)
   - **Note**: If the issue can only be reproduced on mobile device, review Mobile Phone Data Gathering wiki page.

2. Open the trace with Fiddler classic
   - To open a HAR trace: right click HAR file -> "Open with..." -> Fiddler.exe
   - To open a Fiddler trace: File -> Load Archive -> Choose .saz file

3. Press **CTRL+F** to bring up Find sessions dialog. Search for: **x-ms-cpim-trans**
   - Set **Search** = "Requests and responses" and **Examine** = "Headers and bodies"

4. Fiddler will highlight frames containing "x-ms-cpim-trans". Click any highlighted frame.

5. **STOP**: If no frames found with **x-ms-cpim-trans**, search for **x-ms-gateway-requestid** instead (found in Response Headers). Use this as the correlation ID for Kusto queries.

6. In the **Inspectors** tab -> **Headers** sub-tab, find the Cookie value **x-ms-cpim-trans** in request or response headers.
   - If x-ms-cpim-trans= is empty, browse to next result until you find a non-empty value.

7. Right Click the value -> **Send to TextWizard**

8. In Text Wizard:
   - Change **Transform** to **From Base64**
   - Remove all text except the Base64 value (starts with "ey", ends with "==")
   - Remove "x-ms-cpim-trans=" prefix and everything after "; domain="

9. The decoded value contains **"C_ID"** which is the **B2C Correlation ID**. Copy this value.

10. Get the UTC timestamp from **Response Headers** -> Cache -> Date value.

## Finding B2C Service Logs With Correlation ID and Timestamp

With Correlation ID and Timestamp, use either:

1. **ASC Kusto Web Explorer** (if you have ASC access to B2C tenant) - use "Query Everything with Correlation ID and timestamp"
2. **CPIM Kusto Viewers** (entitlement 19029) - use Kusto Web Explorer

### Query errors only:

```kql
let id = "12345678-1234-1234-1234-123456789abc";  //replace with correlation ID
let timestamp = datetime(2022-03-01 20:00); // replace with UTC timestamp
let delta = 1d;
AllIfxEvents
| where env_time > timestamp - delta and env_time <= timestamp + delta
| where TableName !in ("IfxRedisRequestEvent", "IfxThrottlingRequestEvent", "IfxClientTelemetryRequestEvent", "IfxDocDBRequestEvent")
| where internalCorrelationId == id or correlationId == id
| where resultSignature !in ("", "Success", "200", "OK", "200 OK", "Noop", "302")
| summarize by TableName, policyId, userJourneyId, userJourneyStepNumber, resultSignature, resultDescription, message
```

### Query detailed logs:

```kql
let id = "12345678-1234-1234-1234-123456789abc";  //replace with correlation ID
let timestamp = datetime(2023-07-10 22:16); // replace with UTC timestamp
let delta = 30m;
AllIfxEvents
| where env_time > timestamp - delta and env_time <= timestamp + delta
| where TableName !contains "IfxRedisRequestEvent" and TableName !contains "IfxThrottlingRequestEvent" and TableName !contains "IfxClientTelemetryRequestEvent" and TableName !contains "IfxDocDBRequestEvent"
| where internalCorrelationId == id or correlationId == id
| project-reorder env_time, policyId, userJourneyId, userJourneyStepNumber, userJourneyStepType, targetEndpointAddress, operationType, resultType, resultSignature, resourceId, resultDescription, errorCode, responseCode, message, technicalProfileId, correlationId, internalCorrelationId, userObjectId, callerIdentity, clientId, indexableData, sentClaims, receivedClaims, outputClaims, inputClaims, sendClaimsIn, domainName, tenantName, policyClassification
```

## Identify B2C correlation ID from Browser (Live Debugging)

1. Press F12 in Browser (Edge/Chrome) and select Elements or Sources tabs
2. Reload or open the customer's B2C run now URL
3. The Correlation ID is in HTML comment section at top of page
4. Use the Correlation ID + Timestamp with B2C Kusto queries (https://aka.ms/b2ckustoqueries)
