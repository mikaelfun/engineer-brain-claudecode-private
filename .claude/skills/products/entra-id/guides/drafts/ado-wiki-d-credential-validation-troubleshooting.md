---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Troubleshooting Identity Provisioning issues/Credential Validation - Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FTroubleshooting%20Identity%20Provisioning%20issues%2FCredential%20Validation%20-%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Overview

AAD Sync Fabric attempts to validate credentials on the following occasions:

  - When **Test Connection** has been clicked in the Admin Credentials section of the Provisioning blade
  - At the start of any provisioning cycle

When attempting to validate credentials, the following actions are performed:

  - Validate that the provided credentials/token can be used to authenticate to the provisioning endpoint
  - Perform test actions against the endpoint - these vary depending on what provisioning connector is being used, but are usually one or more of the following:
      - GET request for a make up non-existent user to confirm a correct response from the API for the user not existing
      - Create a test user + delete the newly created test user

## Troubleshooting "Test Connection"

To troubleshoot **Test Connection** from the Provisioning blade in the Entra portal, start by knowing the tenantId GUID value (aka the contextId). Perform a **Test Connection** action in the portal and take note of the time that the failed test was performed. Ensuring at least a 5-10 minute wait for logs to populate in Kusto, you can then run the following query:

```kusto
GlobalIfxUsageEvent
| where contextId == "9bfxxxxxx-b82bbd8axxxx" //Add TenantId here
| where message contains "target endpoint / url"
| where env_time > ago(3d)
| where message contains "validateCredentials"
| project env_time, correlationId, message
```

From the results of this query, you should have identified the MS Graph requests for one or more failed **Test Connection** attempts. Take the correlationId for the attempt that is being troubleshot and put it into the following query:

```kusto
GlobalIfxAllTraces
| where correlationId == "bccxxxx-4b0e-8313-e0dd8560xxxx"
//| where message contains "web resource" // Find web traffic
| project env_time, env_seqNum, message
| sort by env_time, env_seqNum
```

Another option will be to use the below queries:

```kusto
-- Query #1
GlobalIfxInformationalEvent
| where env_time>ago(3d)
| where contextId == "3b3ed5aa-2cc7-xxxx" //Use tenant id here
| where message contains "synchronization.validateCredentials"
| project env_time, correlationId, message, sliceName, contextId

-- Query #2
GlobalIfxUsageEvent
| where message contains "servicePrincipals('d26428c6-424b-xxxx)" //Use service principal id here
| where env_time > ago(3d)
| where message contains "validateCredentials"
| project env_time, correlationId, message
```

## Troubleshooting quarantine due to credential validation failure

The below query returns a single log entry for every provisioning cycle execution, indicates if it is an initial sync(1) or an incremental/delta sync(0), and indicates if the runProfile is in quarantine:

```kusto
GlobalIfxRunProfileStatisticsEvent
| where runProfileIdentifier == "slackOutDelta.xxx.xxx"
//| where quarantineStatus != "False" // Uncomment to only show quarantined
| where env_time > ago(7d)
| project env_time, syncAll, quarantineStatus
```

### Example (Authentication Failure)

Error pattern:
```
Error code: ServiceNowCredentialsValidation
Microsoft.ActiveDirectory.Connector.QuarantineException: Your ServiceNow credentials are invalid.
The HTTP request is unauthorized with client authentication scheme 'Basic'.
The remote server returned an error: (401) Unauthorized.
```
Troubleshooting should start with the target system (ServiceNow side) to determine why the request was rejected.

### Example (Test action against target endpoint)

Quarantine triggered by credential validation test action failure:
```
EncounteredQuarantineException
SystemForCrossDomainIdentityManagementCredentialValidationFailure
Response Status Code: BadRequest
Response Content: {"Errors":{"description":"incomplete_filter"}}
```
The test GET request uses matching criteria attributes. If the customer configured matching on an attribute the target SCIM API does not support for filtering, the test fails.

## Final notes

Every connector handles authentication and test actions differently. Logging may vary across connectors, especially with different API types (SOAP, SCIM, etc.). Understanding the base logic of expected operations allows troubleshooting across most provisioning authentication attempts.
