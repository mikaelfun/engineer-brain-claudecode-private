# AVD AVD 防火墙与网络 - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Drafts fused**: 7 | **Kusto queries fused**: 1
**Source drafts**: ado-wiki-a-provisioned-with-warnings-policy-firewall.md, ado-wiki-a-use-network-trace-to-determine-disconnection.md, ado-wiki-a-wan-flaps-moby-dc-mapping.md, ado-wiki-azure-firewall-health-availability.md, ado-wiki-b-outbound-connection-issue.md, ado-wiki-b-wan-flaps-server-side-disconnects.md, ado-wiki-b-whitelist-ips.md
**Kusto references**: url-access-check.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| RTT and bandwidth information missing from CloudPC Performan... | SSL inspection (by firewall/proxy) is intercepting traffic t... | Run elevated PowerShell in Cloud PC: Invoke-WebRequest -Uri ... |
| Multiple users report performance drops, hangs and disconnec... | Proxy ignoring W365/WVD URL exclusions, routing all AVD traf... | Add required AVD URLs to proxy whitelist. Primary: *.wvd.mic... |
| Specific websites unreachable from Cloud PC ERR_CONNECTION_T... | Azure SNAT ports 1024-1087 blocked by website | Configure proxy or create Azure NAT Gateway or request websi... |
| Cloud PC (or Azure VM without public IP) cannot access certa... | Azure Default Outbound Access uses SNAT with ephemeral ports... | 1) Configure proxy inside Cloud PC guest OS to bypass Azure ... |
| Cloud PC on Microsoft Hosted Network (MHN) experiences netwo... | Palo Alto HIP checks (health checks on first network connect... | Contact Palo Alto support to investigate HIP check failures.... |
| WVD no available resource error. O_AGENT_NOT_CONNECTED and E... | Network routing UDR incorrect and VNet Peering missing betwe... | Rectify routing and set up VNet Peering. |
| Users get error while accessing WVD hostpool: Oops, we could... | Two major reasons: 1) rdgateway.wvd.microsoft.com is not all... | Configure the DNS forwarders to forward DNS queries for Non-... |
| Azure KMS Activation on Azure VMs running Windows 10 Enterpr... | Microsoft announced new KMS IP addresses 20.118.99.224 and 4... | Add new Azure KMS IP addresses (20.118.99.224 and 40.83.235.... |

### Phase 2: Detailed Investigation

#### Provisioned with warnings - Policy caused, Firewall caused
> Source: [ado-wiki-a-provisioned-with-warnings-policy-firewall.md](guides/drafts/ado-wiki-a-provisioned-with-warnings-policy-firewall.md)

1. Check if the Customer is allowing the required endpoints in their firewall.

#### Summary
> Source: [ado-wiki-a-use-network-trace-to-determine-disconnection.md](guides/drafts/ado-wiki-a-use-network-trace-to-determine-disconnection.md)

- User experiences frequent disconnections on Cloud PC, every 90 minutes or so.

#### Moby / WAN Datacenter Mapping
> Source: [ado-wiki-a-wan-flaps-moby-dc-mapping.md](guides/drafts/ado-wiki-a-wan-flaps-moby-dc-mapping.md)

Datacenter | City | Country | Continent | Cloud

#### Azure Firewall Health and Availability Check
> Source: [ado-wiki-azure-firewall-health-availability.md](guides/drafts/ado-wiki-azure-firewall-health-availability.md)

> Note: This content was marked as "in development / not ready for consumption" in the source wiki. Use with caution.

#### Outbound Connection Issue for Cloud PC
> Source: [ado-wiki-b-outbound-connection-issue.md](guides/drafts/ado-wiki-b-outbound-connection-issue.md)

Covers scenarios where Cloud PC cannot access internet, reach specific ports, websites, or IP addresses.

*Contains 1 KQL query template(s)*

#### Server Side Disconnects (WAN Flaps)
> Source: [ado-wiki-b-wan-flaps-server-side-disconnects.md](guides/drafts/ado-wiki-b-wan-flaps-server-side-disconnects.md)

| Error Signature | Path Segment | Description | Probable Cause |

#### Whitelist AVD IP Addresses
> Source: [ado-wiki-b-whitelist-ips.md](guides/drafts/ado-wiki-b-whitelist-ips.md)

There are a few ways of leveraging the list of Azure Virtual Desktop IP datacenter ranges:

### Phase 3: Kusto Diagnostics

#### url-access-check
> `[Tool: Kusto skill - url-access-check.md]`

Session Host 名称

### Key KQL Queries

**Query 1:**
```kql
cluster('netcapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= ago(1d)
| where SrcIpAddress == "<src_ip>" or DstIpAddress == "<dst_ip>"
| project TimeStamp, RouterName, IngressIfName, EgressIfName, SrcIpAddress, DstIpAddress, DstTransportPort, SrcAs, DstAs, NextHop
| order by TimeStamp desc
| order by RouterName
```

**Query 2:**
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

**Query 3:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(5d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = parse_json(tostring(x.SessionHostHealthCheckResult))
| mv-expand HealthCheckResult
| extend CheckName = HealthCheckResult.HealthCheckName,
         CheckResult = H
```

**Query 4:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(5d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = parse_json(tostring(x.SessionHostHealthCheckResult))
| mv-expand HealthCheckResult
| extend CheckName = HealthCheckResult.HealthCheckName,
         CheckResult = H
```

**Query 5:**
```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| extend HealthCheckResult = parse_json(tostring(x.SessionHostHealthCheckResult))
| mv-expand HealthCheckResult
| where HealthCheckResult.HealthCheckResult != 1
| where HealthCheckResult.HealthCheckName has "Url"
| extend UrlDetails = par
```

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | RTT and bandwidth information missing from CloudPC Performance / Connection Qual... | SSL inspection (by firewall/proxy) is intercepting traffic to Geneva monitoring ... | Run elevated PowerShell in Cloud PC: Invoke-WebRequest -Uri 'https://gcs.prod.mo... | 🔵 7.5 | ADO Wiki |
| 2 | Multiple users report performance drops, hangs and disconnections on Cloud PCs. ... | Proxy ignoring W365/WVD URL exclusions, routing all AVD traffic through proxy in... | Add required AVD URLs to proxy whitelist. Primary: *.wvd.microsoft.com. Full lis... | 🔵 7.5 | ADO Wiki |
| 3 | Specific websites unreachable from Cloud PC ERR_CONNECTION_TIMED_OUT | Azure SNAT ports 1024-1087 blocked by website | Configure proxy or create Azure NAT Gateway or request website unblock | 🔵 7.5 | ADO Wiki |
| 4 | Cloud PC (or Azure VM without public IP) cannot access certain websites. Website... | Azure Default Outbound Access uses SNAT with ephemeral ports starting from 1024-... | 1) Configure proxy inside Cloud PC guest OS to bypass Azure SNAT port allocation... | 🔵 7.5 | ADO Wiki |
| 5 | Cloud PC on Microsoft Hosted Network (MHN) experiences network session drops rel... | Palo Alto HIP checks (health checks on first network connect) fail, causing user... | Contact Palo Alto support to investigate HIP check failures. SNAT port allocatio... | 🔵 7.5 | ADO Wiki |
| 6 | WVD no available resource error. O_AGENT_NOT_CONNECTED and E_LB_NO_SESSIONHOST_A... | Network routing UDR incorrect and VNet Peering missing between Azure Firewall VN... | Rectify routing and set up VNet Peering. | 🔵 7.5 | KB |
| 7 | Users get error while accessing WVD hostpool: Oops, we could not connect to Host... | Two major reasons: 1) rdgateway.wvd.microsoft.com is not allowed through firewal... | Configure the DNS forwarders to forward DNS queries for Non-Authoritative Answer... | 🔵 6.5 | KB |
| 8 | Azure KMS Activation on Azure VMs running Windows 10 Enterprise for Virtual desk... | Microsoft announced new KMS IP addresses 20.118.99.224 and 40.83.235.53 (azkms.c... | Add new Azure KMS IP addresses (20.118.99.224 and 40.83.235.53) to firewall rule... | 🔵 6.5 | KB |
| 9 | On Windows 11 23H2 and later and Windows Server 2025&nbsp;platforms, including A... | This issue occurs after the modernization of the firewall dialog UI introduced s... | OS  Bug #  Resolving KB  Release Date  Comments  Windows 11 24H2/Windows Server ... | 🔵 6.5 | KB |
| 10 | Issue - After clicking on Subscribe in the RDClient  Application, User gets the ... | Authentication fails because it cannot  reach out to Azure AD. As such, Activity... | Please  check the start value under following registry path : HKEY_LOCAL_MACHINE... | 🔵 6.5 | KB |
| 11 | China users accessing AVD via HK proxy fail to authenticate. MFA/login page does... | Proxy/firewall blocks aadcdn.msftauth.net endpoint which is required for loading... | Whitelist the following URLs in proxy/firewall: aadcdn.msftauth.net, lgincdnvzeu... | 🔵 6.5 | OneNote |
| 12 | China users accessing AVD via HK proxy fail to authenticate. MFA/login page does... | Proxy/firewall blocks aadcdn.msftauth.net endpoint which is required for loading... | Whitelist the following URLs in proxy/firewall: aadcdn.msftauth.net, lgincdnvzeu... | 🔵 6.5 | OneNote |
| 13 | Windows 365 Migration API importSnapshot fails with InvalidSasUrl error - SAS UR... | The SAS URL provided is not from an Azure storage domain, or the Windows 365 ser... | Ensure the SAS URL points to an Azure page blob (not block blob). Verify the sto... | 🔵 6.0 | ADO Wiki |
| 14 | Cloud PC cannot access certain web services because web service providers block ... | Web service providers block Azure Data Center IP ranges that Cloud PCs use for o... | Use browser developer mode to identify which web service component rejects the r... | 🔵 5.5 | ADO Wiki |
| 15 | AVD random/intermittent connection failures in regular time pattern (e.g. at XX:... | Under PG investigation (ICM-261514251). Suspected environment scheduled tasks co... | Diagnose via Kusto DiagActivity/DiagError in WVD database (rdskmc.chinaeast2.kus... | 🔵 5.5 | OneNote |
