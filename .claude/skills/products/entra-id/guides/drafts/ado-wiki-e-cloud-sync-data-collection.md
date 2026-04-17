---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/General/Cloud Sync Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Cloud%20Sync/General/Cloud%20Sync%20Data%20Collection"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Data Collection for Cloud Sync




---

## Overview

Cloud Sync data collection is divided into two main sections:

1. **ServiceSide Data** 
2. **ClientSide Data (Provisioning Agent)**

---

## 1. ServiceSide Data

This refers to data stored on the backend. We primarily use **Azure Support Center (ASC)** to access this data, but some information must be gathered from the customer to ensure we troubleshoot the correct Cloud Sync configuration.

### Key Sources and Queries

#### KustoWebUx
Used for troubleshooting object synchronization or password sync issues.

Our main source of information when troubleshooting object synchronization or password synchronization issues with Cloud Sync is going to be **KustoWebUx**. 

To make sure we are filtering on the right Cloud Sync configuration so we can leverage Kusto to get useful troubleshooting information, **we need to find out the run profile identifier for the affected configuration**. 

This identifier will have a format like one of the below:

```
AD2AADProvisioning.XXXXXXXXXXXXX.YYYYYYYYYYYYYYY
AD2AADPasswordHash.XXXXXXXXXXXXXX.YYYYYYYYYYYYY
AAD2ADGroupProvisioning.XXXXXXXXXXXXXX.YYYYYYYYYYYYY
AAD2ADExchangeHybridWriteback.XXXXXXXXXXXXXX.YYYYYYYYYYYYY
```

More information on KustoWebUx troubleshooting, including example queries, can be found **[HERE] -- pending link insertion**

#### Graph Explorer Queries
Use **ASC Graph Explorer** to get a full view of the customers configuration.

**Published Resources**
```
onPremisesPublishingProfiles/provisioning/publishedResources/?expand=\*
```

**Agent Groups**
```
onPremisesPublishingProfiles/provisioning/agentgroups/?expand=\*
```

**Agents**
```
onPremisesPublishingProfiles/provisioning/agents/?expand=\*
```

If ASC does not return results, ask the customer to run the following **Graph Explorer** queries (beta endpoints):

**Query Agents**
```

https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/agents/?$expand=\*

```

**Query Agent Groups**
```

https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/agentGroups/?$expand=\*

```

**Query Published Resources**
```

https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/publishedResources/?expand=\*

```

### Synchronization Jobs via Graph

**List Service Principal (Configuration)**  
Replace `contoso.com` with the customers domain name:
```

GET https://graph.microsoft.com/v1.0/serviceprincipals?$filter=displayname eq 'contoso.com'

```
|:information_source: Information|  
|:---------------------------|  
| Once you have retrieved the Service Principal ID, you can locate it in ASC to check Audit logs that will be helpful during troubleshooting|

**List Synchronization Jobs**  
Replace `[spid]` with the ID from the previous query:
```

GET https://graph.microsoft.com/v1.0/serviceprincipals/[spid]/synchronization/jobs/

```

---

## 2. ClientSide Data (Provisioning Agent)

This data is generated on the servers where the provisioning agents are installed in the customers environment. It is especially useful for troubleshooting:

- Communication with onprem Active Directory  
- Agent installation issues

### Agent Logs

**Default log path**
```

C:\ProgramData\Microsoft\Azure AD Connect Provisioning Agent\Trace

````

**Collect detailed logs**

1. Install the **AADCloudSyncTools** PowerShell module.  
2. Run the following cmdlet:
```powershell
   Export-AADCloudSyncToolsLogs
````

### Client-side Data Collection

The previous section was related to the data we can find on the service-side (cloud). But since Entra Cloud Sync leverages the provisioning agent to communicate with the on-premises environment, we'll likely also need to collect data on that on-premises environment, both about the communication with Active Directory and with the installation of the provisioning agent itself.

By default, the agent emits minimal error messages and stack trace information. You can find these trace logs in the following folder: `C:\ProgramData\Microsoft\Azure AD Connect Provisioning Agent\Trace`.

### To Gather Additional Details for Troubleshooting Agent-Related Problems

Follow these steps:

1. Install the [AADCloudSyncTools PowerShell module](https://www.powershellgallery.com/packages/AADCloudSyncTools).
2. Use the `Export-AADCloudSyncToolsLogs` PowerShell cmdlet to capture the information. You can use the following options to fine-tune your data collection:
   - **SkipVerboseTrace** to only export current logs without capturing verbose logs (default = false).
   - **TracingDurationMins** to specify a different capture duration (default = 3 minutes).
   - **OutputPath** to specify a different output path (default = user's Documents folder).

### Additional Logs and Data Points

Other than the logs emitted by the agent and mentioned above, there's some logs and data points that might be useful to collect whenever we are dealing with any on-premises issues, so please also gather the following, for every machine where the provisioning agent is installed:

#### 1. Export Application and System Eventlogs

If you used `Export-AADCloudSyncToolsLogs`, you can skip this because it's already automatically collected:

```powershell
wevtutil epl Application C:\Temp\Application.evtx /ow:true
wevtutil epl System C:\Temp\System.evtx /ow:true
```

#### 2. Export additional details

Lastly, from an elevated CMD instance please run the following commands to get a report on the GPOs applied on the server, as well as an overview of the server details (hardware, service status, driver status, etc):

```powershell
Msinfo32 /nfo c:\temp\msTrace\msinfo32.nfo
GPRESULT /H c:\temp\GPReport.html
```