---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Test connectivity to IMDS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Test%20connectivity%20to%20IMDS"
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

# Azure Virtual Machine
## IMDS metadata
- When running the following command, do you see a **200 response** and a **JSON response** with details about this machine?

Using curl:
```sudo -u syslog curl -v -s -S -k -H "Metadata: true"  "http://169.254.169.254/metadata/instance?api-version=2019-11-01&format=json"```

![image.png](/.attachments/image-44eae2cf-e304-4e8f-b416-bc838bbcf6eb.png)

If the output looks like this, we may have a [firewall issue](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1924273/AMA-Linux-HT-Set-firewalld-status-and-rule-set?anchor=scenario%3A-configuration-(imds)):

![image.png](/.attachments/image-954a150f-6c05-4aeb-9fc8-4b39dcb0481d.png)

## IMDS access token
- When running the following command, do you see a **200 response** and a **JSON response** with the access token?

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: Treat this access_token value as sensitive information.
</div>

### System Managed Identity
Using curl:
```sudo -u syslog curl -v -s -S -k -H "Metadata: true" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F"```

![image.png](/.attachments/image-af2d6663-e45c-4a35-a771-7e76ee4a2d62.png)

### User Managed Identity

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: Replace the UserAssignedIdentity value with the ResourceID of the user assigned identity from the target environment.
</div>

Using curl:

```
:: Define the ResourceID of the user assigned identity
export userAssignedIdentity="/subscriptions/{subscriptionId}/resourcegroups/{resourceGroup}/providers/microsoft.managedidentity/userassignedidentities/{userAssignedIdentityName}"

echo $userAssignedIdentity

:: Test to see if we can get an auth token using the user assigned identity
sudo -u syslog curl -v -s -S -k -H "Metadata: true" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https%3A%2F%2Fmanagement.azure.com%2F&msi_res_id=$userAssignedIdentity"
```

![image.png](/.attachments/image-0e9e3074-7c3c-4d39-98ac-99b325cc6118.png)


# Azure Arc Machine
## IMDS metadata
- When running the following command, do you see a **200 response** and a **JSON response** with details about this machine?

Using curl:
```sudo -u syslog curl -v -s -S -k -H "Metadata: true" "http://localhost:40342/metadata/instance?api-version=2019-11-01&format=json"```


![image.png](/.attachments/image-3890cf77-c3c3-470c-ba27-7b82b691abd0.png)


## IMDS access token
- When running the following command, do you see a **200 response** and a **JSON response** with the access token?

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: Treat this access_token value in the .key file as sensitive information.
</div>

Using curl:
```sudo -u syslog curl -v -s -S -k -H "Metadata: true" "http://localhost:40342/metadata/identity/oauth2/token?api-version=2019-11-01&resource=https%3A%2F%2Fmanagement.azure.com"```

![image.png](/.attachments/image-f6d78b37-0918-49ff-8640-e7db6522148d.png)


# Review Related Logs
[IMDS Errors and Debugging](https://learn.microsoft.com/azure/virtual-machines/instance-metadata-service?tabs=linux#errors-and-debugging) shows a list of possible responses we might receive from IMDS.
Azure VM:
**extension.log** located here:
VM: **/var/log/azure/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent/extension.log**
Troubleshooter: **..\Microsoft.Azure.Monitor.AzureMonitorLinuxAgent\extension.log**
- Indication of IMDS endpoint followed by obtaining MSI token
    ```
    2024/10/21 17:06:40 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Using IMDS endpoint "http://169.254.169.254/metadata/instance?api-version=2018-10-01"
    ...
    2024/10/21 17:07:13 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Successfully refreshed metrics-extension MSI Auth token.
    ```

**mdsd.info** log found here:
VM: **/var/opt/microsoft/azuremonitoragent/log/mdsd.info**
Troubleshooter: **..\mdsd\logs\mdsd.info**
- Obtains Resource Id and MSI token from IMDS
    ```
    2024-10-21T21:06:42.2118810Z: Detected cloud region "eastus" via IMDS
    2024-10-21T21:06:42.2119330Z: Detected cloud environment "azurepubliccloud" via IMDS; the domain ".com" will be used
    2024-10-21T21:06:42.2295130Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/FetchIMDSMetadata.cpp:140,FetchMetadataFromIMDS]Setting resource id from IMDS: /subscriptions/{Subscription}/resourceGroups/{ResourceGroup}/providers/Microsoft.Compute/virtualMachines/{VMName}
    2024-10-21T21:06:42.2295600Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/McsManager.cpp:428,Initialize]McsManager successfully initialized
    ...
    2024-10-21T21:06:42.2369790Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/RefreshMSIToken.cpp:94,RefreshMsiTokenThreadProc]Next refresh of MSI token for MCS in 84656 seconds
    ```


Azure ARC:
**extension.log** located here:
ARC: **/var/lib/GuestConfig/extension_logs/Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-{version}/extension.log**
Troubleshooter: **..\\{version}-extension_logs\extension.log**
- Signifies ARC installed and HIMDS access URL
    ```
    2024/10/17 16:12:54 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Arc is installed, loading Arc-specific IMDS endpoint
    2024/10/17 16:12:54 [Microsoft.Azure.Monitor.AzureMonitorLinuxAgent-1.33.1] Using IMDS endpoint "http://localhost:40342/metadata/instance?api-version=2019-08-15"
   ```

**gc_ext.log** located here:
ARC: **/var/lib/GuestConfig/ext_mgr_logs/gc_ext.log**
Troubleshooter: **..\GC_Extension\gc_ext.log**
- Initialization of extension, displays Resource Id, obtains MSI token from HIMDS IDENTITY_ENDPOINT
    ```
    [2024-10-21 17:11:35.095] [PID 862] [TID 936] [Pull Client] [INFO] [0e24ccce-33d3-4f2b-904e-2b4309d9a2a4] Initializing pull client.
    [2024-10-21 17:11:35.272] [PID 862] [TID 936] [METADATA_INFO] [INFO] [00000000-0000-0000-0000-000000000000] Resource Id from get_vm_resource_id - subscriptions/{Subscription}/resourceGroups/{ResourceGroup}/providers/Microsoft.HybridCompute/machines/{MachineName}
    [2024-10-21 17:11:35.347] [PID 862] [TID 936] [METADATA_INFO] [INFO] [00000000-0000-0000-0000-000000000000] Getting msi info from public region for vm located in 'eastus' location.
    [2024-10-21 17:11:35.347] [PID 862] [TID 936] [METADATA_INFO] [INFO] [00000000-0000-0000-0000-000000000000] Reading compute identity info from IDENTITY_ENDPOINT env. variable - http://localhost:40342/metadata/identity/oauth2/token
    [2024-10-21 17:11:35.347] [PID 862] [TID 936] [METADATA_INFO] [INFO] [00000000-0000-0000-0000-000000000000] Connecting to MSI endpoint: http://localhost:40342/metadata/identity/oauth2/token?api-version=2019-08-15&resource=https%3A%2F%2Fmanagement.core.windows.net%2F
    [2024-10-21 17:11:35.356] [PID 862] [TID 936] [METADATA_INFO] [INFO] [00000000-0000-0000-0000-000000000000] Getting the key for access token from file : /var/opt/azcmagent/tokens/406109b6-e357-4a7f-a2df-d14e7e8a1bd5.key
    [2024-10-21 17:11:35.549] [PID 862] [TID 936] [Pull Client] [INFO] [0e24ccce-33d3-4f2b-904e-2b4309d9a2a4] [GAS IPs: Public IPv4: 20.42.65.86]
    [2024-10-21 17:11:35.556] [PID 862] [TID 936] [PULL_CLIENT_CERT_HELPER] [INFO] [00000000-0000-0000-0000-000000000000] Proxy settings could not be read from the config file. Will fallback to env var if available.
    [2024-10-21 17:11:35.556] [PID 862] [TID 936] [PULL_CLIENT_CERT_HELPER] [INFO] [00000000-0000-0000-0000-000000000000] Proxy settings are disabled. Proxy settings 'https_proxy' environment variable is empty.
    [2024-10-21 17:11:36.084] [PID 862] [TID 936] [Pull Client] [INFO] [0e24ccce-33d3-4f2b-904e-2b4309d9a2a4] [GAS IPs: Public IPv4: 20.42.65.86] invoke_agent_service_request return_code = 200
    ```

**mdsd.info** located here:
ARC: **/var/opt/microsoft/azuremonitoragent/log/mdsd.info**
Troubleshooter: **..\mdsd\logs\mdsd.info**
- Obtains Resource Id and MSI token from HIMDS
    ```
    2024-10-21T21:12:45.6335180Z: Detected cloud region "eastus" via IMDS
    2024-10-21T21:12:45.6336500Z: Detected cloud environment "azurepubliccloud" via IMDS; the domain ".com" will be used
    2024-10-21T21:12:45.6360820Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/FetchIMDSMetadata.cpp:140,FetchMetadataFromIMDS]Setting resource id from IMDS:     /subscriptions/{Subscription}/resourceGroups/{ResourceGroup}/providers/Microsoft.HybridCompute/machines/{MachineName}
    2024-10-21T21:12:45.6362490Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/McsManager.cpp:428,Initialize]McsManager successfully initialized
    ...
    2024-10-21T21:06:42.2369790Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/RefreshMSIToken.cpp:94,RefreshMsiTokenThreadProc]Next refresh of MSI token for MCS in 84656 seconds
    ```

# Common Errors
#105678
#137401
#157491
#160414