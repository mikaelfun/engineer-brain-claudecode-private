---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Support Topics/Operation blocked by Policy/Operation blocked by Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Policy/Support Topics/Operation blocked by Policy/Operation blocked by Policy"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure Policy/Operation blocked by Policy

This support topic should be selected by customers when an operation is denied by Azure Policy.

**Note:** The user opening a case might or might not be an Azure Policy administrator — it might be a user with limited permissions trying to create/update a resource that violates a **deny** policy definition.

## 1. Get the error message
For these scenarios error messages usually include all details you require to troubleshoot the issue.

The typical error looks like:
```json
{
    "error": {
        "code": "RequestDisallowedByPolicy",
        "message": "Resource 'xxx' was disallowed by policy. Policy identifiers: [...]",
        "additionalInfo": [{
            "type": "PolicyViolation",
            "info": {
                "policyDefinitionDisplayName": "...",
                "evaluationDetails": {
                    "evaluatedExpressions": [...]
                }
            }
        }]
    }
}
```

The error tells you:
- Which **assignment** and **definition** blocked the operation
- Which **properties** did not meet the expected criteria (evaluationDetails)
- For an *allOf* operator, all expressions being true means the policy effect is triggered

**Note:** If the user does not have permissions over Policy, the `evaluationDetails` section will be removed from the response — only the definition and assignment IDs will be shown.

If the customer is not the Policy administrator and disagrees with restrictions, they should reach out to their Security team.

## 2. The customer believes the operation should not have been denied
If that is the case, the policy is not behaving as expected. Continue troubleshooting under: Policy enforcement not as expected.
