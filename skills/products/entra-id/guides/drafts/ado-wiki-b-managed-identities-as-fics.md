---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Federated Identity Credentials (FIC)/How to/Managed Identities as FICs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Federated%20Identity%20Credentials%20(FIC)/How%20to/Managed%20Identities%20as%20FICs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Managed Identities as Federated Identity Credentials (FICs)

## Overview

User-assigned managed identities (UMI) can be used as Federated Identity Credentials (FICs) on third-party Entra ID applications. This enables applications to authenticate using managed identities through various OAuth 2.0 flows (client credentials, authorization code, OBO) without needing client secrets or certificates.

The FIC is configured with the managed identity as the subject and the tenant's sign-in authority URI as the issuer. The application must be hosted on an Azure resource (VM, App Service, Arc-enabled compute).

**GA Status**: Expected first week of April 2025.

## Limitations

- **Only User-Assigned Managed Identities** are supported. System-assigned managed identities are NOT supported.
- **Cross-cloud federation is NOT supported**: Managed Identities from one cloud cannot federate into Entra ID applications in a different cloud (e.g., Public cannot federate to Mooncake/China Cloud).

## Cloud-Specific Audience Values

| Cloud | Audience |
|-------|----------|
| Public | `api://AzureADTokenExchange` |
| Fairfax | `api://AzureADTokenExchangeUSGov` |
| Mooncake | `api://AzureADTokenExchangeChina` |
| USNat | `api://AzureADTokenExchangeUSNat` |
| USSec | `api://AzureADTokenExchangeUSSec` |

## Token Flow

1. Application on Azure using MSAL calls Instance Metadata Service (IMDS) to get MI Access Token
2. MSAL passes the MI access token from IMDS to the application
3. App calls MSAL to acquire App Token
4. MSAL calls ESTS-R (regional) to get App token, passing MI token as assertion
5. ESTS-R responds with App Access Token

## Scenario 1: MI as FIC to Single Tenant App

- Compute resource, managed identity, and Entra App must be in the same tenant
- Supports: App Service, VM, LogicApps, Labs, Arc-enabled compute
- Failure case: MI is in a different tenant AND the application is single tenant

## Scenario 2: MI as FIC to Multi-Tenant App

- App must be multi-tenant and provisioned in the target tenant via user/admin consent
- Compute resource and MI remain in the home tenant
- App accesses resources in the target tenant

## Setup Steps

1. **Create User-Assigned Managed Identity**: Navigate to Azure Portal > Managed Identities > Create UAMI > Assign to compute resource (VM/App Service)
2. **Create App Registration**: Single-tenant for same-tenant access, multi-tenant for cross-tenant access
3. **Create FIC**: Configure via Portal (Certificates & Secrets > Federated credentials > Add credential) or Graph API

## Public Documentation

- [Configure an application to trust a managed identity (preview)](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation-config-app-trust-managed-identity)
- [Using managed identity as an App credential](https://github.com/hosamsh/entra-id-samples/blob/main/MiFicExamples/readme.md)
