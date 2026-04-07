---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Federated Identity Credentials (FIC)/Troubleshooting/Federated identity credentials TSG"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FFederated%20Identity%20Credentials%20(FIC)%2FTroubleshooting%2FFederated%20identity%20credentials%20TSG"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Federated Identity Credentials (FIC) TSG

## Introduction

Federated identity credentials enable Workload identity federation — tokens issued by an external OIDC provider can be exchanged for Azure AD access tokens. Key scenarios: GitHub Actions OIDC, Kubernetes workload identity, cross-tenant managed identity.

## Prerequisite Reading

- [Workload identity federation](https://aka.ms/fedcredentialapi)
- [Microsoft Graph API - FederatedIdentityCredential](https://docs.microsoft.com/en-us/graph/api/resources/federatedidentitycredential?view=graph-rest-beta)

## Setup: Azure AD + GitHub OIDC

### Registering App and Adding FIC

1. Create app registration in Azure Portal
2. Navigate to Certificates & secrets > Federated credentials > Add credential
3. Fill in required fields:
   - **name**: immutable, no spaces or special characters
   - **issuer**: defaulted to GitHub issuer
   - **subject**: must match the request (e.g., `repo:org/repo:ref:refs/heads/main`)
   - **audiences**: recommended `api://AzureADTokenExchange`

### GitHub Actions Workflow Configuration

1. Grant app Contributor role on subscription
2. Add ClientId, TenantId, SubscriptionId as GitHub secrets
3. Use `azure/login@v1` with OIDC:
   ```yaml
   - uses: azure/login@v1
     with:
       clientId: ${{ secrets.AZURE_CLIENT_ID }}
       tenantId: ${{ secrets.AZURE_TENANT_ID }}
       subscriptionId: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
   ```

## API Error Codes

| Scenario | Error Code | Error Message | Notes |
|--|--|--|--|
| Duplicate FIC name | 409 | FederatedIdentityCredential with name already exists | Names must be unique per app |
| Update FIC name | 400 | Name is immutable and cannot be changed after creation | Cannot change name post-creation |
| Invalid object ID | 404 | Resource does not exist | Check FIC object ID |
| Invalid $select property | 400 | Could not find property | Invalid property name |
| Invalid $filter | 404 | Resource does not exist | Only supports filtering by name, id, subject |
| Duplicate issuer+subject | 400 | Combination of issuer and subject must be unique | Already exists on app |
| Max 20 FIC limit | 403 | Size of object exceeded limit | Delete existing or use another app |
| Name with spaces | 400 | Name value is not a valid URI last segment | No spaces allowed in name |
| Insufficient permissions | 403 | Insufficient privileges | Need Application.Read.All, ReadWrite.All, or ReadWrite.OwnedBy with admin consent |

## ESTS Error Codes

### ADSTS700021

No matching federated identity record found for presented assertion.
- **Issuer**: `{issuer}`
- **Subject**: `{subject}`
- **Audience**: `{audience}`

Verify all three values match the FIC configuration exactly.

### AADSTS100033

See dedicated page: [AADSTS100033](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1049112/AADSTS100033)

## Azure CLI vs PowerShell: FIC with Managed Identities Cross-Tenant

### PowerShell

PowerShell uses `api://AzureADTokenExchange` to exchange the Managed Identity token for an Access Token. After obtaining the token from Tenant B, `Connect-AzAccount -AccessToken` works directly.

### Azure CLI

`az login --federated-token` expects the **Managed Identity token** (OIDC token) to redeem an access token. This is different from PowerShell's `-AccessToken` which uses the access token directly.

**Common Error**: AADSTS700211 when using the access token instead of the MSI token:
```
AADSTS700211: No matching federated identity record found for presented assertion issuer
```

**Fix**: Pass the MSI token (not the access token from Tenant B) to `az login --federated-token`.

## Azure CLI Configuration

Example to create FIC via REST:
```bash
az rest --method POST --uri https://graph.microsoft.com/beta/applications/<appID>/federatedIdentityCredentials --body "$body"
```
