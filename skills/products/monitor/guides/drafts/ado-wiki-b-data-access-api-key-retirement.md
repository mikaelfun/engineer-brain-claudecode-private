---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Deprecated features/Data Access API key retirement"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FDeprecated%20features%2FData%20Access%20API%20key%20retirement"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Data Access API Key Retirement

**Scenario**: Help managing existing data access API keys or migrating to a supported Entra ID auth

## Key Facts

- API Key retirement has occurred ahead of the public scheduled retirement (March 2026)
- No new API Keys are allowed to be created by internal (Microsoft) users (SFI)
- Existing keys continue to work until they expire
- External/public customers can still create API keys in the portal until full retirement

## Scenarios

### What is the API Key?

The API key is a means to access a resource without authenticating with Azure AD.
Reference: https://docs.microsoft.com/azure/azure-monitor/logs/api/authentication-authorization#authenticating-with-an-api-key

### Issues creating or deleting API key

1. Can the user create or delete a key for their Application Insights resource?
2. Can the user try a different browser?
3. Do other users have the same issue?
4. What command (Azure CLI or PowerShell) is being used?
5. Does the user have sufficient privileges - Contributor?

**NOTE**: Internal users will see **Failed to create API Key** error in the portal due to SFI blocks.

### API Key doesn't work or returns error while calling REST API

1. If component is workspace-based, check **Properties** pane of backend LA Workspace > **Access control** mode:
   - "Require workspace permissions" blocks API key (SAS key) auth
   - "Use resource or workspace permissions" allows API key auth
2. Have customer create a brand-new API key with all permissions and test with the new key

### How to identify which resource has API keys still configured

Bash script to enumerate API keys across all App Insights resources:

```bash
#!/bin/bash
resources=$(az resource list --resource-type "Microsoft.Insights/components" --query "[].{name:name, resourceGroup:resourceGroup}" -o tsv)
declare -A apiKeys
while IFS=$'\t' read -r name resourceGroup; do
    keys=$(az monitor app-insights api-key show --app "${name}" -g "${resourceGroup}" --query "[].{name:name}" -o tsv)
    apiKeys["${name}"]="${keys}"
done <<< "${resources}"
echo "Rundown of Application Insights resources and their API keys:"
for resource in "${!apiKeys[@]}"; do
    echo "Resource Name: ${resource}"
    if [ -z "${apiKeys[${resource}]}" ]; then
        echo "  No API keys found."
    else
        echo "  API keys:"
        for key in ${apiKeys[${resource}]}; do
            echo "    - ${key}"
        done
    fi
done
```

### How to check if API keys have been used recently

Query Draft Telemetry (via ASC > any Log Analytics resource > Query Draft logs):

```kusto
requests
| where timestamp > ago(3d)
| where resultCode == 200
| where customDimensions.["Authentication.authenticationStrategy"] == "ApiKey"
| extend Application_subscriptionId_ = tostring(customDimensions.["Application.subscriptionId"])
| extend client = tostring(customDimensions["Request.clientApp"])
| extend Application_resourceId_ = tostring(customDimensions.["Application.resourceId"])
| summarize count() by Application_resourceId_, client
```

## Migration Path

- For custom solutions (Function App, Web App): See Entra ID authentication guides
- Logic Apps: https://learn.microsoft.com/azure/connectors/connectors-azure-monitor-logs
- All other: https://learn.microsoft.com/connectors/azuread/
