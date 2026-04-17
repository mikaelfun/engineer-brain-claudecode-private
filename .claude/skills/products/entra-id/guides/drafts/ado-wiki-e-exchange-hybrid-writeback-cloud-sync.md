---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/EntraID to AD/Exchange Hybrid Writeback using Cloud Sync"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Sync%20Provisioning/Cloud%20Sync/EntraID%20to%20AD/Exchange%20Hybrid%20Writeback%20using%20Cloud%20Sync"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Synchronization
- cw.AAD Workflow
- cw.AzureAD
- cw.Connect Health
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


<span style="color:red">**Microsoft Confidential**</span> ? This feature is currently in Private Preview. Items not in Public Preview or released to the General Audience should be considered confidential and should not be discussed with customers.

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

Many organizations have an Exchange Hybrid deployment which includes an on-premises Exchange server and an Exchange Online organization in the cloud.  Azure AD Cloud Sync has been extended to provide Exchange Hybrid Writeback. This feature allows for seamless management of Exchange information across both environments by synchronizing Exchange attributes on users and groups from Azure Active Directory (AAD) to on-premises Active Directory Domain Services (AD DS).

___

# Support Boundaries

| Scenario | Support Team | SAP |
|-----|-----|-----|
| Cloud sync configuration and scoping issues | MSaaS AAD - Sync Professional<br><br>or<br><br>	MSaaS AAD - Sync Provisioning Premier | Azure\Azure Active Directory User Provisioning and Synchronization\Cloud Sync\Cloud sync configuration and scoping issues |
| Plan your cloud sync deployment | MSaaS AAD - Sync Professional<br><br>or<br><br>MSaaS AAD - Sync Provisioning Premier | Azure\Azure Active Directory User Provisioning and Synchronization\Cloud Sync\Plan your cloud sync deployment |
| Problem with Azure AD cloud sync | MSaaS AAD - Sync Professional<br><br>or<br><br>MSaaS AAD - Sync Provisioning Premier | Azure\Azure Active Directory User Provisioning and Synchronization\Cloud Sync\Problem with Azure AD cloud sync |
| Troubleshoot cloud provisioning agent | MSaaS AAD - Sync Professional<br><br>or<br><br>MSaaS AAD - Sync Provisioning Premier | Azure\Azure Active Directory User Provisioning and Synchronization\Cloud Sync\Troubleshoot cloud provisioning agent |
| Troubleshoot cloud sync | MSaaS AAD - Sync Professional<br><br>or<br><br>MSaaS AAD - Sync Provisioning Premier | Azure\Azure Active Directory User Provisioning and Synchronization\Cloud Sync\Troubleshoot cloud sync |
| Cloud Sync Support determines the attribute is synced and present on the user/group on-prem, but Exchange/Exchange Online is not working because Exchange thinks the attribute not populated on the user. | Office365 | Office Products\Office 365\Identity Management\Active Directory Synchronization |

___

# Requirements

- Domain Administrator or Enterprise Administrator credentials to create the Azure AD Connect Cloud Sync gMSA (group Managed Service Account) to run the agent service.

- Forest Function Level of Windows Server 2012 or later.

- A hybrid identity administrator account for the Azure AD tenant that is not a guest user.

- An on-premises Windows 2016 or later server for the provisioning agent. Installing the agent on a domain controller is supported. (minimum of 4-GB RAM and .NET 4.7.1+ runtime.)

- The PowerShell execution policy on the local server must be set to *Undefined* or *RemoteSigned*.

- High availability can be achieved by having multiple active agents installed and running. Azure AD Connect cloud sync can continue to function even if one agent should fail. Microsoft recommends having 3 active agents installed for high availability.

- On-premises firewall configurations.

  | Port Number     | How it's used                                                |
  | :-------------- | :----------------------------------------------------------- |
  | 80              | Downloads the certificate revocation lists (CRLs) while validating the SSL certificate |
  | 443             | Handles all outbound communication with the service          |
  | 8080 (optional) | Agents report their status every ten minutes over port 8080, if port 443 is unavailable. This status is displayed on the Azure AD portal. Port 8080 is not used for user sign-ins. |

* If the firewall enforces rules according to the originating users, open these ports for traffic from Windows services that run as a network service.

* If the firewall or proxy allows DNS whitelisting, whitelist connections to `*.msappproxy.net` and `*.servicebus.windows.net`. If not, allow access to the [Azure datacenter IP ranges](https://www.microsoft.com/en-us/download/details.aspx?id=56519), which are updated weekly.

* The agents need access to `login.windows.net` and `login.microsoftonline.com`  for initial registration. Open your firewall for those URLs as well.

* For certificate validation, unblock the following URLs: `mscrl.microsoft.com:80`, `crl.microsoft.com:80`, `ocsp.msocsp.com:80`, and `www.microsoft.com:80`. Since these URLs are used for certificate validation with other Microsoft products they may already have these URLs unblocked.

___

# Known Issues

## Issue 1: Exchange hybrid writeback option is Disabled

The **Exchange hybrid writeback** option will be disabled if the on-premises Active Directory does not have the Exchange schema.

___

# Pre-requisites for Exchange Hybrid Sync

- Follow the [Prerequisites for Azure AD Connect cloud sync](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/cloud-sync/how-to-prerequisites?tabs=public-cloud) document. to prepare for installation of the Azure AD Connect Provisioning Agent.
  - Minimum agent version required for Exchange Hybrid is 1.1.1107.0. This versions is likely to change after Public Preview is announced.

* Active Directory has Exchange schema. No Exchange schema version check is performed by the agent.

___

# Configure Hybrid Writeback 

## Step 1: Install or upgrade Azure AD Connect Provisioning agent

Download and install minimum version 1.1.1107.0 or higher of the Azure AD Connect Provisioning agent from the portal.

If an existing agent is not installed, follow the steps from the Install the [Azure AD Connect provisioning agent](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/cloud-sync/how-to-install) document to perform a clean installation of the agent.

If an agent is already installed, simply upgrade the agent to a version that supports Exchange Hybrid.

___

## Step 2: Configure cloud sync

### Existing configuration

1. If a cloud sync configuration already exists, navigate to [Azure AD Connect](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/DirectoriesADConnectBlade)) in the Microsoft Entra portal.

2. From there click the *Manage Azure AD cloud sync* link to see a list of domain configurations that are defined.

3. Click on the configuration link associated with the domain that will support Exchange hybrid.

4. Select the **Properties** tab and click the pencil icon to the right of **Basics** to edit the cloud sync configuration.

5. When the **Basics** fly out page loads, place a check next to the **Exchange hybrid writeback** option.

   **Note**: This option will be disabled if the on-premises Active Directory does not have the Exchange schema.
   
6. Click **Apply** to update the configuration.

   ![Configuration](/.attachments/AAD-Synchronization/970492/Configuration.jpg)

___

### New configuration

1. When setting up Cloud sync configuration for the first time, follow the [Create a new configuration for Azure AD Connect cloud sync](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/cloud-sync/how-to-configure) instructions.

2. Click on the configuration link associated with the domain that will support Exchange hybrid.

3. Select the **Properties** tab and click the pencil icon to the right of **Basics** to edit the cloud sync configuration.

4. When the **Basics** fly out page loads, place a check next to the **Exchange hybrid writeback** option.

   **Note**: This option will be disabled if the on-premises Active Directory does not have the Exchange schema.

5. Click **Apply** to update the configuration.

   ![Configuration](/.attachments/AAD-Synchronization/970492/Configuration.jpg)

___

## Step 3: Verify synchronization job status

Verify the status of the Exchange hybrid writeback job.

1. Navigate to [Azure AD Connect](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/DirectoriesADConnectBlade) in the Microsoft Entra portal.

2. Click the *Manage Azure AD cloud sync* link to see a list of domain configurations that are defined.

3. Click on the link under **Status** for the domain of interest. This will open a *Sync status info* blade on the right, which contains the status of all synchronization jobs that are running against this domain. Scroll down to see the status of the **Exchange hybrid writeback** job.

![SyncStatus](/.attachments/AAD-Synchronization/970492/SyncStatus.jpg)

___

# Troubleshooting

## Check the provisioning logs

1. Navigate to [Azure AD Connect](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/DirectoriesADConnectBlade)) in the Microsoft Entra portal.
2. From there click the *Manage Azure AD cloud sync* link to see a list of domain configurations that are defined.
3. Click on the configuration link associated with the domain.
4. Select the **Provisioning logs** blade.

![ProvLogs](/.attachments/AAD-Synchronization/970492/ProvLogs.jpg)

There is existing public documentation for the provisioning logs [here](https://docs.microsoft.com/en-us/azure/active-directory/reports-monitoring/concept-provisioning-logs):                                        

___


## Provisioning Agent

### Network requirements

Check to make sure the server conforms to all the required pre-requisites listed [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/236881/AD-to-Azure-AD-Cloud-Provisioning?anchor=requirements) 

Use this link to ensure the machine has access to msappproxy.net on Port 443:

https://aadap-portcheck.connectorporttest.msappproxy.net/

___

### Trace and Configuration Logs

Trace and configuration logs are stored here: `C:\ProgramData\Microsoft\Azure AD Connect Provisioning Agent`.

___

#### Verbose Logging

By default, the provisioning agent emits error messages and stack trace information only. These trace events are located in the `AzureADConnectorProvisioningAgent_{guid}.log` under `C:\ProgramData\Microsoft\Azure AD Connect Provisioning Agent\Trace`.

Follow the steps to collect verbose logging of the agent:

1.	Open an elevated PowerShell prompt and run these commands:

```powershell
import-module "C:\Program Files\Microsoft Azure AD Connect Provisioning Agent\Utility\AADCloudSyncTools.psm1"
Connect-AADCloudSyncTools
Start-AADCloudSyncToolsVerboseLogs
```

2.	Wait for the next sync to cycle to start and complete automatically, or have the customer initiate an On demand sync and wait for it to complete.

3.	Stop the trace using this command:

```powershell
Stop-AADCloudSyncToolsVerboseLogs
```

4.	You should now see more events in the Event Viewer and Provisioning Agent log file.
___

### Agent Service

The service running the Hybrid sync agent is called **Microsoft Azure AD Connect Provisioning Agent**.

![ProvAgentSVC](/.attachments/AAD-Synchronization/970492/ProvAgentSVC.jpg)

___

## Check Kusto/Jarvis Logs

Checking the logs for Azure AD Cloud Sync is the same any other sync fabric provisioning which is outlined in detail in the main [Sync Fabric wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/183984/Azure-AD-Sync-Fabric?anchor=log-analysis-(kusto-%2B-jarvis)):    

___

### Kusto Web UX (ASC)

#### Provisioning Agent 

1. Select **Kusto Web UX** in ASC.
2. From the **Select cluster to add** drop-down, select `idsharedwus` and click **Add Cluster**.
3. Expand `AADSFprod` and select `Functions`.
4. Issue one of the queries below...

___

##### Verify AAD2ADExchangeHybridWriteback is Running

Verify the Sync process is healthy and discover the `runProfileId` of the Exchange hybrid writeback value under `runProfileIdentifier`.

```json
// FIND THE RUN PROFILE EXECUTIONS
GlobalIfxRunProfileStatisticsEvent
| where env_time > ago(1d) // Time range
| where runProfileTag == "AAD2ADExchangeHybridWriteback"
| where executionStatus != "NotRun"
| project env_time, correlationId, servicePrincipalDisplayName, runProfileIdentifier , tenantDetail, sliceName, env_cloud_location, executionStatus, quarantineStatus, errorCode, errorDetail, countTotalSynchronizedByType
```

___

##### Audit events

Issue this query to see all sync activity for a user or group. 

- discover the `runProfileId` by running the [Verify AAD2ADExchangeHybridWriteback is Running](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=970492&anchor=verify-aad2adexchangehybridwriteback-is-running) query.
- replace the `runProfileId` in the query below with the Exchange hybrid writeback value under `runProfileIdentifier` from the previous query.
- replace the `reportableIdentifier`. This can be the UPN/EMail of a user, DISPLAYNAME for a group.

```json
let runProfileId = "AAD2ADExchangeHybridWriteback.7dd22###########################.5bbd2dee-23b3-49df-a2f3-971dc0591f83"; 
    GlobalIfxAuditEvent
    | where env_time > ago(30d)   
             and runProfileIdentifier == runProfileId    
             and reportableIdentifier contains "{UPN of user or DISPLAYNAME of a group}" // Use UPN/EMail for users, DISPLAYNAME (usually) for groups
    // If you know objectId in either system, can filter by sourceAnchor / targetAnchor fields instead
    | project env_time, correlationId, sourceAnchor, targetAnchor, reportableIdentifier, eventName, description, ['details']
```

___

#### 1. Get the Connector ID

##### From the Agent server

The server administrator navigate can identify the *Connector ID* by examining the `trace-wizardYYYYMMDD-#####.'og` file which is located under  `C:\ProgramData\Microsoft\Azure AD Connect Provisioning Agent\Trace`.

![CorrID](/.attachments/AAD-Synchronization/970492/CorrID.jpg)

___

##### From Kusto

1. Add the`idsharedweu` cluster to **Kusto Web UX**.

2. The database `AADAP` contains the tables of interest.

**NOTE**: Copy the `connectorId` for queries that will follow.

```json
BootstrapRootOperationEvent
| where env_time > ago(10d) //Insert timeframe to search 
| project connectorId,agentFeature,agentSdkVersion,connectorVersion
```

___

#### 2. Get Bootstrapper Events

1. Add the`idsharedweu` cluster to **Kusto Web UX**.

2. The Database `AADAP` contains the tables of interest.

3. Replace `Insert_connectorId` in the query below with the `connectorId` discovered in [1. Get the Connector ID](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=970492anchor=1.-get-the-connector-id)

Bootstrapper events are responsible for passing configuration information to the provisioning agent and are expected to occur every 10 minutes. Included in the configuration info is data such as endpoints of the Proxy which the agent is expected to flow data through. Most data passed via the bootstrapper events is immutable but some data (such as the proxy endpoints) is expected to change between events.

```json
BootstrapRootOperationEvent
| where env_time > ago(10d) //Insert timeframe to search 
| where connectorId == "Insert_connectorId"
| project env_time,env_cloud_environment,resultType,resultSignature,resultDescription,requestId,sessionId,transactionId,subscriptionId,connectorId,initialBootstrap,connectorVersion, agentFeature,agentSdkVersion,requestString,responseString
```

___

#### 3. Get Registration Events

1. Add the`idsharedweu` cluster to **Kusto Web UX**.

2. The database `AADAP` contains the tables of interest.

3. Replace `Insert_connectorId` in the query below with the `connectorId` discovered in [1. Get the Connector ID](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=970492anchor=1.-get-the-connector-id)

![KustoClusDB](/.attachments/AAD-Synchronization/970492/KustoClusDB.jpg)

When the provisioning agent is first installed on a machine, a registration event occurs, during which? If this registration fails, it's unlikely that the subsequent sync attempts will succeed. You can check for the registration event using the Kusto query below. 

```json
RegistrationRegisterOperationEvent
| where env_time > ago(10d) //Insert timeframe to search 
| where connectorId == "Insert_connectorId"
| project env_time,env_cloud_environment,resultType,resultSignature,resultDescription,requestId,sessionId,transactionId,subscriptionId,connectorId,feature,userAgent
```
___

#### 4. Get Transaction summaries

1. Add the`idsharedweu` cluster to **Kusto Web UX**.

2. The Database `AADHIS` contains the tables of interest.

3. Replace `Insert_connectorId` in the query below with the `connectorId` discovered in [1. Get the Connector ID](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=970492&anchor=1.-get-the-connector-id)

```json
PartnerTransactionSummaries
| where TIMESTAMP > ago(10d) //Insert timeframe to search 
| where ConnectorId == "Insert_ConnectorId"
| project TIMESTAMP,ServiceName,TransactionId,SubscriptionId,CorrelationId,FrontendUrl,LogicResult,ExtraResultData,ResponseStatusCode,EndpointType,FlowType,ConnectorIpAddress,ConnectorId,GroupId
```

___

# Public Documentation

___

# Teams Support Channel

___

# ICM Path

## AAD Cloud Sync User Provisioning

https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=551y1e

- **Owning service**: `AAD SyncFabric`
- **Owning team**: `AAD User Provisioning CRIs`

___

## AAD Cloud Provisioning Agent

https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=RAuN37

___

# Training

## Deep Dive 07445 - Exchange Hybrid Writeback using Cloud Sync

Cloud Sync developer Aditi Saha Aditi explains Exchange Hybrid Writeback using Azure AD Cloud Sync which covers deployment and in depth usage of Kusto troubleshooting flows.

**Title**: Deep Dive 07445 - Exchange Hybrid Writeback using Cloud Sync

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 60 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Sync Premier](https://msaas.support.microsoft.com/queue/2697b5fc-465c-e711-813c-001dd8b72a16), [MSaaS POD Azure Japan Identity - Sync](https://msaas.support.microsoft.com/queue/25e48691-0323-e911-8150-00155d836406), [MSaaS Mooncake BC Escalation](https://msaas.support.microsoft.com/queue/7f624f7a-6a9a-e711-812f-002dd8151753)

**Tool Availability**: June 15, 2023

**Training Completion**: June 15, 2023

**Region**: All regions

**Course Location**: [Cloud Academy](https://aka.ms/AAl11jc)

___

## ATC Jan 2023 - Sync - Architecture and New Features APAC

- [ATC Jan 2023 - Sync - Architecture and New Features APAC](https://aka.ms/AAkmya4) (Forward to 1:42:50 in the recording and listen to the Exchange Hybrid Writeback Design section.)

___

## ATC Jan 2023 - Sync - Cloud Sync - Follow up to Overview and Support Readiness

-  [ATC Jan 2023 - Sync - Cloud Sync - Follow up to Overview and Support Readiness](https://aka.ms/AAknt03)

___

## Troubleshooting (verbose agent logs, Kusto logs)

- [Troubleshooting (verbose agent logs, Kusto logs)](https://aka.ms/AAks8lr)

___
