# Defender Defender for Storage — 排查工作流

**来源草稿**: ado-wiki-a-defender-for-storage-tsg.md, ado-wiki-b-defender-for-storage-v2-internal-faq.md, ado-wiki-b-enabling-on-upload-malware-scanning-bicep.md, ado-wiki-b-storage-atp-alerts.md, ado-wiki-c-defender-for-storage-overview.md, ado-wiki-c-kql-queries-malware-scanning.md
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: Storage Accounts MDC enablement status and type
> 来源: ado-wiki-a-defender-for-storage-tsg.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
let startDateTime = datetime(2023-01-01);
let endDateTime = datetime(2023-01-31); //replace with presumed change date range
cluster("Armprod").database("ARMProd").EventServiceEntries
| where subscriptionId == "{subscriptionId}"
| where TIMESTAMP between (startDateTime .. endDateTime)
| where resourceUri has "/Microsoft.Security/pricings/StorageAccounts/securityoperators/DefenderForStorageSecurityOperator"
| extend Claims = parse_json(claims)
| extend Auth = parse_json(authorization)
| extend Http = parse_json(httpRequest)
| project TIMESTAMP, ExecutedBy = Claims.name, ClientSourceIp = Claims.ipaddr, UserRole = Auth.evidence.role, Method = Http.method, SourceIpAdress = Http.clientIpAddress, operationName,resourceUri,eventName,status,subStatus ,httpRequest, properties
```

**查询 2:**
```kusto
union cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts, cluster('romeuksouth.uksouth.kusto.windows.net').database("ProdAlerts").SecurityAlerts
| where StartTimeUtc > ago(7d)
| where ProviderName == "StorageThreatDetection"
//| where AzureResourceSubscriptionId == "<SubscriptionID>"
| where AzureResourceId == "<storage-account-resource-id>"
```

**查询 3:**
```kusto
cluster("https://dfsv2telemetryadx.westeurope.kusto.windows.net").database("Snapshots").HourlyPolicyTableSnapshot_v1
| where StorageResourceId contains "<subscription or storage account resource id>"
| sort by SnapshotTime desc
```

**查询 4:**
```kusto
cluster('rometelemetrydata').database('RomeTelemetryProd').BillingReportsByDaySubscriptionAndMeterId(now()-14d,now())
| where SubscriptionId == '<SubscriptionID>'
| where Bundle contains "Storage"
| sort by Day desc
```

**查询 5:**
```kusto
cluster('rometelemetrydata.kusto.windows.net').database('RomeTelemetryProd').BillingReportsRawArchive
| where UsageTime > ago(7d)
| where MeterId == "<MeterId>"
```

### 脚本命令
```powershell
$context =Get-AzContext
    $subId = $context.Subscription
    $SAs = Get-AzStorageAccount
    Foreach ($SA in $SAs)
    {
       $resID = "/subscriptions/" + $subID + "/resourceGroups/" + $SA.ResourceGroupName +
       "/providers/Microsoft.Storage/storageAccounts/" + $SA.StorageAccountName + "/"
       Get-AzSecurityAdvancedThreatProtection -ResourceId $resID
    }
```

---

## Scenario 2: Defender for Storage v2 - Internal FAQ
> 来源: ado-wiki-b-defender-for-storage-v2-internal-faq.md | 适用: Mooncake ⚠️ 未明确

---

## Scenario 3: Enabling On-Upload Malware Scanning using Bicep Code
> 来源: ado-wiki-b-enabling-on-upload-malware-scanning-bicep.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Event Grid scan results not working**: Custom topic must be in the same region as the storage account.
2. **Log Analytics not supported**: Sending scan results to Log Analytics via Bicep is not supported (feature request pending).
3. **Deployment errors**: Ensure `isEnabled` is inside the `onUpload` block, not after it.

### 脚本命令
```powershell
# Step 1: Set subscription
az account set --subscription <subscription-name-or-id>

# Step 2: Deploy
az deployment group create -n <deployment-name> -g <resource-group> --template-file './template.bicep'
```

---

## Scenario 4: Triggering Test Alerts for Azure Defender for Storage
> 来源: ado-wiki-b-storage-atp-alerts.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Navigate to a storage account with Azure Defender for Storage enabled
2. Click the "Containers" tab in the sidebar
3. Access an existing container or create a new one
4. Upload any non-sensitive file to that container
5. Right-click the uploaded file and select "Generate SAS" (Shared Access Signature)
6. Click "Generate SAS token and URL" without altering any options
7. Copy the generated SAS URL
8. Download and open the Tor browser
9. In the Tor browser, visit the copied SAS URL
10. You should now see or download the file uploaded in step 4

### Portal 导航路径
- a storage account with Azure Defender for Storage enabled
- the [Tor browser](https://www

---

## Scenario 5: Microsoft Defender for Storage
> 来源: ado-wiki-c-defender-for-storage-overview.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. Assign tag to the storage account:
2. Disable Azure Defender using one of:

### Kusto 诊断查询
**查询 1:**
```kusto
securityresources
| where type == "microsoft.security/pricings"
```

---

## Scenario 6: Useful KQL queries for On Upload Malware scanning feature
> 来源: ado-wiki-c-kql-queries-malware-scanning.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
let _startTime = datetime(2024-08-20T00:00:00Z);
let _endTime = datetime(2024-08-21T22:22:00Z);
cluster('https://<clustername>.<location>.kusto.windows.net').database('ScanData').table('ScanResults')
| where Timestamp between (_startTime .. _endTime)
| where SubscriptionId == "xxx"
| where StorageAccountName == "xxxx"
| where BlobUri contains "xxxx" //blob name
| where BlobUri contains "xxxx" //file name
| order by Timestamp desc
| project-reorder Timestamp, ScanRequestEventCreatedOn, ScanRequestArrivedOn, ScanRequestSentToVaaSOn, ScanResultArrivedOn
```

**查询 2:**
```kusto
let _startTime = datetime(2024-10-01T01:07:00Z);
let _endTime = datetime(2024-10-24T15:07:00Z);
let _resourcename = '';
cluster('https://<clustername>.<location>.kusto.windows.net').database('ScanData').ScanResults
| where Timestamp between (_startTime .. _endTime)
| where StorageAccountName == _resourcename
| where ScanResult == "Finished"
| extend Day = datetime_part('day',Timestamp)
| summarize GB = sum(BlobSizeInBytes) /1024 /1024/ 1024 by Day, ScanResult
```

**查询 3:**
```kusto
let _startTime = datetime(2024-10-01T17:49:04Z);
let _endTime = datetime(2024-10-02T17:49:04Z);
let _resourceid = 'xxx';
let _subscriptionid = 'xxx';
cluster("https://dfsv2telemetryadx.westeurope.kusto.windows.net").database("Snapshots").HourlyPolicyTableSnapshot_v1
| where SnapshotTime between (_startTime .. _endTime)
| where SubscriptionId == _subscriptionid
| where StorageResourceId contains _resourceid
| parse StorageResourceId with * "/storageAccounts/" StorageAccount
| extend IsD4sEnabled = IsDefenderForStorageEnabled
| extend OverrideSubSet = OverrideSubscriptionLevelSettings
| extend MalwareScan = IsAntimalwareOnUploadScanningEnabled
| extend GBCap = AntimalwareCapGBPerMonth
| extend DataSensitivity = IsDataSensitivityScanningEnabled
| extend AntimalwareDiagnostic = IsAntimalwareDiagnosticSettingsEnabled
| distinct SnapshotTime, CreateTime, StorageAccount, Region, BillingRegion, IsD4sEnabled, OverrideSubSet, MalwareScan, GBCap, DataSensitivity, IsAdlsGen2, AntimalwareDiagnostic
```

---
