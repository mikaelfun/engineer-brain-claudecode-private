---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Request AppGw V1 Exception Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FRequest%20AppGw%20V1%20Exception%20Deployment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AppGw V1 Exception Deployment Request

- According to the publicly available documentation, V1 deployments are scheduled to be retired in April 2026. Currently, there are certain restrictions in effect for customers who wish to deploy V1 on their subscriptions.

[AppGw V1 Retirement](https://azure.microsoft.com/en-us/updates/application-gateway-v1-will-be-retired-on-28-april-2026-transition-to-application-gateway-v2/)

- PG has established a specific process to handle customer requests for exceptions to deploy V1 AppGw. As of now, only one exception has been approved: cases where **NTLM Authentication** is necessary, as V2 does not support this feature.

- Once you have gathered the required information from the customer, please complete this form. The whitelisting process by the PG occurs on **Tuesdays and Thursdays**, so there may be a delay before the request is processed.

[Whitelist request for V1 creation after August 2024](https://forms.office.com/r/Byq8sZzpHX)

Required information template:

```
Customer Name & TPID:
Customer Subscription IDs to be whitelisted (multiple Ids can be added):
Cloud Environment: Public
What is stopping you from deploying your workloads in V2?:
```

- **It's important to emphasize that we should always recommend V2 for new deployments, unless the customer explicitly expresses a preference for V1 due to a specific reason. In such cases, you can consider asking PG for a V1 exception as an option.**

## Information

Department in charge: `mjyothish@microsoft.com`

## Customer-facing email examples

English example:

```
We will be advancing our internal processes so that you could create Application Gateway V1 resources in the following Azure Subscription ID:

- AzureProductSubscriptionID: xxxx

Just for your information, we are only accepting this procedure request for V1 to V2 migration testing purposes.
If you are considering creating V1 resources for another purpose, we kindly ask you to design and plan your system based on V2.

Please note that it may take us about a week to complete the above process.
Hopefully, you will be able to create your Application Gateway V1 resources after a few days, but we will reach out to you within a week regardless.
```
