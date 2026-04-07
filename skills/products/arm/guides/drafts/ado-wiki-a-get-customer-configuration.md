---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Troubleshooting Guides/Get customer configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FTroubleshooting%20Guides%2FGet%20customer%20configuration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

As Azure engineers, we have the option to get the customer policy configuration from our tools. This includes the assignments, initiatives and definitions created on our customers' environment.

You can get this information either from ASC or Jarvis as shown below.

[[_TOC_]]

## From ASC
From the ASC homepage, go to **Resource Explorer** > **Click on the subscription id** > **Azure Policy tab**.

The different Azure Policy options will be shown at the top.

Azure Policy Compliance, Azure Policy Change Tracking Log, Azure Policy Evaluation History Log and Azure Policy Scan History Log are covered in [[TSG] Get customer logs](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623715/).

On this TSG we will cover how to get the customer configuration only.

### Azure Policy Assignments
The Azure Policy Assignments section returns all resources of type *Microsoft.Authorization/policyAssignments* that customers have created on their subscription, resource groups inside that subscription, and management groups in the selected subscription hierarchy.

In many scenarios, customers will provide the assignment id, which you can use to filter and locate the specific assignment you need.

A policy assignment json looks like this:
```json
{
    "properties": {
        "displayName": "Inherit a tag from the resource group",
        "policyDefinitionId": "/providers/Microsoft.Authorization/policyDefinitions/cd3aa116-8754-49c9-a813-ad46512ece54",
        "scope": "/subscriptions/e3dc1f21-ee33-xxxx-80a8-30e2cca77d66",
        "notScopes": ["/subscriptions/.../resourceGroups/excludedRG"],
        "parameters": { "tagName": { "value": "Department" } }
    },
    "id": "/subscriptions/.../providers/Microsoft.Authorization/policyAssignments/6fffccf79d724073a48980a5",
    "type": "Microsoft.Authorization/policyAssignments",
    "name": "6fffccf79d724073a48980a5"
}
```

### Azure Policy Set Definitions (Initiatives)
The Azure Policy Set Definitions section returns all resources of type *Microsoft.Authorization/policySetDefinition*.

> ASC does not display built-in initiatives for performance reasons. Built-in initiatives are easy to identify as their resource id starts with `/providers/`. For built-in initiatives, you can get the configuration on your internal subscription Definitions blade.

### Azure Policy Definitions
The Azure Policy Definitions section returns all resources of type *Microsoft.Authorization/policyDefinition*.

> ASC does not display built-in definitions for performance reasons. Built-in definitions are easy to identify as their resource id starts with `/providers/`.

## From Jarvis
### Get Subscription Policy Assignments
Use [[JARVIS] Get subscription policy assignments](https://jarvis-west.dc.ad.msft.net/4C5884E0?genevatraceguid=b063a840-2900-45bf-ad86-5502c3180c58) action.

### Get Subscription Policy Exemptions
Use [[JARVIS] Get subscription policy exemptions](https://jarvis-west.dc.ad.msft.net/F635FF78?genevatraceguid=e40b8a3f-4858-40b9-ae1c-e563997935ce) action.

### Get Subscription Policy Initiatives
Use [[JARVIS] Get subscription policy set definitions](https://jarvis-west.dc.ad.msft.net/674ED7DD?genevatraceguid=b063a840-2900-45bf-ad86-5502c3180c58) action.

### Get Subscription Policy Definitions
Use [[JARVIS] Get subscription policy definitions](https://jarvis-west.dc.ad.msft.net/228DF925?genevatraceguid=b063a840-2900-45bf-ad86-5502c3180c58) action.
