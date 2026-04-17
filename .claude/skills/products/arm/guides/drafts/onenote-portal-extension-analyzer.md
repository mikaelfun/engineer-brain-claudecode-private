# Azure Portal Extension Analyzer (Mooncake)

> Source: MCVKB 14.3 | Last verified: 2024-09

## Overview
Use Azure Portal Extension Analyzer to troubleshoot portal errors by querying user sessions, finding shell/extension errors without needing Kusto access.

## Extension Analyzer Tool
- URL: https://extensionanalyzer.azure-test.net/
- For Mooncake: switch environment to "mc" after login, authenticate with corp account

## Finding Extension Ownership (Ctrl+Alt+D)
1. Navigate to the affected blade and reproduce the issue
2. Press **Ctrl+Alt+D** on the blade
3. Note the Extension_Name > Blade_Name
4. Look up the extension at https://extensionanalyzer.azure-test.net/extensions#overview
5. Find ICM service and ICM team for escalation

## Querying by Username or Session ID
- **Username**: Returns list of portal sessions, find appropriate one by time + error count
- **Session ID**: Found in browser F12 devtools request headers during remote session
- **Correlation ID**: NOT working for Mooncake
- **Tenant ID**: Only provides aggregated summary

## Results
- Shell Errors tab: platform-level issues
- Extension Errors tab: extension-specific failures

## Alternative: Direct Kusto Query
Cluster: `azportalmc2.chinaeast2.kusto.chinacloudapi.cn`
Database: `AzurePortal`

### Shell Errors
```kql
ClientEvents
| where sessionId == "<session-id>"
```

### Extension Errors
```kql
ExtEvents
| where sessionId == "<session-id>"
```
