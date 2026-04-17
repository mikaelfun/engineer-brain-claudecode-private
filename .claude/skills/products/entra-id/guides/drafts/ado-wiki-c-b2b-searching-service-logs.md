---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2B/B2B collaboration TSG: Searching B2B Service Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20B2B/B2B%20collaboration%20TSG%3A%20Searching%20B2B%20Service%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# B2B collaboration TSG: Searching B2B Service Logs

This article is a guide on how to query B2B service logs for the root cause of a customer facing B2B invitation or B2B invite redemption failure.

## Steps

1. The customer will need to at minimum provide you a timestamp of the failure, or the raw audit log from their Entra ID Audit Logs showing you the timestamp and correlation ID of the failure. Requesting a reproduction of the failure while capturing a https://aka.ms/hartrace or a https://aka.ms/fiddlercap (w/https decryption on) and a https://aka.ms/problemstepsrecorder can give you all the details needed to understand the scenario and locate the logs

2. If the customer cannot provide the above details, you can search for the failure using Azure Support Center -> Tenant Explorer -> Audit Logs. Use one of the below filters depending on the failure scenario.

   **Invitation Failure**
   - Service = `Invited Users`
   - Activity examples:
     ```
     Invite external user
     Invite internal user to B2B collaboration
     Invite external user with reset invitation status
     ```
   - Time Range = Customer's reported timestamp of failure

   **Invite Redemption Failure**
   - Service = `Invited Users`
   - Activity = `Redeem external user invite`
   - Time Range = Customer's reported timestamp of failure

3. Once the Entra ID Audit Log is located, find the Timestamp and the Correlation ID

4. Once the Correlation ID and Timestamp are located, Open Azure Support Center -> Tenant Explorer -> Kusto Web UX

5. From Kusto Web UX, choose **Select cluster to add:** and locate/add the cluster **aadb2bprod.westus2**

6. Click the **aadb2b** database name and then copy/paste the below Query into the query window to run:

   ```kql
   let id = "5813c187-xxxx-xxxx-xxxx-a2d0adfcd230"; //Replace with correlation ID from ASC Audit Log
   let delta = 8h;
   let timestamp = datetime(2022-10-24T12:40); // Replace with timestamp from ASC Audit Log
   union withsource=TableName B2B*
   | where env_time >= timestamp-delta and env_time <= timestamp+delta
   | where correlationId == id or internalCorrelationId == id or message has id
   | where loggingLevel != "Verbose"  // Remove this filter to see Verbose logs if root cause is not obvious
   | project TableName, env_time, httpMethod, exception, message, method, contextId, controller, url
   ```

   > **Note**: As of 2023-08 the above logs are PII redacted making them not very useful for support. SEs should add Scenarios/ICM/Cases to [CSS AAD Log Access Tracking Spreadsheet](https://aka.ms/cssaadlogaccess) so we may better understand how often we need access to these logs.

7. After pasting the above query, update the **id** variable with Correlation ID found in Step 3, and the **timestamp** variable with the timestamp found in Step 3. Run the query and expand/review each of the found exceptions in message column for root cause of the failure.

8. If the issue is a proxyAddress/mail attribute conflict, search for the invited user's email address in ASC -> Tenant Explorer -> Inviting Tenant ID and query the following locations:
   - Users
   - Groups
   - Contact

   If there are any results, then check the object's mail and proxyAddresses for the conflicting attribute. Customer will need to remove the conflict before re-inviting the user.

9. If the root cause is not clear, use Kusto Web UX's **Share -> Link, query to clipboard** option to share findings with TA or Escalation.

## Alternative Queries

### Search tenant for all B2B Exceptions

```kql
let delta = 1h;
let timestamp = datetime(2022-10-24T12:40); // Replace with timestamp from ASC Audit Log
union withsource=TableName B2B*
| where env_time >= timestamp-delta and env_time <= timestamp+delta
| where loggingLevel != "Verbose"
| project TableName, env_time, httpMethod, exception, message, method, contextId, controller, url
```

### Geneva Query For Details

> **Note**: As of 2023-08 the B2B Geneva/Jarvis logs require AME/AAD-TA security group membership and access from SAW using ame.gbl accounts. TAs should add Scenarios/ICM/Cases to [CSS AAD Log Access Tracking Spreadsheet](https://aka.ms/cssaadlogaccess).

If information such as email addresses are necessary, ask B2B collaboration PG or Technical Advisor to run [Jarvis Query](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&ns=B2BMds&en=B2BAdminPortalErrorEvent,B2BAdminPortalEvent,B2bCommonEvent,B2BRedeemPortalErrorEvent,B2BRedeemPortalEvent,B2BWorkerErrorEvent,B2BWorkerEvent) and update the Correlation ID and Time Range to match the ASC Audit Log.
