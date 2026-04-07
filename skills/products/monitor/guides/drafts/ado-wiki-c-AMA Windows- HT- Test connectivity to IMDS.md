---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Windows/How-To/AMA Windows: HT: Test connectivity to IMDS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Windows/How-To/AMA%20Windows%3A%20HT%3A%20Test%20connectivity%20to%20IMDS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
Connectivity to the [Azure Instance Metadata Service (IMDS) service](https://learn.microsoft.com/azure/virtual-machines/instance-metadata-service?tabs=linux) can be tested in two steps. 
- A metadata response (a JSON response of properties about our resource)
- An access token (verifying that our identity was accepted by IMDS and we have been issued an access token).

# IMDS with Proxy Servers
[Proxy servers are not supported](https://learn.microsoft.com/azure/virtual-machines/instance-metadata-service?tabs=linux#proxies) with IMDS. If there is a proxy defined, the IMDS address should be in the bypass list. 

[How-to check system proxy settings](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585649/AMA-Windows-HT-Check-agent-proxy-settings?anchor=step-3%3A-how-can-a-system-proxy-be-defined%3F)

# Azure Virtual Machine
## IMDS metadata
- When running the following command, do you see a **200 response** and a **JSON response** with details about this machine?

Using curl:
```
C:\Windows\system32\curl.exe -v -s -S -k -H "Metadata: true"  "http://169.254.169.254/metadata/instance?api-version=2019-11-01&format=json"

```

![image.png](/.attachments/image-c7f39bef-f4c8-4040-aa88-e9cba2fc8a10.png)

Using PowerShell:
```
Invoke-WebRequest -Uri "http://169.254.169.254/metadata/instance?api-version=2019-11-01&format=json" -Headers @{"Metadata"="true"} -Debug

```

![image.png](/.attachments/image-63321e50-f11b-400e-aafd-2afd83ac07e8.png)

## IMDS access token
- When running the following command, do you see a **200 response** and a **JSON response** with the access token?

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: Treat this access_token value as sensitive information.
</div>

### System Managed Identity
Using curl:
```
C:\Windows\system32\curl.exe -v -s -S -k -H "Metadata: true" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F"

```

![image.png](/.attachments/image-b5e4c22c-5c35-4319-9a78-f9cf3ce4c8e1.png)

Using PowerShell:
```
Invoke-WebRequest -Uri "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F" -Headers @{"Metadata"="true"} -Debug

```

![image.png](/.attachments/image-bd0b0e18-2a15-48c6-926e-a60c865640d5.png)

### User Managed Identity

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: Replace the UserAssignedIdentity value with the ResourceID of the user assigned identity from the target environment.
</div>

Using curl:

```
:: Define the ResourceID of the user assigned identity
set "userAssignedIdentity=/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/microsoft.managedidentity/userassignedidentities/{userAssignedIdentityName}"

echo %userAssignedIdentity%

:: Test to see if we can get an auth token using the user assigned identity
C:\Windows\system32\curl.exe -v -s -S -k -H "Metadata: true" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F&msi_res_id=%userAssignedIdentity%"

```

![image.png](/.attachments/image-70b58bb5-5c77-4f5c-88bf-7ba0a2d3d54d.png)

Using PowerShell:

```
$userAssignedIdentity = "/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/microsoft.managedidentity/userassignedidentities/{userAssignedIdentityName}"

Invoke-WebRequest -Uri "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F&msi_res_id=$userAssignedIdentity" -Headers @{"Metadata"="true"} -Debug

```

![image.png](/.attachments/image-897c8484-9c5c-4746-b52c-859ed9af1ca5.png)

# Azure Arc Machine
## IMDS metadata
- When running the following command, do you see a **200 response** and a **JSON response** with details about this machine?

Using curl:
```
C:\Windows\system32\curl.exe -v -s -S -k -H "Metadata: true" "http://localhost:40342/metadata/instance?api-version=2019-11-01&format=json"

```

![image.png](/.attachments/image-3eabdd25-5323-4a32-a8ca-dbafa7e3107c.png)

Using PowerShell:
```
Invoke-WebRequest -Uri "http://localhost:40342/metadata/instance?api-version=2019-11-01&format=json" -Headers @{"Metadata"="true"} -Debug

```

![image.png](/.attachments/image-b0d14623-07e0-4a6e-9f0a-58f52c955bda.png)

## IMDS access token
- When running the following command, do you see a **200 response** and a **JSON response** with the access token?

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: Treat this access_token value in the .key file as sensitive information.
</div>

Using curl:
```
C:\Windows\system32\curl.exe -v -s -S -k -H "Metadata: true" "http://localhost:40342/metadata/identity/oauth2/token?api-version=2019-11-01&resource=https%3A%2F%2Fmanagement.azure.com"

```

![image.png](/.attachments/image-e7530e59-521c-4577-b064-4706eec7ec97.png)

Using PowerShell (public docs reference [here](https://learn.microsoft.com/azure/azure-arc/servers/managed-identity-authentication#acquiring-an-access-token-using-rest-api)):
```
$apiVersion = "2020-06-01"
$resource = "https://management.azure.com/"
$endpoint = "{0}?resource={1}&api-version={2}" -f $env:IDENTITY_ENDPOINT,$resource,$apiVersion
$secretFile = ""
try
{
    Invoke-WebRequest -Method GET -Uri $endpoint -Headers @{Metadata='True'} -UseBasicParsing
}
catch
{
    $wwwAuthHeader = $_.Exception.Response.Headers["WWW-Authenticate"]
    if ($wwwAuthHeader -match "Basic realm=.+")
    {
        $secretFile = ($wwwAuthHeader -split "Basic realm=")[1]
    }
}
Write-Host "Secret file path: " $secretFile`n
$secret = cat -Raw $secretFile
$response = Invoke-WebRequest -Method GET -Uri $endpoint -Headers @{Metadata='True'; Authorization="Basic $secret"} -UseBasicParsing
if ($response)
{
    $token = (ConvertFrom-Json -InputObject $response.Content).access_token
    Write-Host "Access token: " $token
}

```

![image.png](/.attachments/image-3b2c57c0-2b24-47f8-9a0c-957746c2168a.png)

# Review Related Logs
[IMDS Errors and Debugging](https://learn.microsoft.com/azure/virtual-machines/instance-metadata-service?tabs=windows#errors-and-debugging) shows a list of possible responses we might receive from IMDS.

**MonAgentHost** logs are found here:
Azure VM: ```C:\WindowsAzure\Resources\AMADataStore.{HOSTNAME}\Configuration\MonAgentHost.*.log```
Azure Arc: ```C:\Resources\Directory\AMADataStore.{HOSTNAME}\Configuration\MonAgentHost.*.log```
AMA Troubleshooter: ```...\AgentTroubleshooterOutput-{date}\AgentDataStore\Configuration\MonAgentHost.*.log"```

- Output current config
    - With a system managed identity
    ```Info  (2024-04-19T18:29:59Z): MonAgentManager.exe - Initializing McsManager using mcsRegionalEndpoint=https://{region}.handler.control.monitor.azure.com,mcsGlobalEndpoint=https://global.handler.control.monitor.azure.com,azureResourceEndpoint=https://monitor.azure.com/,m_MonAgentVersion=46.11.01,customResourceId=,ManagedIdentity=,AADMode=false,aadClientId=,aadAuthority=,aadResource=,aadDomain=,proxyMode=system,proxyAddress=,proxyAuth=false```
    - With a user managed identity
    ```Info  (2024-03-27T22:49:05Z): MonAgentManager.exe - Initializing McsManager using mcsRegionalEndpoint=https://{region}.handler.control.monitor.azure.com,mcsGlobalEndpoint=https://global.handler.control.monitor.azure.com,azureResourceEndpoint=https://monitor.azure.com/,m_MonAgentVersion=46.16.02,customResourceId=,ManagedIdentity=mi_res_id#/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{UAIDName},AADMode=false,aadClientId=,aadAuthority=,aadResource=,aadDomain=,proxyMode=system,proxyAddress=,proxyAuth=false```

- Defining IMDS endpoint:
```Info  (2024-03-27T22:49:05Z): MonAgentManager.exe - Using Azure IMDS endpoint: http://169.254.169.254```

- Acquired resource id from IMDS response:
```Info  (2024-03-27T22:49:05Z): MonAgentManager.exe - Setting resource id from IMDS: /subscriptions/{SUBSCRIPTIONID}/resourceGroups/{RESOURCEGROUP}/providers/Microsoft.Compute/virtualMachines/{VMNAME}```

- Output MSI Auth Token Expiration:
```Info  (2024-03-27T22:49:05Z): MonAgentManager.exe - Next refresh of MSI token for MCS in 84167 seconds```

**Extension Health** logs are found here:
Azure VM: ```C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\{version}\ExtensionHealth.*.log```
Azure Arc: ```C:\ProgramData\GuestConfig\extension_logs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\ExtensionHealth.*.log```
AMA Troubleshooter: ```...AgentTroubleshooterOutput-{date}\VmExtLogs\Microsoft.Azure.Monitor.AzureMonitorWindowsAgent\1.25.0.0\ExtensionHealth.*.log```

- IMDS request:
```[2024-03-27 22:49:05.000]  [SetImdsEnvironmentVariable] ErrorCode:0 INFO: Querying IMDS information```

- IMDS response:
```[2024-03-27 22:49:05.000]  [QueryIMDSEndpoint] ErrorCode:0 INFO: Queried IMDS successfully.```

- IMDS values output:
```[2024-03-27 22:49:05.000]  [GetValueFromJsonOrDefault] ErrorCode:0 INFO: Read Imds response field with Name:location Value: westus2```
```[2024-03-27 22:49:05.000]  [GetValueFromJsonOrDefault] ErrorCode:0 INFO: Read Imds response field with Name:name Value: WIN-INS993A1OO7```

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:** 
Values will be different for each scenario, but we want to make sure the values are not **EMPTY**.
</div>

# Common Errors
Here's an example of what a failure would look like if we didn't have TCP connectivity (for instance, if a firewall was blocking):

![image.png](/.attachments/image-6e0c3e33-de24-4d57-81cf-65c68c615838.png)

#70571
#70572
#85976
#86590
