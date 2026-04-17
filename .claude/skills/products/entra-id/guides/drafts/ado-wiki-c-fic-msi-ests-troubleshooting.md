---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD ESTS/FIC + MSI ESTS Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20ESTS%2FFIC%20%2B%20MSI%20ESTS%20Troubleshooting%20Guide"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# FIC + MSI ESTS Troubleshooting Guide

## Overview

Federated Identity Credentials (FIC) enable workload identity federation - configuring a user-assigned managed identity or app registration in Microsoft Entra ID to trust tokens from an external identity provider (GitHub, Google, etc.).

**Key constraints:**
- Only user-assigned managed identities can be added as FIC (system-assigned not supported)
- FIC across clouds is not supported
- For third-party apps, compute subscription and managed identities must be in the same tenant

## How It Works

1. External IdP issues a token (the "FIC" from ESTS perspective)
2. User-assigned MI uses FIC to exchange for Access Token for the target resource
3. Trust relationship is based on FIC configurations (Audiences, Issuer, Subject)

## Troubleshooting Steps

### 1. Check ASC Sign-in Diagnostic Logs
- Use correlation ID + timestamp, or search by user-assigned MI's client ID

### 2. On "Client App" tab, verify:
- **FederatedIdentityCredentials**: Audiences must be `['api://AzureADTokenExchange']` for public clouds
- **ManagedIdentityResourceID**: Must exist for user-assigned MI + FIC scenario

### 3. Check for "FIC" in incoming credentials
- If missing: workload identity not configured correctly on app side (AKS, ADO, etc.) - engage corresponding team

### 4. Compare Issuer value
- From step 3 FIC token vs step 2 FIC configuration
- **Matching is case-sensitive** for Issuer, Subject, and Audience

### 5. Validate Subject and Audience claims
- Get FIC token or check ESTS error message which usually prints received values
- Example: `AADSTS7002121: No matching federated identity record found for presented assertion audience 'xxx'`

### 6. Check for chained FIC
- `AADSTS700231`: Chained FIC (FIC1 -> FIC2 -> Token) is not supported
- Solution: Use FIC directly to get access token

## Graph API to Check FIC Config

```
GET https://graph.microsoft.com/v1.0/serviceprincipals/{ObjectId}/federatedIdentityCredentials
```

## ICM Path
- Owning Service: eSTS
- Owning Team: Incident Triage
