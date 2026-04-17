---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Deploy AppGW v1 on v2 hardware"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Deploy%20AppGW%20v1%20on%20v2%20hardware"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Deploy AppGW v1 on v2 hardware

## Description

Some customers' use-case requires deploying an AppGW v1 using v2 hardware. To enable this functionality, the AppGW PG team needs to allow list the subscription.

## How to Identify the Feature

In ASC under Properties → SKU name. Look for the **_v2** suffix under what would normally be e.g. **WAF_Medium** (e.g., `WAF_Medium_v2`).

Compare with traditional v1 application gateway which shows just `Standard_Medium` without the `_v2` suffix.

## Solution

1. Collect the customer company/organization name and the subscription ID that needs to be allow listed.
2. Email the AppGW preview team alias: `appgwpreview@microsoft.com`
3. Request that the subscription is allow listed.

The AppGW team is aware of some customers that need this feature and will allow list immediately. If they are not aware of your customer, work with the AppGW team to understand what info is needed from the customer to proceed.
