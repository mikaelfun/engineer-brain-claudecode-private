# Purview 跨云 / 跨租户 MIP 标签 -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Drafts fused**: 1 | **Kusto queries fused**: 1
**Source drafts**: [onenote-purview-cross-cloud-labeling-config.md](..\guides/drafts/onenote-purview-cross-cloud-labeling-config.md)
**Kusto references**: [mip-request-analysis.md](../../kusto/purview/references/queries/mip-request-analysis.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: onenote-purview-cross-cloud-labeling-config.md

1. Cross-Cloud Labeling Configuration and Limitations `[source: onenote-purview-cross-cloud-labeling-config.md]`
2. Configuration Requirements `[source: onenote-purview-cross-cloud-labeling-config.md]`
3. 1. Cross-Tenant Access Policy (XTAP) - Both Sides `[source: onenote-purview-cross-cloud-labeling-config.md]`
4. 2. Label Encryption Permissions `[source: onenote-purview-cross-cloud-labeling-config.md]`
5. 3. Email Address Requirement `[source: onenote-purview-cross-cloud-labeling-config.md]`
6. Supported Content Types `[source: onenote-purview-cross-cloud-labeling-config.md]`
7. Limitations `[source: onenote-purview-cross-cloud-labeling-config.md]`
8. Only **offline** encrypted Word, Excel, and PowerPoint files are supported `[source: onenote-purview-cross-cloud-labeling-config.md]`
9. **Email is NOT supported** - includes all Outlook clients (desktop, web, mobile) `[source: onenote-purview-cross-cloud-labeling-config.md]`
10. Public Preview - behavior may change `[source: onenote-purview-cross-cloud-labeling-config.md]`

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
| Cross-cloud MIP label decryption fails - bearer token missing verified_primary_e... | Account in home tenant has no valid email address (no proxyA... | Ensure user account in home tenant has valid email set as proxyAddress. Verify a... |
| Cross-cloud encrypted file fails to open on some devices - works on newer Office... | Office versions before 2402 use MSIPC (legacy RMS engine) wh... | Check HTTP headers to determine MSIPC vs MIP SDK. Check HKCU\Software\Microsoft\... |
| Cross-tenant MIP label access fails - no access token for aadrm.com, Entra cross... | Entra ID cross-tenant access settings block outbound to Azur... | Configure Entra ID cross-tenant access settings: add outbound access rule allowi... |
| Cross-cloud labeling (Purview) only supports offline Word/Excel/PowerPoint files... | Cross-cloud labeling is in Public Preview with limited scope... | Only offline encrypted Word, Excel, PowerPoint files are supported. Prerequisite... |
| External user with Entra ID guest account gets error 'selected user account does... | MIP Viewer may not properly authenticate external guest user... | 1) Install Adobe Acrobat DC with MIP extension. 2) When error appears, select Ba... |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cross-cloud MIP label decryption fails - bearer token missing verified_primary_email claim | Account in home tenant has no valid email address (no proxyAddress). Without ver... | Ensure user account in home tenant has valid email set as proxyAddress. Verify access token contains... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 2 | Cross-cloud encrypted file fails to open on some devices - works on newer Office but not older build... | Office versions before 2402 use MSIPC (legacy RMS engine) which may not handle c... | Check HTTP headers to determine MSIPC vs MIP SDK. Check HKCU\Software\Microsoft\Office\16.0\Common\D... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 3 | Cross-tenant MIP label access fails - no access token for aadrm.com, Entra cross-tenant outbound set... | Entra ID cross-tenant access settings block outbound to Azure RMS resource (AppI... | Configure Entra ID cross-tenant access settings: add outbound access rule allowing Azure Rights Mana... | 🔵 7.5 | MCVKB/21.4 [MIP] _ Cross-Cloud Label.md |
| 4 | Cross-cloud labeling (Purview) only supports offline Word/Excel/PowerPoint files - email (all Outloo... | Cross-cloud labeling is in Public Preview with limited scope. Email messages are... | Only offline encrypted Word, Excel, PowerPoint files are supported. Prerequisites: 1) Bidirectional ... | 🔵 7.5 | MCVKB/cross-cloud labeling.md |
| 5 | External user with Entra ID guest account gets error 'selected user account does not exist in the te... | MIP Viewer may not properly authenticate external guest user. Requires Adobe Acr... | 1) Install Adobe Acrobat DC with MIP extension. 2) When error appears, select Back to continue openi... | 🟡 4.5 | [MS Learn](https://learn.microsoft.com/troubleshoot/microsoft-365/purview/sensitivity-labels/known-issues-ip-client) |