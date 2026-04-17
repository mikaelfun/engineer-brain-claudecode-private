---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Managed Grafana/How-To/How to authenticate and make calls to Grafana's API"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FManaged%20Grafana%2FHow-To%2FHow%20to%20authenticate%20and%20make%20calls%20to%20Grafana%27s%20API"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Authenticate and Make Calls to Grafana's API

## Overview

Grafana Labs has a known design limitation: **resources created through the API can only be edited/deleted through the same API**. Customers may need to run API calls against Azure Managed Grafana to manage their resources.

## Prerequisites

- An existing Managed Grafana resource
- Owner or User Access Administrator permissions on the Azure Managed Grafana resource

## Steps

1. **Enable service accounts**: Go to Settings > Configuration > Service Accounts in your Managed Grafana resource
2. **Create a Service Account**: Follow [How to use service accounts: Create a Service Account](https://learn.microsoft.com/en-us/azure/managed-grafana/how-to-service-accounts?tabs=azure-portal%2Cgrafana-ui#create-a-service-account)
3. **Add a service token**: Follow [Add a service token](https://learn.microsoft.com/en-us/azure/managed-grafana/how-to-service-accounts?tabs=azure-portal%2Cgrafana-ui#add-a-service-account-token). Copy and store the token securely.
4. **Make API calls** using PowerShell:

```powershell
$token = "glsa_123..."
$body = @{
    key = "value"
} | ConvertTo-Json -Depth 3

Invoke-WebRequest -Uri https://amg-central-abcd.cus.grafana.azure.com/api/v1/<api-endpoint> -Method POST -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
} -Body $body
```

## Example: Delete Contact Points Created via API

### List all contact points (get UID):
```bash
curl.exe -sS -H "Authorization: Bearer glsa_123" -H "Content-Type: application/json" https://amg-central-abcd.cus.grafana.azure.com/api/v1/provisioning/contact-points
```

### Delete a contact point:
```powershell
$uid = "abc"
$token = "glsa_###"
Invoke-WebRequest -Uri "https://amg-central-abcd.cus.grafana.azure.com/api/v1/provisioning/contact-points/$uid" -Method DELETE -Headers @{ "Authorization" = "Bearer $token" }
```

Expected response: HTTP 202 confirming deletion.

## Resources

- [Alerting Provisioning HTTP API | Grafana documentation](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/alerting_provisioning/#contact-points)
