---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph MCP Server for Enterprise/Step 2. MCP Client Visual Studio Code"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20MCP%20Server%20for%20Enterprise%2FStep%202.%20MCP%20Client%20Visual%20Studio%20Code"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MCP Client - Visual Studio Code

## Install Microsoft Graph MCP

1. Install VS Code and GitHub Copilot
2. Click Install Microsoft MCP Server for Enterprise link
3. Click Allow on auth prompt and sign-in
   - Note: When signing-in from a machine managed in another tenant, deselect "Allow my organizations to manage my device" and click "No, this app only"
4. Ctrl+Shift+P > MCP: List Servers > Verify "Microsoft MCP Server for Enterprise" is Running
   - Production endpoint: https://mcp.svc.cloud.microsoft/enterprise
5. Start Server
6. Ctrl+Shift+I > Open Copilot Chat Panel > Select Agent mode > Select GPT-4.1 or higher model

## Launch MCP (Post Install)

1. Ctrl+Shift+P > MCP: List Servers
2. Select MicrosoftGraph > Start Server
3. Verify terminal shows "Connection state: Running" and "Discovered 3 tools"

## Claude Desktop

Claude Desktop also requires exposing their client application and server in the tenant similar to Microsoft MCP Server for Enterprise. Their process uses Microsoft Graph Explorer to add two service principals to the tenant.

See: https://support.claude.com/en/articles/12542951-enabling-and-using-the-microsoft-365-connector
