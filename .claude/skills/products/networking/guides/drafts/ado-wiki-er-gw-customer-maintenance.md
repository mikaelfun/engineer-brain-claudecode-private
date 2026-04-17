---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/ExpressRoute Gateway Customer Controlled Maintenance"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/Features%20and%20Functions/ExpressRoute%20Gateway%20Customer%20Controlled%20Maintenance"
importDate: "2026-04-17"
type: troubleshooting-guide
---


[[_TOC_]]

**Note**: Since this feature is in preview, the contents of this TSG may change frequently. Please consult a TA if your issue is not covered here, and if needed, they can 'involve beta' in Teams regarding release information. 

# Background
Customers have long requested the ability to control when Azure Maintenances occur on the Gateways. With Maintenance Experiences (aka Customer Defined Windows), they now can control when VMSS OS Upgrades (and soon Fleet Upgrades) occur.
The project is a joint project from MRP, ARG, and Hybrid Networking Org with ExpressRoute & VPN as the pilot teams. 

Feature is currently in **Public Preview**. Feature Item: https://msazure.visualstudio.com/One/_workitems/edit/17750650

**Implementation Steps if interested**: [Customer Defined Maintenance Windows Uptake Steps for Hybrid Networking](https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/386976/Customer-Defined-Maintenance-Windows)

# Diagnose
1. If case is Virtual WAN: (you can use ASC to retrieve the same data but if relying on ACIS follow the below)
   - ExpressRoute Virtual WAN:
      - Run Get Express Route Gateway for the Hub Region and with ONE of the fields filled in
      - From the output, grab:
         - Child Gateway Manager Gateway Id
         - Hub Subscription Id
      - Follow the below steps but where it asks for Gateway Subscription Id or Gateway Id, you may need to replace it with what you've found
  1. Pull Get Gateway and check for the following fields:
   - Customer Subscription Id
   - Gateway Mode
   - Gateway SKU
   - Gateway Deployment Type
   - Gateway Subscription Id
   - Public IP Resource URI (or Subnet Resource URI)
   - Maintenance Configuration Id
   - Maintenance Configuration Start Time
   - Maintenance Configuration Expiry Time (coming with 23.10)
1. If Gateway Deployment Type is not VMScaleSet, it is **NOT** supported. Please see the **Known Issues** section
1. Pull the ARN Dashboard [aka.ms/hybrid-arndashboard](https://aka.ms/hybrid-arndashboard)
   - Account: Brk<Cloud> (so if Prod pick BrkProd)
   - Action: <Keep Blank initially>
   - Tenant: <Tenant Id for the GWM. For Prod\NCs, it's usually wavnet<regionMoniker>_<0/1> >
   - ServiceType: <Keep blank. This is for the Publisher widgets only>
   - Subscriber Event Hub: maintenance-eh
   - Publisher Topic: <blank>
1. Scroll to the subscriber side widget of ARN Notifications Received to see at what time was the last time maintenance-eh notifications were read for that region. Record that time
1. If there is a Maintenance Configuration Id, follow instructions for Window is tied but Maintenance did not occur in the window
1. If there is NO Maintenance Configuration Id, follow instructions for Window not tied

# Mitigate
## Window not Tied
1. Run [Get Hybrid Feature State](https://portal.microsoftgeneva.com/?page=actions&acisEndpoint=Public&managementOpen=false&selectedNodeType=3&extension=Brooklyn&group=Hybrid%20Service%20Feature%20Management&operationId=gethybridfeaturestate&operationName=Get%20Hybrid%20Feature%20State&inputMode=single&params={"hybridservice":"ExpressRoute","hybridfeaturename":"CustomerMaintenanceWindows","smegatewaymanagerregion":"East%20Asia","smedeploymentphase":"NONE"}&actionEndpoint=Brooklyn%20-%20Prod&genevatraceguid=2b3c0fc2-843c-4b9c-8164-1232f531b152) (will be gone in Public Preview)
   - Hybrid Service: ExpressRoute
   - Hybrid Feature Name: CustomerMaintenanceWindow
   - Region Names: <Region Gateway is In>
1. If Customer Subscription Id is NOT in the return, customer is NOT enrolled in preview. Please have them send an e-mail to gatewaymaintenance@microsoft.com
1. If Customer Subscription Id is in the return, pull in Jarvis:
   - Dgrep: ([Example Logs Link](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-1&offsetUnit=Days&UTC=true&ep=Diagnostics%20PROD&ns=BrkGWM&en=AsyncWorkerLogsDetailedTable,AsyncWorkerLogsTable&scopingConditions=[["__Region__","<Region>"]]&conditions=[["AnyField","contains","<GatewayId>"]]&clientQuery=orderby%20PreciseTimeStamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20) )
      - Namespace: BrkGWM
      - Tables: AsyncWorkerLogsTable, AsyncWorkerDetailedLogsTable
      - Timestamp: <Timestamp last read from Maintenance-eh was for that region>
      - Scoping Conditions:
          - Tenant==<tenantIds of the GWM. You can put more than one>
      - Search:
          - AnyField contains ARNNotificationChecker
   - Since this needs the AsyncWorkerDetailedLogs table at the moment, it's not possible to query using Kusto
1. In the resulting logs, search for the customer's Gateway Name, Customer Subscription Id, or GatewayId
1. If no logs appear, notification was NOT sent for this customer when the configuration was tied
   - If it has been more than 24 hours since the customer tied the window to the resource, engage MRP team (OneDeploy\PlannedMaintenance) to see if they can find that they sent the notification
       - Alternatively, run the following query for the underlying Resource Group to see if the request was seen by MRP
         ```
         cluster('azdeployer').database('AzDeployerKusto').MRPServiceAuditEvent
         | where PreciseTimeStamp between (todatetime("<Tied time - 2 hrs>") .. todatetime("<End time + 2 hrs>"))
         | where ResourceGroup == "<Underlying Resource's Resource Group>"
         | where SubscriptionId == "<Underlying Resource's Subscription Id>"
         | project PreciseTimeStamp, CorrelationId, ResourceId, Operation, Message, Exception, HttpStatusCode, MaintenanceScope
         ```
       - Dgrep equivalent: [Example Link](https://portal.microsoftgeneva.com/logs/dgrep?be=DGrep&offset=-3&offsetUnit=Hours&UTC=true&ep=Diagnostics%20PROD&ns=azdeployer&en=MRPServiceAuditEvent&scopingConditions=[["__Region__","<Region>"]]&conditions=[["ResourceGroup","contains","armrg-<gatewayId>"],["SubscriptionId","contains","<Gateway%20Subscription%20Id>"]]&clientQuery=orderby%20PreciseTimeStamp%20asc&chartEditorVisible=true&chartType=line&chartLayers=[["New%20Layer",""]]%20)
          - Namespace: azdeployer
          - Events to Search: MRPServiceAuditEvent
          - Region: <Region>
          - Resource Group: armrg-<GatewayId> (or if vWAN, this will be the Hub Resource Group name)
          - Subscription Id: <Gateway Subscription Id> (or if vWAN, this will be the Hub Subscription Id)
   - If less than 24 hours, please wait for the next notification read time. Most likely the notification was sent after the last read and so it'll be picked up 12 hrs from the last read (as the periodic work item reads every 12 hours)
1. If logs do appear, see if it prints out the error of why the underlying configuration for the VMSS failed to be tied.
1. If not able to find the error message in the logs, request Subscription JIT access to the Gateway Subscription and do the following:
    1. Search for the Gateway's Resource group using the Gateway Id under the Resource Groups blade
         - Make sure the Gateway Subscription is in the list of Subscriptions to search!
    1. Visit the Resource Group and click on Activity Logs
    1. Search for the past 2 days. There should be a Create or Update Maintenance Configuration or Configuration Assignment Request
    1. Click on the event and view the Json response. Record the error message and check the Known Issues if the repair is in the middle of shipping. If it doesn't match any of the below known issues, reach out to exract team

## Window is tied but Maintenance did not occur in the window
1. Run the following Kusto Query to find what kind of Maintenance it is: ([Link to the original page with the Query](https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/85721/Other-Queries?anchor=guest-os-upgrade%2C-vmss-os-upgrade-and-platform-maintenance-events.) ) 
 ([sample link](https://dataexplorer.azure.com/clusters/https%3a%2f%2fhybridnetworking.kusto.windows.net/databases/GatewayManager?query=H4sIAAAAAAAEAKVUXU%2fbMBR9R%2bI%2fWHmhldqQEtCAqQ8VdKjTspY16x6R49ymHokd2Q6h1bTfvusm0G%2f2lbfY9x6fc%2b7H6Sl%2bx0cpGKINVYZ0iZExNWB4Bg3nzDvz295Fu%2bMTz7v2PKf5vgoGER8KvdgKTTCkpPMBJjgsZtTz%2fE770mdR%2b9x%2fd9WOvA60p9Q%2fn1757PyS%2bU6ddwt5KucZCDMQU4mvsbTQBlTjZDaPFI8FmFKqRy6Sk6aLPGhENTRO6EKUWazxrK8mubgrQ3kjhaFcgBrEx0c%2fSDkDBQTzQBsuxcOSf5NEiAcgSKMywnWtyOYq4W6lo7sSZe9jjkCCGRKCoEg3flFe4AtD%2fTW3LmlUcHz0qqG3KBSwzH3Ef%2bmWXMSy1C5q2hCzjLoJ8CwMgiQz1QMBFTQB68xHGVlz%2bqYMaZTCiuwIwbmGEKWNDc3yXXWb4ipgNIU0Nn1fxugiy6jiCyAZF41t7GaLZPR595hEc2IJ3loIeDa2Z%2b5eLEkUjWEgRkomCrQ1p1O7Nsm0Xjft1TK6YCrfsAf%2fH2ia5krGeG4TJ0Ev5%2fdS95%2bQ%2f5q8QdAfh71g9NsqyxwUtW3xmWZgK%2b1MuDIFTQPKZthDY0ZTGIPRbq8wcjiulbij4Th0VjCoSRaKwZ2SRV5B%2fcQJU4yahkNVppK201p10X%2b6%2fEq66sfa6xcjD1v9IQUwdcA%2fDFhPzwX7hiGgPslE%2f3UL%2fvGAVffDndLU1OvENfsD1IkjUu00XXIzI84a2y%2bQSzy31EI5tjH9Z2CFxV42Drl2iFR7UW4BjYP7Agqor6%2bJs1O9hx3x3TeKujf6UK17zPAnbrZXz75H94O3tiDqbhml1EylygLclMZuA7bbM4VAhzYHtLW15VobTWXxcTq%2fAzJcA15abglVtuyhuBbcF7G96O7XcmihtA61f%2bttpb8AC1dmSREHAAA%3d))
   ```
   Execute in [Web] [Desktop] [cluster('hybridnetworking.kusto.windows.net').database('aznwmds')]
   let start = todatetime("2023-05-13 00:00");
   let end = todatetime("2023-05-15 00:00");
   let gatewayId ="cdca0031-83cb-4379-b01e-fa34f93c48c3";
   let DeploymentInfo = cluster('hybridnetworking').database('aznwmds').ErVpnGwToContainerId
   | where ingestion_time() between (start .. end)
   | where GatewayId == gatewayId
   | distinct TenantId;
   let guestOsUpdates = 
   cluster('Azurecm.kusto.windows.net').database('AzureCM').TMMgmtTenantManagementJobInfoEtwTable
   | where PreciseTimeStamp between (start ..end)
   | where Tenant in (DeploymentInfo)
   | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by JobID
   | extend GuestOsUpgradeInProgress = 1;
   let VmssOsUpdates = cluster('azcrp').database('crp_allprod').VmssVMApiQosEvent
   | where TIMESTAMP between (start .. end)
   | where operationName == "VirtualMachineScaleSets.AutoOSUpgrade.POST"
   | where resourceGroupName =~ strcat("armrg-", gatewayId)
   | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by operationId
   | extend VmssOsUpgradeInProgress = 1;
   let FleetUpgrade = cluster('hybridnetworking').database('aznwmds').AsyncWorkerLogsTable
   | where PreciseTimeStamp between (start .. end)
   | where GatewayId == gatewayId
   | where OperationName == "UpgradeGateway"
   | where Message startswith "AsyncWorkerReportsTimeToStartExecutionEvent :" or Message startswith "DeleteQueueMessage: "
   | summarize min_PreciseTimeStamp = min(PreciseTimeStamp), max_PreciseTimeStamp = max(PreciseTimeStamp) by ActivityId
   | distinct min_PreciseTimeStamp, max_PreciseTimeStamp, ActivityId
   | extend PlatformMaintenanceInProgress = 1;
   union VmssOsUpdates, guestOsUpdates, FleetUpgrade
   | project MaintenanceStartTime = min_PreciseTimeStamp, MaintenanceEndTime=max_PreciseTimeStamp, GuestOsUpgradeInProgress, VmssOsUpgradeInProgress, PlatformMaintenanceInProgress
   ```
1. If VMSS OS Maintenance, please send to VMSS OS Deployment team as they are in control of if window is respected or not
   - IcM Team Name: ScaleSet Services\VMSS\Image Patching
1. If Host Maintenance, please see the Known Issues > Host Updates
1. If Maintenance was fleet upgrade:
   1. Run Get Hybrid Feature State
      - Hybrid Service: GatewayManager
      - Hybrid Feature Name: CustomerDefinedWindowForFleet
      - Region Names: <Region Gateway is in>
   1. If it's not globally on, Fleet Upgrade is NOT supported yet. Please follow up with exract team on timelines for fleet upgrade.
   1. Close ticket with By Design
 
# Resolution
1. Please follow up with exract@microsoft.com. ~~As feature is still in the private preview, we'll see if repair items will be filed but they will NOT be linked to the IcM as it has yet to reach public preview.~~

# Known Issues

## [By Design] Configuration and Gateway must be in the Same Region
If customer tries to connect a configuration in Location A and the Gateway is in Location B, issue is though in portal it might seem they are connected, in the backend it won't be :( This is because the notification will be issued for Location A and not Location B. The Backend for Location A will NOT be able to find the gateway in Location B or update the Gateway.
- Repair Items:[MRP Repair Item: MRP Validations for Network Gateway Maintenance SubScope (VSO Dependency Item: 24871446)](https://dev.azure.com/msazure/One/_workitems/edit/24871446)

## [By Design] Host Updates are not in the Window
This is by design. Gateways today use Shared Hosts as the Dedicated Hosts do NOT support our VM Skus and there's no zero downtime story for migrating Gateways to go from Shared to Dedicated Hosts.
1. Run the following Kusto Query to find what kind of Maintenance it is: ([Link to the original page with the Query](https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/85721/Other-Queries?anchor=guest-os-upgrade%2C-vmss-os-upgrade-and-platform-maintenance-events.) )
   ```
   let start = todatetime("2023-05-13 00:00");
   let end = todatetime("2023-05-15 00:00");
   let gatewayId ="cdca0031-83cb-4379-b01e-fa34f93c48c3";
   let DeploymentInfo = cluster('hybridnetworking').database('aznwmds').ErVpnGwToContainerId
   | where ingestion_time() between (start .. end)
   | where GatewayId == gatewayId
   | distinct TenantId;
   let guestOsUpdates = 
   cluster('Azurecm.kusto.windows.net').database('AzureCM').TMMgmtTenantManagementJobInfoEtwTable
   | where PreciseTimeStamp between (start ..end)
   | where Tenant in (DeploymentInfo)
   | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by JobID
   | extend GuestOsUpgradeInProgress = 1;
   let VmssOsUpdates = cluster('azcrp').database('crp_allprod').VmssVMApiQosEvent
   | where TIMESTAMP between (start .. end)
   | where operationName == "VirtualMachineScaleSets.AutoOSUpgrade.POST"
   | where resourceGroupName =~ strcat("armrg-", gatewayId)
   | summarize min(PreciseTimeStamp), max(PreciseTimeStamp) by operationId
   | extend VmssOsUpgradeInProgress = 1;
   let FleetUpgrade = cluster('hybridnetworking').database('aznwmds').AsyncWorkerLogsTable
   | where PreciseTimeStamp between (start .. end)
   | where GatewayId == gatewayId
   | where OperationName == "UpgradeGateway"
   | where Message startswith "AsyncWorkerReportsTimeToStartExecutionEvent :" or Message startswith "DeleteQueueMessage: "
   | summarize min_PreciseTimeStamp = min(PreciseTimeStamp), max_PreciseTimeStamp = max(PreciseTimeStamp) by ActivityId
   | distinct min_PreciseTimeStamp, max_PreciseTimeStamp, ActivityId
   | extend PlatformMaintenanceInProgress = 1;
   union VmssOsUpdates, guestOsUpdates, FleetUpgrade
   | project MaintenanceStartTime = min_PreciseTimeStamp, MaintenanceEndTime=max_PreciseTimeStamp, GuestOsUpgradeInProgress, VmssOsUpgradeInProgress, PlatformMaintenanceInProgress
   ```
1. Check if for the impact time, there a ScheduledEvent or Host Maintenance Event.
   - Alternatively, you can check NetVMA for Production or check with Host Networking in National Clouds
1. If there was a Host Update, close with By Design with the note of Host Update is not supported.

**Note**: MRP team is working on how to plan the host updates on shared hosts to be in Customer Defined Windows but there's no ETA.

## [By Design] CloudService-ExtendedSupport\CloudService NOT Supported for Guest OS Upgrade
This is by design. CloudService is on the deprecation path and MRP is not following up with CS-ES to get support.
1. Pull Get Gateway. Find the column GatewayDeploymentType. If it does not match "VMScaleSet", it's not supported.

## [By Design] Non-Daily Recurrence NOT Supported
Due to VMSS only being able to support daily or at most weekly, we have restricted Network Gateway to daily. Hopefully we will be able to expand the schedule soon but it will be a new feature that will require designing.
1. Request Customer to share the Maintenance Configuration or command they used to create the configuration. If under the -RecurEvery parameter it reads something other than "Day", "1Day", "1Days", it is not supported.

## ARN Notification Checker NOT Enabled \ All Resources in Region not getting any windows
1. Pull ARN Notification Checker logs as part of the instructions for Window not tied
1. See if in the logs you find a line of "ARNNotificationChecker: Processor started"
1. If log line is not there, please send an e-mail to exract@microsoft.com with which region you're trying it in and Subject as "ARN Resource Onboarding Missing: Region <region name>" with the logs you found
1. If log line is there, check if there are any notifications in the dashboard for "maintenance-eh" for that region.
    - if that region is not being returned or has count of 0 for the past 1 day, please send an e-mail to exract@microsoft.com with subject as "ARN Maintenance-eh Onboarding Missing: Region <region name>"
1. Tranfer ticket to Cloudnet\ExpressRoute if not done so already with the details

## National Clouds\Government Clouds are NOT Supported
MRP team failed to push the notifications for National Clouds and Government clouds. Currently we're working with them to get the notifications in the National Clouds & Government clouds.
1. Request Cloud for the Gateway\Customer is in. If it's not "Public", it is not supported.

Repair Item: 
ExpressRoute Side: [VSO Backlog Item: Onboard NC Event Hubs to ARN](https://msazure.visualstudio.com/One/_workitems/edit/24994419)
MRP Side:
[Fairfax IcM for Onboarding Notifications]()
[Mooncake IcM for Onboarding Notifications]()

## Multiple Configuration Assignments are NOT Supported
1. Run Get Gateway and see if the Gateway already has a maintenance configuration tied
1. Request Customer to share the configuration they attempted to tie or which window is not being respected (could be a previously tied window which had an assignment not deleted)
1. If the 2 do not match in Resource Uri, it is this issue

Repair Item: [VSO Backlog Item 23290501: Multiple Configuration Assignment Support](https://msazure.visualstudio.com/One/_workitems/edit/23290501)

*For the most up to date information, please see [Gateway Customer Controlled Maintenance (ExpressRoute-and-VPN)](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/1153493/TSG-Gateway-Customer-Controlled-Maintenance-(ExpressRoute-and-VPN)).*

#Contributors
- @<8CB6160A-BF9C-671D-AF52-290D540959D2> (Author)
- @<ABFFCE7F-A93E-4F09-AE10-4978ED838817>
- @<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 
