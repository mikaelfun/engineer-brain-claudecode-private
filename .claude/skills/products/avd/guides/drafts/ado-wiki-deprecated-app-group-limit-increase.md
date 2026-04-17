---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/Archived Content/Deprecated Content/DEPRECATED_App Group Limit Increase"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FSandbox%2FArchived%20Content%2FDeprecated%20Content%2FDEPRECATED_App%20Group%20Limit%20Increase"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# App Group Limit Increase

> **Note:** This content is from deprecated/archived wiki pages and may be outdated.

## App Group Limits

We currently enforce soft limit of 200 App Groups per Azure tenant that contains AVD host pools.

- **Soft Limit**: 200 App Groups
- **Hard Limit**: 400 App Groups

A customer can request an increase up to 400 (hard limit) with no impact to feed latency.

## Reason for the 200 App Group Limit

Since AVD is under Azure umbrella, AVD adopted to leveraging Azure RBAC instead of creating AVD RBAC. Azure RBAC is provided by PAS (Policy Access Service), which is a resource provider for ARM front end.

When any new request comes ("Give me the App Groups I have access to?"):
1. Access control/permission check is done on the ARM front end against AVD database
2. AVD performs check access for the app group via a PAS API

There is no API that tells which user has access to which resources. AVD created an API that takes the user info and AAD tenant info (1 tenant per API call) and pulls all app groups for that tenant, then filters the list using PAS service for that user.

If there are N app groups created and only a couple that the user has access to, the AVD API will go through all available App Groups in the tenant and PAS API will check user access against all App Groups one at a time.

During login storms (e.g., 1000 end users accessing the feed at the same time), the number of API calls = 1000 requests × total # of app groups per tenant. This is an expensive operation and PAS API is subject to throttling leading to feed latency.

**Note**: A tenant can have multiple host pools and/or multiple subnets but the App Group limit is still applied at the AAD tenant level.

## Process to Request App Group Increase

If a customer wants App Group limit increase, the change must be done on back-end which requires the engineer to create ICM. Emphasize to customer the hard limit is 400.

**Before creating ICM**, get answers to:
1. How many users they expect to scale to?
2. Is the customer an ISV? If so, did they consider splitting their customers among a few AAD tenants?
3. Do they have login storms - how many users do they expect to login at the same time?

Answers help determine if increasing the App group limit will impact their users/customers feed discovery performance.
