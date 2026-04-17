---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/Workspace Management/How-to: Use the Log Analytics search API and validate the permissions are correctly set"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FWorkspace%20Management"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How-to: Validate Log Analytics Search API Permissions

## Scenario
Validate customer has properly set permissions for the Log Analytics search API.

## PowerShell Validation Script
```powershell
$ClientId       = "<ApplicationId>"
$ClientSecret   = "<Key>"
$TenantId       = "<TenantId>"
$WorkspaceId    = "<WorkspaceId>"
$Query          = "Heartbeat| distinct Computer"

# Acquire token
$TokenEndpoint = "https://login.windows.net/"+$TenantId+"/oauth2/token/"
$Auth_Body = @{
    resource      = "https://api.loganalytics.io"
    client_id     = $ClientId
    grant_type    = "client_credentials"
    client_secret = $ClientSecret
}
$token = (Invoke-RestMethod -Method POST -Uri $TokenEndpoint -Headers @{accept="application/json"} -Body $Auth_Body).access_token

# Query API
$API_Headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
$API_Body = @{query = $Query} | ConvertTo-Json
$APIEndpoint = "https://api.loganalytics.io/v1/workspaces/"+$workspaceid+"/query"
$response = Invoke-WebRequest -Method POST -Uri $APIEndpoint -Headers $API_Headers -Body $API_Body
$response.Content
```

## CURL Validation
1. Get token: POST to `https://login.microsoftonline.com/{TenantId}/oauth2/token`
2. Query: POST to `https://api.loganalytics.io/v1/workspaces/{WorkspaceId}/query`

## Reference
- API setup: https://dev.loganalytics.io/documentation/1-Tutorials/Direct-API
