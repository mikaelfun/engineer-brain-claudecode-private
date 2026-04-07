---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph MCP Server for Enterprise/Step 1. Register MCP Server and Client Apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20MCP%20Server%20for%20Enterprise%2FStep%201.%20Register%20MCP%20Server%20and%20Client%20Apps"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Register MCP Server and Client Apps

## How Permissions are Granted to MCP Client

To enforce least privilege:
1. Go to App registrations > All applications > select the client app (e.g., VS Code: aebc6443-996d-45c2-90f0-388ff96faa56)
2. Under API Permissions > Add a permission > APIs my organization uses > select "Microsoft MCP Server for Enterprise"
3. Choose Delegated permissions > select `<McpPrefix>.User.Read` > Add permissions
4. Click Grant admin consent

## Register MCP Client and Server Apps

1. Follow Quick Start in https://github.com/microsoft/EnterpriseMCP
2. Use `Grant-EntraBetaMCPServerPermission` cmdlet to:
   - Provision MCP Server for Enterprise Service Principal in tenant
   - Provision MCP Client Service Principal
   - Assign scopes from Server to Client

## Manage Authorization for 3P Apps

### List Permissions
```powershell
(Get-EntraBetaServicePrincipal -Property "PublishedPermissionScopes" -Filter "AppId eq 'e8c77dc2-69b3-43f4-bc51-3213c9d915b4'").PublishedPermissionScopes | Select-Object Value, AdminConsentDisplayName | Sort-Object
```

### Set Permissions
```powershell
Grant-EntraBetaMCPServerPermission -ApplicationId "<MCP_Client_Application_Id>"
# Custom scopes:
Grant-EntraBetaMCPServerPermission -ApplicationId "<MCP_Client_Application_Id>" -Scopes "<Scope1>", "<Scope2>"
```

### Revoke Permissions
```powershell
Revoke-EntraBetaMCPServerPermission
```

Note: MCP Server uses delegated permissions only, providing a reduced set of Microsoft Graph permissions.
