# AVD W365 ANC 网络连接 - Comprehensive Troubleshooting Guide

**Entries**: 11 | **Drafts fused**: 5 | **Kusto queries fused**: 2
**Source drafts**: ado-wiki-anc-device-filter-troubleshooting.md, ado-wiki-anc-domain-credential-management.md, ado-wiki-anc-ip-availability-intune-setup.md, ado-wiki-anc-limit-increase.md, ado-wiki-change-anc-limitation.md
**Kusto references**: health-check.md, url-access-check.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| ANC health check fails with DNS resolution error: '_ldap._tc... | DC DNS SRV records (_ldap._tcp.domain.local) were manually a... | Verify DNS Servers configured in the VNET are reachable, Dom... |
| ANC deploy failure due to 'Environment and configuration is ... | GPO with 'AllSigned' execution policy for PowerShell blocks ... | Solution 1: Move ANC to blank GPO (remove AllSigned executio... |
| ANC configuration fails during Environment and configuration... | WinRM service incorrectly configured via image, GPO deployme... | Reconfigure WinRM service to allow messages from IP addresse... |
| ANC endpoint connectivity check shows warning for http://log... | ANC checks both TCP and HTTP for login.microsoftonline.com; ... | Whitelist www.office.com as workaround. Dev team and PM are ... |
| Cannot delete unused Azure Network Connection (ANC) via Grap... | Provisioning policy that previously referenced the ANC was d... | 1) Run Kusto query on CloudPCEvent with TenantID and ANC ID ... |
| ANC Endpoint Connectivity check fails each time for differen... | DNS Conditional Forwarders on the Domain Controller only inc... | 1) Collect trace logs from DC during ANC checks to identify ... |
| ANC health check fails with ResourceAvailabilityCheckNoSubne... | Delete Lock or ReadOnly Lock on the resource group prevents ... | 1) Go to Azure Portal > Resource Groups > affected RG > Sett... |
| ANC (Azure Network Connection) health checks fail with Endpo... | Default outbound connectivity on subnets within MCAPS tenant... | Set up an Azure NAT Gateway for outbound connectivity on the... |

### Phase 2: Detailed Investigation

#### ANC Device Filter Troubleshooting
> Source: [ado-wiki-anc-device-filter-troubleshooting.md](guides/drafts/ado-wiki-anc-device-filter-troubleshooting.md)

**Note:** The release is hardcoded in the Intune Portal, reason why the Troubleshooting is limited to the visuals or outputs. In case the action plans below are exhausted, follow the ICM process to fi

#### Overview
> Source: [ado-wiki-anc-domain-credential-management.md](guides/drafts/ado-wiki-anc-domain-credential-management.md)

When a Hybrid Azure Active Directory-Joined (HAADJ) ANC is created, the on-prem domain credential information attached to the ANC. W365 has provided a secure way to ensure customer credential safety i

#### ANC IP Availability Column Setup - Windows 365
> Source: [ado-wiki-anc-ip-availability-intune-setup.md](guides/drafts/ado-wiki-anc-ip-availability-intune-setup.md)

- Customer has an existing ANC.

#### ANC Limit Increase Process
> Source: [ado-wiki-anc-limit-increase.md](guides/drafts/ado-wiki-anc-limit-increase.md)

- Current limit: **50 ANCs** for all customers

#### JIT Access Preparation
> Source: [ado-wiki-change-anc-limitation.md](guides/drafts/ado-wiki-change-anc-limitation.md)

> **Stop**: This information should only be followed by WCX PMs and SaaF teams. These steps do not apply to CSS.

*Contains 1 KQL query template(s)*

### Phase 3: Kusto Diagnostics

#### health-check
> `[Tool: Kusto skill - health-check.md]`

AAD 租户 ID

#### url-access-check
> `[Tool: Kusto skill - url-access-check.md]`

Session Host 名称

### Key KQL Queries

**Query 1:**
```kql
CloudPCEvent
  | project env_cloud_environment, env_cloud_name, ApplicationName, ContextId
  | where ApplicationName in ("conn", "connFunction")
  | where ContextId == "<TenantId>"
  | distinct env_cloud_name
```

**Query 2:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| where Name == "SxSStackListenerCheck" 
    or Name == "DomainReachableHealthCheck" 
    or Name == "DomainTrustCheckHealthCheck" 
    or Name == "DomainJoinedCheck" 
    or Name == "FSLogixHealthCheck" 
    or Name == "MonitoringAgentCheck" 
    or Name == "SessionHostCanAccessUrlsCheck" 
    or Name == "RDAgentCanReachRDGatewayURL" 

```

**Query 3:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where AADTenantId == "{AADTenantId}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| where ResType != "Success"
| project TIMESTAMP, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```

**Query 4:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where PreciseTimeStamp > ago(1d)
| where Role == 'RDAgent'
| where Name endswith "Check"
| where AADTenantId != ""
| summarize arg_max(PreciseTimeStamp, ResType) by Env, Ring, HostPool, HostInstance, Name, AADTenantId
| order by Env, Ring, HostPool, HostInstance
```

**Query 5:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(7d)
| where Name endswith "Check"
| where ResType != "Success"
| summarize FailureCount = count() by bin(TIMESTAMP, 1h), Name
| order by TIMESTAMP desc
```

**Query 6:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = tostring(x.SessionHostHealthCheckResult)
| extend UrlsAccessibleCheck = parse_json(HealthCheckResult)
| where UrlsAccessibleCheck.ErrorCode != "0"
| project Precis
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | ANC health check fails with DNS resolution error: '_ldap._tcp.domain.com: This o... | DC DNS SRV records (_ldap._tcp.domain.local) were manually added in the DNS Serv... | Verify DNS Servers configured in the VNET are reachable, Domain Join ports are n... | 🔵 7.5 | ADO Wiki |
| 2 | ANC deploy failure due to 'Environment and configuration is ready' check failing... | GPO with 'AllSigned' execution policy for PowerShell blocks DSC extension, or re... | Solution 1: Move ANC to blank GPO (remove AllSigned execution policy). Solution ... | 🔵 7.5 | ADO Wiki |
| 3 | ANC configuration fails during Environment and configuration checks with Interna... | WinRM service incorrectly configured via image, GPO deployment, or Intune CSP co... | Reconfigure WinRM service to allow messages from IP addresses. Check GPO: see ht... | 🔵 7.5 | ADO Wiki |
| 4 | ANC endpoint connectivity check shows warning for http://login.microsoftonline.c... | ANC checks both TCP and HTTP for login.microsoftonline.com; HTTP check encounter... | Whitelist www.office.com as workaround. Dev team and PM are aware and working on... | 🔵 7.5 | ADO Wiki |
| 5 | Cannot delete unused Azure Network Connection (ANC) via Graph API - error 'Faile... | Provisioning policy that previously referenced the ANC was deleted but backend r... | 1) Run Kusto query on CloudPCEvent with TenantID and ANC ID to check if ANC is s... | 🔵 7.5 | ADO Wiki |
| 6 | ANC Endpoint Connectivity check fails each time for different endpoints - interm... | DNS Conditional Forwarders on the Domain Controller only include main domains bu... | 1) Collect trace logs from DC during ANC checks to identify all accessed endpoin... | 🔵 7.5 | ADO Wiki |
| 7 | ANC health check fails with ResourceAvailabilityCheckNoSubnetIP - subnet has no ... | Delete Lock or ReadOnly Lock on the resource group prevents W365 DeleteAzureReso... | 1) Go to Azure Portal > Resource Groups > affected RG > Settings > Locks, note l... | 🔵 7.5 | ADO Wiki |
| 8 | ANC (Azure Network Connection) health checks fail with Endpoint Connectivity, Lo... | Default outbound connectivity on subnets within MCAPS tenants was disabled due t... | Set up an Azure NAT Gateway for outbound connectivity on the affected subnet. Af... | 🔵 7.5 | ADO Wiki |
| 9 | Windows 365 Cloud PC provisioning or ANC (Azure Network Connection) fails when t... | Built-in DSC scripts used during Windows 365 provisioning are internally signed ... | AllSigned execution policy is not supported for Windows 365 Cloud PCs. Switch to... | 🔵 7.5 | ADO Wiki |
| 10 | Large Cloud PC provisioning batch fails with 'We encountered a service error'; u... | Default route sends all Cloud PC traffic through VPN Gateway, overwhelming it; p... | Options: 1) Upgrade VPN Gateway to higher SKU; 2) Change encryption algorithm to... | 🔵 6.0 | ADO Wiki |
| 11 | Cloud PC provisioning fails with 'Not Enough IP Addresses' error when customer u... | The subnet serving the Azure Network Connection (ANC) has exhausted all availabl... | Customer must extend the address space for the subnet serving the ANC in their V... | 🔵 6.0 | ADO Wiki |
