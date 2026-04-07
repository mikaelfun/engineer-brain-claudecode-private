---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy aware portal experience"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20aware%20portal%20experience"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Introduction
The initial design of Azure Policy evaluates operations as they go through ARM. This is great for preventing the users to create resources that are out of compliance (talking specifically about deny policies), but it also means, that as users navigate through Portal blades, they can only realize their configurations are not allowed after they click on "Save" or get to the last step of a long resource creation wizard.

With the intent of improving this experience, the Azure Policy engineering group, in collaboration with the Azure Portal team, worked together to create the Azure Policy aware portal experience.

## Architecture
The Policy aware portal experience consists or 2 main components:
- The Policy Restrictions REST APIs
  - [[LEARN] Policy Restrictions - Check At Resource Group Scope](https://learn.microsoft.com/en-us/rest/api/policy/policy-restrictions/check-at-resource-group-scope?tabs=HTTP#checkrestrictionsresult)
  - [[LEARN] Policy Restrictions - Check At Subscription Scope](https://learn.microsoft.com/en-us/rest/api/policy/policy-restrictions/check-at-subscription-scope?tabs=HTTP)
- The client-side code that interprets the API responses (Portal).

A policy aware portal blade would call into the APIs mentioned above to confirm the restrictions that may be enforced for a resource that the user is trying to create. The API would look at the resource type, the scope, and return any restriction that is enforced by policy at that scope (there is no resource creation at this scope, this is an ad hoc check for Policy to indicate Portal what restrictions are in place before the resource is even tried to be created).

Once the response from Policy is provided, Portal can interpret these results and guide the customer accordingly in multiple ways. Here are a few samples of what this experience can accomplish:
- Disable portal options so that they are not clickable.
- Provide warnings to user when a non-allowed value is selected.
- Filter out options the user can see.

The list above is not exhaustive, and the portal can do with the data what is appropriate depending on the experience that wants to be delivered to the user.

On the portal side, this experience can be implemented by the Portal team itself on blades that are generic, or they can also be implemented by specific resource provider teams (that own specific blades in the portal).

:::mermaid
sequenceDiagram
  autonumber
  participant A as Portal
  participant B as Policy RP
  A->>A: Portal logic takes user input and prepares request
  A->>B: POST {scope}/providers/Microsoft.PolicyInsights/checkPolicyRestrictions
  B->>B: Applicable policies are evaluated
  B-->>A: Policy restrictions API response
  A->>A: Portal logic interprets response and takes portal action
:::

## Support ownership
The Azure Policy team is responsible for the APIs directly, that means ensuring the response provided by the API is consistent with the policies that are assigned to the customer environment and actually reflecting the restrictions those policies impose.

The Portal team (or RP team for resource specific blades) is responsible of:
1. Calling the Policy restrictions API with the correct data for what the API should evaluate
2. Interpreting those results in the UI in a way that is consistent with what the policy enforces or does not enforce.

For instance, if the policy restrictions API reports that a value would be modified in the payload, the portal implementation should not block the user from setting a value, because only deny would result in an actual block.

Another scenario like this would be the UI not letting the user continue to create a resource in a resource group that is excluded from the assignment (that is assuming of course such exclusion is reflected in the API response).
