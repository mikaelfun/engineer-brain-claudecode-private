# Azure VPN Client Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/vpn-gateway/troubleshoot-azure-vpn-client

## Diagnostic Steps

### 1. View Status Logs
- Click arrows icon at bottom-right of Azure VPN Client window
- Error messages displayed in red
- Check for connection errors, authentication failures

### 2. Clear Sign-in Info (Entra ID only)
- Profile ... > Configure > Clear Saved Account > Save
- Reconnect to trigger fresh authentication

### 3. Run Built-in Diagnostics
- Profile ... > Diagnose > Run Diagnosis
- Tests: Internet Access, Client Credentials (Entra endpoint), Server Resolvable (DNS), Server Reachable (VPN server)
- Failed tests indicate specific connectivity issues

### 4. Collect Log Files
- Profile ... > Diagnose > Show Logs Directory
- Opens Windows Explorer to log folder
- Share logs with support via email or support ticket

## Common Issues

### Background Apps Permission (Windows)
- Error: "VPN Platform did not trigger connection" / Error 1460
- Fix: Settings > Privacy > Background apps > "Let apps run in the background" = On

### Feedback Hub for Bug Reports
- Windows key + F to open Feedback Hub
- Category: Problem > Network and Internet > Azure VPN Client
- Use "Recreate my problem" with recording for best diagnostics
- Copy Short Link + URI for Azure support ticket reference

## 21V Applicability
NOT applicable - Azure VPN Client with Entra ID auth not available in 21V.
