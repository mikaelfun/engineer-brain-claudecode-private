---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Federated Identity Credential (FIC) Auth"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Federated%20Identity%20Credential%20(FIC)%20Auth"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Federated Identity Credential (FIC) Auth

## What is FIC Auth in App Proxy?

Traditionally App Proxy uses client secrets in the pre-auth flow to redeem a token for the auth code in the OAuth grant flow. FIC is an alternative that uses Federated Identity Credentials instead of secrets.

## When FIC is NOT Used

- Preauthentication type is **passthrough**
- Apps configured for **POST token flow**: specific apps configured by engineering to use POST token flow. Token is posted to the application proxy endpoint by the client instead of using a code. (Check `UsePostBodyAuth` in `ExtraResultData` in `TransactionSummaries`)

## Control Plane

### FIC Creation

Enabling FIC results in adding a Federated Identity Credential named **"Appproxy-FIC"** to apps during:
- **New App**: All app create flows add FIC if the feature is enabled
- **Existing App**: App update flows that update `OnPremisesPublishing` property add FIC if not present

> **Note**: Changing connector groups will NOT add FIC to an existing app.

### FIC Lifetime

- FIC **does not expire** - valid for the lifetime of the app
- Editing/deleting the FIC value causes auth failures
- **Self-fix**: Delete the corrupted FIC, then disable/re-enable the app to trigger an update that recreates FIC

### Kusto - Track FIC Operations

```kusto
// Track addition of FIC to app
UnionAPTables("GraphOperationEvent")
| where env_time > ago(12h)
| where operationName == "MsGraphAddFederatedIdentity" and env_cloud_role == "adminfrontend"
| summarize count() by env_cloud_location, resultType
```

```kusto
// App creates/updates that had FIC adds
UnionAPTables("GraphOperationEvent")
| where env_time > ago(12h)
| where operationName == "MsGraphAddFederatedIdentity"
| project-rename trxId=transactionId, addficresult=resultType
| join kind = rightouter
(UnionAPTables("MsgraphApplicationOperationEvent")
| where env_time > ago(12h)
| where SubOperationName in ("AdminUpdateApplication", "AdminCreateApplication")
| where appType == "enterpriseapp"
| project env_time, env_cloud_deploymentUnit, transactionId, resultType)
on $left.trxId==$right.transactionId
```

## Data Path - FIC Auth in OAuth Grant Flow

Token acquisition happens in 2 steps:
1. **Acquire FIC token** using 1pp app and unique id (appid) specified in the Federated credential
2. **Use FIC token + OAuth code** to redeem user token

### Kusto - Data Path Troubleshooting

```kusto
// Step 1: Acquiring FIC Token
AadAuthenticationOperationEvent
| where env_time > ago(2h) and operationName == "AcquireTokenForProjectedIdentity"
| where subscriptionId == "<tenantId>"
```

```kusto
// Step 2: Acquiring user token using FIC assertion
AadAuthenticationOperationEvent
| where env_time > ago(2h) and operationName == "AcquireGrantFlowToken"
| where subscriptionId == "<tenantId>"
| where ClientIdentity == "Assertion"
```

```kusto
// Check TransactionSummaries for FIC flow
TransactionSummaries
| where TIMESTAMP > ago(1h) and FlowType == "AadPreauth"
| where ExtraResultData contains "GrantFlow-FIC"
| take 50
```

```kusto
// For a specific application
TransactionSummaries
| where TIMESTAMP > ago(1h) and FlowType == "AadPreauth"
| where ApplicationId == "<applicationId>"
| where ExtraResultData contains "GrantFlow-FIC"
| take 50
```

## Known FIC Failure Scenarios

1. **AADSTS700020**: Reserved URI used as app identifier URI. FIC token acquisition fails. Secrets auth succeeds.
2. **AADSTS70052**: App is multi-tenant. FIC does not support multi-tenant apps.
