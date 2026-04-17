# Purview SHIR 安装注册与运行时 — 排查工作流

**来源草稿**: `ado-wiki-change-log-level-k8s-shir.md`, `ado-wiki-collect-logs-shir-k8s.md`, `ado-wiki-collect-process-monitor-logs.md`, `ado-wiki-get-logs-from-shir-scan.md`, `ado-wiki-on-premise-sql-shir-log-filter.md`, `ado-wiki-shir-connectivity.md`, `ado-wiki-shir-k8s-setup.md`, `ado-wiki-shir-k8s-upgrade-delete.md`, `ado-wiki-shir-log-collection.md`, `ado-wiki-shir-proxy-registration.md`, `ado-wiki-shir-reportid-sanity-check.md`, `ado-wiki-shir-setup.md`, `ado-wiki-shir-troubleshooting-package.md`
**Kusto 引用**: 无
**场景数**: 53
**生成日期**: 2026-04-07

---

## Scenario 1: Log Level
> 来源: ado-wiki-change-log-level-k8s-shir.md | 适用: 未标注

### 排查步骤
There are 5 levels for the logs:
- Trace
- Debug
- Information
- Warning
- Error
- Critical
- None

"Warning" is default log level. Please note that case is sensitive while you update log level.

`[来源: ado-wiki-change-log-level-k8s-shir.md]`

---

## Scenario 2: Limitation & Impact
> 来源: ado-wiki-change-log-level-k8s-shir.md | 适用: 未标注

### 排查步骤
Enabling higher log levels will result in worker re-creation and may impact performance and increase disk utilization. Before proceeding, please check the disk pressure. If it's high, follow to clean up the logs. If you need to upload your logs using `irctl log upload`, note that the upload time is limited to 1 hour. You can follow to adjust your logging behavior to control log size based on your network situation. Please revert to the default log level, 'Warning', after troubleshooting is complete.

`[来源: ado-wiki-change-log-level-k8s-shir.md]`

---

## Scenario 3: Prerequisite
> 来源: ado-wiki-change-log-level-k8s-shir.md | 适用: 未标注

### 排查步骤
- The K8s supported Self-Hosted IR has been successfully installed.
- The Kubectl command line tool is installed.
- The K8s cluster is accessible via the Kubectl command line tool, with sufficient permissions to Get and Update Deployments in the compute-fleet-system namespace and Get Pods in all namespaces. Alternatively, you may use the same cluster access credentials used during the K8s SHIR installation.
- (Optional) To clean up existing logs, IRCTL is also required.

`[来源: ado-wiki-change-log-level-k8s-shir.md]`

---

## Scenario 4: Step-1
> 来源: ado-wiki-change-log-level-k8s-shir.md | 适用: 未标注

### 排查步骤
Retrieve the deployment details of the namespace compute-fleet-system. The default log level is set as an environment variable of the containers, which is 'Warning'. Use the following commands:

`$ kubectl get deployments -n compute-fleet-system`

`$ kubectl get -n compute-fleet-system deployment/compute-fleet-controller-manager -o jsonpath="{'LogLevel: '}{.spec.template.spec.containers[?(@.name=='manager')].env[?(@.name=='LogLevel')].value}{'\n'}"`

LogLevel: Warning

`[来源: ado-wiki-change-log-level-k8s-shir.md]`

---

## Scenario 5: Step-2
> 来源: ado-wiki-change-log-level-k8s-shir.md | 适用: 未标注

### 排查步骤
Update the environment variable LogLevel to 'Trace' to enable verbose logging. Use the following command:

`$ kubectl set env deployment/compute-fleet-controller-manager LogLevel=Trace -n compute-fleet-system`

`$ kubectl get -n compute-fleet-system deployment/compute-fleet-controller-manager -o jsonpath="{'LogLevel: '}{.spec.template.spec.containers[?(@.name=='manager')].env[?(@.name=='LogLevel')].value}{'\n'}"`

LogLevel: Trace

`[来源: ado-wiki-change-log-level-k8s-shir.md]`

---

## Scenario 6: Step-3
> 来源: ado-wiki-change-log-level-k8s-shir.md | 适用: 未标注

### 排查步骤
Please verify that the new setting has been applied to the K8s Self-Hosted IR Pods. Ensure that the Pods have been re-created due to the changes in Step 2. You can use the command below to check the Pods.

`$ kubectl get pods -A -l 'app.kubernetes.io/name in (batch-defaultspec, interactive-schemaprocess)'`

`[来源: ado-wiki-change-log-level-k8s-shir.md]`

---

## Scenario 7: Steps to clean up existing logs
> 来源: ado-wiki-change-log-level-k8s-shir.md | 适用: 未标注

### 排查步骤
List existing logs under irstorage of K8s Shir. You can use the following commands:

`$ ./irctl storage list ./_log/workload`

`$ ./irctl storage list ./_log/infra`

Please delete the logs under irstorage. Ensure that you do not delete the _log directory directly. You may use the following commands:

`$ ./irctl storage delete ./_log/workload`

`$ ./irctl storage delete ./_log/infra`

`[来源: ado-wiki-change-log-level-k8s-shir.md]`

---

## Scenario 8: Changing Log Level
> 来源: ado-wiki-collect-logs-shir-k8s.md | 适用: 未标注

### 排查步骤
If you wish to change log level for troubleshooting complex issue such as scan perf issue, please refer to TSG "How to change log level for K8s SHIR" and update log level to "Trace" before collecting logs.

`[来源: ado-wiki-collect-logs-shir-k8s.md]`

---

## Scenario 9: Command for SHIR log uploading
> 来源: ado-wiki-collect-logs-shir-k8s.md | 适用: 未标注

### 排查步骤
Unlike SHIR in Windows which logs by a single button click, please run the command `./irctl log upload` to upload SHIR logs in K8s. Copy the log upload id for further troubleshooting purpose.

`[来源: ado-wiki-collect-logs-shir-k8s.md]`

---

## Scenario 10: Kusto table for SHIR log in K8s
> 来源: ado-wiki-collect-logs-shir-k8s.md | 适用: 未标注

### 排查步骤
Unlike SHIR in Windows which logs are stored in TraceGatewayLocalEventLog, please leverage the following tables for logs in K8s:

```kql
TaskHostingEvent
| where LogUploadId has "<log-upload-id>"

OperatorOps
| where LogUploadId has "<log-upload-id>"

ComputeDefaultLogEvent
| where LogUploadId has "<log-upload-id>"
```

`[来源: ado-wiki-collect-logs-shir-k8s.md]`

---

## Scenario 11: When to Use
> 来源: ado-wiki-collect-process-monitor-logs.md | 适用: 未标注

### 排查步骤
System.IO.FileLoadException in SHIR logs, e.g.:
> System.IO.FileLoadException: Could not load file or assembly 'Newtonsoft.Json, Version=11.0.0.0' ... The located assembly's manifest definition does not match the assembly reference. (Exception from HRESULT: 0x80131040)

`[来源: ado-wiki-collect-process-monitor-logs.md]`

---

## Scenario 12: Steps
> 来源: ado-wiki-collect-process-monitor-logs.md | 适用: 未标注

### 排查步骤
1. Download Process Monitor (https://learn.microsoft.com/en-us/sysinternals/downloads/procmon), unzip on SHIR machine
2. Start Process Monitor (events captured automatically)
3. Reproduce by re-running the scan on SHIR
4. Once scan fails, save the log file (default PML format)
5. Share the log file for analysis

`[来源: ado-wiki-collect-process-monitor-logs.md]`

---

## Scenario 13: Solution:
> 来源: ado-wiki-get-logs-from-shir-scan.md | 适用: 未标注

### 排查步骤
Self Host Logs will not appear in Kusto; this means you will need to look into the event viewer under the  
"Connecters - Integration Runtime" log. 
 
There are Three options on how to get logs from the customer (detailed instructions below). 
1. Send Logs options 
2. Ask them send the event viewer logs. This is painful because you will need to browse through the logs to find the error. Hopefully you'll spot the errors right away - but sometimes it's not an error your looking for. 
3. Powershell to Text. This is the easiest to parse.

`[来源: ado-wiki-get-logs-from-shir-scan.md]`

---

## Scenario 14: Option 1: Send Logs
> 来源: ado-wiki-get-logs-from-shir-scan.md | 适用: 未标注

### 排查步骤
1. Ask the Customer to Send Logs in the Integration runtime  
2. A report Id will appear. The customer must send this information. 
3. Wait 20+ minutes and the logs will be in ADF 

```
Execute: [Web] [Desktop] [Web (Lens)] [Desktop (SAW)] https://azuredm.kusto.windows.net/AzureDataMovement 
TraceGatewayLocalEventLog 
| where UserReportId contains "report-id-from-customer" 
```

`[来源: ado-wiki-get-logs-from-shir-scan.md]`

---

## Scenario 15: Option 2: UI Approach to get Logs
> 来源: ado-wiki-get-logs-from-shir-scan.md | 适用: 未标注

### 排查步骤
1. Open the self host console 
2. View the logs from the console View Logs button under the diagnostic window 
3. Event Viewer will popup. Make sure you have the proper item selected.

`[来源: ado-wiki-get-logs-from-shir-scan.md]`

---

## Scenario 16: Option 3: PowerShell
> 来源: ado-wiki-get-logs-from-shir-scan.md | 适用: 未标注

### 排查步骤
```
Get-WinEvent -LogName * 
 
Get-WinEvent -LogName "Connectors - Integration Runtime" | Format-List -Property Message 
```

`[来源: ado-wiki-get-logs-from-shir-scan.md]`

---

## Scenario 17: On-premise SQL Server Scan Troubleshooting
> 来源: ado-wiki-on-premise-sql-shir-log-filter.md | 适用: 未标注

### 排查步骤
Filter SHIR logs with Customer provided Report Id:

```kql
TraceGatewayLocalEventLog
| where UserReportId =="06c039b9-3fb8-4b29-88ec-7b5d772a535c"
| where LocalMessage contains "SQL2017" //If you know the SQL instance name 
| project PreciseTimeStamp, LocalMessage
| where LocalMessage contains "ExecutionDataScanActivity"
| order by PreciseTimeStamp desc
```

Use this query template to filter Self-Hosted Integration Runtime (SHIR) logs for on-premise SQL Server scan failures. Replace the UserReportId and SQL instance name with actual values from the customer's scan result.

`[来源: ado-wiki-on-premise-sql-shir-log-filter.md]`

---

## Scenario 18: Prerequisite
> 来源: ado-wiki-shir-k8s-setup.md | 适用: 未标注

### 排查步骤
Make sure you have Purview account. Your Purview account should be either Enterprise account or a new purview account after Dec 2023.

Download IRCTL to a machine that can connect to the K8s cluster:
- IRCTL on Linux: https://aka.ms/purview-irctl/irctl-linux-latest.tar.gz
- IRCTL on Windows: https://aka.ms/purview-irctl/irctl-windows-latest.zip
- Release notes: https://aka.ms/purview-irctl/releasenotes

`[来源: ado-wiki-shir-k8s-setup.md]`

---

## Scenario 19: On-prem Kubernetes Cluster Requirements
> 来源: ado-wiki-shir-k8s-setup.md | 适用: 未标注

### 排查步骤
- **Container type**: Linux
- **Kubernetes version**: 1.24.9 or above
- **Node OS**: Ubuntu 18.04 x64 or above
- **Node spec**: minimal 8 cores CPU, 32 GB Memory, 80GB available disk
- **Node count**: >= 1 (fixed node count, NOT enable cluster auto scaler)

`[来源: ado-wiki-shir-k8s-setup.md]`

---

## Scenario 20: AKS Requirements
> 来源: ado-wiki-shir-k8s-setup.md | 适用: 未标注

### 排查步骤
- **Node Size**: higher than D8s_v3
- **OS type**: Linux
- **OS Sku**: Azure Linux
- **Scalability**: Disable Node auto-scale
- **Node count**: >= 1

`[来源: ado-wiki-shir-k8s-setup.md]`

---

## Scenario 21: Create SHIR in Purview Studio
> 来源: ado-wiki-shir-k8s-setup.md | 适用: 未标注

### 排查步骤
1. Append feature flag `feature.ext.datasource={"enableUXK8sSHIR":"true"}` at the end of Purview URL
2. Create SHIR from Data Map → Source management → Integration runtimes → + New
3. Provide a name, turn on Kubernetes service support, click Create
4. Generate key for SHIR registration

`[来源: ado-wiki-shir-k8s-setup.md]`

---

## Scenario 22: Install SHIR in AKS
> 来源: ado-wiki-shir-k8s-setup.md | 适用: 未标注

### 排查步骤
1. Connect to AKS cluster via Azure CLI
2. cd to IRCTL directory
3. Execute: `./irctl create --registration-key <key> --selector agentpool=<your-user-pool>`
4. Registration takes 5-30 minutes

`[来源: ado-wiki-shir-k8s-setup.md]`

---

## Scenario 23: Check Status
> 来源: ado-wiki-shir-k8s-setup.md | 适用: 未标注

### 排查步骤
- `./irctl describe` — monitor installation progress and current SHIR status
- If node selector is not specified, all nodes will be used
- For AKS, suggest using AKS node pool label as node selector

`[来源: ado-wiki-shir-k8s-setup.md]`

---

## Scenario 24: Upgrade SHIR
> 来源: ado-wiki-shir-k8s-upgrade-delete.md | 适用: 未标注

### 排查步骤
1. cd to IRCTL directory
2. Check version: `./irctl --version`
3. Upgrade: `./irctl --upgrade`
4. Upgrade takes 5-30 minutes

`[来源: ado-wiki-shir-k8s-upgrade-delete.md]`

---

## Scenario 25: Delete K8s SHIR
> 来源: ado-wiki-shir-k8s-upgrade-delete.md | 适用: 未标注

### 排查步骤
1. Run command: `./irctl delete`
2. This deregisters SHIR and deletes local resources

`[来源: ado-wiki-shir-k8s-upgrade-delete.md]`

---

## Scenario 26: Where SHIR logs are stored
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
SHIR logs are stored in Event Viewer on Windows: Application and Service Logs → Integration Runtime.

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 27: Log Retention
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
No specific retention period. New logs overwrite oldest logs once max log size is reached.

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 28: When to Increase Log Size
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
- If scan discovers thousands of assets → increase log size before reproducing
- Check asset count via:
```kql
database("babylonMdsLogs").Scan_Results
| where scanResultId == "<run-id>"
| project TIMESTAMP, scanResultId, resultType, TotalScanTimeTakenInMinutes, assetsDiscovered, dataSourceType, AccountName
| limit 1
```

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 29: How to Increase Log Size
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
1. Event Viewer → Applications and Services Logs
2. Right-click Connectors-Integration Runtime → Properties
3. Change maximum log size to 4GB
4. Ensure Enable logging is selected

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 30: How to Upload SHIR Log
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
Integration Runtime Configuration Manager → Diagnostics → Send logs → collect Report ID

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 31: When to Upload Event Viewer Log
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
Upload immediately after issue is reproduced. Collect:
- Scan run ID
- Report ID
- Troubleshooting package for 3rd party data sources
- Scan monitor logs if scan completed with exception

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 32: How to Validate Report ID
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
```kql
cluster('azuredmprod').database('AzureDataMovement').TraceGatewayLocalEventLog
| where UserReportId == '<report-id>'
| where LocalTimestamp > <scan-start-time-UTC>
| where LocalTimestamp < <scan-finish-time-UTC>
| where * contains "<scan-run-id>"
| project LocalTimestamp, LocalTraceLevel, LocalMessage
| order by LocalTimestamp asc
```

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 33: Log Retention in Kusto
> 来源: ado-wiki-shir-log-collection.md | 适用: 未标注

### 排查步骤
Log retention in Kusto is **3 weeks**. If uploaded > 3 weeks ago, reproduce and recollect.

`[来源: ado-wiki-shir-log-collection.md]`

---

## Scenario 34: Issue Background
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
While customer tries to register SHIR with proxy enabled, he may get the following error message:
"The Integration Runtime (Self-hosted) node has encountered an error during registration."

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 35: Root Cause Analysis
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
This is because the on-prem SHIR machine cannot connect to Purview cloud service endpoint. So that SHIR service cannot be online.

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 36: Pre-requisite
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
Please make sure customer downloads the right Purview integration runtime from [Purview SHIR](https://www.microsoft.com/en-ca/download/details.aspx?id=105539). If customer downloads SHIR from ADF website, please request customer to download it from Purview site.

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 37: Cloud Endpoints needed to be connected
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
The following lists all the cloud endpoints where SHIR needs to connect to. You can find all details from [Create and manage a self-hosted integration runtime](https://learn.microsoft.com/en-us/purview/manage-integration-runtimes).

All endpoints use outbound port 443. Domains cover public cloud, Azure Government, and China regions.

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 38: Scenario 1: System proxy with PE
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
1. Find all PEs' IP including managed queue and blob IP from the portal, run **Test-NetConnection** for each. Ensure resolved IP is correct and TCP test succeeds.
2. Refer to [Create and manage a self-hosted integration runtime](https://learn.microsoft.com/en-us/purview/manage-integration-runtimes) and whitelist IP of all PEs by updating config files.
3. If issue persists, collect **event viewer logs** and **network trace** before escalating.

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 39: Scenario 2: System proxy without PE
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
1. Refer to "Cloud Endpoint needed to be connected" section. Ensure proxy can connect to those endpoints successfully. Note: wildcard is needed as there are no dedicated endpoints.
2. If issue persists, collect network trace from **customer's proxy server** (trace from SHIR machine only shows connection to proxy). Also collect Event Viewer logs.

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 40: Scenario 3: Custom proxy with PE
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
1. Find all PEs' IP including managed queue and blob IP from the portal.
2. Whitelisting IP is not available for custom proxy. Customer must ensure their proxy server can resolve the correct private IP for each PE, and proxy can connect to all PEs and Cloud Endpoints successfully.

**Note**: **Test-NetConnection** will NOT help determine RCA in custom proxy scenarios, as it only tests connection between SHIR machine and cloud endpoints without going through the proxy.

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 41: Scenario 4: Custom proxy without PE
> 来源: ado-wiki-shir-proxy-registration.md | 适用: 未标注

### 排查步骤
Same action plan as Scenario 2.

`[来源: ado-wiki-shir-proxy-registration.md]`

---

## Scenario 42: Background
> 来源: ado-wiki-shir-reportid-sanity-check.md | 适用: 未标注

### 排查步骤
Uploaded SHIR logs might not contain related scan data, and logs for a scan can be split across different reports. Sanity check is essential BEFORE submitting info to ICM.

`[来源: ado-wiki-shir-reportid-sanity-check.md]`

---

## Scenario 43: Before Sanity Check (Optional)
> 来源: ado-wiki-shir-reportid-sanity-check.md | 适用: 未标注

### 排查步骤
Have customer upload SHIR logs, rerun the scan, upload logs again. Use latest reportId and scanResultId.

`[来源: ado-wiki-shir-reportid-sanity-check.md]`

---

## Scenario 44: Step 1: Validate reportId
> 来源: ado-wiki-shir-reportid-sanity-check.md | 适用: 未标注

### 排查步骤
1. Get ADF activityId for the scan run (see TSG: Get-all-ADF-datascan-activityIds-for-a-scan-run)
2. Find reportId by activityId from Kusto:
```kql
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where LocalMessage contains <activityId>
| summarize by UserReportId
```
3. Verify UserReportId matches the given reportId

`[来源: ado-wiki-shir-reportid-sanity-check.md]`

---

## Scenario 45: Step 2: Verify reportId has all logs
> 来源: ado-wiki-shir-reportid-sanity-check.md | 适用: 未标注

### 排查步骤
```kql
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where UserReportId == <reportId>
| where LocalMessage has "Integration Runtime node event" or LocalMessage has "Integration Runtime node event logs have been uploaded to Microsoft with ReportId"
| project LocalMessage
```
If a separate reportId appears, repeat Step 2 with the new reportId until no more sub-reportIds are found.

`[来源: ado-wiki-shir-reportid-sanity-check.md]`

---

## Scenario 46: Step 3: Collect all reportIds
> 来源: ado-wiki-shir-reportid-sanity-check.md | 适用: 未标注

### 排查步骤
- One master reportId + one/multiple sub reportIds
- **PASS**: If logs exist → valid reportId, submit scanResultId + all reportIds to ICM
- **FAIL**: Logs incomplete → follow steps to re-upload

`[来源: ado-wiki-shir-reportid-sanity-check.md]`

---

## Scenario 47: Steps to Upload Complete SHIR Logs
> 来源: ado-wiki-shir-reportid-sanity-check.md | 适用: 未标注

### 排查步骤
1. On customer SHIR machine: Computer Management > Event Viewer > Applications and Services Logs
2. Right-click "Connectors-Integration Runtime" > Properties
3. Select "Do not overwrite events (clear logs manually)" > increase max log size > Apply
4. Click "Clear Log" before rerunning scan
5. Repeat for "Integration Runtime"
6. Rerun scan, upload logs, repeat sanity check

`[来源: ado-wiki-shir-reportid-sanity-check.md]`

---

## Scenario 48: Step 4: Query Exceptions (Optional)
> 来源: ado-wiki-shir-reportid-sanity-check.md | 适用: 未标注

### 排查步骤
```kql
cluster("https://azuredmprod.kusto.windows.net").database("AzureDataMovement").
TraceGatewayLocalEventLog
| where UserReportId == reportId
| where LocalMessage contains <activityId>
| project LocalTimestamp, LocalMessage, ActivityId
```

`[来源: ado-wiki-shir-reportid-sanity-check.md]`

---

## Scenario 49: SHIR Setup TSGs (from ADF, applicable to Purview)
> 来源: ado-wiki-shir-setup.md | 适用: 未标注

### 排查步骤
- [How to setup SHIR services with customized account](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/436552/How-to-setup-SHIR-services-with-customized-account)
- [Failed to grant IR service account the access to the certificate - Error code 103](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/403991/Failed-to-grant-Integration-Runtime-service-account-the-access-of-to-the-certificate-'xxxxxxxxxxxxxxx'.-Error-code-103)
- [SHIR offline due to SSL connection failure](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/400684/SelfHosted-IR-offline-due-to-SSL-connection-failure)
- [Configure SHIR Proxy](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/389513/Configure-SHIR-proxy)
- [Register SHIR failed due to FIPSAlgorithmPolicy](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/387194/Register-Integration-Runtime-(Self-hosted)-failed-due-to-FIPSAlgorithmPolicy)
- [Self help Document Self Hosted IR Setup](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/377933/-Self-help-Document-Self-Hosted-IR-Setup)
- [Could not find Register button to register a SHIR](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286731/Could-not-find-Register-button-to-register-a-Self-hosted-Integration-Runtime)
- [SHIR in VMSS](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286748/SHIR-in-VMSS)
- [SHIR Gateway Downgrade](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286735/Self-hosted-IR(slash)Gateway-Downgrade)
- [Service (DIAHostService) failed to start](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286746/Service(DIAHostService)-failed-to-start)
- [Collecting Self-hosted IR logs](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286740/Collecting-Self-hosted-IR-logs)
- [Gateway/Self-hosted IR not get Updated](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286732/Gateway(slash)Self-hosted-IR-not-get-Updated) — Customer see their on-prem gateway or self-hosted IR hasn't been auto upgraded.
- [Install/Uninstall IR failed](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286743/Install(slash)Uninstall-IR-failed) — Customer cannot uninstall/install/upgrade IR.
- [Unable to register the self-hosted IR on a new Machine when get_LoopbackIpOrName](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286769/Unable-to-register-the-self-hosted-IR-on-a-new-Machine-when-get_LoopbackIpOrName)
- [Use PowerShell to register a Self-hosted Integration Runtime](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/286733/Use-PowerShell-to-register-a-Self-hosted-Integration-Runtime) — When Register button is not available.
- [SHIR Could not add New Node](https://supportability.visualstudio.com/AzureDataFactory/_wiki/wikis/AzureDataFactory/322847/SHIR-Could-not-add-New-Node)

`[来源: ado-wiki-shir-setup.md]`

---

## Scenario 50: How to Collect Valid Troubleshooting Package
> 来源: ado-wiki-shir-troubleshooting-package.md | 适用: 未标注

### 排查步骤
The troubleshooting package is essential for addressing issues related to third-party data sources.

`[来源: ado-wiki-shir-troubleshooting-package.md]`

---

## Scenario 51: Step 1: Enable Troubleshooting Flag
> 来源: ado-wiki-shir-troubleshooting-package.md | 适用: 未标注

### 排查步骤
Enable the troubleshooting package flag during Data Source registration.

`[来源: ado-wiki-shir-troubleshooting-package.md]`

---

## Scenario 52: Step 3: Collect Package
> 来源: ado-wiki-shir-troubleshooting-package.md | 适用: 未标注

### 排查步骤
After scan finishes, troubleshooting package files are generated at:
`C:\windows\ServiceProfiles\DIAHostService\AppData\Local\Microsoft\Purview\Troubleshooting`

`[来源: ado-wiki-shir-troubleshooting-package.md]`

---

## Scenario 53: Q&A
> 来源: ado-wiki-shir-troubleshooting-package.md | 适用: 未标注

### 排查步骤
**Q: Do I need to collect for every scan run?**
A: Yes, a new scan creates a new package and overwrites previous folders.

**Q: Can I share steps with customer and request logs?**
A: No. Schedule a Teams call with CX, guide them to collect logs. Validate before escalating. A valid folder has folders for options, props, and schema.

**Q: What logs are required for 3rd party scan issues?**
A: Collect promptly after issue scan:
- Scan run ID
- Report ID
- Troubleshooting package

`[来源: ado-wiki-shir-troubleshooting-package.md]`

---
