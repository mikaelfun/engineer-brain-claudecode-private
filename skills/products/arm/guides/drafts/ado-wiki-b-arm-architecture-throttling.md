---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/Throttling"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FThrottling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## What is throttling?
Throttling is the process of limiting the number of API requests a user can make in a certain period. Organizations use API throttling with various goals, such as security, scalability, performance, monetization, authentication, and availability.

Source: [What is API Throttling?](https://www.tibco.com/reference-center/what-is-api-throttling)

In the case of Azure, Throttling is key for maintaining high availability, if we let users make unlimited calls, we may exhaust the available capacity we have to process the requests.

## ARM vs RP throttling

There are 2 places where ARM requests can be throttled:

1. **ARM**: ARM imposes various subscription and tenant limits for all management operations, regardless of the underlying resource or resource provider.

2. **Resource Providers**: Each resource provider may further impose rate limit restrictions at the resource provider layer. Performance issues at the underlying RP layer may also cause performance impacts and timeouts. This is the most common type of throttling we see.

ARM is essentially a proxy service. It is a front-end Web API that takes incoming requests to `management.azure.com`, does some initial processing (authn+authz, policy, locks, template evaluation, etc) and then sends the requests to the back-end resource providers.

The resource provider back-end is a separate service (often a PaaS cloud service, but can also be something like a Service Fabric cluster or something else) owned and hosted entirely by the resource provider team. ARM passes on calls to the resource provider and then the resource provider can decide if and how it does additional throttling. This resource provider throttling is completely independent of ARM throttling so the ARM layer/throttling is not relevant at that point. Besides Storage, the resource provider throttling limits are not documented publicly and can change at any time. You can see the Disk RP and CRP throttling subpages for info on troubleshooting those RPs.

The majority of the time the customer will encounter RP throttling, not ARM throttling. Generally you can identify ARM vs RP throttling by looking at the `failureCause` field in *HttpIncomingRequests* table.

- Gateway = ARM throttling
- Service = RP throttling
- <blank> or anything else = ? -- usually RP throttling

You can definitively identify ARM vs RP throttling by checking the HttpOutgoingRequests table. If there is an entry in this table with an outgoing call to an RP endpoint (i.e. <region>.compute.azure.com) and the httpStatusCode==429, then the throttling is coming from the resource provider.

If customer is not using Portal, SDKs or other clients with built in retry policies, sometimes implementing an exponential backoff retry policy might be enough to fix the RP Throttling issue.

## How ARM does throttling
### ARM throttling migration
As of April 2024, Azure Resource Manager is migrating the architecture from a sliding window algorithm to a token bucket algorithm (leveraging Azure Throttling Solution).

Migration will be done in stages, and it is expected to be completed before June 2024.

During the migration period, customers may be using either one of the algorithms described below. It can be determined which algorithm based on the headers returned by the operations.

### Sliding window architecture
#### Customer shareable

ARM currently determines throttling based on the following number of requests:
- 12000 read operations per hour
- 1200 write operations per hour

> The one hour window is a sliding window. It is not determined by the top of the hour.

The limits are the same at the subscription and tenant level. However, **the tenant level limit is only used when there is no subscription id in the request** (calls to Azure Resource Graph, or to resources above the subscription scope, like management groups).

Not only that, ARM also will look at the principal id of the request, which means every principal id gets a different counter for the limits.

#### ARM limit overrides
For specific actions, RPs can override the limits above and set their own limits. This would reflect as ARM throttling, it is ARM enforcing the throttling, but using the custom limits the RP defined in their manifest.

If while investigating the behavior the throttling is confirmed to be on ARM layer, and yet the customer is not even close to ARM default limits, it is worth checking the RP manifest for the action the customer is performing to confirm a custom limit has not been set by the RP.

#### Internal architecture details
ARM works as a set of instances running our Frontdoor code (the actual ARM API) on multiple Azure regions. Throttling counters are not shared across these instances. Potentially, this could mean that the limit number is way higher per principal id, as each instance in each region would start counting at 0 if the user made a call down the list.

We do not and cannot advertise it this way, since the user has no control over what region their ARM call goes to (this is handled by Traffic Manager routing the request to the closest region to the user), neither do they have control over what instance in one specific region they hit (ARM instances sit between a load balancer which cannot be bypassed).

On top of that, each instance also has 16 different counter instances (counting buckets). So even hitting the same instance, in the same location, may show a different count than expected based on the bucket that was selected. In the same way the region and the instance can not be selected by the user, buckets are not the exception, they are randomized by the service.

> We do not currently have any logging for the bucket number.

Based on this information, the throttling counter being used, is determined by a few things:

**Type of operation** + **Subscription/Tenant Id** + **Principal id** + **ARM Location** + **Instance number** + **Throttling bucket**

Which from the above, only the type of operation, the subscription/tenant id and principal id, can be controlled from the user side (and this is what we have documented publicly). However, for troubleshooting purposes, engineers do need to group the calls on all fields that are possible (all of the above minus the bucket number).

The above is also the reason why sometimes customers might be doing multiple calls into Azure, and yet the throttling headers in the response do not reflect the actual number of calls they had made from the client in the last hour.

##### Bucket collision
The throttling bucket each instance offers does not consider into account the principal id. This means two principals, calling into the same subscription/tenant id could potentially call the same ARM region, hit the same instance within that region, and unluckily enough, hit the same one bucket in that instance (out of the 16 that are available).

If this scenario comes to happen, **both principal ids will share the same throttling limit**. As it can probably be inferred, this is a corner case, as the chances of this scenario are low. However, some occurrences of this issue have been detected. This is more likely to happen in ARM regions with low instance count (as chances of hitting the same ARM instance in that region are higher), and ironically enough, with a higher number of principal ids running the same operation type.

> The internal architecture details above can be shared with customers if the scenario merits it, TA approval is required.

### Token bucket algorithm
A token bucket algorithm consists of 2 main elements:
- A bucket size
- A refill rate

Both elements are defined in number of tokens, which means the bucket has certain token capacity but it refills X amount of tokens based on the refill rate.

At any moment, the user can consume **one** or **more tokens** from the bucket, but can not exceed the amount of tokens available in the bucket. If the number of tokens in the bucket is exhausted, the user must wait for more tokens to become available (refill rate) to consume additional tokens.

Azure Resource Manager uses a service called Azure Throttling Solutions (ATS) to implement token bucket algorithm, but ARM owns the segmentation, refill rate and bucket size for its implementation. Current bucket and refill rates are documented in [Understand how Azure Resource Manager throttles requests - Migrating to regional throttling and token bucket algorithm](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/request-limits-and-throttling#migrating-to-regional-throttling-and-token-bucket-algorithm).

> Each request to ARM consumes **one token** from the bucket.

ATS throttling is **regional** and per **subscription id or tenant id**. However, **the tenant level limit is only used when there is no subscription id in the request** (calls to Azure Resource Graph, or to resources above the subscription scope, like management groups).

There are 2 quotas the caller needs to take in consideration when making a call:
- Principal id limit (defined in the table previously linked)
  > **x-ms-ratelimit-remaining-{scope}-{action}** header
- Global limit (only for subscription level calls), which is enforced on all principals and it is 15 times the principal specific limit for both bucket size and refill rate.
  > **x-ms-ratelimit-remaining-subscription-global-{action}** header.

> **The global limit header can be used to identify if the subscription is already onboarded to the new token bucket algorithm**
