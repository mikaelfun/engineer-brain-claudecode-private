---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy- Backend server responds with 401 Unauthorized_Status Code - Forbidden"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy-%20Backend%20server%20responds%20with%20401%20Unauthorized_Status%20Code%20-%20Forbidden"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Backend server responds with 401 Unauthorized / 403 Forbidden

## Symptom

A user attempts to connect to a published app and gets the following error:

**Forbidden:**

This corporate app can't be accessed.
You are not authorized to access this application.

Authorization failed. Make sure the user has permissions to the internal application.

In The AAD Application Proxy Connector Admin Event logs you will see EventId 13022 with HTTP 401 from the backend server.

## Cause

This error can occur when Integrated Windows Authentication is used for SSO and authorization has failed on the Backend Web server. Either the user is not authorized to access the application, or there is a configuration problem with the Web App/Server.

## Behind the curtain

The Microsoft Entra private network connector was able to obtain a Kerberos ticket on behalf of the user, but the backend server (app) replies with HTTP 401.

In the IWA SSO scenario the HTTP 401 response from the published server gets "converted" to HTTP 403 by the Entra ID Application Proxy and this response will be delivered to the client. If this did not happen, the HTTP 401 would trigger an authentication popup on the client. This is not correct, because the connector is the client that makes the authentication towards the published web app and not the browser / app running on the user's computer.

## Root cause verification

In Kusto, verify what authentication method(s) has been advertised by the backend server / app:

```kql
let tran ='TRANSACTION_ID'; // Replace with the TransactionID in the error message
let transdate = datetime("yyyy-mm-ddThh:mm:ss"); // Replace using the Timestamp in the error message
Traces
| where TIMESTAMP > transdate-30s and TIMESTAMP < transdate+30s  and ( TransactionId == tran or Message contains tran)
| project TIMESTAMP , Message, TransactionId, SubscriptionId
```

In the output scroll down to `CopyBackendResponseHeaders`. Check the `www-Auth headers` line:
- If www-Auth headers do not contain `Negotiate` or `Kerberos` (e.g., only shows `NTLM`) -> the application is not configured to accept Kerberos authentication
- If no www-Auth header at all -> check Configure Kerberos authentication section

## Configure Kerberos authentication for the application

Consider what application the customer published. Not all web apps support Kerberos authentication (KCD).

### Key questions:
- Is the web app hosted on a server farm (more servers)?
- Does the app just support SPNEGO?
- Are the prerequisites for Kerberos Constrained Delegation fulfilled?
- How many connectors are member of the connector group?

### Microsoft products:
- **SharePoint** - https://docs.microsoft.com/azure/active-directory/manage-apps/application-proxy-integrate-with-sharepoint-server
- **Exchange (OWA/Webmail)** - https://docs.microsoft.com/exchange/architecture/client-access/kerberos-auth-for-load-balanced-client-access
- **Remote Desktop Server** - KCD is NOT supported! Use RD Gateway publishing guide
- **Power BI / Reporting Server** - https://docs.microsoft.com/power-bi/report-server/configure-kerberos-powerbi-reports

### Third party products:
- Contact vendor or application developer for Kerberos configuration
- **Tableau** - Use SAML SSO instead of KCD

### Configure IIS for Kerberos:
See https://learn.microsoft.com/entra/identity/app-proxy/application-proxy-back-end-kerberos-constrained-delegation-how-to

## Other problems (Kerberos already configured)

1. **SPNEGO required (Linux apps)**: Check UseSpnegoAuthentication setting via Kusto:
   ```kql
   BootstrapRootOperationEvent
   | where env_time > ago(30m) and subscriptionId == "TENANTID" and connectorId == "CONNECTORID"
   | extend Spnego = extract("'UseSpnegoAuthentication':(.*)", 1, requestString)
   | project env_time, connectorId, connectorVersion, Spnego
   ```
   See: https://learn.microsoft.com/entra/identity/app-proxy/how-to-configure-sso-with-kcd#sso-for-non-windows-apps

2. **IIS Extended Protection** should be disabled

3. **IIS useAppPoolCredentials** must be True if web app runs under a service account with registered SPN

4. **Logon identity**: Try `On-premises SAM account name` instead of `User Principal Name`. Note: connector machine must be in the same domain as the user account. See: https://learn.microsoft.com/entra/identity/app-proxy/how-to-configure-sso-with-kcd#working-with-different-on-premises-and-cloud-identities

5. **Multiple web apps sharing one App Proxy app**: If apps run under different service accounts but share one published URL, create separate App Proxy apps with correct IWA SSO config for each

6. **Intermittent issues**: May indicate one or more servers in a farm are misconfigured

## Best Practices

- After IIS changes: IISRESET or recycle application pool
- Before testing: Flush the Kerberos cache on connector server(s):
  ```powershell
  Get-WmiObject Win32_LogonSession | Where-Object {$_.AuthenticationPackage -ne 'NTLM'} | ForEach-Object {klist.exe purge -li ([Convert]::ToString($_.LogonId, 16))}
  ```
