---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Authentication_flows SAML_and_OAuth/Labs/LAB - how to use Insomnia application to test OAuth2.0 Authentication flows"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Authentication_flows%20SAML_and_OAuth/Labs/LAB%20-%20how%20to%20use%20Insomnia%20application%20to%20test%20OAuth2.0%20Authentication%20flows"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# LAB - Using Insomnia to Test OAuth2.0 Authentication Flows

## Why Insomnia (Not Postman)?

A security investigation identified risks with Postman Cloud's handling of secrets and sensitive data. Insomnia is the recommended replacement for testing OAuth authentication flows within Microsoft support.

## Prerequisites

- Install Insomnia: https://insomnia.rest/download
- Create a free Insomnia account
- Reference lab: [Learning OAuth 2.0 flows with Azure AD, Postman and Fiddler](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/610705/Learning-OAuth-flows-through-Azure-AD-Postman-and-Fiddler)

## Importing Postman Collection into Insomnia

1. Download the Postman collection: **Azure AD v2.0 Protocols for Training.postman_collection.json** (from wiki attachment)
2. Open Insomnia → Personal Workspace → **Import**
3. Choose the downloaded file (drag & drop or file browser)
4. Click **Scan** → then **Import**
5. The "Azure AD v2.0 Protocols for Training" collection will appear as a tile
6. (Optional) Rename to "Entra ID V2.0 Protocols for training"
7. Auth flows are now available in the left sidebar

## Setting Variables in Insomnia

Variables help secure sensitive info (passwords, client secrets) and allow easy switching between test applications.

1. Open Insomnia → Click on the top section of your collection
2. Click **Environment** tab
3. Enter values or create new variables
4. To use variables in requests: start typing the variable name, wait for Insomnia to show the suggestion (may appear as `_[` or `_`)

## Key Differences from Postman

| Feature | Insomnia | Postman |
|---|---|---|
| UI | Very similar | Reference |
| Getting tokens | Use **Auth** tab → enter params → click **Fetch Tokens** | OAuth2 helper |
| Body format | Use **Form Data** dropdown | Body type |
| Variables | Environment tab | Environment |

## Common Issue: AADSTS Error for Missing grant_type

**Symptom**: AADSTS error indicating grant_type is not present in token request

**Fix**: In the request body tab, click the format dropdown and select **Form Data** (not JSON/raw). OAuth2 token endpoints require `application/x-www-form-urlencoded` body format.

## Token Flow Reference

After importing the collection:
- **Authorization Code Flow**: Auth flows → Authorization Code
- **Client Credentials Flow**: Auth flows → Client Credentials
- **Device Code Flow**: Auth flows → Device Code
- Use the **Auth** tab for each request; fill in tenant/client/scope values from your app registration
