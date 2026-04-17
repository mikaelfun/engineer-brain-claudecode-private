# Defender 监控代理 (MMA/AMA/OMS) — 排查工作流

**来源草稿**: ado-wiki-a-mma-baselines-product-knowledge.md, ado-wiki-a-tsg-migrated-mma-to-ama-not-working.md, ado-wiki-a-tsg-mma-baseline-value-mismatch.md, ado-wiki-b-tsg-auoms.md, ado-wiki-b-tsg-log-analytics-agent-azure-vms.md, ado-wiki-b-tsg-windows-mma.md, ado-wiki-b-what-is-auoms.md, ado-wiki-d-fim-over-mma-tsg.md, onenote-linux-auditd-auoms.md, onenote-monitoring-agent-deployment-options.md, onenote-monitoring-agent-deployment.md, onenote-oms-agent-tsg.md
**场景数**: 10
**生成日期**: 2026-04-07

---

## Scenario 1: Overview (Mma Baselines Product Knowledge)
> 来源: ado-wiki-a-mma-baselines-product-knowledge.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. If a resource has any Baseline row where AnalyzeResult == "Failed" -> then the resource status is "Not Healthy".
2. If a resource has rows in the Baseline table, and for all of them AnalyzeResult == "Success"-> then the resource status is "Healthy".

### Kusto 诊断查询
**查询 1:**
```kusto
SecurityBaseline
| where (BaselineType =~ 'WindowsOS' or BaselineType =~ 'Windows OS' or BaselineType =~ 'Linux' or BaselineType =~ 'Oms.Linux' or BaselineType =~ 'Web' or (isempty(BaselineType) and isnotempty(TimeGenerated))) 
| summarize arg_max(TimeGenerated, *) by SourceComputerId, Computer, BaselineRuleId, RuleSeverity, BaselineRuleType
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 2: Overview (Tsg Migrated Mma To Ama Not Working)
> 来源: ado-wiki-a-tsg-migrated-mma-to-ama-not-working.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Was auto-provisioning used? If so, which workspace (system-defined or user-defined)?
2. If not, was the deployment done via Policy?
3. For manual installation — verify each pipeline component was created correctly.

---

## Scenario 3: I see a different value on the machine compared with the value I see in MDC
> 来源: ado-wiki-a-tsg-mma-baseline-value-mismatch.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Go to Recommendations > "Machines should be configured securely"
2. Run the SecurityBaseline query on each workspace the machine reports to:
3. **If workspace matches MDC but not machine** → Agent issue → open ticket with ASM-Dev team
4. **If workspace matches machine but not MDC** → Could be:
5. **To distinguish agent vs MDC issue**, collect from workspace:
6. **If all fields are valid** → MDC discrepancy → open CRI ticket with:

### Portal 导航路径
- Recommendations > "Machines should be configured securely"
- ticket with ASM-Dev team
- CRI ticket with:

### Kusto 诊断查询
**查询 1:**
```kusto
SecurityBaseline
   | where (BaselineType =~ 'WindowsOS' or BaselineType =~ 'Windows OS' or BaselineType =~ 'Linux' or BaselineType =~ 'Oms.Linux' or BaselineType =~ 'Web' or (isempty(BaselineType) and isnotempty(TimeGenerated)))
   | summarize arg_max(TimeGenerated, *) by SourceComputerId, Computer, BaselineRuleId, RuleSeverity, BaselineRuleType
   | where BaselineRuleId =~ "<baseline_rule_id>"
   | where SubscriptionId == "<subscription_id>" or isempty(SubscriptionId)
```

---

## Scenario 4: AUOMS Troubleshooting Guide
> 来源: ado-wiki-b-tsg-auoms.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Create a file named `000local.rules` with the contents:
2. Copy the file to `/etc/opt/microsoft/auoms/rules.d`
3. Download the MDE analyser:
4. Check the file `auditd_log_analysis.txt`

### Kusto 诊断查询
**查询 1:**
```kusto
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics
| where AzureResourceSubscriptionId == "{subscriptionId}"
```

### 脚本命令
```powershell
./mde_support_tool.sh -d
```

```powershell
vi /etc/audit/rules.d/audit.rules
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: Log Analytics Agent (MMA) TSG for Azure VMs
> 来源: ado-wiki-b-tsg-log-analytics-agent-azure-vms.md | 适用: Mooncake ✅

### 排查步骤
1. All Events
2. Common Events
3. Minimal Events
4. Set auto provisioning to "Connect Azure VMs to the default workspace(s) created by Defender for Cloud" → Apply and Save
5. Reconfigure to desired workspace → popup appears for scope selection
6. Select **"Existing and new VMs"**
7. Go to Log Analytics workspace → Computer data sources → Virtual Machines
8. Find the machine and check status:
9. Agent not reporting data or heartbeat missing
10. Agent extension deployment failing
11. Agent crashing
12. Agent consuming high CPU/memory
13. Installation/uninstallation failures
14. Custom logs issue
15. OMS Gateway issue
16. Performance counters issue

### Portal 导航路径
- Log Analytics workspace → Computer data sources → Virtual Machines

### Kusto 诊断查询
**查询 1:**
```kusto
SecurityEvent
| project EventID
| extend DataTier = case(
    EventID in (1102,4624,4625,4657,4663,4688,4700,4702,4719,4720,4722,4723,4724,4727,4728,4732,4735,4737,4739,4740,4754,4755,4756,4767,4799,4825,4946,4948,4956,5024,5033,8001,8002,8003,8004,8005,8006,8007,8222), "Minimal",
    EventID in (1,299,300,324,340,403,404,410,411,412,413,431,500,501,1100,1102,1107,1108,4608,4610,4611,4614,4622,4624,4625,4634,4647,4648,4649,4657,4661,4662,4663,4665,4666,4667,4688,4670,4672,4673,4674,4675,4689,4697,4700,4702,4704,4705,4716,4717,4718,4719,4720,4722,4723,4724,4725,4726,4727,4728,4729,4733,4732,4735,4737,4738,4739,4740,4742,4744,4745,4746,4750,4751,4752,4754,4755,4756,4757,4760,4761,4762,4764,4767,4768,4771,4774,4778,4779,4781,4793,4797,4798,4799,4800,4801,4802,4803,4825,4826,4870,4886,4887,4888,4893,4898,4902,4904,4905,4907,4931,4932,4933,4946,4948,4956,4985,5024,5033,5059,5136,5137,5140,5145,5632,6144,6145,6272,6273,6278,6416,6423,6424,8001,8002,8003,8004,8005,8006,8007,8222,26401,30004), "Common",
    "Non-Common-Non-Minimal")
| summarize count(EventID) by DataTier
| union (SecurityEvent | project EventID | extend DataTier = "All" | summarize count(EventID) by DataTier)
```

**查询 2:**
```kusto
Usage
| where TimeGenerated > ago(32d)
| where StartTime >= startofday(ago(31d)) and EndTime < startofday(now())
| where IsBillable == true
| summarize BillableDataGB = sum(Quantity) / 1000 by Solution, DataType
| sort by Solution asc, DataType asc
```

**查询 3:**
```kusto
SecurityEvent
| summarize countofEvents = count() by EventID, Computer
| sort by countofEvents desc
```

### 脚本命令
```powershell
$workspaceId = "<Your workspace Id>"
$workspaceKey = "<Your workspace Key>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.AddCloudWorkspace($workspaceId, $workspaceKey)
$mma.ReloadConfiguration()
```

```powershell
$workspaceId = "<Your workspace Id>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.RemoveCloudWorkspace($workspaceId)
$mma.ReloadConfiguration()
```

---

## Scenario 6: Windows MMA Troubleshooting
> 来源: ado-wiki-b-tsg-windows-mma.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Go to Log Analytics workspace → Computer data sources → Virtual Machines
2. Find the machine, check status:
3. Go to Control Panel → Microsoft Monitoring Agent
4. Review agent status — errors listed here
5. Verify service running: Services → MicrosoftMonitoringAgent
6. VM → Extensions
7. Verify MicrosoftMonitoringAgent extension is **Successfully provisioned** (not Unavailable)
8. Ensure machine can reach URLs on **port 443**
9. Windows connectivity test:
10. Agent not reporting / heartbeat missing
11. Agent extension deployment failing
12. Agent crashing
13. Agent high CPU/memory
14. Installation/uninstallation failures
15. Custom logs issue
16. OMS Gateway issue
17. Performance counters issue

### Portal 导航路径
- Log Analytics workspace → Computer data sources → Virtual Machines
- Control Panel → Microsoft Monitoring Agent

### Kusto 诊断查询
**查询 1:**
```kusto
let Workspaces = cluster("Romelogs").database("Prod").WorkspaceHealthMonitoringOE
| where SubscriptionId == "{SubscriptionId}"
| where env_time >= ago(2d)
| summarize arg_max(env_time, *) by OmsWorkspaceResourceId
| project OmsWorkspaceResourceId, WorkspaceLocation = Location;
cluster("Romelogs").database("Prod").OmsHealthMonitoringOE
| where SubscriptionId == "{SubscriptionId}"
| where env_time >= ago(1d)
| summarize arg_max(env_time, *) by VmId
| project VmId, LastHeartbeat, IsOmsExtensionInstalled, OmsExtensionVersion,
          OmsWorkspaceId, IsSecurityStandardSolutionEnabled, VmPowerState,
          OmsExtensionProvisioningStatus, ExtensionMessages
```

**查询 2:**
```kusto
Heartbeat
| join ProtectionStatus on Computer
| where TimeGenerated between(datetime(2020-05-01 00:00:00)..datetime(2020-05-06 00:00:00))
| distinct Computer, VMUUID, Solutions, Type
| project Computer, VMUUID, Solutions, Type
```

### 脚本命令
```powershell
$workspaceId = "<Your workspace Id>"
$workspaceKey = "<Your workspace Key>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.AddCloudWorkspace($workspaceId, $workspaceKey)
$mma.ReloadConfiguration()
```

```powershell
$workspaceId = "<Your workspace Id>"
$mma = New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg'
$mma.RemoveCloudWorkspace($workspaceId)
$mma.ReloadConfiguration()
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 7: What is "auoms"?
> 来源: ado-wiki-b-what-is-auoms.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('rome.kusto.windows.net').database('ProdRawEvents').LinuxAuditD
| where Computer has "VMName"
| where TimeCreatedUtc > ago(1h)
```

**查询 2:**
```kusto
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics
| where AgentId == "{agentId}"
```

### 脚本命令
```powershell
sudo /opt/microsoft/auoms/bin/auomsctl status
```

```powershell
journalctl | grep auoms >> /var/log/journalctl_auoms.txt
journalctl | grep auditd >> /var/log/journalctl_auditd.txt
```

```powershell
wget https://github.com/microsoft/auoms-kits/blob/master/release/2.3.4-31/auoms-2.3.4-31.universal.x64.sh
chmod +x auoms-2.3.4-31.universal.x64.sh
sudo ./auoms-2.3.4-31.universal.x64.sh --upgrade
```

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 8: - FIM (File Integrity Monitoring) over MMA (Log Analytics Agent)
> 来源: ado-wiki-d-fim-over-mma-tsg.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- "Microsoft Monitoring Agent" (Name of the service: HealthService
- OperationsManager log and filter to errors/warnings
- `C:\Program Files\Microsoft Monitoring Agent\Agent\Health Service State\Management Packs`

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 9: Linux auditd/auoms Troubleshooting (OMS Agent)
> 来源: onenote-linux-auditd-auoms.md | 适用: Mooncake ⚠️ 未明确

### 脚本命令
```powershell
grep -B 2 -A 2 'nxOMSAuditdPlugin' /var/opt/microsoft/omsconfig/omsconfig.log
grep -B 2 -A 2 'nxOMSAuditdPlugin' /var/opt/microsoft/omsconfig/omsconfigdetailed.log
grep -B 2 -A 2 'Auditd' /var/opt/microsoft/omsconfig/omsconfig.log
```

```powershell
sudo service omsagent-* stop
rm /var/opt/microsoft/omsagent/*/run/auoms.socket
# Install nc if not available: yum install nc
nc -lU /var/opt/microsoft/omsagent/*/run/auoms.socket

# Restore omsagent
rm /var/opt/microsoft/omsagent/*/run/auoms.socket
sudo service omsagent-* start
```

---

## Scenario 10: OMS Agent Troubleshooting Guide
> 来源: onenote-oms-agent-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Open **Control Panel → Microsoft Monitoring Agent**
2. Check the status of the agent and connected workspaces
3. Go to **Log Analytics** workspace
4. Navigate to **Data sources → Virtual machines**
5. Check machine status — look for errors or wrong workspace connection
6. If errors/health issues: **disconnect** then **reconnect** the machine
7. Agent health should update within 5 minutes of reconnecting
8. Go to **Virtual Machines → Extensions**
9. Click on the monitoring agent extension → **Delete**
10. Go to **Log Analytics → Data sources → Virtual machines**
11. Reconnect machine to workspace (auto-installs agent)

### Portal 导航路径
- **Control Panel → Microsoft Monitoring Agent**
- **Log Analytics** workspace
- **Data sources → Virtual machines**
- **Virtual Machines → Extensions**
- **Log Analytics → Data sources → Virtual machines**

### 脚本命令
```powershell
(New-Object -ComObject 'AgentConfigManager.MgmtSvcCfg').GetCloudWorkspaces()
```

```powershell
/opt/microsoft/omsagent/bin/omsadmin.sh -l
```

---
