---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/Troubleshooting Guides/Private link/Azure Monitor Private Link Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FTroubleshooting%20Guides%2FPrivate%20link%2FAzure%20Monitor%20Private%20Link%20Troubleshooting"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Purpose of this wiki
---
Customer may setup Azure Monitor Private Link Scope (AMPLS) under subscription and added Azure VM and Log analytics workspace to this scope, however it doesn't work as expected. This wiki will guide you how to troubleshoot such issue before engaging network team.

# AMPLS structure
---
![image.png](/.attachments/image-5a16a1ad-7d5c-4c48-ba4c-1bbb29902355.png)
Regarding to this structure, we have generally 3 steps to complete all configurations:

1- Create AMPLS under subscription;
2- Under AMPLS, Connect to Azure resources;
3- Under AMPLS, connect to vnet via private endpoint.

Detailed steps can be found in this doc: https://learn.microsoft.com//azure/azure-monitor/logs/private-link-configure

# Troubleshooting
---
## Log analytics network configuration
### 1. Public Network Access in workspace
- ASC -> Log analytics workspace -> Properties:
![image.png](/.attachments/image-c1a56578-846d-4b62-927d-af9d9db32a62.png)
- Azure portal: Log analytics workspace -> Network Isolation:
![image.png](/.attachments/image-3e7f85e5-01fd-4450-85c0-b24e34f44bc1.png)

**Why did it happen if you didn't disable it manually?**
Customer may add some [built-in policies](https://learn.microsoft.com//azure/azure-monitor/policy-reference) which can disable public network automatically, below are several 'public network access' related policies:
- ![image.png](/.attachments/image-adbe05e3-5c3f-481d-803b-37c86ed8ecfb.png)

You can verify it from ASC -> subscription -> Policy:
- Firstly check both Policy assignments and Policy definitions (or Policy set (initiative) definitions), if there is related policy, you can move forward to check policy evaluation. We can engage Azure policy team for policy evaluation check:
![image.png](/.attachments/image-58667333-565b-4b5e-9a82-dc83e2eac78d.png)

**What will it happen when disabled?** https://learn.microsoft.com//azure/azure-monitor/logs/private-link-design#control-network-access-to-your-resources
- When you disable public access for ingestion, no machine can send data to this workspace except those that are configured to send traffic through Azure Monitor Private Link.
- When you disable public access for queries, no machine can access data in this workspace except those that are configured through Azure Monitor Private Link.

**Recommendation:** don't disable it but use Access mode if you would restrict connection more securely

### 2. Access mode
- Azure portal: AMPLS -> Access modes
![image.png](/.attachments/image-bac28064-4aaf-4d3e-81ff-8d6116a5d4cc.png)

**What will it happen with Private Only?**
Your vnet can reach only to Private link resource, you can find all available Private link resource from:
- ASC -> AMPLS -> Connected Resources:
![image.png](/.attachments/image-758040b8-e1da-4700-90e3-79108262378c.png)
![image.png](/.attachments/image-b837465f-4d0b-4c5e-b185-452ee23d7058.png)

- Azure portal: AMPLS -> Azure Monitor Resources:
![image.png](/.attachments/image-41d6bcb3-0a5f-483c-adfa-cacabdd49952.png)

Reference: https://learn.microsoft.com//azure/azure-monitor/logs/private-link-design#control-how-private-links-apply-to-your-networks

### 3. Connected AMPLS
ASC -> Log analytics workspace -> Properties ->Associated Private Link Scopes:
![image.png](/.attachments/image-24433870-0060-460f-8c66-d73ee7e39334.png)
![image.png](/.attachments/image-2dfcacbc-20af-4709-a40f-083b60ad31d4.png)
Azure portal: log analytics workspace -> Network Isolation -> Azure Monitor Private Link Scopes
**Recommendation:**
- If there is not any AMPLS, please follow general LA agent troubleshooting and leave this wiki;
- If AMPLS is found, move to [**AMPLS configuration**](/Log-Analytics/Troubleshooting-Guides/Private-link/Azure-Monitor-Private-Link-Troubleshooting#ampls-configuration) part for further troubleshooting.

## AMPLS configuration
### 1. Check vnet configuration
1.1. vnet configuration
ASC -> Azure VM -> Properties, click Virtual Network, under virtual network page, go to Properties:
![image.png](/.attachments/image-c316afd9-a5fd-46a2-a214-4de13424d1ef.png)
If **DNS Servers** is not 'Default', you need pay attention on custom DNS configuration later;

1.2. IP configuration
ASC -> Azure VM -> Networking:
![image.png](/.attachments/image-1d559911-9a12-4aa5-b616-75f34968c758.png)
![image.png](/.attachments/image-d0beaf9d-c983-4a0f-b693-5602447d5729.png)
If **Provisioning State** is not 'Succeeded', reach to Azure network team for further investigation;
If **Provisioning State** is 'Succeeded', take note of Private IP and Vnet name, then move to next step.

### 2. Check AMPLS configuration
In ASC, go to AMPLS that you have in ['3. Connected AMPLS'](/Log-Analytics/Troubleshooting-Guides/Private-link/Azure-Monitor-Private-Link-Troubleshooting#3.-connected-ampls), then go to Properties -> Private Endpoint Connections:
![image.png](/.attachments/image-2b118bba-dc2d-4bc6-8137-b6fd5dbb2dd3.png)
![image.png](/.attachments/image-fde44392-e6e5-4c30-a989-4206da495106.png)
If **Provisioning State** is not 'Succeeded', reach to Azure network team for further investigation;
If there are mulitple private endpoints, please check each and find out the one with same Vnet connected.

In the same page, go to **Connected Resources** and check if Provisioning State is Succeeded:
![image.png](/.attachments/image-ecd9a983-d520-43cb-8ebe-8a65b6458c9a.png)
If **Provisioning State** is not 'Succeeded':
a. verify if the relevant subnets of private endpoint have available IPs, if available IPs = 0, engage Azure network team to add more subnets.
Note: subnets can be added to VNets at any time as long as the subnet address range is not part of another subnet and there is available space left in the virtual network's address range.

![image.png](/.attachments/image-8329466f-9108-43d5-8498-3bfdd16bc141.png)
b. refresh private endpoint, see [how to refresh private endpoint](/Log-Analytics/Known-Issues/AMPLS/Azure-monitor-private-link-scope:-Azure-Monitor-Resources-shows-'Failed'-provisioning-state)
otherwise raise ICM to Application Insights/Control Plane (CDS) team.

### 3. Check Private link configuration
In ASC, go to Private link when you click Private endpoint id in ['2. Check AMPLS configuration'](/Log-Analytics/Troubleshooting-Guides/Private-link/Azure-Monitor-Private-Link-Troubleshooting#2.-check-ampls-configuration).
3.1. go to Properties -> Private Endpoint Dependent Objects:
![image.png](/.attachments/image-8ab4bb2f-4df9-4b4a-883e-cf2529d8ffa3.png)
![image.png](/.attachments/image-1e092df2-7297-41b7-8d36-a01932604422.png)
Verify if **Private Endpoint Virtual Network** is exactly same as Vnet that you took note in ['1. Check vnet configuration'](h/Log-Analytics/Troubleshooting-Guides/Private-link/Azure-Monitor-Private-Link-Troubleshooting#1.-check-vnet-configuration);
Verify if **Private Endpoint Subnet Policy Config** is 'Diabled', if not, reach to Azure network team to disable it;

3.2. go to Properties: 
![image.png](/.attachments/image-d589e8ea-9acf-41fc-aeae-cdea4391ec9d.png)
If **Connection Approval Method** is 'Manual', reach to Azure network team to check approval request.

3.3. go to Properties -> Private DNS Zone Record Sets:
**Note:** To avoid this conflict, create only a single AMPLS object per DNS.
![image.png](/.attachments/image-0fdf93f3-482f-4002-8855-39b311a027e9.png)
- confirm **Private DNS Zone Groups** contains all LA endpoints: https://learn.microsoft.com//azure/azure-monitor/logs/private-link-configure#log-analytics-endpoints

- if **Private DNS Zone Configurations** contains the following **Record Sets**, customer should have DCE ([data collection endpoint](https://learn.microsoft.com/azure/azure-monitor/essentials/data-collection-endpoint-overview?tabs=portal#sample-data-collection-endpoint)) enabled:
<unique-dce-identifier>.<regionname>.handler.control
<unique-dce-identifier>.<regionname>.ingest

- confirm **Private DNS Zone Record Sets** contains below urls:
<workspace ID>.privatelink.oms.opinsights.azure.com
<workspace ID>.privatelink.ods.opinsights.azure.com
<workspace ID>.privatelink.agentsvc.azure-automation.net
[for DCE only]<unique-dce-identifier>.<regionname>.handler.control.privatelink.monitor.azure.com
[for DCE only]<unique-dce-identifier>.<regionname>.ingest.privatelink.monitor.azure.com
After April 19,2021, we support access to solution packs (for example, url of public region: scadvisorcontent.blob.core.windows.net). If you create AMPLS before it, please re-create it or manually allow url by referring this doc: https://learn.microsoft.com//azure/azure-monitor/logs/private-link-design#log-analytics-solution-packs-download

- if DCE is added, find its name in above **Record Sets**, then search it under resource provider Microsoft.Insights/dataCollectionEndpoints, then move to next step for DCE validation, otherwise skip next step and move to **Verify AMPLS Connection**

### 4. Check DCE configuration
4.1. go to Properties -> Data Collection Endpoint Details:
![image.png](/.attachments/image-1bf85263-73c1-4ca8-b273-f650b7e413c3.png)
* provisioningState should be Succeeded, otherwise you need [re-add it to AMPLS](https://learn.microsoft.com/azure/azure-monitor/agents/azure-monitor-agent-data-collection-endpoint?tabs=PowerShellWindows#enable-network-isolation-for-the-azure-monitor-agent) and [re-associate to machines](https://learn.microsoft.com/azure/azure-monitor/agents/data-collection-rule-azure-monitor-agent#create-data-collection-rule-and-association).
* If publicNetworkAccess is Disabled, then associated machines can only access to log analytics workspace through private links. In this case, [custom Metrics (preview)](https://learn.microsoft.com/azure/azure-monitor/essentials/metrics-custom-overview) collected and uploaded via the Azure Monitor Agent are not currently controlled by DCEs nor can they be configured over private links.

4.2. go to Associations -> Association Details, then check associated machines as below:
![image.png](/.attachments/image-04e92bae-a50a-49cb-a842-620a2101686a.png)
If target machine is associated to DCE and has network communication issue, you can also try to remove DCE or enable publicNetworkAccess of DCE temporarily and see if machine can connect to log analytics workspace through AMPLS without DCE.

## Verify AMPLS Connection
### 1. Verify name resolution
**IMPORTANT**: We don't need check other urls which is not used by AMPLS like advisorxxxx.blob.core.windows.net or xxxoiomsmds.blob.core.windows.net.
- Windows platform:
nslookup <workspace ID>.oms.opinsights.azure.com
nslookup <workspace ID>.ods.opinsights.azure.com
nslookup <workspace ID>.agentsvc.azure-automation.net
They should return private IP addresses and cname as listed as above, such as <workspace ID>.**privatelink**.oms.opinsights.azure.com

- Linux platform:
Use dig command which need to install on linux:
Debian/Ubuntu: sudo apt-get install dnsutils
CentOS/Redhat: sudo yum install bind-utils
  - run dig command as below:
dig <workspace ID>.oms.opinsights.azure.com
dig <workspace ID>.ods.opinsights.azure.com
dig <workspace ID>.agentsvc.azure-automation.net
Note: they should return private cname as windows platform in part **ANSWER SECTION**

- If private cname is not found but all above AMPLS configuration is good, reach to Azure network team for further investigation.

### 2. Forcely flush DNS cache
If customer has issue with DNS resolver, please try to flush DNS cache firstly with below steps:
1. stop-service healthservice
2. ipconfig /flushdns
3. Start-Service healthservice

## Activity logs
- We can check activity logs in ASC or Kusto to investigate AMPLS configuration actions by filtering operation name:

|**Action**| **operationName contains** |
|--|--|
| AMPLS | microsoft.insights/privatelinkscopes/write or microsoft.insights/privateLinkScopes/delete |
| Private endpoint connection | microsoft.insights/privateLinkScopes/privateEndpointConnectionProxies |
| Azure monitor resources connection | microsoft.insights/privatelinkscopes/scopedresources |

### ASC
Under subscriptions -> Azure Activity Logs -> Query Activity logs:
![image.png](/.attachments/image-73a76641-e60b-4790-ae8a-b9f917982269.png)
![image.png](/.attachments/image-2807627e-9c81-4eef-a4bd-ecf814399005.png)

### Kusto
Note: replace subscription Id and operationName
Execute in [Web] [Desktop][cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')]
```

Unionizer("Requests", "EventServiceEntries")
| where TIMESTAMP > ago(6d)
| where subscriptionId == ""
| where operationName contains "microsoft.insights/privateLinkScopes/privateEndpointConnectionProxies"
| project TIMESTAMP, correlationId, operationName, properties, eventCategory, resourceUri, status, claims
```


# Additional Resources
- [Private Link Known issues](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/336990/Private-Link-TSG?anchor=0---check-for-%3Cspan-style%3D%22color%3Aorange%22%3Eprivate-link-known-issues%3C/span%3E)
- [Support boundaries](/Log-Analytics/Support-Boundaries/Support-Boundary:-Azure-Monitor-Private-link)
- [Private link TSG from Azure network](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/336990/Private-Link-TSG)
- [AMPLS documentation](https://learn.microsoft.com//azure/azure-monitor/logs/private-link-security)
- [LA network requirements](https://learn.microsoft.com//azure/azure-monitor/agents/log-analytics-agent#network-requirements)
- [IcM Escalation path](/Log-Analytics/Collaboration-Guides/Azure-Monitor-Private-Link:-IcM-Escalation-Path)

