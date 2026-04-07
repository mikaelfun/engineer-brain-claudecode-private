---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/Azure Policy in Disconnected Azure Local Environments \u2013 Overview/Sample Policy in Disconnected Azure Local"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FWorkloads%2FAzure%20Policy%20in%20Disconnected%20Azure%20Local%20Environments%20%E2%80%93%20Overview%2FSample%20Policy%20in%20Disconnected%20Azure%20Local"
importDate: "2026-04-06"
type: troubleshooting-guide
---

### Sample Azure Policy Definition: Require a Specific Tag

    {
      "properties": {
        "displayName": "Require 'Environment' tag on all resources",
        "policyType": "Custom",
        "mode": "All",
        "description": "This policy ensures that all resources have an 'Environment' tag.",
        "metadata": {
          "version": "1.0.0",
          "category": "Tags"
        },
        "parameters": {
          "tagName": {
            "type": "String",
            "metadata": {
              "displayName": "Tag Name",
              "description": "Name of the tag to enforce"
            }
          }
        },
        "policyRule": {
          "if": {
            "field": "[concat('tags[', parameters('tagName'), ']')]",
            "exists": "false"
          },
          "then": {
            "effect": "deny"
          }
        }
      }
    }

---

### How to Use in Disconnected Azure Local

1. **Save the JSON** to a file (e.g., `require-tag-policy.json`).
2. **Deploy via CLI or PowerShell** in your Azure Local environment:

       az policy definition create \
         --name 'require-tag' \
         --display-name 'Require Environment Tag' \
         --description 'Ensure Environment tag is present' \
         --rules require-tag-policy.json \
         --mode All

3. **Assign the policy** to a scope (e.g., subscription or resource group).
