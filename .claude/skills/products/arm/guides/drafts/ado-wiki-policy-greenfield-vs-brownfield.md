---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Greenfield vs Brownfield"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Policy/Architecture/Greenfield vs Brownfield"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Greenfield and Brownfield are two concepts used internally to refer to the type of evaluation Policy is executing at a given moment.

## Greenfield

- It is executed synchronously, while the user is sending a PUT or PATCH or DELETE request.
- Payload evaluated:
  - **On PUT:** Uses the request body in the PUT or PATCH request as the payload for evaluation.
  - **On PATCH:** Calls resource GET to retrieve the current payload for that resource, merges the incoming payload changes, and evaluates the result of that against the policy conditions.
  - **On DELETE:** Calls resource GET and evaluates that payload.
- It has the ability to take action on an incoming request.
- Does not have any impact on the compliance state of a resource.

Greenfield can also be referred to as **policy evaluation** or **policy enforcement**.

When a PUT or PATCH or DELETE request is submitted, Policy will look at the scope of the requests and determine which assignments are in the hierarchy of that scope. Once that is done, it has a list of assignments that should be evaluated on the incoming request.

> After a policy is assigned, greenfield evaluation might take up to 30 minutes to start occurring. This happens because the policy assignments are cached in the ARM layer, this cache is refreshed every 30 minutes. Logging out and logging back in to Azure, will force the cache to be refreshed, bypassing the 30 minute wait.

The next step in the process is to determine applicability, which ones of those policies should be evaluated on the incoming request based on the **type**, **name** and **kind** conditions. After applicability is determined, next step is evaluation: the process of actually going through each condition and checking if the resource returns **true** for the **if** condition. This is done in order based on the effect of the policy definitions: [Understand Azure Policy effects - Order of evaluation](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effects#order-of-evaluation).

If there is a policy that needs enforcement, the effect is triggered accordingly.

### Greenfield Flow

1. User sends PUT/PATCH/DELETE request to ARM
2. If PATCH or DELETE: ARM calls GET on resource provider to get current payload
3. ARM evaluates all applicable policies
4. If not denied or no policy evaluation failure: ARM forwards request to resource provider
5. Resource provider returns operation result
6. ARM returns operation result to user

> DELETE method is evaluated for denyAction policies only.

## Brownfield

- It is executed asynchronously, based on a GET request to the ARM cache or resource provider.
- Uses the GET calls responses as the payload for evaluation.
- It cannot take action on an incoming request.
- Determines compliance of a resource.

Brownfield can also be referred to as **policy scan** or **compliance scan**.

There are a few ways a brownfield scan can be triggered:
- **On a resource change:** After a greenfield evaluation occurs, a brownfield scan is triggered to update compliance state of the resource.
- **On a policy resource change:** After an assignment, initiative or definition is updated, a brownfield scan is kicked off for all resources in the assignment scope. This also applies when a new policy assignment is created.

> After the policy is assigned, results for the brownfield scan might take up to 30 minutes to be shown in portal. This is because the trigger is based on the EventServicesEntries table, which is ingested from Geneva and it might take this long to do so.

- **On demand:** A brownfield scan can be triggered on a specific scope. See [Get compliance data - On-demand evaluation scan](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/get-compliance-data#on-demand-evaluation-scan).
- **Daily scan:** Every day, a scan will be triggered for all subscriptions in Azure which have policy assignments created, therefore all applicable resources will have their compliance state updated at least every 24 hours.

Brownfield evaluation will determine what policies are applicable to the scope being scanned, perform a GET request on the resource or resources, and after determining applicability, it will determine the compliance state for each resource based on the GET response payload that got evaluated.
