---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Dedicated/Windows365 FLW TSG"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Frontline/Frontline%20Dedicated/Windows365%20FLW%20TSG"
importDate: "2026-04-05"
type: troubleshooting-guide
---

The below URL contains TSG/Architecture for Windows 365 Frontline Worker.

https://eng.ms/docs/experiences-devices/wd-windows/wcx/cloud-pc/cloudpc-service/concurrent-access-service/frontline/frontline-main 


# **Frontline overview**

Frontline is a Windows 365 offering. Frontline offers customers to buy 1 license and have 3 cloud PCs for 3 users. Only 1 user can work at a time.

https://www.microsoft.com/en/windows-365/frontline

Frontline is the same Windows 365 dedicated cloud PCs, processes but with additional license check when user tries to connect.

This introduces multiple scenarios when and how user can connect and disconnect. When user disconnects from Cloud PC, license is released, and now new user can consume license.


## **Difference between Dedicated W365 CloudPC and Windows 365 Frontline CloudPC**


# **Terminology**

**Cold start** - Start when CloudPC is "deallocated" and license is "unassigned". When user connects to the turned off CloudPC.

**Hot start** - Start when CloudPC is "running" and license is "active". When user reconnect in less than 10 mins after user disconnected.

**Warm start** - Start when CloudPC is "running" and license is "inStandbyMode". When user reconnect after more than 10 mins after user disconnected.

**VM start or VM allocation** - Process of allocation VM in Azure world. This will turn on Cloud PC.

**VM stop or VM de-allocation** - This will shut down Cloud PC.

# **Services**

**CAS, Concurrent Access Service** - CAS is the service responsible for Frontline license acquire and release process. CAS makes decision if user can get license or not. CAS keep track of how many licenses Tenant consumed. CAS is the source of truth for License usage Buffer.

**COGS** - COGS is a service which maintains and executes workflows.

**IDS, Idle detection service** - In the Frontline scenarios IDS is responsible for getting AVD events and orchestrate COGS workflows. 
- When user disconnects - creates FlexDeallocate workflow. 
- When user reconnects - creates FlexStart workflow.

**RMS, Resource Management Service** - Responsible to allocate/de-allocate Cloud PC using Azure.


## **License State** 

**Unassigned\Revoked** - License is not assigned to any user.  

**Activating** - The CPC start action has been triggered by user by using IWP, Win365 APP, Graph APIs or Intune portal.

**Active** - The license is activated and assigned to user and the CPC is in running state. 

**InStandbyMode** - License is not assigned and can be reused by another user. Cloud PC is still running for 2 more hours. This happens after user is disconnected from Cloud PC. Takes up to 1 min to change license state from "Active" to "InStandbyMode".

**ActivationFailed** - Error happened during activating license


# **User scenarios**

**Provisioning Cloud PC**

Frontline Cloud PC provision process is the same as for dedicated Cloud PC. The only difference is Tenant can provision 3x Cloud PC as they have licenses. If there are any issues related to Provision, please contact to Provision team.
After Cloud PC provisioned, IDS will create **FlexDeallocate** workflow. This workflow will de-allocate Cloud PC in 2 hours.

**User connecting to Cloud PC (cold start)**

**Cold start flow:**
- IWP/Win365 App: Initiate request
- Graph (start) or IWS (request): "Win 365 app" works with Graph and IWP works IWS. Graph will redirect requests to IWS APIs.
- CAS (request):

1. At this point CAS will check Tenant existence in CAS, if not exists then will update from Tenant Service.
1. Will check license claimed licenses vs consumed licenses.

- If there is enough licenses, then will change license state from Unassigned to "Activating" state and then create COGS "FlexStart" workflow. This workflow will allocate Cloud PC thru RMS.
- If not enough licenses then check license usage buffer. If enough licenses then execute previous step, if not then return "NoLicensesAvailable" error.
3. COGS will execute "FlexStart" workflow. Call RMS API to allocate Cloud PC
4. RMS will create and execute an action to Allocate Cloud PC.
5. RMS will wait until Cloud PC is allocated.
6. COGS will wait until RMS action is completed.
7. CAS will wait until COGS workflow is completed.
8. When COGS workflow is completed, CAS will change license state to Active.
9. IWP/"Win 365 app" will wait until license state is turned to Active state.


**How to troubleshoot:**

- You can use the below Kusto Query to Check the CAS Flow.
```
CloudPCEvent
| where ApplicationName =~ 'cas'
| where * contains 'TenantID' //tenantID
| where * contains 'CPCId' //cpcid is workspaceid from cpcd tool for a given CPC.
| project env_time,ComponentName,EventUniqueName,ApplicationName,Col1,Col2,Col3,Col4,Col5,Col6,Message,DeviceId,OtherIdentifiers,env_cloud_name,env_cloud_environment,BuildVersion, ActivityId,ColMetadata,TraceLevel
//| summarize by DeviceId
```

- Check Workflow execution status: Debugging a failed workflow inside COGSWorkflowService 
https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/884239/Windows-365-FrontLine


# **Returning user (warm start)**

**Warm start flow:**

- IWP/Win365 App: Initiate request
- Graph (start) or IWS (request): "Win 365 app" works with Graph and IWP works IWS. Graph will redirect requests to IWS APIs.
- CAS (request):
1. At this point CAS will check Tenant existence in CAS, if not exists then will update from Tenant Service.
1. Check that Cloud PC power stat is running. If not, then it is Cold start scenario.
1. Will check license claimed licenses vs consumed licenses.
1. If there is enough licenses, then will change license state from inStandbyMode to "Active" state.
1. If not enough licenses then check license usage buffer. If enough licenses then execute previous step, if not then return "NoLicensesAvailable" error.
1. IWP/"Win 365 app" will wait until license state is turned to Active state.

**How to troubleshoot:**

At this point all the troubleshooting for this scenario is located inside OCE (Dev and SaaF Only) for CAS. Will update this section once we have more Kusto queries for CSS.


# **Returning user (hot start)**

**Hot start flow:**

- IWP/Win365 App: checking license state. License state is already Active. No Services will be called.

**User disconnecting from Cloud PC**

When user is disconnecting from Cloud PC, Windows 365 services will know about it in few different ways. Depending on disconnect type (closed browser, closed app, used Windows Start -> disconnect button, Internet loss, Host terminated ...) License release time may vary. License release takes 7 to 17 minutes. To check is license is released or not use Geneva action "CloudPC Get Concurrent Access CPC Status of the given tenant by CPC Id"

**How to troubleshoot:**

Refer to Kusto Queries for "Checking Concurrent Access Service (CAS) Flow using CPC ID/WorkspaceID" and "Debugging a failed workflow inside COGSWorkflowService"

https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/884239/Windows-365-FrontLine
