# Purview IRM / RMS / 邮件加密 — 排查工作流

**来源草稿**: `ado-wiki-a-feature-request-customer-communication.md`, `ado-wiki-a-how-customers-raise-tickets.md`, `ado-wiki-b-verify-set-irm-configuration-pme.md`, `ado-wiki-common-kusto-logs-1st-party-connectors.md`, `ado-wiki-ecr-drill-certificate-issues.md`, `ado-wiki-get-har-file.md`, `ado-wiki-policy-triage-ui-issues.md`
**Kusto 引用**: `mip-request-analysis.md`, `rms-auth-tracking.md`
**场景数**: 61
**生成日期**: 2026-04-07

---

## Scenario 1: Verbiage to use
> 来源: ado-wiki-a-feature-request-customer-communication.md | 适用: 未标注

### 排查步骤
SEE NEW FEATURE REQUEST INSTRUCTIONS HERE:
https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912734/Handling-Feature-Requests

`[来源: ado-wiki-a-feature-request-customer-communication.md]`

---

## Scenario 2: INITIAL RESPONSE - First communication:
> 来源: ado-wiki-a-feature-request-customer-communication.md | 适用: 未标注

### 排查步骤
Purview is still relatively a new product, so they are adding features regularly. You can check the roadmap at the below link to see if is there. If it is not the option is to create a feature request on our community, or vote on an existing one that matches your needs.

If you like I can assist with creating the request; it is good to have not only the feature request but also its use case, how it would provide meaningful benefit to the product, and what impact it will have without the feature.

Roadmap: https://techcommunity.microsoft.com/t5/microsoft-purview/azure-purview-roadmap/m-p/2334507
Community for Feature Requests: https://feedback.azure.com/d365community/forum/82d7bddb-fb24-ec11-b6e6-000d3a4f07b8

`[来源: ado-wiki-a-feature-request-customer-communication.md]`

---

## Scenario 3: FIRST FOLLOW-UP (let case sit a few days then send):
> 来源: ado-wiki-a-feature-request-customer-communication.md | 适用: 未标注

### 排查步骤
I wanted to follow up and see if you had the opportunity to create the feature request. Also since submitting a feature request is the only solution support can offer at this time, is it agreeable that we close this case as resolved by feature request?

`[来源: ado-wiki-a-feature-request-customer-communication.md]`

---

## Scenario 4: SECOND FOLLOW-UP (if customer still demanding):
> 来源: ado-wiki-a-feature-request-customer-communication.md | 适用: 未标注

### 排查步骤
The only other avenue is to create an internal feature request. Note that you will not be able to track this internal request, but it will highlight the feature to our product managers. Please send me the link for your Community Feature Request for me to include in this internal one.

`[来源: ado-wiki-a-feature-request-customer-communication.md]`

---

## Scenario 5: AVA FEATURE REQUEST CHANNEL
> 来源: ado-wiki-a-feature-request-customer-communication.md | 适用: 未标注

### 排查步骤
Create the request in the AVA Feature Request Channel with the link. Once created send for closure:
As we have now exhausted all avenues for support to highlight this request to management, are we agreeable to close the case at this time?

`[来源: ado-wiki-a-feature-request-customer-communication.md]`

---

## Scenario 6: ESCALATE and MR
> 来源: ado-wiki-a-feature-request-customer-communication.md | 适用: 未标注

### 排查步骤
Further resistance to closure by customer: utilize CSAM to get closure then follow up with Manager Recovery.

`[来源: ado-wiki-a-feature-request-customer-communication.md]`

---

## Scenario 7: LAST QUALITY RESPONSE and CLOSURE TEMPLATE
> 来源: ado-wiki-a-feature-request-customer-communication.md | 适用: 未标注

### 排查步骤
https://supportability.visualstudio.com/Azure%20Purview/_wiki/wikis/Microsoft%20Purview/912710/Last-Quality-Response-(LQR)?anchor=by-design-(product-limitation)-email

`[来源: ado-wiki-a-feature-request-customer-communication.md]`

---

## Scenario 8: How to: Verify and Set IRM Configuration for Purview Message Encryption
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
**Scope**: Exchange Online IRM configuration for MIP/RMS-based encryption (PME). **Not applicable to on-premises AD RMS customers.**

IRM = the RMS-enabled application component in Exchange Online that enforces Rights Management. Required for EXO Transport Rules, OWA encryption, and making Do Not Forward (DNF) / Encrypt-Only (EO) templates available.

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 9: Install
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
Install-Module AipService
Install-Module ExchangeOnlineManagement

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 10: Connect
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
Connect-AipService
Connect-ExchangeOnline
```

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 11: Step 2: Check AipService is Enabled
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
```PowerShell
Get-AipServiceConfiguration | FL
```

Check:
- `FunctionalState` = **Enabled** → If not: `Enable-AipService`
- `IPCv3ServiceFunctionalState` = **Enabled** → If not: `Enable-AipServiceIPCv3`

> After enabling, wait ~24h for replication before testing IRM.

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 12: Get AIP endpoint
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
$EndPoint = (Get-AipServiceConfiguration).LicensingExtranetDistributionPointUrl

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 13: Set in IRM
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
Set-IRMConfiguration -LicensingLocation $EndPoint

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 14: Enable IRM
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
Set-IRMConfiguration -InternalLicensingEnabled $true -AzureRMSLicensingEnabled $true
```

Wait a couple of hours (ideally 24h), then run `Get-RMSTemplate` to confirm DNF and EO templates appear.

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 15: Step 4: Check IRM Configuration
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
**Via Assist (Assist365):**
- Actions → Diagnostics → search "irm" → run with sender + recipient → check Full Details or Diagnostics details

**Via PowerShell:**
```PowerShell
Get-IRMConfiguration | FL
```

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 16: Key Parameters Explained
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
| Parameter | Description |
|-----------|-------------|
| `InternalLicensingEnabled` | Enables IRM for EXO. Required with AzureRMSLicensingEnabled. |
| `AzureRMSLicensingEnabled` | Enables Azure RMS licensing and advanced labeling features. |
| `TransportDecryptionSetting` | `Mandatory`/`Optional`/`Disabled`. If Disabled, may block DLP on encrypted emails. |
| `JournalReportDecryptionEnabled` | Enables journal decryption — journal recipient gets encrypted + decrypted copy. |
| `SimplifiedClientAccessEnabled` | Enables encryption features in OWA (required for sensitivity button + EO/DNF in OWA). |
| `SearchEnabled` | Enables search of IRM-encrypted messages in OWA. |
| `DecryptAttachmentForEncryptOnly` | If true, EO-encrypted attachments are decrypted on download. |
| `SimplifiedClientAccessEncryptOnlyDisabled` | If true, Encrypt-Only is hidden in OWA. |
| `SimplifiedClientAccessDoNotForwardDisabled` | If true, Do Not Forward is hidden in OWA. |
| `EnablePdfEncryption` | Enables PDF attachment encryption. |
| `AutomaticServiceUpdateEnabled` | Required for Teams/AAD Groups labeling. Enables AIP feature auto-sync. |
| `LicensingLocation` | RMS licensing URL(s). **Must have Get-AipServiceConfiguration URL as first entry.** |
| `EnablePortalTrackingLogs` | Enables OME portal audit logging (E5 license required). |
| `EDiscoverySuperUserEnabled` | If true, bypasses RMS decryption for eDiscovery super users. |

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 17: Via PowerShell
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
Test-IrmConfiguration -Sender sender@contoso.com -Recipient recipient@contoso.com
```

If result = `Fail`: IRM disabled/misconfigured, AIP disabled, user has no label access, or Onboarding policy is set.

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 18: Step 6: Common Issues and Fixes
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| OWA labels/templates not available; Sensitivity button missing | IRM not enabled or SimplifiedClientAccessEnabled=false | Enable IRM; `Set-IRMConfiguration -SimplifiedClientAccessEnabled $true` |
| Transport Rules can't see encryption templates | InternalLicensingEnabled or AzureRMSLicensingEnabled=false | `Set-IRMConfiguration -InternalLicensingEnabled $true -AzureRMSLicensingEnabled $true` |
| RMS templates missing or fail to sync to Exchange | Multiple LicensingLocations with wrong order | LicensingExtranetDistributionPointUrl from Get-AipServiceConfiguration MUST be first |
| PDF attachments not encrypted with EO | EnablePdfEncryption=false | `Set-IRMConfiguration -EnablePdfEncryption $true` |
| No OME audit logs | EnablePortalTrackingLogs=false | `Set-IRMConfiguration -EnablePortalTrackingLogs $true` (E5 required) |
| Encrypted messages not searchable in OWA | SearchEnabled=false | `Set-IRMConfiguration -SearchEnabled $true` |
| Teams/AAD Group labels not showing | AutomaticServiceUpdateEnabled=false | `Set-IRMConfiguration -AutomaticServiceUpdateEnabled $true` |
| Journaling copies still encrypted | JournalReportDecryptionEnabled=false | `Set-IRMConfiguration -JournalReportDecryptionEnabled $true` |
| Recipient gets unencrypted attachment unexpectedly | DecryptAttachmentForEncryptOnly=true | `Set-IRMConfiguration -DecryptAttachmentForEncryptOnly $false` |
| OWA DNF or EO not available | SimplifiedClientAccessEncryptOnlyDisabled or DoNotForwardDisabled=true | Set the respective flag to $false |
| Labels visible but can't apply encrypted labels | TransportDecryptionSetting=Disabled | Set to Optional or Mandatory |

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 19: Multiple Licensing Locations
> 来源: ado-wiki-b-verify-set-irm-configuration-pme.md | 适用: 未标注

### 排查步骤
If `Get-IRMConfiguration` shows multiple LicensingLocation values, the URL from `Get-AipServiceConfiguration` **MUST** be listed first. If not, templates will fail to sync.
Follow TSG: [How To: Re-order IRM licensing Locations](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection/10531/How-To-Re-order-IRM-licensing-Locations)

`[来源: ado-wiki-b-verify-set-irm-configuration-pme.md]`

---

## Scenario 20: Get basic Information of the Scan
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
Pay attention to the errors, exceptions.

```log
//################scanningService/connectorService#################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "RUNID"
| order by ['time'] asc
| project PreciseTimeStamp, Type, Message, SourceFilePath, ContainerName, Uri, MemberName
//################scanningService/connectorService#################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 21: Get the backend Activities of the Scan
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
```log
//#######################Find activityId###########################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').ScanningLog
| where ScanResultId == "RUNID"
| where Message contains "the data scan activities are:"
//#######################Find activityId###########################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 22: Get Database for the Scan Agent Log
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
```log
//#######################Find cluster##############################
cluster('catalogtelemetrykusto.eastus.kusto.windows.net').database("Scan").GetAgentCluster("RUNID")
//#######################Find cluster##############################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 23: Get the Scan Agent Log
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
Please pay attention to the errors/exceptions/Payload of the metadata generated using the related keyword.

```log
//#####################Find DataScanExecutor#######################
cluster("CONN from GetAgentCluster").database("DataScanLogs").CustomLogEvent
| where ActivityId in ("Find activityId")
| project TIMESTAMP, TraceMessage, Message, Level
| order by TIMESTAMP asc
//#####################Find DataScanExecutor#######################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 24: Try to get the potential Issues from Agent log
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
```log
//#####################Find DataScanAgent##########################
cluster('CONN from GetAgentCluster').database('DataScanLogs').DataScanAgentEvent
| where * contains "RUNID"
// | where Message contains "convertedEntities" or Message contains "SequenceNumber" (SequenceNumber is for split payload)
// | where Message !contains "Logging message failed" (this message is logged when payload split and no useful info in there)
| project env_time,Message,SourceNamespace,env_name, TracingLevel
| order by env_time asc
//#####################Find DataScanAgent##########################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 25: Get the metadata generated
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
```log
//#####################Find Processed Entities#####################
cluster("CONN from GetAgentCluster").database("DataScanLogs").CustomLogEvent
| where JobId == "RUNID"
// | where Message contains "convertedEntities"
//#####################Find Processed Entities#####################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 26: Detect the metadata handled by ingestion
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
Try to compare the payload with the one found from the agent log above.

```log
//#####################Ingestion###################################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierDetails
| where RequestId startswith "RUNID"
// | where Msg contains "KEYWORD YOU MAY BE INTERESTED"
| order by ['time'] asc
| project PreciseTimeStamp, Msg, Level
//#####################Ingestion###################################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 27: Review the metadata inserted into Data Map
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
```log
//#####################Ingestion###################################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierWebRequests
| where RequestId startswith "RUNID"
// | where Message contains "KEYWORD YOU MAY BE INTERESTED"
| project ['time'], Msg, Role, ApiCaller, CatalogName, CatalogId, RequestId, Method, RequestUrl, Status, Duration, Message, ErrorCode
| order by ['time'] asc
//#####################Ingestion###################################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 28: Detect the Ingestion Details
> 来源: ado-wiki-common-kusto-logs-1st-party-connectors.md | 适用: 未标注

### 排查步骤
```log
//#####################IngestionWorker (Could find payload for particular ingestion)###################################
cluster('babylon.eastus2.kusto.windows.net').database('babylonMdsLogs').OnlineTierIngestionDetails
| where TraceId contains "9e006096-02c0-4d87-8660-7b6b0fa49116_95c9894e-4a67-4e98-9f08-8aa577dea4b7-1_0_bb5b"
| project ['time'], RequestId, TraceId, Message, Level
| order by ['time'] asc
//#####################IngestionWorker (Could find payload for particular ingestion)###################################
```

`[来源: ado-wiki-common-kusto-logs-1st-party-connectors.md]`

---

## Scenario 29: Issue
> 来源: ado-wiki-ecr-drill-certificate-issues.md | 适用: 未标注

### 排查步骤
ECR (Emergency Certificate Rotation) Drill will change the certificates used by application with the expectation that the application should pick up new certificates without any code modifications.

The application might not throw any errors as old certificates are still valid and it takes some time before being getting invalidated.

`[来源: ado-wiki-ecr-drill-certificate-issues.md]`

---

## Scenario 30: Triaging Steps
> 来源: ado-wiki-ecr-drill-certificate-issues.md | 适用: 未标注

### 排查步骤
1. If the issue has been logged by Tip Test, click on "DGrep: Tip results" to see the logs in Jarvis portal
2. Get the correlation id or account id from the logs or from the issue creator
3. Use this "Correlation ID" and search the logs again:
   ```kql
   ProjectBabylonLogEvent  
   | where CorrelationId == "<correlation id>" 
   ```
4. Possible causes - If the error in the logs says something similar to "Failed to validate client certificate", there is an issue with the certificate. Get the Thumbprint of the certificate and domain from the logs.
5. Check the Thumbprint of the certificate used and match it with certificate stored in Key vault
6. To get the name of key vault, go to region specific yaml file at: `PolicyStore/src/PolicyStoreService.Deployment/Generated/Helm/policystore/values_policystore_df_wus.yaml`
7. Go to Key vault service in Azure portal and search with the key vault name in yaml file
8. Click on the key vault and go to Certificates
9. Match the Thumbprint of the certificate in Key vault against the Thumb to the one printed in logs
10. If the Thumbprint does not match, old certificates are still being used

`[来源: ado-wiki-ecr-drill-certificate-issues.md]`

---

## Scenario 31: Resolution
> 来源: ado-wiki-ecr-drill-certificate-issues.md | 适用: 未标注

### 排查步骤
Wait for the new certificate to get reflected. If new certificate does not get reflected, please connect with SMEs.

`[来源: ado-wiki-ecr-drill-certificate-issues.md]`

---

## Scenario 32: When to Use
> 来源: ado-wiki-get-har-file.md | 适用: 未标注

### 排查步骤
Some UX errors are triggered by API failures or incorrect API responses. A HAR file helps quickly identify if the error is an API issue or a UX issue.

`[来源: ado-wiki-get-har-file.md]`

---

## Scenario 33: Steps
> 来源: ado-wiki-get-har-file.md | 适用: 未标注

### 排查步骤
1. Login to Purview portal, go to the target page
2. Press F12 or open Developer Tools, switch to **Network** tab, set filter type to "All"
3. Refresh the browser (ensures all requests are captured from portal initialization)
4. Reproduce the error in Purview portal
5. Click **Export HAR...** button to export the HAR file
6. Attach HAR file to ICM for triage

`[来源: ado-wiki-get-har-file.md]`

---

## Scenario 34: Triage Tips
> 来源: ado-wiki-get-har-file.md | 适用: 未标注

### 排查步骤
- Check for failed requests (usually marked in red)
- Some failures may be irrelevant to the error
- Get rough idea of API behavior from the API URL

`[来源: ado-wiki-get-har-file.md]`

---

## Scenario 35: Issue
> 来源: ado-wiki-policy-triage-ui-issues.md | 适用: 未标注

### 排查步骤
This TSG covers steps to triage UI issues related to Purview Policy.

`[来源: ado-wiki-policy-triage-ui-issues.md]`

---

## Scenario 36: Triaging Steps / Root Cause
> 来源: ado-wiki-policy-triage-ui-issues.md | 适用: 未标注

### 排查步骤
1. Go to **Jarvis DGrep** (Jarvis - microsoftgeneva.com)
2. Run a query on **GatewayEvent**:
   - Endpoint: set appropriately (e.g., "Test" or "Prod")
   - Namespace: `GatewayDogfood` (or appropriate production namespace)
   - Events to search: Check **AuthorizationEvent** and **GatewayEvent**
   - Set appropriate time range around the issue time
   - Add filtering condition: `RequestId == {customer's request ID}`
3. Get the **Correlation Id** from the logs
4. Query **PolicyStoreEvent** with the Correlation Id:
   - Namespace: `PolicyStoreDogFood` (or appropriate production namespace)
   - Events to search: Check **PolicyStoreLogEvent**
   - Filter by `CorrelationId == {correlation ID from step 3}`
5. Check the logs and get the exception details

`[来源: ado-wiki-policy-triage-ui-issues.md]`

---

## Scenario 37: Resolution
> 来源: ado-wiki-policy-triage-ui-issues.md | 适用: 未标注

### 排查步骤
- Make sure to delete all the bindings and retry the operation
- Investigate the specific exception details from PolicyStoreLogEvent for targeted resolution

`[来源: ado-wiki-policy-triage-ui-issues.md]`

---

## Scenario 38: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

`[来源: mip-request-analysis.md]`

---

## Scenario 39: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 40: 必要参数
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

`[来源: mip-request-analysis.md]`

---

## Scenario 41: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

`[来源: mip-request-analysis.md]`

---

## Scenario 42: 结果字段说明
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

`[来源: mip-request-analysis.md]`

---

## Scenario 43: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 44: 用途
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

`[来源: mip-request-analysis.md]`

---

## Scenario 45: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 46: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 47: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 48: 执行方式
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

`[来源: mip-request-analysis.md]`

---

## Scenario 49: 查询语句
> 来源: mip-request-analysis.md | 适用: 未标注

### 排查步骤
```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

`[来源: mip-request-analysis.md]`

---

## Scenario 50: 用途
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
追踪 Azure RMS 服务的 Azure AD 认证请求，排查登录失败、条件访问阻止等问题。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 51: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 52: 必要参数
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID |
| {correlationId} | 否 | 关联 ID |
| {userId} | 否 | 用户对象 ID |

`[来源: rms-auth-tracking.md]`

---

## Scenario 53: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where UserPrincipalObjectID contains userobjectId
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Client, 
         ResourceId, ResourceDisplayName, ClientIp, RequestId, Result, 
         MaskedResponse, HttpStatusCode, HttpMethod, ApplicationId, 
         VerificationCert, Call, OriginalHost, Tenant, TenantId, UserTenantId, 
         ThrTenant, UserTenantMfaStatus, DeviceId, DomainName, FaultDomain, 
         UserPrincipalObjectID, ServicePrincipalObjectID, OTData, ITData, 
         LastPasswordChangeTimestamp
| order by env_time asc
```

`[来源: rms-auth-tracking.md]`

---

## Scenario 54: 结果字段说明
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| CorrelationId | 关联 ID |
| ErrorCode | AAD 错误码 (AADSTS) |
| ApplicationDisplayName | 应用程序名称 |
| ResourceDisplayName | 资源名称 (Azure RMS) |
| Result | 结果 |
| HttpStatusCode | HTTP 状态码 |
| ClientIp | 客户端 IP |
| TenantId | 租户 ID |
| UserPrincipalObjectID | 用户对象 ID |
| DeviceId | 设备 ID |
| UserTenantMfaStatus | MFA 状态 |

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 55: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 56: 用途
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
根据 correlationId 查询 AAD 登录失败的详细错误信息。

`[来源: rms-auth-tracking.md]`

---

## Scenario 57: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| project env_time, Message, Exception, haskeyvalue
| order by env_time asc
```

`[来源: rms-auth-tracking.md]`

---

## Scenario 58: 结果字段说明
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| Message | 消息（可能包含 AADSTS 错误详情） |
| Exception | 异常信息 |
| haskeyvalue | 标记是否包含 AADSTS 错误 (1=是) |

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 59: 执行方式
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

`[来源: rms-auth-tracking.md]`

---

## Scenario 60: 查询语句
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| where TenantId =~ tenantid or Tenant =~ tenantid or UserTenantId =~ tenantid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| where Result != "Success" and ErrorCode != ""
| summarize Count = count() by ErrorCode, ApplicationDisplayName
| order by Count desc
```

---

`[来源: rms-auth-tracking.md]`

---

## Scenario 61: 常见 AADSTS 错误码
> 来源: rms-auth-tracking.md | 适用: 未标注

### 排查步骤
| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS50105 | 用户未分配到应用程序 |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |
| AADSTS70011 | 无效的请求范围 |
| AADSTS90072 | 用户租户禁用外部 IdP 访问 |

---

`[来源: rms-auth-tracking.md]`

---

# Kusto 查询参考

## 来源: `mip-request-analysis.md`

# MIP 请求日志分析

## 用途

分析 MIP (Microsoft Information Protection) / AIP (Azure Information Protection) 的请求日志，排查加密、解密、预授权等操作问题。

---

## 查询 1: 按 correlationId/tenantId 查询所有 MIP 请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID（与 correlationId 二选一） |
| {correlationId} | 否 | 关联 ID（与 tenantId 二选一） |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
IFxRequestLogEvent
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where userObjectId contains userobjectId
| extend workload = case(
    operationName == 'AcquireTemplateInformation', 'Bootstrap',
    operationName == 'FECreateEndUserLicenseV1', 'Decryption',
    operationName == 'FECreatePublishingLicenseV1', 'Encryption',
    operationName == 'FEGetUserRights', 'Decryption',
    operationName == 'AcquireLicense', 'Decryption',
    operationName == 'AcquirePreLicense4User', 'Prelicense',
    operationName == 'FECreateClientLicensorCertificateV1', 'Bootstrap',
    operationName == 'ServiceDiscoveryForUser', 'Bootstrap',
    operationName == 'AcquireDelegationLicense', 'Prelicense',
    operationName == 'FEGetAllTemplatesV1', 'Bootstrap',
    operationName == 'FECreatePublishingLicenseAndEndUserLicenseV1', 'Encryption',
    operationName == 'AcquireDelegationLicense4User', 'Decryption',
    'N/A'
)
| extend ApiType = case(
    operationName in ('FECreateEndUserLicenseV1', 'FECreatePublishingLicenseV1', 'FEGetUserRights', 
                      'FECreateClientLicensorCertificateV1', 'FEGetAllTemplatesV1', 
                      'FECreatePublishingLicenseAndEndUserLicenseV1'), 'REST',
    operationName in ('AcquireLicense', 'AcquirePreLicense4User', 'AcquireDelegationLicense', 
                      'AcquireDelegationLicense4User'), 'SOAP',
    'Hrms'
)
| project env_time, operationName, ApiType, workload, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, durationMs, iisWaitRequestTime, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| operationName | 操作名称 |
| ApiType | API 类型 (REST/SOAP/Hrms) |
| workload | 工作负载类型 (Bootstrap/Encryption/Decryption/Prelicense) |
| correlationId | 关联 ID |
| resultType | 结果类型 |
| ResourceTenant | 资源租户 ID |
| homeTenantId | 用户主租户 ID |
| userObjectId | 用户对象 ID |
| UserAccessType | 用户访问类型 |
| appName | 应用程序名称 |
| durationMs | 持续时间 (毫秒) |
| resultSignature | 结果签名/错误码 |

---

## 查询 2: 查询 PL/EUL 解密请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

专门查询 Publishing License (PL) 和 End User License (EUL) 相关的解密请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where correlationId =~ targetid or contextId =~ targetid or homeTenantId =~ targetid
| where operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1",
    "AcquireDelegationLicense4User",
    "AcquireDelegationLicense",
    "AcquireLicense",
    "AcquirePreLicense4User",
    "AcquirePreLicense"
)
| extend ApiType = iff(operationName in (
    "FECreateEndUserLicenseV1",
    "FECreatePublishingLicenseAndEndUserLicenseV1"
), "REST", "SOAP")
| project env_time, operationName, ApiType, correlationId, resultType, 
         ResourceTenant = contextId, homeTenantId, userObjectId, UserAccessType, 
         appName, appVersion, rmsTenantId, contentId, resultSignature
| order by env_time asc
```

---

## 查询 3: 统计失败请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

按操作类型和错误码统计失败的 MIP 请求。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
IFxRequestLogEvent 
| where env_time between (starttime .. endtime)
| where contextId =~ tenantid or homeTenantId =~ tenantid
| where resultType != "Success"
| summarize Count = count() by operationName, resultType, resultSignature
| order by Count desc
```

---

## 查询 4: 查询 RMS 跟踪日志

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://azrmsmc.kusto.chinacloudapi.cn`
> - database: `azrms`

### 用途

根据 correlationId 查询详细的跟踪日志。

### 查询语句

```kql
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```

---

## 关联查询

- [rms-auth-tracking.md](./rms-auth-tracking.md) - RMS 认证追踪（ESTS 日志）

---

## 来源: `rms-auth-tracking.md`

# Azure RMS 认证追踪

## 用途

追踪 Azure RMS 服务的 Azure AD 认证请求，排查登录失败、条件访问阻止等问题。

**Azure RMS ResourceId**: `00000012-0000-0000-c000-000000000000`

---

## 查询 1: 查询 Azure RMS 登录请求

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {tenantId} | 否 | 租户 ID |
| {correlationId} | 否 | 关联 ID |
| {userId} | 否 | 用户对象 ID |

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
let correlationid = "{correlationId}";
let userobjectId = "{userId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| extend targetid = iff(correlationid <> '', correlationid, iff(tenantid <> '', tenantid, 'non-exist'))
| where CorrelationId =~ targetid or Tenant =~ targetid or TenantId =~ targetid or UserTenantId =~ targetid
| where UserPrincipalObjectID contains userobjectId
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| project env_time, CorrelationId, ErrorCode, ApplicationDisplayName, Client, 
         ResourceId, ResourceDisplayName, ClientIp, RequestId, Result, 
         MaskedResponse, HttpStatusCode, HttpMethod, ApplicationId, 
         VerificationCert, Call, OriginalHost, Tenant, TenantId, UserTenantId, 
         ThrTenant, UserTenantMfaStatus, DeviceId, DomainName, FaultDomain, 
         UserPrincipalObjectID, ServicePrincipalObjectID, OTData, ITData, 
         LastPasswordChangeTimestamp
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| CorrelationId | 关联 ID |
| ErrorCode | AAD 错误码 (AADSTS) |
| ApplicationDisplayName | 应用程序名称 |
| ResourceDisplayName | 资源名称 (Azure RMS) |
| Result | 结果 |
| HttpStatusCode | HTTP 状态码 |
| ClientIp | 客户端 IP |
| TenantId | 租户 ID |
| UserPrincipalObjectID | 用户对象 ID |
| DeviceId | 设备 ID |
| UserTenantMfaStatus | MFA 状态 |

---

## 查询 2: 查询诊断跟踪日志 (AADSTS 错误详情)

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

根据 correlationId 查询 AAD 登录失败的详细错误信息。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let correlationid = "{correlationId}";
DiagnosticTracesIfx
| where env_time between (starttime .. endtime)
| where CorrelationId == correlationid
| project env_time, Message, Exception
| extend haskeyvalue = iff(Message contains "AADSTS" or Exception contains "AADSTS", 1, 0)
| project env_time, Message, Exception, haskeyvalue
| order by env_time asc
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| env_time | 事件时间 |
| Message | 消息（可能包含 AADSTS 错误详情） |
| Exception | 异常信息 |
| haskeyvalue | 标记是否包含 AADSTS 错误 (1=是) |

---

## 查询 3: 统计 RMS 登录失败

### 执行方式

> 🔵 **Kusto 直接查询** - 使用 `KUSTO-AzureCM-kusto_query` 工具执行
> - cluster_uri: `https://estscnn2.chinanorth2.kusto.chinacloudapi.cn`
> - database: `ESTS`

### 用途

按错误码统计 Azure RMS 的登录失败情况。

### 查询语句

```kql
let starttime = datetime({starttime});
let endtime = datetime({endtime});
let tenantid = "{tenantId}";
PerRequestTableIfx
| where env_time between (starttime .. endtime)
| where TenantId =~ tenantid or Tenant =~ tenantid or UserTenantId =~ tenantid
| where ResourceId == '00000012-0000-0000-c000-000000000000'  // Azure RMS
| where Result != "Success" and ErrorCode != ""
| summarize Count = count() by ErrorCode, ApplicationDisplayName
| order by Count desc
```

---

## 常见 AADSTS 错误码

| 错误码 | 说明 |
|--------|------|
| AADSTS50076 | 需要 MFA |
| AADSTS50105 | 用户未分配到应用程序 |
| AADSTS53003 | 被条件访问策略阻止 |
| AADSTS65001 | 用户未同意应用程序 |
| AADSTS70011 | 无效的请求范围 |
| AADSTS90072 | 用户租户禁用外部 IdP 访问 |

---

## 关联查询

- [mip-request-analysis.md](./mip-request-analysis.md) - MIP 请求日志分析

---

