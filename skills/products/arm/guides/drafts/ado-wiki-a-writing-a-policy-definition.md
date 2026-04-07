---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Support Topics/Authoring a Policy/Writing a policy definition"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FSupport%20Topics%2FAuthoring%20a%20Policy%2FWriting%20a%20policy%20definition"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Policy/Authoring a Policy/Writing a policy definition
This support topic should be selected by customers when they need a policy for a specific requirement, and they either don't know where to start, or need assistance to write their policy.

[[_TOC_]]

## 1. Understand the requirement
What is the customer trying to accomplish? On which scenarios should policy flag the resource as compliant vs non-compliant? This information should be documented on your case notes.

Is the requirement something that is related to Policy? or should they maybe go for:
- **RBAC** > For restricting actions on specific users.
- **ARM locks** > To lock a resource for everyone.
- **Activity Log alerts** > To get notified on a specific event.
- **Another Azure feature** > Something that doesn't align to the Azure Policy core functionalities.

## 2. Determine what the right effect is to accomplish the requirement
### Is the goal to...?
- Determine compliance? Use **Audit**
- Block operations that don't meet the desired resource configuration? Use **Deny**
- Specify a predefined value for a property that is not present in the resource payload? Use **Append**
- Add and/or replace a tag/property on a resource? Use **Modify**
- Determine compliance based on the existence of another resource? Use **AuditIfNotExists**
- Determine compliance based on the existence of another resource, and create that resource? Use **DeployIfNotExists**
- Determine compliance based on a control that policy can not evaluate from the resource and must be attested manually? Use **Manual**
- Prevent a resource from being deleted based on conditions evaluated against its payload? Use **DenyAction**

### Additional Information
- [[LEARN] Understand Azure Policy effects](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/effects)
- [[ARCH] How effects work](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623661/)

## 3. Get the payload of a sample resource the policy will be based on
[[TSG] Get the right resource payload](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623716/)

Based on the payload, you should identify the property or properties that require evaluation.

## 4. Check the list of known issues to confirm the requirement will be supported
[[GH] Azure Policy known issues](https://github.com/Azure/azure-policy#known-issues)

## 5. Set the correct policy mode
[[ARCH] Policy mode](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623676/)

## 6. Determine what the right aliases for the resource type should be
[[TSG] Find the right alias](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623713/)

## 7. Check if there is a built-in policy to accomplish the requirement
From the Azure Portal
- Go to **Policy** > **Definitions**.
- Search for keywords and look for a built-in definition that fulfills the requirement. You can also filter the definitions by Category.

## 8. Think about the logic, and then translate it into policy language
There is no TSG we can write for this, you need to interpret the requirement and understand what policy language is needed.

If you found a similar built-in policy, it is also possible to create a duplicate and make the necessary adjustments.

### Additional information
- [[LEARN] Azure Policy definition structure](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/definition-structure)
- [[LEARN] Tutorial: Create a custom policy definition](https://learn.microsoft.com/en-us/azure/governance/policy/tutorials/create-custom-policy-definition#compose-the-definition)
- [[LEARN] Azure Policy Samples](https://learn.microsoft.com/en-us/azure/governance/policy/samples/)

## Related troubleshooting workflows
- [[SAP] Compliance state and details not as expected](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623705/)
- [[SAP] Policy enforcement not as expected](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623706/)
