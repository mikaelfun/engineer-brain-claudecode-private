---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Data Map/SDK and API/Configure VSCode for Rest API and setup tips"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FSDK%20and%20API%2FConfigure%20VSCode%20for%20Rest%20API%20and%20setup%20tips"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Configure VSCode for REST API and Setup Tips

Guide for using VSCode REST Client extension to test and troubleshoot REST connections to Purview.

## Prerequisites

Three phases:
1. Configure a Service Principal and give it access to Purview
2. Download and configure VSCode with REST Client extension
3. Use REST to obtain a Bearer Token, then run Purview REST calls

## Step 1: Create a Service Principal

1. In Azure Portal → search "Microsoft Entra ID"
2. Copy the **Tenant ID** from the Overview page
3. Go to **Manage → App registrations → New registration**
4. Name the app, select "Accounts in any organizational directory (Multitenant)", click Register
5. Copy the **Application (client) ID**
6. Go to **Certificates & secrets** → create a new client secret → copy the **Value**
7. In Purview → assign the app to the appropriate collection roles (Collection admin, Data source admin, Data curator, etc.) depending on the REST operations needed

Reference: https://learn.microsoft.com/en-us/purview/tutorial-using-rest-apis

## Step 2: Download and Configure VSCode

1. Download VSCode
2. Install the **REST Client** extension (by Huachao Mao)
3. Create a new file with `.rest` extension

## Step 3: Obtain Authentication Token

Write the following in the `.rest` file:

```
### GetToken
# @name getToken
POST https://login.microsoftonline.com/{tenant_id}/oauth2/token
Content-Type: "application/x-www-form-urlencoded"

client_id={client_id}
&client_secret={client_secret}
&grant_type=client_credentials
&resource=https://purview.azure.net
```

Click "Send Request" above the POST line. A 200 response returns the `access_token`.

### Token Variable (avoid copy-paste)

Add these lines at the top of the `.rest` file to cache the token:

```
@token = {{getToken.response.body.access_token}}
@authentication = Bearer {{token}}
```

Now use `{{authentication}}` in the Authorization header of subsequent requests.

### Common Errors

- **401 Unauthorized / invalid_client**: The client secret is incorrect. Re-check the secret VALUE (not the secret ID).

## Step 4: Run Purview REST Calls

Use the `@authentication` variable in subsequent REST calls:

```
### Example: Get Entity
GET https://{purview-account}.purview.azure.com/catalog/api/atlas/v2/entity/guid/{guid}
Authorization: {{authentication}}
```
