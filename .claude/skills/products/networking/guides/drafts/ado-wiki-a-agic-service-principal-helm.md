---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/AGIC Application Gateway Ingress Controller/How to configure a service principal for use with AGIC Helm deployments"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FHow%20to%20configure%20a%20service%20principal%20for%20use%20with%20AGIC%20Helm%20deployments"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Configure a Service Principal for Use with AGIC Helm Deployments

> **Note:** Recommended method is Workload Identity or AGIC Add-on. Service Principals are still supported but require specific steps.

[[_TOC_]]

## Required Permissions

The service principal needs:
- **Contributor** on the Application Gateway
- **Reader** on the resource group containing the AKS cluster
- **Network Contributor** on the Application Gateway's subnet
- If using Key Vault: `Microsoft.ManagedIdentity/userAssignedIdentities/*/read` on the managed identity for the App Gateway

---

## Steps to Create the Service Principal (Azure Portal)

1. Navigate to **Entra ID → App Registrations → New Registration**
2. Note the **Tenant ID** and **Application (Client) ID**
3. Create a **Client Secret** — record the **value** (shown only once; this is the secret *value*, not the Secret ID)
4. Assign required permissions (see above)

---

## Configuring the secretJSON for AGIC Helm

The `secretJSON` must be a JSON object in this format, then **Base64 encoded**:

```json
{
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientSecret": "00000~0000000000000000000000000000000000",
  "subscriptionId": "00000000-0000-0000-0000-000000000000",
  "tenantId": "00000000-0000-0000-0000-000000000000",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

> ⚠️ For Azure Government / Mooncake, endpoint URLs differ. See [National Cloud auth docs](https://learn.microsoft.com/en-us/entra/identity-platform/authentication-national-cloud).

### Base64 Encode with PowerShell

```powershell
$data = @{
    clientId = "00000000-0000-0000-0000-000000000000"
    clientSecret = "00000~0000000000000000000000000000000000"
    subscriptionId = "00000000-0000-0000-0000-000000000000"
    tenantId = "00000000-0000-0000-0000-000000000000"
    activeDirectoryEndpointUrl = "https://login.microsoftonline.com"
    resourceManagerEndpointUrl = "https://management.azure.com/"
    activeDirectoryGraphResourceId = "https://graph.windows.net/"
    sqlManagementEndpointUrl = "https://management.core.windows.net:8443/"
    galleryEndpointUrl = "https://gallery.azure.com/"
    managementEndpointUrl = "https://management.core.windows.net/"
}
$jsonString = $data | ConvertTo-Json
$bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonString)
$base64EncodedJson = [Convert]::ToBase64String($bytes)
Write-Output $base64EncodedJson
```

> ⚠️ The string is **case sensitive** — copy exactly.

### AGIC Helm values.yaml snippet

```yaml
appgw:
    subscriptionId: <subscriptionId>
    resourceGroup: <resourceGroupName>
    name: <applicationGatewayName>
    shared: false

armAuth:
    type: servicePrincipal
    secretJSON: <base64EncodedJSON>
```

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| AGIC fails to start | `secretJSON` incorrectly formatted or not base64 encoded | Verify JSON format and encoding |
| "Failed to authenticate to ARM" | Wrong `clientSecret` value (using Secret ID instead of value) | Use the client secret **value** |
| "Failed to get Application Gateway" | Missing Contributor permission on AppGw | Assign Contributor to service principal |
| Key Vault cert retrieval fails | Missing managed identity read permission | Assign `Microsoft.ManagedIdentity/userAssignedIdentities/*/read` |
