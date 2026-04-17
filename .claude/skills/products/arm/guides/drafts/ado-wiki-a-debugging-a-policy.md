---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Support Topics/Authoring a Policy/Debugging a Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FSupport%20Topics%2FAuthoring%20a%20Policy%2FDebugging%20a%20Policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Policy/Authoring a Policy/Debugging a Policy
This support topic should be selected by customers when they need to understand how each one of the conditions is behaving, for the resource to be either compliant or non-compliant in a specific scenario.

[[_TOC_]]

## 1. Understand the requirement
What is the customer trying to accomplish? On which scenarios should policy flag the resource as compliant vs non-compliant? This information should be documented on your case notes.

## 2. Get the customer current configuration
[[TSG] Get customer configuration](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623714/)

## 3. Get the resource payload of the scenario the customer want to debug
[[TSG] Get the right resource payload](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623716/)

## 4. Check the list of known issues to confirm the requirement is supported
[[GH] Azure Policy known issues](https://github.com/Azure/azure-policy#known-issues)

## 5. Debug the policy
Based on the policy definition, identify the **aliases** and **top level properties** being used. Look for those properties in the resource payload you got from step 3, we will use those values.

There is no step by step debugger for Policy, so we have to do this manually.

From the **if** section of the policy, drill down to each *oneOf*, *allOf* and *not* logical operators, and then to each condition.

For each condition see what is the **value** for that property, and then evaluate the **operator** and **value** we are looking for on the policy. Keep in mind the value on the policy might come from a parameter, so you may need to get it from the assignment or initiative.

For each condition, you need to determine whether it will evaluate to **true** or **false**, and use the result for each condition to determine the value of your logical operators (*allOf*, *anyOf*, *not*).

The result of the if statement, will determine compliance for the resource (or applicability for AINE and DINE policies).

### Additional information
- [[LEARN] Azure Policy definition structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/definition-structure)

## Related troubleshooting workflows
- todo TSG
- todo TSG
