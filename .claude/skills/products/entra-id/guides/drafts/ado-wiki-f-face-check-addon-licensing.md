---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Verified ID/How to/Face Check Addon Licensing for Verified ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Verified%20ID/How%20to/Face%20Check%20Addon%20Licensing%20for%20Verified%20ID"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Face Check Addon Licensing for Verified ID

## Summary

Verified ID Face Check became Generally Available on July 1, 2024. Face Check for free stopped and customers must enable the Face Check Add-on.

## Pricing Options

**Option 1: Pay-as-you-go** - $0.25 USD per verification (billed when Face Check is used)

**Option 2: Entra Suite** - Each paid seat includes 10 Face Check verifications per month. Additional verifications: $0.25 USD each.

Example: 100 seats = 1,000 Face Check verifications/month (10 x 100). A single user could perform all 1,000 validations.

**Note:** Entra Suite of 250 licenses provides 2000 verifications/month. Overages billed at $0.25 each.

## Support Boundaries

- **Authenticator App errors with Face Check** → `Azure/Microsoft Entra Verified ID/Errors in Authenticator App` (Security and Access Management)
- **Billing/Licensing questions** → `Azure\Billing\Assistance with bill\Help with a billing discrepancy` (ASMS)

**IMPORTANT:** Subscription ID must be supplied in ASMS collaboration requests.

### How to obtain Subscription ID:

1. Go to **Verified ID** in ASC → Copy Authority Id → **Contracts** tab → search Authority Id → Face Check anchor shows Subscription ID
2. Graph Explorer in ASC → Query `/verifiableCredentials/authorities/:authorityid/billingProfile` (Version: beta)
3. Azure Cloud Shell (if single authority):
```bash
az account list --output table
az account set --subscription <subscription-id>
az resource list --resource-type "Microsoft.Compute/virtualMachines"
```

## Requirements

- Entra ID tenant
- Azure subscription
- Face Check enabled on Verifiable Credential with photo claim
- Azure CLI to register resource provider

## Register Microsoft.VerifiedId Provider

```bash
az account set --subscription {subscription-id-or-name}
az feature register --namespace Microsoft.VerifiedId -n DefaultFeature
# Wait a few minutes...
az provider register -n Microsoft.VerifiedId
# Verify:
az feature show --namespace Microsoft.VerifiedId -n DefaultFeature
```

## Enable Face Check Billing

1. Navigate to Verified ID portal in Microsoft Entra
2. Click the **Face Check** tile in Add-ons section
3. Without Entra Suite: tile shows "Start a free trial"
4. With Entra Suite: tile shows number of free verifications
5. Specify Azure subscription for billing before verifications can work

## Public Documentation

- [Using Face Check with Entra Verified ID](https://learn.microsoft.com/en-us/entra/verified-id/using-facecheck)
- [Billing model for Face Check](https://learn.microsoft.com/en-us/entra/verified-id/verified-id-pricing)
- [Request Service REST API presentation specification](https://learn.microsoft.com/en-us/entra/verified-id/presentation-request-api)
- [Request Service API error codes](https://learn.microsoft.com/en-us/entra/verified-id/error-codes)
