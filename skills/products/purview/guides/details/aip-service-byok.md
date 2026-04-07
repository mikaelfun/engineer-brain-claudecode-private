# Purview AIP Service / BYOK / TPD 管理 -- Comprehensive Troubleshooting Guide

**Entries**: 20 | **Drafts fused**: 12 | **Kusto queries fused**: 2
**Source drafts**: [ado-wiki-a-dke-consume-protected-content.md](..\guides/drafts/ado-wiki-a-dke-consume-protected-content.md), [ado-wiki-a-mapping-aip-keys-to-imported-tpds.md](..\guides/drafts/ado-wiki-a-mapping-aip-keys-to-imported-tpds.md), [ado-wiki-activate-aipservice-keys-byok-mmk.md](..\guides/drafts/ado-wiki-activate-aipservice-keys-byok-mmk.md), [ado-wiki-aip-tenant-migrations.md](..\guides/drafts/ado-wiki-aip-tenant-migrations.md), [ado-wiki-b-aip-service-ps-commands.md](..\guides/drafts/ado-wiki-b-aip-service-ps-commands.md), [ado-wiki-b-document-tracking.md](..\guides/drafts/ado-wiki-b-document-tracking.md), [ado-wiki-b-dsr-delete-request.md](..\guides/drafts/ado-wiki-b-dsr-delete-request.md), [ado-wiki-b-rms-v1-export-tuds-tpds.md](..\guides/drafts/ado-wiki-b-rms-v1-export-tuds-tpds.md), [ado-wiki-b-tpd-aip-key-requests.md](..\guides/drafts/ado-wiki-b-tpd-aip-key-requests.md), [ado-wiki-b-track-and-revoke.md](..\guides/drafts/ado-wiki-b-track-and-revoke.md), [ado-wiki-connect-aipservice-fails.md](..\guides/drafts/ado-wiki-connect-aipservice-fails.md), [ado-wiki-migrate-aip-byok-key-vault.md](..\guides/drafts/ado-wiki-migrate-aip-byok-key-vault.md)
**Kusto references**: [mip-request-analysis.md](../../kusto/purview/references/queries/mip-request-analysis.md), [rms-auth-tracking.md](../../kusto/purview/references/queries/rms-auth-tracking.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-dke-consume-protected-content.md

1. Unable to Consume DKE Protected Content `[source: ado-wiki-a-dke-consume-protected-content.md]`
2. Things to Check `[source: ado-wiki-a-dke-consume-protected-content.md]`
3. appsettings.json `[source: ado-wiki-a-dke-consume-protected-content.md]`
4. AAD App Registration `[source: ado-wiki-a-dke-consume-protected-content.md]`
5. Additional DKE Troubleshooting Tips `[source: ado-wiki-a-dke-consume-protected-content.md]`
6. DKE Troubleshooting Guide `[source: ado-wiki-a-dke-consume-protected-content.md]`
7. Introduction `[source: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`
8. Mapping Key GUIDs to TPDs `[source: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`
9. Method 1 - Using SQL `[source: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`
10. Use SQL Server Management Studio to open the AD RMS configuration database. `[source: ado-wiki-a-mapping-aip-keys-to-imported-tpds.md]`

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
| Cannot protect new files with AIP after BYOK key expires in Azure Key Vault — er... | Azure Key Vault key used for BYOK has expired. AIP still sho... | Generate or import a new key in Azure Key Vault, then use Use-AipServiceKeyVault... |
| Concern about old protected content accessibility after AIP BYOK rekey — will ol... | After rekey, old tenant key is automatically marked as Archi... | Old content remains accessible after rekey — AIP handles key selection automatic... |
| Users unable to apply AIP/MIP encryption to documents. Desktop apps fail to encr... | AIP Service Onboarding Control Policy (OCP) is configured, r... | 1) Check OCP: Get-AipServiceOnboardingControlPolicy / fl. 2) Verify user has RMS... |
| AIP Service super user cannot decrypt content despite being configured. Super us... | Super user was configured with UPN but the service now requi... | Use primary email (SMTP) address when configuring super users, not UPN. Check wi... |
| Connect-AipService fails or access denied. User has Global Admin role via group ... | AIP Service PowerShell requires Global Admin role assigned d... | 1) Assign GA role directly to user. 2) Alternative: use Add-AipServiceRoleBasedA... |
| After partial tenant migration (users only, email domain retained in old tenant)... | Ad-hoc protection is tied to the user's original email addre... | Decrypt files/mails from the old tenant using an AIP Superuser account and share... |
| After complete tenant migration (users + DNS domains + AIP config), users cannot... | Missing one or more migration prerequisites: AIP keys not im... | Verify: 1) Get-AIPServiceKeys shows old keys in new tenant, 2) old DNS domain is... |
| Import-AipServiceTpd fails with password error when importing TPD (Trusted Publi... | Incorrect password provided for the TPD encryption during im... | Re-export the TPD with a new known password from the source (AD RMS or other ten... |

`[conclusion: 🔵 7.5/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot protect new files with AIP after BYOK key expires in Azure Key Vault — error 'key is not avai... | Azure Key Vault key used for BYOK has expired. AIP still shows key status as Act... | Generate or import a new key in Azure Key Vault, then use Use-AipServiceKeyVaultKey to register it a... | 🔵 7.5 | MCVKB/21.3 AIP_ BYOK rekey_revoke key verification.md |
| 2 | Concern about old protected content accessibility after AIP BYOK rekey — will old documents become i... | After rekey, old tenant key is automatically marked as Archived. AIP client auto... | Old content remains accessible after rekey — AIP handles key selection automatically via Archived st... | 🔵 7.5 | MCVKB/21.3 AIP_ BYOK rekey_revoke key verification.md |
| 3 | Users unable to apply AIP/MIP encryption to documents. Desktop apps fail to encrypt content. OCP err... | AIP Service Onboarding Control Policy (OCP) is configured, restricting which use... | 1) Check OCP: Get-AipServiceOnboardingControlPolicy / fl. 2) Verify user has RMS license if UseRmsUs... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Check%20AIP%20Service%20Configuration) |
| 4 | AIP Service super user cannot decrypt content despite being configured. Super user feature not worki... | Super user was configured with UPN but the service now requires the primary emai... | Use primary email (SMTP) address when configuring super users, not UPN. Check with Get-AipServiceSup... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Check%20AIP%20Service%20Configuration) |
| 5 | Connect-AipService fails or access denied. User has Global Admin role via group membership but canno... | AIP Service PowerShell requires Global Admin role assigned directly to the user,... | 1) Assign GA role directly to user. 2) Alternative: use Add-AipServiceRoleBasedAdministrator to assi... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Check%20AIP%20Service%20Configuration) |
| 6 | After partial tenant migration (users only, email domain retained in old tenant), migrated users can... | Ad-hoc protection is tied to the user's original email address; migrated users h... | Decrypt files/mails from the old tenant using an AIP Superuser account and share unprotected copies ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20to%3A%20AIP%20Service%20Tenant%20Migration) |
| 7 | After complete tenant migration (users + DNS domains + AIP config), users cannot open/decrypt AIP-pr... | Missing one or more migration prerequisites: AIP keys not imported to new tenant... | Verify: 1) Get-AIPServiceKeys shows old keys in new tenant, 2) old DNS domain is verified in new ten... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20to%3A%20AIP%20Service%20Tenant%20Migration) |
| 8 | Import-AipServiceTpd fails with password error when importing TPD (Trusted Publishing Domain) to AIP... | Incorrect password provided for the TPD encryption during import. | Re-export the TPD with a new known password from the source (AD RMS or other tenant) and retry the i... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20Import%20TPD%20to%20AIP%20Service) |
| 9 | Import-AipServiceTpd fails when importing a TPD that was already imported to another AIP tenant. | A TPD cannot be imported to multiple tenants simultaneously. The same TPD is alr... | Delete the TPD from the existing tenant first, then retry importing to the new tenant. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20Import%20TPD%20to%20AIP%20Service) |
| 10 | Applying encryption label fails: 'We were not able to find the Information Rights Management templat... | AIP Service is disabled for the tenant, or the user does not meet the AIP Servic... | Verify AIP Service is enabled via AIPService PowerShell module. Check for Onboarding Control Policy:... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/Sensitivity%20Labels/Troubleshooting%20Scenarios%3A%20Sensitivity%20Labels/Scenario%3A%20Sensitivity%20Label%20is%20not%20working%20correctly) |
| 11 | Set-AipServiceTemplateProperty fails with error when attempting to set AD RMS-imported templates to ... | AD RMS templates imported via TPD are cryptographically tied to that imported AD... | Recreate AD RMS templates as independent AIP templates: 1. Export template XML files from AD RMS cac... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20Importing%20AD%20RMS%20templates%20into%20AIP) |
| 12 | PowerShell module (AIPService, or other Microsoft cloud PS modules) fails to connect to Microsoft cl... | .NET Framework version 4.6 or older is installed; old .NET Framework does not de... | Upgrade .NET Framework to version 4.8 from https://dotnet.microsoft.com/en-us/download/dotnet-framew... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FLearn%3A%20AipSerivce%2FLearn%3A%20.NET%20Framework) |
| 13 | Connect-AIPService PowerShell command fails or not found; AIPService module missing or outdated | AIPService PowerShell module is not installed or is on an outdated version | Run `Get-Module -ListAvailable -Name aipservice` to check installation. Install/update with: `Instal... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Connect-AIPService%20fails) |
| 14 | Connect-AIPService fails when run from PowerShell 7 | AIPService PowerShell module does not support PowerShell 7 | Run Connect-AIPService from a PowerShell 5 (Windows PowerShell) window instead of PowerShell 7. | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Connect-AIPService%20fails) |
| 15 | Connect-AIPService fails with authentication error; user has Global Administrator role but connectio... | Connect-AIPService requires the user to be a DIRECT member of the Global Adminis... | Add the user as a direct member of the Global Administrator role in Entra ID. Alternatively, grant t... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Connect-AIPService%20fails) |
| 16 | Connect-AIPService fails with SSL or network error; credential prompt never appears (discover.aadrm.... | TLS 1.2 not enabled on client machine, unsupported cipher suites, or firewall/pr... | 1) Enable TLS 1.2 or higher on the machine. 2) Verify required cipher suites are enabled. 3) Ensure ... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Connect-AIPService%20fails) |
| 17 | Use-AipServiceKeyVaultKey or Set-AipServiceKeyProperties fails when switching to or activating a BYO... | AIP service cannot access the previously active BYOK key because it was deleted ... | If the BYOK key was deleted from Key Vault, escalation is required. Collect verbose error output and... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20Activate%20AIPService%20keys%20%28BYOK%20or%20MMK%29) |
| 18 | Use-AipServiceKeyVaultKey fails; AIP service cannot access BYOK key in Azure Key Vault even though t... | AIP service does not have the correct permissions on the Key Vault key | Verify and grant AIP service the correct Key Vault permissions. Reference: https://learn.microsoft.c... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20Activate%20AIPService%20keys%20%28BYOK%20or%20MMK%29) |
| 19 | Use-AipServiceKeyVaultKey fails; BYOK key in Key Vault is present but activation fails | The BYOK key length is not supported by the AIP service | Check supported key length requirements at: https://learn.microsoft.com/en-us/azure/information-prot... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FTroubleshooting%20Scenarios%3A%20AipService%2FScenario%3A%20Unable%20to%20Activate%20AIPService%20keys%20%28BYOK%20or%20MMK%29) |
| 20 | Need to migrate AIP Service BYOK key from one Azure Key Vault to another (e.g., subscription migrati... | - | 1) Keep original BYOK key/subscription/AKV intact. 2) Import original BYOK key to new AKV. 3) Config... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20To%3A%20Migrate%20AIP%20Service%20BYOK%20key%20vault%20keys) |