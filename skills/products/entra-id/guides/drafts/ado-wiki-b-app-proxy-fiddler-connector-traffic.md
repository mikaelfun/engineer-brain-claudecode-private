---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra application proxy - Checking the traffic between the connector and the web app using Fiddler"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20application%20proxy%20-%20Checking%20the%20traffic%20between%20the%20connector%20and%20the%20web%20app%20using%20Fiddler"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Checking Traffic Between Connector and Web App Using Fiddler

## Background

In some troubleshooting scenarios you need to understand the SSL-protected HTTP traffic between the Microsoft Entra private network connector and the web application. Since switching from HTTPS to HTTP is usually impractical, injecting Fiddler between the parties can help inspect the traffic. This guide covers the configuration for scenarios where the connector communicates directly (no outbound proxy configured for connector-to-webapp traffic).

## Prerequisites

- Latest version of the connector installed
- Fiddler Classic installed on the connector server

## Configuration Steps

1. **Ensure latest connector version** - Follow the version check guide

2. **Install Fiddler** (Classic) on the connector server
   - Download from https://www.telerik.com/download/fiddler

3. **Set WinHTTP proxy**:
   ```cmd
   netsh winhttp set proxy http://127.0.0.1:8888
   ```

4. **Set registry value**:
   - Path: `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Microsoft AAD App Proxy Connector`
   - Name: `UseDefaultProxyForBackendRequests`
   - Type: DWORD
   - Value: `1`

5. **Verify config file** (`EntraPrivateNetworkConnectorService.exe.config` in Program Files\Microsoft Entra Private Network Connector):
   - If `<proxy>` tag exists with proxy setting, leave as-is
   - Otherwise, ensure these lines are present:
   ```xml
   <system.net>
     <defaultProxy enabled="false"></defaultProxy>
   </system.net>
   ```

6. **Enable HTTPS decryption in Fiddler**:
   - Tools > Options > HTTPS tab
   - Check "Decrypt HTTPS traffic"
   - Install certificates
   - Click OK

7. **Restart the Microsoft Entra private network connector service**

8. **Test** - You should see HTTPS traffic between connector and backend app in Fiddler

## Possible Issues

- **URL translation loop**: If internal and external URLs differ and "Translate URLs in headers" is set to No, Fiddler may try to establish a session to the external URL, causing a loop

- **Fiddler resolves the issue**: In some cases, inserting Fiddler in the path may fix the issue being investigated. If so, use alternative tracing methods:
  - WinHttp trace (netsh trace)
  - AppProxyTrace

## Cleanup

After troubleshooting, remember to:
1. Remove the WinHTTP proxy: `netsh winhttp reset proxy`
2. Remove or set `UseDefaultProxyForBackendRequests` to `0`
3. Restart the connector service
