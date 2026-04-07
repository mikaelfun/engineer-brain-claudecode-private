---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Support Topics/Policy behavior not as expected/Policy enforcement not as expected"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Policy/Support Topics/Policy behavior not as expected/Policy enforcement not as expected"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Policy/Policy behavior not as expected/Policy enforcement not as expected
This support topic should be selected by customers when greenfield evaluation occurs or does not occur, when they do not expect it to.

For brownfield evaluation issues, customer should open the case under [SAP] [Azure Policy/Policy behavior not as expected/Compliance state and details not as expected]()

[[_TOC_]]

## 1. Understand the scenario
- What was the customer expecting to happen? What didn't happen?
- What was the customer not expecting to happen? What did happen?
- What should this policy definition do?

This information should be documented on your case notes.

On greenfield evaluation, a policy being triggered means:
- For **audit** policy generated an activity log entry.
- For **append** properties added to the incoming payload.
- For **modify** properties added/updated/removed to/from the incoming payload.
- For **deny** or **denyAction** request fails with error 403.
- For **auditIfNotExists** policy generated an activity log entry.
- For **deployIfNotExists** remediation deployment ran automatically 10 minutes (or value of `evaluationDelay` property) after the CRUD operation.

## 2. Get the customer current configuration
[[TSG] Get customer configuration](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623714)

## 3. Check the policy mode is set correctly
[[ARCH] Policy mode](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623676)

## 4. Check the policy logic
Based on what the customer said the policy should do, check the policy logic. Make sure the conditions and values the policy has align to the intended purpose.

If customer is using array aliases ([*]), pay special attention to the array syntax: [[LEARN] Author policies for array properties on Azure resources](https://learn.microsoft.com/en-us/azure/governance/policy/how-to/author-policies-for-arrays).

If any issues are found, let the customer know what adjustments need to be made.

## 5. Get a resource payload and verify the conditions
[[TSG] Get the right resource payload](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623716)

Go through the [[TSG] Condition checklist](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623711) for each one of the evaluated properties in the definition.

## 6. Verify the correlation id
For greenfield, the correlation id should tell you if the policy was evaluated or not, and if was triggered.

`EventServiceEntries` will have a record if the effect was triggered.

### 6.1 The policy was not evaluated
- Verify the resource being created/updated is part of the assignment **scope**, and not part of the assignment exclusions (**notScopes**).
- Verify if there is an exemption for the resource or its parent scopes that is applicable for the impacted assignment.
- Verify the assignment **enforcementMode** is set to *default*.
- Double check for typos in the type/name/kind conditions of the policy definition.

## 7. Repro the issue
See if you are able to replicate the issue. Use the same policy definition and assignment configuration, and use a payload as close as possible to what the customer was using. It does not have to be an exact copy, but at least the properties evaluated by the policy should be exactly the same.

The repro will help you take a second look at things that may have been missed on the initial troubleshooting, and if the behavior can be reproduced, that means your TA/SMEs should take a look at the issue. They will rely on your repro environment for analysis.
