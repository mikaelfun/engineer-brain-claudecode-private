---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Accessing published WebAPI using OAuth 2.0 client credentials flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Accessing%20published%20WebAPI%20using%20OAuth%202.0%20client%20credentials%20flow"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Accessing published WebAPI using OAuth 2.0 client credentials flow

Some applications require access to on-premises Web API published through Microsoft Entra Application Proxy using the Application Identity.

You can use the OAuth 2.0 client credentials grant specified in [RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749), sometimes called two-legged OAuth, to access web-hosted resources by using the identity of an application. This type of grant is commonly used for server-to-server interactions that must run in the background, without immediate interaction with a user. These types of applications are often referred to as daemons or service accounts.

In this tutorial the first leg will be the external application (Confidential Client) and the second leg will be the on-premises web-hosted resource, which is published through Microsoft Entra Application Proxy.
The Confidential Client will access the on-premises Web API, which is published through MEAP using the Identity of the published Web API. That allows the calling service "Confidential Client" to use a certificate/Shared secret as a credential.

In the client credentials flow, permissions are granted directly to the application itself by an administrator. When the app presents a token to the web-hosted resource, the resource enforces that the app itself has authorization to perform an action since there is no user involved in the authentication.

## Overview

Using [OAuth 2.0 client credentials flow](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow) your Confidential Client will be able to access On-Prem Web API which is Published through MEAP using the Identity of the Published WebAPI, what it means allows the calling service to use a certificate/Shared secret as a credential.

## Publish and configure your on-premise Web API

Below the basic steps required to Publish the Web API and allow the confidential Client to Access the Web API using the Identity of the Web API:

### I. Publishing the Web API and Register your app in Entra

1. In the [Portal](http://portal.azure.com), select **Entra ID**. Then select **Enterprise applications**.
2. At the top of the **Enterprise applications - All applications** page, select **New application**.
3. On the **Add an application** page, select **On-premises applications**. The Add your own on-premises application page appears.
4. If you don't have an **Application Proxy Connector** installed, you'll be prompted to install it. Select **Download Application Proxy Connector** to download and install the connector.
5. Once you've installed the Application Proxy Connector, on the **Add your own on-premises application** page:
   a) Next to **Name**, enter _SecretAPI_.
   b) Next to **Internal Url**, enter the URL you use to access the API from within your intranet.
   c) Make sure **Pre-Authentication** is set to **Entra ID**.
   d) Select **Add** at the top of the page, and wait for the app to be created.
6. On the **Enterprise applications - All applications** page, select the **SecretAPI** app.
7. Go to the **SecretAPI - Overview** page, select **Properties** in the left navigation.
8. Set **Visible to users** to **No** at the bottom of the **Properties** page, and then select **Save**.
9. On the Entra ID **Overview** page, select **App registrations**, search for **SecretAPI**.
10. Go to the menu **App roles** and check if you have an enabled role for member types: **Applications**. If not, create one.
11. If you use the current app registration for your client, continue here. Otherwise create a separate app registration.
12. Go to **Certificates & Secrets** and create **new client secret** or upload a **new certificate**.
13. Switch to **API permissions** and click **+ Add a permission**. Select **APIs my organization uses**, locate the MEAP application. Click **Application Permissions**, check the permission, and click **Add permissions**.
14. Click **Grant admin consent for...** and select **Yes**.

> **Important**: Currently, the Microsoft Entra Application Proxy Cloud Service strips the bearer token out from the authorization header in the request. See the known issue entry for a solution.

### II. Get administrator consent

In the OAuth 2.0 client credentials grant flow, you use the Application ID and Application Secret values. This step is not required with Microsoft Entra Application Proxy.

### III. Get an access token

Use Postman to request an access token:
1. Open Postman and select Client Credential with shared secret.
2. In the Body tab fill the information (client_id, client_secret, scope, grant_type).
3. Using your tenant ID, request access token from: `https://login.microsoftonline.com/Your_Tenant_ID/oauth2/v2.0/token`
4. Copy the access token from the response to use for calling the Web API.

## PowerShell script

Sample PowerShell script using MSAL to get token and access the MEAP application:

```powershell
# Load MSAL (Tested with version 4.32.0)
Add-Type -Path "$env:WinDir\MSAL\Microsoft.Identity.Client.dll"

$tenantId = "REPLACE_WITH_TENANT_ID"
$authority = "https://login.microsoftonline.com/" + $tenantId
$externalURL = "REPLACE_WITH_EXTERNAL_URL"
$appId = "REPLACE_WITH_APP_ID"
$scopeUri = $externalURL + "/.default"
$clientSecret = "REPLACE_WITH_CLIENT_SECRET"

$scopes = New-Object System.Collections.ObjectModel.Collection["string"]
$scopes.Add($scopeUri)

$app = [Microsoft.Identity.Client.ConfidentialClientApplicationBuilder]::Create($appId).WithAuthority($authority).WithClientSecret($clientSecret).Build()

$authResult = $app.AcquireTokenforClient($scopes).ExecuteAsync().ConfigureAwait($false).GetAwaiter().GetResult()

If (($authResult) -and ($authResult.AccessToken)) {
    $token = $authResult.AccessToken
    Write-Output "Success: Authentication result returned."
} Else {
    Write-Output "Error: Authentication result, token or tenant id returned with null."
}

$headers = @{
    "Authorization" = ("Bearer {0}" -f $token);
    "Content-Type" = "application/json";
}

Invoke-Webrequest -Method Get -Uri ("{0}" -f $externalURL) -Headers $headers
```

## Audit log

You can use the audit log to check the sign-ins of the client (Service Principal).
