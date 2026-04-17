---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Federated Identity Credentials (FIC)/How to/Workload Identity Federation with User Assigned Managed Identities"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Federated%20Identity%20Credentials%20(FIC)/How%20to/Workload%20Identity%20Federation%20with%20User%20Assigned%20Managed%20Identities"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Workload Identity Federation with User-Assigned Managed Identities

## Overview

Workload identity federation on User-assigned managed identities allows an identity from an OpenID Connect Provider outside of Azure to authenticate as a user-assigned managed identity by establishing a trust between Azure AD and the OIDC identity provider.

Capabilities native to Azure Kubernetes (AKS) and GitHub can integrate with Azure AD Workload Identity to federate with external identity providers via OIDC-compliant token exchange protocols.

## Limitations

- Only **20 Federated Identity Credentials** can be created on a single user-assigned identity
- Creation of a federation between two Azure AD identities from the same or different tenants is **not supported**
- Exactly **1 audience** must be added to a Federated Credential (default: `api://AzureADTokenExchange`)
- FIC name length: 3-120 symbols, alphanumeric/dash/underscore, first symbol must be alphanumeric

## Known Issue: Concurrent FIC Creation Fails

Creating multiple federated identity credentials concurrently under the same UAMI may result in unexpected results, even though each concurrent API call receives a successful response. **Create FICs sequentially.**

## Support Boundaries

| Support Topic | Routes To |
|---------------|-----------|
| Managing FICs (CRUD) on UAMI | MSaaS AAD - Account Management |
| Authentication issues with FICs on UAMI | MSaaS AAD - Applications |
| AKS clusters with UAMI FICs | AKS team |
| AKS-HCI with Azure ARC FIC failures | Kubernetes (with AAD-Auth collaboration) |
| GitHub/GitLab issues | GitHub support (escalate within ticket) |

## How Federated Credentials Work

A trust relationship is created between the external IdP and the UAMI by configuring a federated identity credential with three core properties:

1. **Issuer** (`iss`): OpenID Connect metadata URL of the external identity provider
2. **Subject** (`sub`): Subject value in the token sent to Azure AD (must exactly match)
3. **Audience** (`aud`): Audience value in the token (must exactly match, default: `api://AzureADTokenExchange`)

## Managing Federated Credentials

### Azure Portal
1. Open [Managed Identities](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.ManagedIdentity%2FuserAssignedIdentities)
2. Select the UAMI > Settings > Federated credentials
3. Click **+ Add credential** to launch the wizard
4. Choose scenario: GitHub Actions, Kubernetes, or Other issuer

### Azure CLI
```bash
# Create FIC on UAMI
az identity federated-credential create \
  --name {ficName} \
  --identity-name {uamiName} \
  --resource-group {rgName} \
  --issuer {issuerUrl} \
  --subject {subjectClaim} \
  --audiences api://AzureADTokenExchange
```

### REST API / Bicep / ARM Templates
Also supported for programmatic FIC management.

## Public Documentation

- [Tutorial: Use a workload identity with an application on AKS](https://learn.microsoft.com/en-us/azure/aks/learn/tutorial-kubernetes-workload-identity)
- [Workload identity federation overview](https://docs.microsoft.com/en-us/azure/active-directory/develop/workload-identity-federation)
