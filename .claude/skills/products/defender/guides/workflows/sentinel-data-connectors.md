# Defender Sentinel 数据连接器 — 排查工作流

**来源草稿**: ado-wiki-a-cef-syslog-troubleshooter-deprecated.md, ado-wiki-a-change-dcr-reporting-workspace.md, ado-wiki-a-codeless-connector-framework-ccf-tsg.md, ado-wiki-a-devops-connector-takeover-workflow.md, ado-wiki-a-manually-create-dcr-rule-asa-ama.md, ado-wiki-a-mdc-pipeline-ama.md, ado-wiki-a-msbizapps-connector-tsg.md, ado-wiki-a-purview-information-protection-connector.md, ado-wiki-a-sentinel-data-connector-wizard-tsg.md, ado-wiki-a-syslog-cef-advanced-filtering-rsyslog.md, ado-wiki-a-syslog-custom-api-connector-corero.md, ado-wiki-a-syslog-custom-api-connector-stealthwatch.md, ado-wiki-a-syslog-oms-installation-troubleshooting.md, ado-wiki-a-track-m365d-connector-changes.md, ado-wiki-a-windows-dns-ama-connector-tsg.md, ado-wiki-b-aws-s3-connector-tsg.md, ado-wiki-b-cef-syslog-ama-tsg.md, ado-wiki-b-connector-connected-disconnected-status.md, ado-wiki-b-connector-health-errors.md, ado-wiki-b-dynamics-365-data-connector-missing-delayed-logs.md, ado-wiki-b-entra-id-aad-connector-tsg.md, ado-wiki-b-salesforce-service-cloud-connector.md, ado-wiki-b-syslog-test-examples.md, ado-wiki-b-unified-connectors-tsg.md, ado-wiki-b-win-ama-connectors-tsg.md, ado-wiki-c-cisco-ftd-custom-api-connector.md, ado-wiki-c-rsyslog-tls-configuration.md
**场景数**: 23
**生成日期**: 2026-04-07

---

## Scenario 1: CEF & Syslog Step by Step Troubleshooter (Deprecated OMS Agent)
> 来源: ado-wiki-a-cef-syslog-troubleshooter-deprecated.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Verify NSG allows inbound TCP/UDP 514 from log sender
2. Capture arriving packets: `tcpdump -Ani any port 514 and host <sender_ip> -vv`
3. Check for rejected packets: `watch -n 2 -d iptables -nvL`

### Kusto 诊断查询
**查询 1:**
```kusto
Heartbeat
| where Computer contains "<computername>"
| sort by TimeGenerated desc
```

**查询 2:**
```kusto
CommonSecurityLog | sort by TimeGenerated desc
Syslog | sort by TimeGenerated desc
-- Mock test logs:
CommonSecurityLog | where DeviceVendor == "TestCommonEventFormat" | sort by TimeGenerated desc
```

### 脚本命令
```powershell
sudo wget -O cef_installer.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/CEF/cef_installer.py && sudo python cef_installer.py <WorkspaceId> <Primary Key>
```

```powershell
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 25226 -j ACCEPT
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p udp --dport 25224 -j ACCEPT
sudo firewall-cmd --direct --add-rule ipv4 filter INPUT 0 -p tcp --dport 25224 -j ACCEPT
sudo firewall-cmd --reload
```

```powershell
netstat -anp | grep syslog
# Should see established connection on TCP 25226 for CEF/ASA
```

---

## Scenario 2: Change DCR's Reporting Workspace (FIM over AMA — Archived)
> 来源: ado-wiki-a-change-dcr-reporting-workspace.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. FIM DCR Resource ID (subscription + RG + resource name)
2. New Log Analytics Workspace Resource ID
3. New Log Analytics Workspace ID (hex GUID)
4. **GET** current DCR config:
5. Save the JSON response. Locate `destinations` section containing:
6. Modify `workspaceResourceId` and `workspaceId` to new workspace values.
7. **PUT** updated config:

### API 端点
```
GET https://management.azure.com<DCR-RESOURCE-ID>?api-version=2021-04-01
```
```
PUT https://management.azure.com<DCR-RESOURCE-ID>?api-version=2021-04-01
```

### 脚本命令
```powershell
# Step 1: Obtain Bearer token
response=$(curl http://localhost:50342/oauth2/token --data "resource=https://management.azure.com/" -H Metadata:true -s)
access_token=$(echo $response | python -c 'import sys, json; print (json.load(sys.stdin)["access_token"])')

# Step 2: GET current DCR
curl "https://management.azure.com/<DCR resource ID>?api-version=2021-04-01" \
  -X GET -H "Authorization: Bearer $access_token" -H "x-ms-version: 2019-02-02" >> dcr.json

# Step 3: Edit dcr.json — update workspaceResourceId and workspaceId
nano dcr.json

# Step 4: PUT updated DCR
curl "https://management.azure.com/<DCR resource ID>?api-version=2021-04-01" \
  -X PUT -H "Authorization: Bearer $access_token" \
  -H "x-ms-version: 2019-02-02" -H "Content-Type: application/json" \
  -d @dcr.json | grep -q Microsoft-ConfigurationChange && echo "Success"
```

---

## Scenario 3: Possible causes for main issue
> 来源: ado-wiki-a-codeless-connector-framework-ccf-tsg.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- a ticket for Content Hub on-call Sentinel US / Sentinel ecosystem third-party content
- an IcM for `Content Hub` on-call Sentinel US/ Sentinel ecosystem third-party content
- a ticket for Sentinel data connectors on-call Sentinel US/ Sentinel ecosystem third-party content

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: Workflow Guide for Supporting Customer Enabled Disaster Recovery (CEDR)
> 来源: ado-wiki-a-devops-connector-takeover-workflow.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Create a New Connector** in a different region (standard public documentation for ADO/GitHub/GitLab connector).
2. **Provide Security Connector Resource IDs** (both new and original):
3. **Open a Support Ticket** with Defender for Cloud DevOps security support:
4. **Validate Customer Request:**
5. **Confirm Prerequisites** are completed by customer.
6. **Execute Geneva Actions:**
7. **Get Access — Submit JIT Request:**
8. **Run Takeover Action:**
9. **Check Operation Status** (~1 minute after initiating):
10. **Reconfigure Features:** Reconfigure pull request annotation features if previously enabled.
11. **Delete Old Connector** when the region recovers from the outage.

### Portal 导航路径
- a Support Ticket** with Defender for Cloud DevOps security support:
- Environment = **Public**

---

## Scenario 5: Manually Create the DCR Rule to Connect ASA and AMA
> 来源: ado-wiki-a-manually-create-dcr-rule-asa-ama.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 6: MDC Pipeline Architecture: MMA vs AMA
> 来源: ado-wiki-a-mdc-pipeline-ama.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **AMA** — Azure Monitor Agent (data transport)
2. **ASA** — Azure Security Agent (security data collection)
3. **DCR** — Data Collection Rule (routing configuration)

---

## Scenario 7: Activity Logs Data Collection
> 来源: ado-wiki-a-msbizapps-connector-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Check the customer is eligible for, and has turned on, the Microsoft Purview Audit log. This is the unified audit log available in https://security.microsoft.com. If this log has not been activated, or the customer does not enable at least one Office 365 license, then no data can be collected by Sentinel.
2. In case of the `DataverseActivity` table, then verify the following:
3. Navigate to Microsoft Purview Audit log within https://security.microsoft.com
4. Create a new audit log search, setting the filters based on the timestamp of the affected audit log record in Sentinel. They can narrow the workload further by selecting the workload (Dynamics365 or DataverseActivity is `CRM`), the time, and the user account.
5. Open the details of the audit log and check the data is correct here. The data should be the same as Sentinel. If Sentinel has different data, then escalate to engineering, otherwise, send to Dynamics queue.
6. Validate the Self-Service Analytics feature is configured properly, check there is data within the storage account used by the customer. There should be a container called `powerplatform` and inside it, subfolders with .json files. If this is not the case, make sure the customer has followed Microsoft Power Platform self-service analytics export Power Platform inventory and usage data (preview).
7. If there is data inside the storage account, then check the IAM blade of the storage account and make sure the System Assigned Managed Identity (MSI) of the Azure Function App has been granted the `Storage Blob Data Reader` role on the storage account. This is necessary otherwise the function app can not read the data.
8. Check permissions on the DCR. Make sure that the MSI of the Function App has been granted `Monitoring Metrics Publisher` role over the Microsoft-Sentinel-PPInventory-DCR within Data Collection Rules in the Azure portal. This is necessary otherwise no data can reach log analytics. Note that if the function had been previously triggered without this permission it may take up to 24 hours for the token refresh to receive the updated permissions.
9. Examine the Function App logs. Open the Function app in the portal and on the overview blade click on the `PowerPlatformInventoryDataConnector` function. Click on the monitoring blade and open the latest log entry. Check for any error messages in the logs.
10. Ask the customer to check if the missing data is present in the Azure Storage account used for Self Service Analytics feature.
11. If the data is missing from the Storage Account, the ticket should be moved to the Power Platform team. If the data is present in the storage account but not collected, please raise an ICM and include screenshots of the missing data including file paths in storage and sample data that is missing.

### Portal 导航路径
- Microsoft Purview Audit log within [https://security
- the details of the audit log and check the data is correct here
- the Function app in the portal and on the overview blade click on the `PowerPlatformInventoryDataConnector` function
- the latest log entry

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 8: Troubleshooting Guide for Microsoft Sentinel Data Connector Wizard
> 来源: ado-wiki-a-sentinel-data-connector-wizard-tsg.md | 适用: Mooncake ✅

### Portal 导航路径
- the connector details page in Microsoft Sentinel

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 9: Corero Security Watch Workbook
> 来源: ado-wiki-a-syslog-custom-api-connector-corero.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Open Log Analytics/Azure Sentinel Logs blade. Copy the query below and paste into the Logs query window.
2. In the query window, on the second line of the query, enter the hostname(s) of your Corero Security Watch device(s) and any other unique identifiers for the logstream.
3. Click the Save button above the query. A pane will appear on the right, select "as Function" from the drop down. Enter a Function Name.
4. Kusto Functions can typically take up to 15 minutes to activate. You can then use Function Alias for other queries.

### Portal 导航路径
- Log Analytics/Azure Sentinel Logs blade

### Kusto 诊断查询
**查询 1:**
```kusto
corero_CL
| extend Parser = extract_all(@"(\w+\s+\d+\s\d+:\d+:\d+)\s(\S+)\s(.*)",dynamic([1,2,3]),Message)
| mv-expand Parser
| extend Date = tostring(Parser[0]),
        DeviceName = tostring(Parser[1]),
        Substring = tostring(Parser[2])
| extend cat = tostring(extract(@"cat=(\w+),",1,Substring)),
        type = tostring(extract(@"type=(\w+),",1,Substring)),
        v = tostring(extract(@"v=(\w+),",1,Substring)),
        cl = tostring(extract(@"cl=(\w+),",1,Substring)),
        device = tostring(extract(@"device=(\w+),",1,Substring)),
        profile = tostring(extract(@"profile=(\w+),",1,Substring)),
        sc = tostring(extract(@"sc=(\w+),",1,Substring)),
        sfn = tostring(extract(@"sfn=(\w+),",1,Substring)),
        dir = tostring(extract(@"dir=(\w+),",1,Substring)),
        timestamp = tostring(extract(@"time=(\w+),",1,Substring)),
        issr = tostring(extract(@"issr=(\w+),",1,Substring)),
        isr = tostring(extract(@"isr=(\w+),",1,Substring)),
        px = tostring(extract(@"px=(\w+),",1,Substring)),
        lb = tostring(extract(@"lb=(\w+),",1,Substring)),
        ipv = tostring(extract(@"ipv=(\w+),",1,Substring)),
        dip = tostring(extract(@"dip=(\w+),",1,Substring)),
        dprt = tostring(extract(@"dprt=(\w+),",1,Substring)),
        iplen = tostring(extract(@"iplen=(\w+),",1,Substring)),
        prot = tostring(extract(@"prot=(\w+),",1,Substring)),
        tos = tostring(extract(@"tos=(\w+),",1,Substring)),
        sip = tostring(extract(@"sip=(\w+),",1,Substring)),
        sprt = tostring(extract(@"sprt=(\w+),",1,Substring)),
        ttl = tostring(extract(@"ttl=(\w+),",1,Substring)),
        bp = tostring(extract(@"bp=(\w+),",1,Substring)),
        ep = tostring(extract(@"ep=(\w+),",1,Substring)),
        icn = tostring(extract(@"icn=(\w+),",1,Substring)),
        scl = tostring(extract(@"scl=(\w+),",1,Substring)),
        fp = tostring(extract(@"fp=(\w+),",1,Substring)),
        pflags = tostring(extract(@"flags=(\w+),",1,Substring)),
        pflagsdecode = tostring(extract(@"flags-decode=(\w+),",1,Substring)),
        plen = tostring(extract(@"plen=(\w+),",1,Substring))
| extend data = split(Substring,",")
| extend mpdata = split(data[10],"=")
| extend mp =mpdata[1]
| project-away Parser,Message,mpdata,data
```

---

## Scenario 10: ado-wiki-a-syslog-oms-installation-troubleshooting.md
> 来源: ado-wiki-a-syslog-oms-installation-troubleshooting.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Create a Linux Azure Virtual Machine
2. Enable tcp and udp port 514 for access to the virtual machine.
3. Click the add inbound port rule button
4. Click the Add button to save the rule
5. SSH or use Serial Console Connection to Login
6. Change to Root user
7. Create a new browser page and navigate to the Sentinel and enable Syslog and other Syslog facilities (Log Analytics Workspace � Advance settings � Data � Syslog)
8. Open the CEF Connector in Sentinel Data Connector page
9. Click the Open Connector Page button
10. Click the copy/Paste icon to copy the Python script to the clipboard
11. Paste in the Virtual Machine cli the python OMSAgent Install script command
12. Wait until the Python script completes
13. Now that the installation is complete, we need to confirm that everything is working as expected.
14. We need to run the Python Troubleshooting script to create Mock log events for us to query in Sentinel.
15. Copy and paste the Python command from the copy/paste icon and paste it in the cli of the virtual machine.
16. What do we need to check to confirm that everything is working correctly?
17. Tcpdump can provide details
18. Open the Log Analytics Workspace and query CommonSecurityLog

### Portal 导航路径
- the Sentinel and enable Syslog and other Syslog facilities (Log Analytics Workspace � Advance settings � Data � Syslog)
- the CEF Connector in Sentinel Data Connector page
- Connector Page button
- the Log Analytics Workspace and query CommonSecurityLog

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 11: Track M365 Defender Connector Changes
> 来源: ado-wiki-a-track-m365d-connector-changes.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(14d)
| where * has "{TenantID}"
| sort by TIMESTAMP desc
```

**查询 2:**
```kusto
cluster('asiusagetelemetryprod.eastus.kusto.windows.net').database('usagetelemetyprod').CustomerConnectOperationsFromUI
| where timestamp > ago(90d)
| where Message contains "DataExportSettings"
| where WorkspaceArmId == "/subscriptions/{SubscriptionID}/resourceGroups/{ResourceGroup}/providers/Microsoft.OperationalInsights/workspaces/{WorkspaceName}"
```

**查询 3:**
```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(90d)
| where HttpMethod =~ "delete"
| where OrgId == "{OrgId}"
| where Controller == "DataExportSettings"
| project env_time, DurationMs, HttpMethod, StatusCode, CorrelationId, AppId, AppName, OrgId, RequestUrl, ExposedWorkloads, ObjectId
```

**查询 4:**
```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(10d)
| where Sha256TenantId == hash_sha256(tolower("{TenantID}"))
| where AppName == "Sentinel"
| sort by TIMESTAMP desc
```

**查询 5:**
```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').HttpRequestLog
| where env_time>ago(365d)
| where OrgId == "{OrgId}"
| where Controller == "DataExportSettings"
| project env_time, DurationMs, HttpMethod, StatusCode, CorrelationId, AppId, AppName, OrgId, RequestUrl, ExposedWorkloads, ObjectId
```

---

## Scenario 12: Boundaries
> 来源: ado-wiki-a-windows-dns-ama-connector-tsg.md | 适用: Mooncake ✅

### 排查步骤
1. A domain controller machine.
2. Azure monitor agent / Arc Agent is installed and running on the machine and reporting healthy.
3. A DCR with the DNS stream downloaded to the machine.
4. DNS agent installed and reporting healthy.
5. The VM / on-prem Machine is a DNS server and creates events that can be seen in the windows event viewer.
6. **Install the AMA agent** (skip if already installed):
7. **Install the DNS agent**:
8. AMA is sending heartbeat for that machine in the Heartbeat table in LA.
9. Check that the DCR was successfully downloaded and applied to the machine and formatted correctly.
10. Check that no filters are applied in the DCR. If the issue is about missing events this could explain the problem.
11. Check that AMA is healthy in the VM extension section (only works for non-ARC machines).
12. Check the MicrosoftDnsAgent extension status - if not `Provisioning succeeded`, there should be a message.
13. Verify the machine is a DNS server sending DNS events in the ETW stream using this guide#to-enable-dns-diagnostic-logging).
14. Check logs at `C:\WindowsAzure\Logs\Plugins\Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent`.
15. Use table2csv.exe to check MaQosEvent.tf file for DNS events reaching AMA.
16. Open elevated PowerShell
17. Navigate to `C:\Packages\Plugins\Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent\<version>\ManagementScripts`
18. Run `.\disableCommand.ps1` to stop
19. Run `.\enableCommand.ps1` to start

### Portal 导航路径
- the named pipe
- elevated PowerShell
- `C:\Packages\Plugins\Microsoft

### Kusto 诊断查询
**查询 1:**
```kusto
GuestAgentExtensionEvents
| where TIMESTAMP > ago(14d)
| where Name == "Microsoft.Sentinel.AzureMonitorAgentExtensions.MicrosoftDnsAgent"
| project TIMESTAMP, Region, Version, RoleName, Name, Operation, OperationSuccess, Duration, Message, SubscriptionId, ResourceGroupName, VMId, OSVersion
| where OperationSuccess != "True"
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 13: Docs (Aws S3 Connector Tsg)
> 来源: ado-wiki-b-aws-s3-connector-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Select a timeframe
2. Copy the scubaId
3. Launch the query
4. Once the query has finish reload the table to show all the data

### Portal 导航路径
- S3 bucket in Amazon Web Services (AWS), search for the relevant folder according to the required logs, and check if there is any logs inside this folder
- the AWS SQS from the AWS console, go under monitoring tab and you should see the traffic in Number Of Messages Sent widget
- "Event notifications" section
- the [Investigate Scuba Telemetry](https://eng

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 14: Table schema notes
> 来源: ado-wiki-b-cef-syslog-ama-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Creation of an DCR (Data Collection Rule). This can be done using one of the following:
2. Running the installation script on the Log forwarder

### Portal 导航路径
- the Azure Portal and navigate to the log collector machine of your choice
- the **Extensions + applications** blade and select the **AMA (AzureMonitorLinuxAgent)** extension
- the Azure Portal and navigate to the log collector machine of your choice
- the **Extensions + applications** blade and select the **AzureMonitorLinuxAgent** extension
- but a firewall might be blocking all communications

### 脚本命令
```powershell
export MDSD_OPTIONS="-A -c /etc/opt/microsoft/azuremonitoragent/mdsd.xml -d -r $MDSD_ROLE_PREFIX -S $MDSD_SPOOL_DIRECTORY/eh -L $MDSD_SPOOL_DIRECTORY/events -T 0x1002"
```

```powershell
systemctl restart azuremonitoragent
```

```powershell
tail -f -n 100 /var/opt/microsoft/azuremonitoragent/log/mdsd.info
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 15: Connector Connected and Disconnected Status
> 来源: ado-wiki-b-connector-connected-disconnected-status.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
F5Telemetry_system_CL
| summarize LastLogReceived = max(TimeGenerated)
| project IsConnected = LastLogReceived > ago(7d)
```

---

## Scenario 16: Dynamics 365 Data connector - missing logs/delayed logs in MS Sentinel
> 来源: ado-wiki-b-dynamics-365-data-connector-missing-delayed-logs.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Navigate to the Microsoft Purview compliance portal.
2. Set **Record type** as **CRM** and **Activities** as **All Dynamics 365 activities**.
3. Go to the Power Platform Admin Center (PPAC).
4. Select **Environments** from the left menu.
5. Choose the production environment to check.
6. Click **Settings** and navigate to **Audit and logs** > **Audit settings**.

### Portal 导航路径
- the [Microsoft Purview compliance portal](https://compliance
- the [Power Platform Admin Center (PPAC)](https://aka
- **Audit and logs** > **Audit settings**

### Kusto 诊断查询
**查询 1:**
```kusto
let startDate = ago(30d);
Dynamics365Activity
| where TimeGenerated > startDate
| extend LatencyInHours = datetime_diff('hour', ingestion_time(), TimeGenerated)
| project TimeGenerated, ingestion_time(), LatencyInHours
| summarize avg(LatencyInHours) by bin(TimeGenerated, 1h)
| sort by avg_LatencyInHours desc
```

**查询 2:**
```kusto
let startDate = ago(30d);
Dynamics365Activity
| where TimeGenerated > startDate
| extend LatencyInHours = datetime_diff('hour', ingestion_time(), _TimeReceived)
| project TimeGenerated, ingestion_time(), LatencyInHours
| summarize avg(LatencyInHours) by bin(TimeGenerated, 1h)
| sort by avg_LatencyInHours desc
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 17: Common Issues
> 来源: ado-wiki-b-entra-id-aad-connector-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Go to Entra ID
2. Select "Diagnostics setting" and "+add new".
3. Select "Send to Log Analytics" (and select the relevant subscription and workspace)
4. select: Entra ID Sign-in logs & Entra ID Audit logs
5. click "Save"
6. Ask him to log in and out of the Portal.
7. Try activating the AAD connector again.
8. If the issue persists, go to Entra ID Extension from the portal search bar.
9. In Entra ID, go to the "Diagnostic settings" page under "Monitoring."<br>
10. In the Diagnostic settings page, you should see a list of connected workspaces, if there are more than 5, that is the limit, and to add a different workspace, the customer must remove one of the connected workspaces before he can add a new one. ( please let us know if there was 5 )
11. On the Diagnostic settings page, we will click on "+ Add diagnostic setting."
12. In the Add diagnostic setting page, first give a name to the new setting, select Audit logs and Signup Logs from the right, and "Send to log analytics workspace" on the left.
13. After selecting Send to log analytics workspace, select the Subscription and Sentinel workspace that the customer would like to use.<br>
14. After all, it is selected hit save of the top right. If all went okay, the logs should now be connected to Sentinel and checked in Sentinel to see.
15. If the customer still can't activate it, it is most likely an issue with diagnostic settings.

### Portal 导航路径
- Entra ID Extension from the portal search bar
- the "Diagnostic settings" page under "Monitoring

### Kusto 诊断查询
**查询 1:**
```kusto
let _startTime = datetime(2024-01-31T18:40:00Z);
let _endTime = datetime(2024-02-02T18:40:00Z);
let _operationName = 'microsoft.aadiam/diagnosticSettings/write';
let _tenant = '<TID>';
cluster("Armprod").database("ARMProd").EventServiceEntries
| where TIMESTAMP between (_startTime .. _endTime)
| where tenantId contains _tenant
| where operationName contains _operationName
| sort by TIMESTAMP
| project-reorder TIMESTAMP, status, operationName, operationId, resourceProvider, resourceUri, eventName
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 18: Salesforce Service Cloud Data Connector - Setup and Troubleshooting
> 来源: ado-wiki-b-salesforce-service-cloud-connector.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Sign up at https://developer.salesforce.com/signup (use personal email)
2. Note the username (SalesforceUser)
3. Verify account via email
4. Set password (SalesforcePass)

### API 端点
```
POST https://<instance>.my.salesforce.com/services/oauth2/token
```

---

## Scenario 19: Declare variable choice and assign value 4
> 来源: ado-wiki-b-syslog-test-examples.md | 适用: Mooncake ⚠️ 未明确

### API 端点
```
GET https://..."
```
```
GET https://..."
```

---

## Scenario 20: Training Sessions
> 来源: ado-wiki-b-unified-connectors-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Data Collection Endpoint (DCE) Creation**
2. **Log Analytics Custom Tables Creation**
3. **Data Collection Rule (DCR) Creation**
4. **Start with Error Query**: Use the main error query to identify patterns
5. **Follow Session Journey**: Use SessionId to trace complete user experience
6. **Correlate with Backend**: Use CorrelationId to match frontend errors with backend issues
7. **Check Performance**: Review performance markers if users report slowness
8. **Browser Compatibility**: Check Browser and BrowserVersion fields for compatibility issues

### Portal 导航路径
- the tenant's Unified Connectors UI gallery (in the SCC portal)
- the browser's Developer Tools  Network tab, then refresh the page
- the connector page and review the status details

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 21: Glossary
> 来源: ado-wiki-b-win-ama-connectors-tsg.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- the file and search for any indicative errors that might point to the error (fault Xpath for example)

### API 端点
```
GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}/extensions/{vmExtensionName}?api-version=2021-07-01`
```
```
GET https://management.azure.com/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Insights/dataCollectionRules/{dataCollectionRuleName}?api-version=2019-11-01-preview`
```
```
GET https://management.azure.com/{resourceUri}/providers/Microsoft.Insights/dataCollectionRuleAssociations?api-version=2019-11-01-preview`
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 22: Creatre a filter to pull something that is unique for the log source in this case "FTD"
> 来源: ado-wiki-c-cisco-ftd-custom-api-connector.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
ciscoftd_CL
| extend Parser = extract_all(@"(\w+\s+\d+\s\d+:\d+:\d+)\s(\S+)\s%(FTD)\S(\d+)\S(\d+): (.*)",dynamic([1,2,3,4,5,6]),Message)
| mv-expand Parser
| extend Epoch = tostring(Parser[0]),
        DeviceName = tostring(Parser[1]),
        LogType = tostring(Parser[2]),
        ReasonCode = tostring(Parser[3]),
        ErrorCode = tostring(Parser[4]),
        Substring = tostring(Parser[5])
| extend DeviceUUID = tostring(extract(@"DeviceUUID: (\S+)",1,Substring)),
        SrcIP = tostring(extract(@"SrcIP: (\S+),",1,Substring)),
        DstIP = tostring(extract(@"DstIP: (\S+),",1,Substring)),
        SrcPort = tostring(extract(@"SrcPort: (\S+),",1,Substring)),
        DstPort = tostring(extract(@"DstPort: (\S+),",1,Substring)),
        Protocol = tostring(extract(@"Protocol: (\S+),",1,Substring)),
        IngressInterface = tostring(extract(@"IngressInterface: (\S+),",1,Substring)),
        EgressInterface = tostring(extract(@"EgressInterface: (\S+),",1,Substring)),
        IngressZone = tostring(extract(@"IngressZone: (\S+),",1,Substring)),
        EgressZone = tostring(extract(@"EgressZone: (\S+),",1,Substring)),
        Priority = tostring(extract(@"Priority: (\S+),",1,Substring)),
        GID = tostring(extract(@"GID: (\S+),",1,Substring)),
        SID = tostring(extract(@"SID: (\S+),",1,Substring)),
        Revision = tostring(extract(@"Revision: (\S+),",1,Substring)),
        Message = tostring(extract(@"Message: (\S+),",1,Substring)),
        Classification = tostring(extract(@"Classification: (\S+),",1,Substring)),
        User = tostring(extract(@"User: (\S+),",1,Substring)),
        IntrusionPolicy = tostring(extract(@"IntrusionPolicy: (\S+),",1,Substring)),
        ACPolicy = tostring(extract(@"ACPolicy: (\S+),",1,Substring)),
        NAPPolicy = tostring(extract(@"IntrusionPolicy: (\S+),",1,Substring))
| project-away Parser,Substring
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 23: make gtls driver the default and set certificate files
> 来源: ado-wiki-c-rsyslog-tls-configuration.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---
