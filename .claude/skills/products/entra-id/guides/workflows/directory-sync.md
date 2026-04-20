# Entra ID Directory Sync (Connect/Cloud Sync/PTA) — 排查工作流

**来源草稿**: ado-wiki-a-entra-connect-admin-actions-auditing.md, ado-wiki-a-entra-connect-sync-on-premise-lab-setup.md, ado-wiki-a-failover-aad-connect-servers.md, ado-wiki-a-migration-connect-sync-to-cloud-sync.md, ado-wiki-b-aad-connect-architecture-troubleshooting.md, ado-wiki-b-migrating-phs-entra-connect-to-cloud-sync.md, ado-wiki-b-phs-troubleshooting-cloud-sync.md, ado-wiki-b-remove-unwanted-ad-domains-cloud-sync.md, ado-wiki-c-entra-connect-performance-issues.md, ado-wiki-c-rpc-errors-affecting-aadconnect.md... (+20 more)
**Kusto 引用**: aad-connect-sync.md
**场景数**: 23
**生成日期**: 2026-04-07

---

## Scenario 1: ado-wiki-a-entra-connect-sync-on-premise-lab-setup
> 来源: ado-wiki-a-entra-connect-sync-on-premise-lab-setup.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Check your domain health**
   - Check the replication status of your domain controllers
   - Use the DNS Manager console to verify that your domain name is registered and resolvable
2. **Step 2: Add UPN suffix in your on-premise domain**
   - Add a UPN suffix that matches your Microsoft Entra ID domain name.
   - Open Active Directory Domains and Trusts > Right-click > Properties > UPN Suffixes > Add
3. **Step 3: Add custom domain names in your Microsoft Entra ID domain**
   - Add your on-premise domain name as a custom domain name in your Microsoft Entra ID domain.
   - Verify domain ownership by adding a TXT or MX record in your DNS provider.
   - **NOTE:** Status "Unverified" is expected for non-existent or non-navigable domain names.
4. **Step 4: Install and configure Microsoft Entra Connect**
   - Prerequisites: https://aka.ms/entra-connect-prerequisites
5. **Step 5: Configure synchronization options**
   - 1. Open Entra Connect > Configure > Customize synchronization options
   - 2. Connect to Microsoft Entra ID with global admin credentials
   - 3. Connect to Active Directory Forests with enterprise admin
6. **Step 6: Create a service connection point (SCP)**
   - 1. Open Entra Connect > Configure > Configure device options
   - 2. Select Configure Hybrid Azure AD Join
   - 3. Select Windows 10 or later domain-joined devices
7. **Step 7: Verify the sync status**
   - Synchronization Service Manager console for sync operations and logs
   - Microsoft Entra Connect Health portal for sync health and alerts
   - Microsoft Entra ID admin center

---

## Scenario 2: How To: Failover AAD Connect Servers
> 来源: ado-wiki-a-failover-aad-connect-servers.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 3: Migration of Entra Connect Sync To Cloud Sync
> 来源: ado-wiki-a-migration-connect-sync-to-cloud-sync.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **No immediate action required** - Phase 1 is awareness only
- 2. **6-month migration window** per cohort, hard deadline enforced
- 3. **Migration tool** will be provided for eligible configurations
- 4. **Early migration encouraged** - customers can migrate before their cohort
- 5. **Cannot opt out** - exception process exists but rigorous
- 6. **Unsupported features** - customers can stay on Connect Sync until Cloud Sync gains parity
- 7. **Rollback available** within migration tool before cohort deadline

---

## Scenario 4: Or for all users:
> 来源: ado-wiki-b-aad-connect-architecture-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 5: ado-wiki-b-migrating-phs-entra-connect-to-cloud-sync
> 来源: ado-wiki-b-migrating-phs-entra-connect-to-cloud-sync.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Resolution and action plan**
   - Now we know that Password Hashes are being sent twice, by the Cloud Sync Agent and by Entra Connect and the reason is because we never ask the engine of Entra Connect to stop syncing hashes just regul
   - Unfortunately we don't specify we need to follow additional steps to stop flowing password hashes and this is not yet documented in public articles, however we have the action plan to resolve this pro
   - ](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-selective-password-hash-synchronization)

---

## Scenario 6: Introduction
> 来源: ado-wiki-b-phs-troubleshooting-cloud-sync.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Go to ASC, open Tenant Explorer and navigate to AAD Cloud Sync menu.
- 2. Choose the proper domain, there copy and save the Service Principal Identifier of the Cloud Sync application.
- 3. Then navigate to Graph Explorer tab and run the following query by setting the previously copied Service Principal Identifier
- 4. This will return all the provisioning jobs associated to that Cloud Sync enabled domain:
- 1. Navigate to Kusto Web UX tab and open Kusto.
- 2. Connect to cluster "idsharedwus" and choose table "AADFSprod"
- 3. Use query. Change runProfileIdentifier and reportableIdentifier to the relevant ones
- 4. You will find the password hash sync operations for the given user

---

## Scenario 7: Troubleshooting Entra Connect Performance Issues
> 来源: ado-wiki-c-entra-connect-performance-issues.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 8: Troubleshooting RPC Errors Affecting AADConnect
> 来源: ado-wiki-c-rpc-errors-affecting-aadconnect.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Start capture: `nmcap /network * /Capture /file c:\MSData\%Computername%_Trace.cap:500M /StopWhen /Frame (ICMP and Ipv4.TotalLength == 328) /CaptureProcesses /TimeAfter 2s`
- 2. Prepare a script with: `ping -l 300 -n 2 120.##.###.42`
- 3. Attach a task to the error event to trigger the ping command that stops the trace.

---

## Scenario 9: Cloud Sync Connectivity Issues
> 来源: ado-wiki-d-cloud-sync-connectivity-issues.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Troubleshooting Steps**
   - 1. **Firewall and Proxy Requirements**: Ensure customer meets requirements documented at Prerequisites for Microsoft Entra Cloud Sync
   - 2. **Web Proxy Configuration**: If using web proxy, verify configuration per Cloud Sync troubleshooting docs (agent-times-out-or-certificate-isnt-valid)
   - 3. **Check Trace Logs**: Default agent trace logs at `C:\ProgramData\Microsoft\Azure AD Connect Provisioning Agent\Trace`

### 关键 KQL 查询
```kql
let qJobId = "<Input JobId here>";
GlobalIfxUsageEvent
| where env_time > ago(1d)
| where internalCorrelationId contains qJobId
| where usageType == "RunProfileStatistics"
| where message !contains "ExecutionStatus: Executing"
| extend duration = (extract("(?:  Duration: )([0-9]*:[0-9]*:[0-9]*.[0-9]*)", 1, message, typeof(timespan)))
| project duration, env_time
| summarize max(duration) by env_time
| render timechart
```
`[来源: ado-wiki-d-cloud-sync-connectivity-issues.md]`

```kql
let qCorrelationId = "<input correlation id>";
GlobalIfxAllTraces
| where correlationId == qCorrelationId
| project env_time, env_seqNum, message
| order by env_time asc
```
`[来源: ado-wiki-d-cloud-sync-connectivity-issues.md]`

---

## Scenario 10: Cloud Sync Architecture Overview
> 来源: ado-wiki-e-cloud-sync-architecture-overview.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 11: Data Collection for Cloud Sync
> 来源: ado-wiki-e-cloud-sync-data-collection.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **ServiceSide Data**
- 2. **ClientSide Data (Provisioning Agent)**
- 1. Install the **AADCloudSyncTools** PowerShell module.
- 2. Run the following cmdlet:
- 1. Install the [AADCloudSyncTools PowerShell module](https://www.powershellgallery.com/packages/AADCloudSyncTools).
- 2. Use the `Export-AADCloudSyncToolsLogs` PowerShell cmdlet to capture the information. You can use the following options to fine-tune your data collection:

---

## Scenario 12: Compliance note
> 来源: ado-wiki-e-exchange-hybrid-writeback-cloud-sync.md | 适用: Mooncake ✅

### 排查步骤
1. **Step 1: Install or upgrade Azure AD Connect Provisioning agent**
   - Download and install minimum version 1.1.1107.0 or higher of the Azure AD Connect Provisioning agent from the portal.
   - If an existing agent is not installed, follow the steps from the Install the [Azure AD Connect provisioning agent](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/cloud-sync/how-to-ins
   - If an agent is already installed, simply upgrade the agent to a version that supports Exchange Hybrid.
2. **Step 2: Configure cloud sync**
3. **Step 3: Verify synchronization job status**
   - Verify the status of the Exchange hybrid writeback job.
   - 1. Navigate to [Azure AD Connect](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/DirectoriesADConnectBlade) in the Microsoft Entra portal.
   - 2. Click the *Manage Azure AD cloud sync* link to see a list of domain configurations that are defined.
4. **Troubleshooting (verbose agent logs, Kusto logs)**
   - [Troubleshooting (verbose agent logs, Kusto logs)](https://aka.ms/AAks8lr)

---

## Scenario 13: What are transients?
> 来源: ado-wiki-e-troubleshooting-aadconnect-transient-csobjects.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1) A Full import obsoletes it (Deleted)
- 2) Delta import eventually brings in the rename of the old object. This will get a new DN and will stop being a transient
- 3) If neither action is applied, you get a completed-transient-objects status at the end of the run cycle.
- 1) Execute a Full Import just at the connector the transients are staled.
- 2) Execute a Delta Cycle from powershell.
- 1. `Get-ADSyncCSObject [-Identifier] <guid>`
- 2. `Get-ADSyncCSObject [-ConnectorIdentifier] <guid>     [-DistinguishedName] <string> [-SkipDNValidation] [-Transient]`
- 3. `Get-ADSyncCSObject [-ConnectorIdentifier] <guid> [-Transient]     [-StartIndex <int>] [-MaxResultCount <int>]`
- 4. `Get-ADSyncCSObject [-ConnectorName] <string> [-DistinguishedName]     <string> [-SkipDNValidation] [-Transient]`
- 5. `Get-ADSyncCSObject [-ConnectorName] <string> [-Transient]     [-StartIndex <int>] [-MaxResultCount <int>]`

---

## Scenario 14: Support guidelines for Azure AD Connect deprecation
> 来源: ado-wiki-f-aadconnect-deprecation-support-guidelines.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 15: RPC Errors Affecting Entra Connect
> 来源: mslearn-rpc-errors-affecting-aadconnect.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. Check Application event log on Connect server
- 2. Identify the RPC system error code from the event details
- 3. Target troubleshooting based on the specific error code

---

## Scenario 16: AAD Connect: Auto Truncate mms_step_history via Scheduled Task
> 来源: onenote-aadc-auto-truncate-step-history.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. Open **Task Scheduler** (search or find in Administrative Tools)
   - 2. **Create Task** (not "Create Basic Task")
   - 3. **General Tab**: Set user account in admin group

---

## Scenario 17: Change AAD Connect Connector / Service Accounts
> 来源: onenote-aadc-change-connector-service-accounts.md | 适用: Mooncake ✅ / Global ✅

---

## Scenario 18: AAD Connect: Do NOT Clear Connector Spaces
> 来源: onenote-aadc-do-not-clear-connector-spaces.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **State Loss** - Legitimate deletes accumulated in the DB are lost forever. Original AD objects are gone and Azure AD objects cannot be correlated to non-existent on-prem objects. Results in unexpl
- 2. **Unintended Mass Deletion** - Scheduler can automatically trigger right after CS is deleted. If it runs remaining steps, it can delete large numbers of objects, causing Sev 1 incidents. Newer vers
- 3. **PG Loses Diagnostic Opportunity** - If a product shortcoming causes the need to delete CS, PG never gets to see/fix the root cause.
- 1. **Perform a Full Sync** first - this resolves the issue in most cases
- 2. If Full Sync doesn't work, try **Full Import and/or Full Sync on the specific connector** having the issue
- 3. If still unresolved, escalate for further investigation via ICM

---

## Scenario 19: AAD Connect: Group ManagedBy and Owner Attribute Sync Logic
> 来源: onenote-aadc-group-managedby-owner.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
- 1. **ManagedBy** and **Owner** are synced **separately**
- 2. **ManagedBy** is synced directly from on-prem AD
- 3. **Owner** attribute by default is **not** in on-prem AD (cloud-only attribute)
- 4. The "Manager" (value of ManagedBy) of the synced group **must also exist in cloud** - otherwise AAD backend, AAD portal, and O365 portal will show empty

---

## Scenario 20: AAD Connect: Using MSODS Audit Logging (Kusto) to Investigate Object Operations
> 来源: onenote-aadc-msods-audit-logging.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Step 1: Check Operations Around the Incident Time**
   - let mytime = datetime(2018-07-30 03:05:26.5592925);
   - GlobalIfxAuditLoggingCommon()
2. **Step 2: Identify the Actor**
   - Check `actorObjectId` - if it's the AAD Connect sync account (e.g., `Sync_<ServerName>_<hash>`), the operations were performed by AAD Connect.
3. **Step 3: Timeline Visualization**
   - let myStartTime = datetime(2018-07-29 09:47:10) - 1h;
   - let myEndTime = datetime(2018-07-30 03:05:26) + 30m;

### 关键 KQL 查询
```kql
let mytime = datetime(2018-07-30 03:05:26.5592925);
GlobalIfxAuditLoggingCommon()
| where env_time > mytime - 30m and env_time < mytime + 30m
| where contextId == "<tenant-id>"
| summarize count() by operationName
| sort by count_
```
`[来源: onenote-aadc-msods-audit-logging.md]`

```kql
let myStartTime = datetime(2018-07-29 09:47:10) - 1h;
let myEndTime = datetime(2018-07-30 03:05:26) + 30m;
GlobalIfxAuditLoggingCommon()
| where env_time > myStartTime and env_time < myEndTime
| where contextId == "<tenant-id>"
| where actorObjectId == "<aadc-sync-account-objectid>"
| where operationName contains "Add " or operationName contains "Delete "
| summarize count(operationName) by bin(env_time, 5m)
```
`[来源: onenote-aadc-msods-audit-logging.md]`

---

## Scenario 21: Password Writeback Troubleshooting Guide
> 来源: onenote-aadc-password-writeback-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤
1. **Troubleshooting Steps**
2. **Step 1: Check Support Code in Event Log**
   - If found → troubleshoot according to the error message
   - If NOT found → proceed to Step 2
3. **Step 2: Check Prerequisites**
   - Reference: [Getting started with Password Management](https://azure.microsoft.com/en-us/documentation/articles/active-directory-passwords-getting-started/)
4. **Step 3: Verify Password Writeback Status**
   - $aadConnectorName = Get-ADSyncConnector -name "<tenant>.onmicrosoft.com – AAD"
   - Get-ADSyncAADPasswordResetConfiguration -Connector $aadConnectorName.Name
5. **Step 4: Reset Password Writeback (without re-configuration)**
   - Set-ADSyncAADPasswordResetConfiguration -Connector $aadConnectorName.Name -Enable $true
   - Get-ADSyncAADPasswordResetConfiguration -Connector $aadConnectorName.Name
6. **Step 5: Check Sync Rule**
   - Verify sync rule **"Out to AAD – User Join"** has **Enable Password Sync** checked
   - Even if Password Sync is not enabled in AADC config, this flag must be checked for writeback to work
   - Reference: entra-id-onenote-299

---

## Scenario 22: AAD Connect: Stop Syncing One Forest's Objects to Azure AD
> 来源: onenote-aadc-stop-syncing-forest.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Steps**
   - 1. **Disable sync scheduler**:
   - Set-MsolDirSyncEnabled -EnableDirSync $false

---

## Scenario 23: AADC Sync Performance Troubleshooting Guide
> 来源: onenote-aadc-sync-performance-troubleshooting.md | 适用: Mooncake ✅

### 排查步骤
1. **Diagnostic Steps**
2. **Step 1: Examine Synchronization Manager**
   - Note delta between start time and end time for each run profile step
   - Focus on the phase performing slowly
3. **Step 2: Check Run Histories**
   - Run miisclient.exe to see run histories
   - Check number of adds, updates, deletes
   - If run histories are numerous, purge oldest to free disk space
4. **Step 3: Hardware Inventory**
   - CPU, memory, disk space
   - Run perfmon during synchronizations
   - Verify network link quality to DC
5. **Step 4: Network Performance**
   - Check between sync client and domain controller
   - Check between sync client and Azure AD endpoint
   - Look for: small packet sizes, excessive retransmits, dropped packets

---

## 附录: Kusto 查询参考

### aad-connect-sync
> AAD Connect 同步事件查询

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{tenantId}'
| where env_cloud_role in ('msods-syncservice', 'adminwebservice')
| summarize 
    EventCount = count(),
    FirstEventTime = min(env_time),
    LastEventTime = max(env_time)
    by env_cloud_role
| order by EventCount desc
```

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{tenantId}'
| where env_cloud_role == 'msods-syncservice'
| project env_time, correlationId, internalOperationType, message
| order by env_time desc
| take 50
```

```kql
cluster('msodsmooncake.chinanorth2.kusto.chinacloudapi.cn').database('MSODS').IfxUlsEvents
| where env_time between(datetime({startTime})..datetime({endTime}))
| where * has '{objectId}'
| project env_time, env_appId, env_cloud_role,
    correlationId, resourceId, resourceType, internalOperationType, message
```

---

---

## Incremental Scenarios (2026-04-18)

## Scenario 24: AAD Connect is installed and configured in Hybrid identity scenario with a �Multiple forest, single sync server, user re...
> Source: contentidea-kb (entra-id-3648) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: AAD Connect is installed and configured in Hybrid identity scenario with a �Multiple forest, single sync server, user represented in only one directory� topology using the ms-DS-ConsistencyGuild as a ...
2. **Root cause**: The on-premises ActiveDirectory attribute �Manager� is a reference attribute and contains the distinguished name of the user who is the user's manager. The manager's user object contains a directRepor...
3. **Solution**: As a workaround to bypass this scenario, you can try to leverage the Azure AD Connect synchronization engine to manipulate the metaverse objects and achieve your goal. Depending on the requirements of...

---

## Scenario 25: Azure AADConnect service fails to start with an error 'Error 1069: The service did not start due to a logon failure'
> Source: contentidea-kb (entra-id-3675) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: Azure AADConnect service fails to start with an error 'Error 1069: The service did not start due to a logon failure'
2. **Root cause**: This happens when the Adsync service cannot use the credentials associated with the VSA (Virtual Service Account) of 'NT SERVICE\ADSYNC'
3. **Solution**: 1. Please confirm through ASC that the service account used for Azure AADConnect is 'NT Service\ADSYNC'.  2. Using Service.MSC please Navigate to ADSync service with the Display Name as 'Microsoft Azu...

---

## Scenario 26: You get a case or collab task for an Azure type application, such as CloudSync.  The customer gets an error in the wizar...
> Source: contentidea-kb (entra-id-3681) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: You get a case or collab task for an Azure type application, such as CloudSync.  The customer gets an error in the wizard/application stating, "The specified directory service attribute or value does ...
2. **Root cause**: Directory Services is not responsible for troubleshooting this error.  It is the application team's responsibility to not only troubleshoot this error, but to improve their logging to improve servicea...
3. **Solution**: If collab owner, do not proceed without an ICM created by Azure application's team for troubleshooting this error.  ICMs are used for escalation, and should be used here to gain awareness of this scen...

---

## Scenario 27: CloudSync or Azure application error: "The specified directory service attribute or value does not exist." Log shows Con...
> Source: contentidea-kb (entra-id-3687) | Applicability: unverified

### Troubleshooting Steps
1. **Confirm symptom**: CloudSync or Azure application error: "The specified directory service attribute or value does not exist." Log shows ConfigSyncDirectoriesPage caught exception while creating connector for directory.
2. **Root cause**: Directory Services is not responsible for troubleshooting this error. It is the application team's responsibility to troubleshoot and improve their logging.
3. **Solution**: If collab owner, do not proceed without an ICM created by Azure application's team. If case owner, do not allow Azure application's team to resolve collaboration until they provide the object and natu...

---
