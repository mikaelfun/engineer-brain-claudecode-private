---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra External ID (CIAM)/Entra External ID for Customers (CIAM) - Fraud Protection using Arkose Labs and Human Security"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20External%20ID%20(CIAM)%2FEntra%20External%20ID%20for%20Customers%20(CIAM)%20-%20Fraud%20Protection%20using%20Arkose%20Labs%20and%20Human%20Security"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Entra External ID - Fraud Protection using Arkose Labs

## Overview

Premium security feature to protect against fake account creation by integrating with Arkose Labs (and Human Security). Prevents fake account registrations by detecting and blocking bots/malicious actors during sign-up.

## Prerequisites

1. Entra External ID (EEID) tenant with Local Account sign-ups enabled
2. Arkose account created at Arkose
3. Arkose config details: Client Subdomain, Verify Subdomain, Public Key, Private Key
   - Use only subdomain prefix (e.g., "client-api"), NOT full domain

## Setup Steps

### Step 1: Create ArkoseFraudProtectionProvider Policy

- Target correct CIAM tenant in Graph Explorer (switch directory via profile icon)
- API: `POST https://graph.microsoft.com/beta/identity/riskPrevention/fraudProtectionProviders`
- Permission: `RiskPreventionProviders.ReadWrite.All`
- Body:
  ```json
  {
    "@odata.type": "#microsoft.graph.arkoseFraudProtectionProvider",
    "displayName": "<name>",
    "publicKey": "<guid>",
    "privateKey": "<guid>",
    "clientSubDomain": "<prefix-only>",
    "verifySubDomain": "<prefix-only>"
  }
  ```
- Success: 201 Created with ID (save for Step 2)

### Step 2: Create AuthenticationEventListener

- API: `POST https://graph.microsoft.com/beta/identity/authenticationEventListeners`
- Body includes appId of target app and the Arkose config policy ID from Step 1
- Uses `onFraudProtectionLoadStartListener` type
- `isContinueOnProviderErrorEnabled: true` controls fallback behavior

### Step 3: Test

- Verify Arkose challenge appears during sign-up
- Check challenge can be completed successfully
- Monitor for unexpected failures

## Troubleshooting Notes

- CIAM sign-up logs are NOT available to customers or in ASC Tenant Explorer audit logs (pending Workitem 3113389)
- To troubleshoot sign-up failures: request HAR/Fiddler from customer, or use correlation ID + timestamp with ASC Auth Troubleshooter
- See: Entra External ID - How to locate correlation ID and logs
- See: Entra External ID - Data Collection

## ICM Escalation

- Queue: CPIM/CIAM-CRI-Triage (via ASC Escalations, reviewed by TAs/PTAs first)
