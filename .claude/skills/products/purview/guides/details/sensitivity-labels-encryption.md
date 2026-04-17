# Purview 敏感度标签加密与权限 -- Comprehensive Troubleshooting Guide

**Entries**: 7 | **Drafts fused**: 5 | **Kusto queries fused**: 1
**Source drafts**: [ado-wiki-b-learn-exo-powershell-pme.md](..\guides/drafts/ado-wiki-b-learn-exo-powershell-pme.md), [ado-wiki-b-message-header-analyzer-tool.md](..\guides/drafts/ado-wiki-b-message-header-analyzer-tool.md), [ado-wiki-b-required-information-pme.md](..\guides/drafts/ado-wiki-b-required-information-pme.md), [ado-wiki-check-encryption-method.md](..\guides/drafts/ado-wiki-check-encryption-method.md), [ado-wiki-check-label-encryption-enabled.md](..\guides/drafts/ado-wiki-check-label-encryption-enabled.md)
**Kusto references**: [mip-request-analysis.md](../../kusto/purview/references/queries/mip-request-analysis.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-b-learn-exo-powershell-pme.md, ado-wiki-b-message-header-analyzer-tool.md

1. EXO PowerShell Quick Reference — Purview Message Encryption `[source: ado-wiki-b-learn-exo-powershell-pme.md]`
2. Common Commands `[source: ado-wiki-b-learn-exo-powershell-pme.md]`
3. Docs References `[source: ado-wiki-b-learn-exo-powershell-pme.md]`
4. Introduction `[source: ado-wiki-b-message-header-analyzer-tool.md]`
5. Prerequisites `[source: ado-wiki-b-message-header-analyzer-tool.md]`
6. Step by Step Instructions `[source: ado-wiki-b-message-header-analyzer-tool.md]`
7. Step 1: Header Extraction `[source: ado-wiki-b-message-header-analyzer-tool.md]`
8. Step 2: Access Message header Analyzer and paste the headers `[source: ado-wiki-b-message-header-analyzer-tool.md]`
9. Step 3: Analyze headers & email Routing `[source: ado-wiki-b-message-header-analyzer-tool.md]`
10. Step 4: Interpreting Results and Relevant Headers `[source: ado-wiki-b-message-header-analyzer-tool.md]`

### Phase 2: Data Collection (KQL)

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

### Phase 3: Decision Logic

| Condition | Meaning | Action |
|-----------|---------|--------|
| Cross-cloud B2B user gets access denied when opening MIP-labeled content from ap... | MIP label permissions do not include B2B email domain, speci... | Edit sensitivity label encryption settings to include B2B partner email domain, ... |
| IRM errors in Word/Excel/PowerPoint when applying sensitivity label with encrypt... | IRM client downloads from global cloud address which fails i... | Add registry: HKLM\SOFTWARE\Microsoft\MSIPC\ServiceLocation\EnterpriseCertificat... |
| Register-SPODataEncryptionPolicy (CMK for SPO/ODB) fails with error 'Please ensu... | CMK for SharePoint and OneDrive requires ALL users in the te... | Ensure all users have E5 license. For internal testing only: PG can bypass via S... |
| Protected email replies become attachments instead of inline in message thread w... | Too few rights granted in label protection settings. Edit an... | Add Edit and Save rights to the label encryption settings. This does not allow t... |
| Cannot access document with Dynamic Watermark enabled; access denied on unsuppor... | Client Office version does not support Dynamic Watermarks. U... | Upgrade to a supported Office client version. Check supported versions at Micros... |
| Users in a group that was deleted and recreated with the same email/UPN cannot o... | AIP service maintains a 30-day cache mapping email address t... | Option 1: Wait 30 days for the ObjectID cache to expire naturally. Option 2 (urg... |
| eDiscovery cannot preview, review, or export files encrypted with Microsoft encr... | The eDiscovery manager account does not have the RMS Decrypt... | Assign the RMS Decrypt role. In Purview portal this role is assigned by default ... |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cross-cloud B2B user gets access denied when opening MIP-labeled content from api.aadrm.cn | MIP label permissions do not include B2B email domain, specific B2B user, or Aut... | Edit sensitivity label encryption settings to include B2B partner email domain, or add specific B2B ... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 2 | IRM errors in Word/Excel/PowerPoint when applying sensitivity label with encryption in Mooncake | IRM client downloads from global cloud address which fails in Mooncake. Missing ... | Add registry: HKLM\SOFTWARE\Microsoft\MSIPC\ServiceLocation\EnterpriseCertification (default)=https:... | 🔵 7.5 | MCVKB/Information rights management errors..md |
| 3 | Register-SPODataEncryptionPolicy (CMK for SPO/ODB) fails with error 'Please ensure that every user i... | CMK for SharePoint and OneDrive requires ALL users in the tenant to have E5 lice... | Ensure all users have E5 license. For internal testing only: PG can bypass via SPO Escorts by runnin... | 🔵 7.5 | MCVKB/SharePoint and OneDrive.md |
| 4 | Protected email replies become attachments instead of inline in message thread when using Sensitivit... | Too few rights granted in label protection settings. Edit and Save rights are no... | Add Edit and Save rights to the label encryption settings. This does not allow the user to remove pr... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/Troubleshooting%20Scenarios%3A%20Sensitivity%20Labels/Scenario%3A%20Sensitivity%20Label%20encryption%20is%20not%20giving%20access%20as%20expected) |
| 5 | Cannot access document with Dynamic Watermark enabled; access denied on unsupported Office client ve... | Client Office version does not support Dynamic Watermarks. Unsupported versions ... | Upgrade to a supported Office client version. Check supported versions at Microsoft docs (sensitivit... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/Troubleshooting%20Scenarios%3A%20Sensitivity%20Labels/Scenario%3A%20Sensitivity%20Label%20encryption%20is%20not%20giving%20access%20as%20expected) |
| 6 | Users in a group that was deleted and recreated with the same email/UPN cannot open encrypted or pro... | AIP service maintains a 30-day cache mapping email address to AAD ObjectID. When... | Option 1: Wait 30 days for the ObjectID cache to expire naturally. Option 2 (urgent): Create an ICM ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Recreated%20Group%20in%20Entra%20with%20Same%20Email%20Unable%20to%20Access%20Encrypted%20Items) |
| 7 | eDiscovery cannot preview, review, or export files encrypted with Microsoft encryption technologies ... | The eDiscovery manager account does not have the RMS Decrypt role assigned, whic... | Assign the RMS Decrypt role. In Purview portal this role is assigned by default to eDiscovery Manage... | 🔵 6.0 | [MS Learn](https://learn.microsoft.com/purview/edisc-decryption) |