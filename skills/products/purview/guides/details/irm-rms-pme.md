# Purview IRM / RMS / 邮件加密 -- Comprehensive Troubleshooting Guide

**Entries**: 34 | **Drafts fused**: 7 | **Kusto queries fused**: 2
**Source drafts**: [ado-wiki-a-feature-request-customer-communication.md](..\guides/drafts/ado-wiki-a-feature-request-customer-communication.md), [ado-wiki-a-how-customers-raise-tickets.md](..\guides/drafts/ado-wiki-a-how-customers-raise-tickets.md), [ado-wiki-b-verify-set-irm-configuration-pme.md](..\guides/drafts/ado-wiki-b-verify-set-irm-configuration-pme.md), [ado-wiki-common-kusto-logs-1st-party-connectors.md](..\guides/drafts/ado-wiki-common-kusto-logs-1st-party-connectors.md), [ado-wiki-ecr-drill-certificate-issues.md](..\guides/drafts/ado-wiki-ecr-drill-certificate-issues.md), [ado-wiki-get-har-file.md](..\guides/drafts/ado-wiki-get-har-file.md), [ado-wiki-policy-triage-ui-issues.md](..\guides/drafts/ado-wiki-policy-triage-ui-issues.md)
**Kusto references**: [mip-request-analysis.md](../../kusto/purview/references/queries/mip-request-analysis.md), [rms-auth-tracking.md](../../kusto/purview/references/queries/rms-auth-tracking.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-feature-request-customer-communication.md

1. Verbiage to use `[source: ado-wiki-a-feature-request-customer-communication.md]`
2. INITIAL RESPONSE - First communication: `[source: ado-wiki-a-feature-request-customer-communication.md]`
3. FIRST FOLLOW-UP (let case sit a few days then send): `[source: ado-wiki-a-feature-request-customer-communication.md]`
4. SECOND FOLLOW-UP (if customer still demanding): `[source: ado-wiki-a-feature-request-customer-communication.md]`
5. AVA FEATURE REQUEST CHANNEL `[source: ado-wiki-a-feature-request-customer-communication.md]`
6. ESCALATE and MR `[source: ado-wiki-a-feature-request-customer-communication.md]`
7. LAST QUALITY RESPONSE and CLOSURE TEMPLATE `[source: ado-wiki-a-feature-request-customer-communication.md]`
8. How to: Verify and Set IRM Configuration for Purview Message Encryption `[source: ado-wiki-b-verify-set-irm-configuration-pme.md]`
9. Prerequisites `[source: ado-wiki-b-verify-set-irm-configuration-pme.md]`
10. Step 1: Install Modules & Connect `[source: ado-wiki-b-verify-set-irm-configuration-pme.md]`

### Phase 2: Data Collection (KQL)

```kusto
ProjectBabylonLogEvent  
   | where CorrelationId == "<correlation id>"
```
`[tool: ado-wiki-ecr-drill-certificate-issues.md]`

```kusto
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
`[tool: Kusto skill -- mip-request-analysis.md]`

```kusto
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
`[tool: Kusto skill -- mip-request-analysis.md]`

```kusto
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
`[tool: Kusto skill -- mip-request-analysis.md]`

```kusto
IFxTrace
| where env_time between (datetime({starttime}) .. datetime({endtime}))
| where correlationId =~ "{correlationId}"
| project env_time, level, traceData, region
| order by env_time asc
```
`[tool: Kusto skill -- mip-request-analysis.md]`

```kusto
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
`[tool: Kusto skill -- rms-auth-tracking.md]`

```kusto
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
`[tool: Kusto skill -- rms-auth-tracking.md]`

```kusto
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
`[tool: Kusto skill -- rms-auth-tracking.md]`

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Cannot open encrypted email (sensitivity label) in OWA - shows 'This message is ... | IRM not configured in Exchange Online for 21Vianet: AzureRMS... | 1) Enable Azure RMS: Connect-AipService -EnvironmentName AzureChinaCloud; Enable... |
| Cannot enable SharePoint IRM when using RMS connector server — error during conf... | RMS connector configuration issue with SharePoint IRM integr... | Check RMS connector setup and SharePoint IRM configuration. Refer to case 210401... |
| Customer asks about migrating from Azure Data Catalog (ADC) Gen 1 to Purview; no... | ADC Gen 1 and Purview are fundamentally different services; ... | 1) Reassure customer ADC Gen 1 continues with 99.9 SLA (sustenance mode). 2) Do ... |
| Azure Databricks connection issues after metastore ID migration; ADB scan or con... | ADB connection was updated to include metastore ID in FQN. A... | Navigate to ADB Connection under Connection tab, update the description field (a... |
| Search returns HTTP 400 error 'The search request is invalid' when searching key... | Search keywords contain special characters (/, +, -, {, etc.... | Remove all symbol characters from the search keyword or double-quote the keyword... |
| Scan does not update asset schema or classifications even though scan data is co... | Customer previously modified the asset (name, classification... | This is by design. Inform customer that once any schema change is made manually,... |
| Purview scan does not pick up new columns added to Synapse views or tables — col... | Binding errors: Synapse view or function becomes outdated du... | Check if customer changed view/function definition; run Kusto query on DataScanA... |
| Policy and Rule columns are blank for Endpoint events in Activity Explorer | 'File Created on Removable Media' is an IRM event (not DLP),... | Explain the distinction: IRM events (File Created on Removable Media) do not car... |

`[conclusion: 🟢 8.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot open encrypted email (sensitivity label) in OWA - shows 'This message is protected with Micro... | IRM not configured in Exchange Online for 21Vianet: AzureRMSLicensingEnabled=Fal... | 1) Enable Azure RMS: Connect-AipService -EnvironmentName AzureChinaCloud; Enable-AipService. 2) Conf... | 🟢 8.0 | MCVKB/Mail with sensitivity label (encryption) applied.md |
| 2 | Cannot enable SharePoint IRM when using RMS connector server — error during configuration | RMS connector configuration issue with SharePoint IRM integration (details in im... | Check RMS connector setup and SharePoint IRM configuration. Refer to case 2104010040000408 for detai... | 🔵 7.5 | MCVKB/RMS connector - Cannot enable SharePoint IRM [2104.md |
| 3 | Customer asks about migrating from Azure Data Catalog (ADC) Gen 1 to Purview; no migration path avai... | ADC Gen 1 and Purview are fundamentally different services; automatic or manual ... | 1) Reassure customer ADC Gen 1 continues with 99.9 SLA (sustenance mode). 2) Do NOT commit to migrat... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FImportant%20Notifications%2FNo%20Migration%20from%20ADC%20Gen%201) |
| 4 | Azure Databricks connection issues after metastore ID migration; ADB scan or connection not working ... | ADB connection was updated to include metastore ID in FQN. All accounts migrated... | Navigate to ADB Connection under Connection tab, update the description field (any change), and clic... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FScanning%2FDQ%20ADB%20Connection%20Update) |
| 5 | Search returns HTTP 400 error 'The search request is invalid' when searching keywords | Search keywords contain special characters (/, +, -, {, etc.) that are treated a... | Remove all symbol characters from the search keyword or double-quote the keyword. Use Kusto (OnlineT... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSearch%20and%20Browse%2FCannot%20search%20or%20browse%20assets%20after%20a%20successful%20scan%2FBrowse%20failure) |
| 6 | Scan does not update asset schema or classifications even though scan data is correct; previously sc... | Customer previously modified the asset (name, classification, or description), m... | This is by design. Inform customer that once any schema change is made manually, scan cannot overrid... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FData%20Map%2FAsset%20Schema%20is%20missing%20or%20incorrect%2FMissing%20Assets) |
| 7 | Purview scan does not pick up new columns added to Synapse views or tables — column mismatch between... | Binding errors: Synapse view or function becomes outdated due to changes in unde... | Check if customer changed view/function definition; run Kusto query on DataScanAgentEvent to look fo... | 🔵 7.0 | ado-wiki |
| 8 | Policy and Rule columns are blank for Endpoint events in Activity Explorer | 'File Created on Removable Media' is an IRM event (not DLP), so Policy/Rule colu... | Explain the distinction: IRM events (File Created on Removable Media) do not carry Policy/Rule data.... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FActivity%20Explorer%2FTroubleshooting%20Scenarios%3A%20Activity%20Explorer%2FScenario%3A%20Information%20incorrect%20for%20an%20event%20in%20activity%20explorer) |
| 9 | Wrong or default branding template applied to OME encrypted message — recipient sees default templat... | Wrapper message has AuthAs Anonymous (from 3rd party connector), causing default... | Check X-MS-Exchange-CrossTenant-AuthAs header. If Anonymous: adjust mail flow so OME encrypted messa... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Branding%20Template%20not%20working%20as%20expected) |
| 10 | Journaled encrypted email missing decrypted attachment — JournalReportDecryptionEnabled is False | IRM configuration parameter JournalReportDecryptionEnabled is set to False, prev... | Run Set-IRMConfiguration -JournalReportDecryptionEnabled $true. Takes time to replicate; only applie... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Encrypted%20email%20journaling%20is%20not%20working%20correctly) |
| 11 | Journaled encrypted email missing decrypted attachment — ETR with explicit OME branding applied to m... | Transport rule applies ApplyRightsProtectionCustomizationTemplate (explicit OME ... | Remove explicit OME branding (ApplyRightsProtectionCustomizationTemplate action) from the ETR. Use i... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Encrypted%20email%20journaling%20is%20not%20working%20correctly) |
| 12 | Cannot revoke encrypted message despite having Premium license; revoke button not shown for multi-re... | By design: revocation only works for messages sent via OWA to exactly 1 external... | Inform customer of by-design limitation. Requirements: 1) OWA client only, 2) single recipient, 3) n... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FTroubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption%2FScenario%3A%20Sender%20is%20unable%20to%20revoke%20an%20encrypted%20message) |
| 13 | Get-RMSTemplate returns no results in Exchange Online; TemplateNotFound errors in Extended Message T... | IRM configuration (Get-IRMConfiguration) has multiple licensing locations in Lic... | 1) Get AIP service URL: run (Get-AipServiceConfiguration).LicensingIntranetDistributionPointUrl in A... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20To%3A%20Re-order%20IRM%20licensing%20Locations) |
| 14 | OWA (Outlook on the Web) 中 Sensitivity 标签或加密模板不可见、不可选；Sensitivity 按钮缺失或灰显 | IRM 未在 EXO 启用（InternalLicensingEnabled=false）或 SimplifiedClientAccessEnabled=fal... | 1) Set-IRMConfiguration -InternalLicensingEnabled $true -AzureRMSLicensingEnabled $true；2) Set-IRMCo... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 15 | EXO Transport Rules (ETR) 中无法选择加密模板（Do Not Forward / Encrypt-Only 不显示）；DLP 加密动作无法执行 | InternalLicensingEnabled=false 或 AzureRMSLicensingEnabled=false；或 IRM LicensingL... | 1) Set-IRMConfiguration -InternalLicensingEnabled $true -AzureRMSLicensingEnabled $true；2) $ep=(Get-... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 16 | IRM 模板无法同步到 Exchange，或 RMS 模板突然消失；Get-RMSTemplate 返回空或报错；存在多个 LicensingLocation 值 | IRM LicensingLocation 中存在多个值，但 AipServiceConfiguration 返回的 LicensingExtranetDist... | 按官方 TSG 重新排序 IRM Licensing Locations，确保 Get-AipServiceConfiguration 返回的 URL 排列第一；参考指南 ado-wiki-b-ver... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 17 | Microsoft Teams 或 AAD 分组（Groups）中敏感度标签不显示；Teams 用户无法看到或应用标签 | IRM 中 AutomaticServiceUpdateEnabled=false，禁止了 AIP 新功能自动同步及 Azure AD 同步，Teams/AAD... | Set-IRMConfiguration -AutomaticServiceUpdateEnabled $true；等待约 24h 同步生效后验证 | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 18 | Get-AipServiceConfiguration 显示 FunctionalState 或 IPCv3ServiceFunctionalState 为 Disabled；所有依赖 AIP 加密的... | AIP (Azure Information Protection) 服务或 IPCv3 服务被禁用 | 1) Enable-AipService（启用 AIP 服务）；2) Enable-AipServiceIPCv3（启用 IPC v3）；3) 运行 Get-AipServiceConfigurati... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 19 | 使用 Encrypt-Only (EO) 模板发送加密邮件时，PDF 附件未被加密（收件人可直接打开） | IRM 中 EnablePdfEncryption=false，PDF 附件加密功能未开启 | Set-IRMConfiguration -EnablePdfEncryption $true | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 20 | 邮件日志（Journaling）的副本收件人收到的 journal 邮件仍然加密，没有附带可直接读取的解密副本 | IRM 中 JournalReportDecryptionEnabled=false，未启用加密邮件的 journal 解密功能 | Set-IRMConfiguration -JournalReportDecryptionEnabled $true；Journal 收件人将收到两份附件：一份加密原文、一份解密副本 | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 21 | OWA 中默认的 Do Not Forward 或 Encrypt-Only 选项不可用（被禁用） | IRM 中 SimplifiedClientAccessEncryptOnlyDisabled=true 或 SimplifiedClientAccessDoN... | Set-IRMConfiguration -SimplifiedClientAccessEncryptOnlyDisabled $false（恢复 EO）；Set-IRMConfiguration -... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FHow%20to%3A%20Purview%20Message%20Encryption%2FHow%20to%3A%20Verify%20and%20set%20the%20Information%20Rights%20Management%20%28IRM%29%20Configuration%20for%20Purview%20Message%20Encryption) |
| 22 | 发送加密邮件时收到 NDR："550 5.3.101 RmsSvcAgent; Cannot RMS protect the message because Encryption is disable... | IRM 配置错误或 EXO Transport 无法从 AIP 获取 IRM 配置（AIP 服务禁用、LicensingLocation 配置错误或 IRM 禁... | 1) 获取 Extended Message Trace，确认 tenant_id 正确；2) 运行 Assist365 诊断 'Validate Office Message Encryption ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FPurview%20Message%20Encryption%2FTroubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption%2FScenario%3A%20550%205.3.101%20RmsSvcAgent%3B%20Cannot%20RMS%20protect%20the%20message%20because%20Encryption%20is%20disabled) |
| 23 | Recipient cannot open encrypted attachment (Word/Excel/PowerPoint); error occurs when attempting to ... | Conditional Access (CA) policies in the sender's organization require specific a... | Option A: Create a guest account for the external recipient in the sender's tenant and have them com... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Recipient%20is%20not%20able%20to%20open%20Encrypted%20Attachment) |
| 24 | External recipient (Gmail/Yahoo) not receiving One Time Passcode (OTP) to open encrypted message; OT... | OTPEnabled is set to false in the OME Configuration, so the OTP sign-in option i... | Connect to EXO PowerShell. Run Get-OmeConfiguration to check OTPEnabled. If false, run: Set-OMEConfi... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Recipient%20is%20not%20receiving%20a%20One%20Time%20Passcode%20%28OTP%29) |
| 25 | External recipient (Gmail/Yahoo/365) cannot find the OTP email in inbox; OTP email seems lost | The OTP email may have been delivered to the Junk/Spam folder or quarantined by ... | 1. Search mailbox for 'one-time passcode'. For Gmail/Yahoo: use 'in:spam "one-time passcode"'. For M... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Recipient%20is%20not%20receiving%20a%20One%20Time%20Passcode%20%28OTP%29) |
| 26 | Recipient set up inbox rule to forward OTP email to another mailbox; forwarded OTP does not work | By design: the OTP code email can only be used by the original recipient of the ... | This is by design. The OTP email cannot be forwarded. The original recipient must receive and use th... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Recipient%20is%20not%20receiving%20a%20One%20Time%20Passcode%20%28OTP%29) |
| 27 | NDR 554 5.2.0 STOREDRV.Deliver.Exception or NDR 550 5.7.162 when sending encrypted email; encrypted ... | Publishing license is too large. When a message is encrypted, recipient addresse... | For sensitivity label encryption: go to Purview Portal → label Access Control settings → minimize th... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Remote%20server%20returned%20554%20%205.2.0%20%20STOREDRV.Deliver.Exception) |
| 28 | Error shown when attempting to preview Word/Excel/PowerPoint documents from Purview encrypted messag... | Either the user lacks label permissions to view the document, Conditional Access... | 1. Check if document is labeled and verify user has permission in the label configuration. 2. Check ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20Unable%20to%20preview%20Office%20documents%20from%20Purview%20encrypted%20messages) |
| 29 | Get-RMSTemplate returns no templates; DLP rule template dropdown remains empty even though user has ... | IRM configuration settings are incorrect or AzureRMSEnabled is not set to true, ... | Run Get-IRMConfiguration and verify AzureRMSEnabled = $true. If not, follow the IRM configuration ve... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Purview%20Message%20Encryption/Troubleshooting%20Scenarios%3A%20Purview%20Message%20Encryption/Scenario%3A%20User%20cannot%20configure%20encryption%20via%20DLP%20Rule) |
| 30 | Users cannot open/send encrypted emails or the Encrypt button is missing in Outlook and Outlook on t... | Microsoft 365 subscription does not support Purview Message Encryption, tenant i... | 1) Run OME diagnostic in M365 admin center. 2) Verify subscription supports OME. 3) Run Get-OwaMailb... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/office-message-encryption/fix-message-encryption-issue-microsoft-purview) |
| 31 | eDiscovery cannot search or decrypt email messages sent with Purview Message Encryption custom brand... | OME custom branding templates deliver encrypted emails to the encrypted message ... | Known limitation by design. Use standard OME without custom branding if eDiscovery access is require... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/edisc-decryption) |
| 32 | SharePoint takes 30-90 seconds to download files from IRM-enabled document library via RMS Connector... | SharePoint is attempting to retrieve RMS templates directly from AIP instead of ... | Create MsipcHostNameRedirection.dat file with mapping: Azure RMS endpoint URL to connector URL (e.g.... | 🔵 5.5 | ado-wiki |
| 33 | External recipient cannot open encrypted email using Purview Message Encryption - message body is bl... | Conditional Access (CA) or MFA policy in sender tenant blocks external recipient... | 1) Review and adjust external-facing CA policies in sender tenant. 2) Check MFA policies that may bl... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/office-message-encryption/fix-message-encryption-issue-microsoft-purview) |
| 34 | External recipient cannot open encrypted email - blank body or Read the message link | CA/MFA policy blocks AIP endpoint access, or sensitivity label restricts to inte... | Check sender tenant CA/MFA policies for external AIP access. Verify label scope. Use OME portal | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/outlook/security/external-recipient-cant-open-encrypted-email) |