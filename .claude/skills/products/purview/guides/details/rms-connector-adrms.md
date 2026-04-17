# Purview RMS Connector 与 AD RMS -- Comprehensive Troubleshooting Guide

**Entries**: 10 | **Drafts fused**: 13 | **Kusto queries fused**: 1
**Source drafts**: [ado-wiki-a-connector-spns.md](..\guides/drafts/ado-wiki-a-connector-spns.md), [ado-wiki-a-default-iis-settings-rms-connector.md](..\guides/drafts/ado-wiki-a-default-iis-settings-rms-connector.md), [ado-wiki-a-ds-lookup-caching.md](..\guides/drafts/ado-wiki-a-ds-lookup-caching.md), [ado-wiki-a-fiddler-trace-rms-connector.md](..\guides/drafts/ado-wiki-a-fiddler-trace-rms-connector.md), [ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md](..\guides/drafts/ado-wiki-a-iis-kerberos-configuration-for-ad-rms.md), [ado-wiki-a-restore-ad-rms-databases.md](..\guides/drafts/ado-wiki-a-restore-ad-rms-databases.md), [ado-wiki-a-rms-connector-tsg.md](..\guides/drafts/ado-wiki-a-rms-connector-tsg.md), [ado-wiki-a-view-ad-rms-certificates-in-iis.md](..\guides/drafts/ado-wiki-a-view-ad-rms-certificates-in-iis.md), [ado-wiki-b-learn-default-iis-settings.md](..\guides/drafts/ado-wiki-b-learn-default-iis-settings.md), [ado-wiki-b-rms-v1-cluster-key-password.md](..\guides/drafts/ado-wiki-b-rms-v1-cluster-key-password.md), [ado-wiki-b-rms-v1-configuration.md](..\guides/drafts/ado-wiki-b-rms-v1-configuration.md), [ado-wiki-b-rms-v1-install.md](..\guides/drafts/ado-wiki-b-rms-v1-install.md), [onenote-rms-connector-troubleshooting.md](..\guides/drafts/onenote-rms-connector-troubleshooting.md)
**Kusto references**: [rms-auth-tracking.md](../../kusto/purview/references/queries/rms-auth-tracking.md)
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Initial Diagnosis
> Sources: ado-wiki-a-default-iis-settings-rms-connector.md, ado-wiki-a-connector-spns.md

1. RMS Connector Service Principals (SPNs) `[source: ado-wiki-a-connector-spns.md]`
2. Introduction `[source: ado-wiki-a-connector-spns.md]`
3. Inspecting Connector SPNs `[source: ado-wiki-a-connector-spns.md]`
4. Useful Commands `[source: ado-wiki-a-connector-spns.md]`
5. Default IIS Settings for RMS Connector `[source: ado-wiki-a-default-iis-settings-rms-connector.md]`
6. Introduction `[source: ado-wiki-a-default-iis-settings-rms-connector.md]`
7. IIS Settings `[source: ado-wiki-a-default-iis-settings-rms-connector.md]`
8. SSL Settings `[source: ado-wiki-a-default-iis-settings-rms-connector.md]`
9. Authentication `[source: ado-wiki-a-default-iis-settings-rms-connector.md]`
10. NTFS Permissions `[source: ado-wiki-a-default-iis-settings-rms-connector.md]`

### Phase 2: Data Collection (KQL)

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
| AD RMS management console Health and Troubleshooting reports unavailable; link i... | Missing .NET Framework 3.5 Features and Report Viewer Redist... | 1) Add .NET Framework 3.5 Features via Server Manager Add Roles and Features Wiz... |
| AD RMS group membership changes not reflected; users cannot access protected con... | AD RMS caches Active Directory directory services lookups in... | Clear AD RMS directory services cache by running DELETE statements on PrincipalA... |
| After migrating from AD RMS to AIP, newer Office clients using MIP SDK fail lice... | Newer Office clients use MIP SDK instead of MSIPC, which has... | Create registry key: HKCU\Software\Microsoft\Office\16.0\Common\DRM, REG_DWORD P... |
| RMS Connector stops working after disabling TLS 1.0 and/or TLS 1.1 on the server... | Windows .NET Framework defaults to TLS 1.0. The RMS Connecto... | 1) Set registry keys: SchUseStrongCrypto=1 and SystemDefaultTlsVersions=1 under ... |
| AD RMS rights granted to a universal group containing domain global groups work ... | Global Catalog servers replicate domain global/local groups ... | Use universal groups with universal group members (not domain global groups). Or... |
| AD RMS Service Connection Point (SCP) fails to register. Error when attempting t... | 1) Account is not an AD Enterprise Administrator. 2) SCP con... | 1) Ensure AD RMS admin is member of Enterprise Admins group. 2) If SCP container... |
| AD RMS configuration fails with SQL error: The File DRMS_Config.mdf is compresse... | The folder containing SQL database files has NTFS compressio... | Uncheck 'Compress contents to save disk space' option on the SQL data folder. Al... |
| Unable to change AD RMS Service account or password. Permission errors when atte... | Insufficient permissions or admin share disabled. Account ru... | 1) Ensure account is local admin, AD RMS Enterprise Admin member, and SQL SysAdm... |

`[conclusion: 🔵 7.0/10]`

---

## Known Issues Lookup

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AD RMS management console Health and Troubleshooting reports unavailable; link in GUI tries to acces... | Missing .NET Framework 3.5 Features and Report Viewer Redistributable 2008 SP1 o... | 1) Add .NET Framework 3.5 Features via Server Manager Add Roles and Features Wizard. 2) Download and... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20Add%20AD%20RMS%20Reports%20Functionality) |
| 2 | AD RMS group membership changes not reflected; users cannot access protected content despite being a... | AD RMS caches Active Directory directory services lookups in the Directory Servi... | Clear AD RMS directory services cache by running DELETE statements on PrincipalAliases, GroupAliases... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20DS%20lookup%20caching) |
| 3 | After migrating from AD RMS to AIP, newer Office clients using MIP SDK fail licensing redirection; u... | Newer Office clients use MIP SDK instead of MSIPC, which has known issues with l... | Create registry key: HKCU\Software\Microsoft\Office\16.0\Common\DRM, REG_DWORD PreferredRmsPackage=1... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAIP%20Service%2FHow%20To%3A%20AipService%2FHow%20to%3A%20AIP%20Service%20Tenant%20Migration) |
| 4 | RMS Connector stops working after disabling TLS 1.0 and/or TLS 1.1 on the server. Also applies to AD... | Windows .NET Framework defaults to TLS 1.0. The RMS Connector is a .NET applicat... | 1) Set registry keys: SchUseStrongCrypto=1 and SystemDefaultTlsVersions=1 under HKLM\SOFTWARE\Micros... | 🔵 7.0 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=/RMS%20Connector/Troubleshooting%20Scenarios%3A%20RMS%20Connector/Scenario%3A%20Connector%20issue%20after%20disabling%20TLS%201.0%20and%201.1) |
| 5 | AD RMS rights granted to a universal group containing domain global groups work intermittently. Some... | Global Catalog servers replicate domain global/local groups but NOT their member... | Use universal groups with universal group members (not domain global groups). Or control which GCs R... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FTroubleshooting%20Scenarios%3A%20AD%20RMS%2FScenario%3A%20AD%20Group%20Lookups%20not%20Working%20as%20Expected) |
| 6 | AD RMS Service Connection Point (SCP) fails to register. Error when attempting to register SCP in AD... | 1) Account is not an AD Enterprise Administrator. 2) SCP container object is mis... | 1) Ensure AD RMS admin is member of Enterprise Admins group. 2) If SCP container missing, create it ... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FTroubleshooting%20Scenarios%3A%20AD%20RMS%2FScenario%3A%20Failed%20to%20register%20the%20AD%20RMS%20SCP) |
| 7 | AD RMS configuration fails with SQL error: The File DRMS_Config.mdf is compressed but does not resid... | The folder containing SQL database files has NTFS compression enabled (Compress ... | Uncheck 'Compress contents to save disk space' option on the SQL data folder. Also ensure installati... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FTroubleshooting%20Scenarios%3A%20AD%20RMS%2FScenario%3A%20Installation%20Error%20after%20Confirmation%20step) |
| 8 | Unable to change AD RMS Service account or password. Permission errors when attempting the change. | Insufficient permissions or admin share disabled. Account running wizard must be... | 1) Ensure account is local admin, AD RMS Enterprise Admin member, and SQL SysAdmin. 2) New service a... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FTroubleshooting%20Scenarios%3A%20AD%20RMS%2FScenario%3A%20Unable%20to%20change%20AD%20RMS%20Service%20account) |
| 9 | AD RMS clients fail to connect after disabling TLS 1.0/1.1. MSIPC log shows Send Request Failed with... | AD RMS is a .NET application that defaults to TLS 1.0. After disabling TLS 1.0/1... | 1) Set registry keys to enforce .NET StrongCrypto (TLS 1.2): SystemDefaultTlsVersions=1 and SchUseSt... | 🔵 5.5 | [ADO Wiki](https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20to%3A%20Configure%20AD%20RMS%20for%20TLS%201.2) |
| 10 | RMS template present in AIP but not visible to on-premises Exchange/FCI via RMS Connector; scoped te... | Template has ScopedIdentities configured, and scoped templates are not advertise... | Run: Set-AipServiceTemplateProperty -TemplateId <id> -EnableInLegacyApps $true. Note: RMS Connector ... | 🔵 5.5 | ado-wiki |