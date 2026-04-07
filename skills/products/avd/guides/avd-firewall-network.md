# AVD AVD 防火墙与网络 - Quick Reference

**Entries**: 15 | **21V**: partial
**Keywords**: aadcdn, authentication, azure-vm, china, connection-failure, connectivity, disconnections, firewall
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | RTT and bandwidth information missing from CloudPC Performance / Connection Qual... | SSL inspection (by firewall/proxy) is intercepting traffic to Geneva monitoring ... | Run elevated PowerShell in Cloud PC: Invoke-WebRequest -Uri 'https://gcs.prod.mo... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Multiple users report performance drops, hangs and disconnections on Cloud PCs. ... | Proxy ignoring W365/WVD URL exclusions, routing all AVD traffic through proxy in... | Add required AVD URLs to proxy whitelist. Primary: *.wvd.microsoft.com. Full lis... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Specific websites unreachable from Cloud PC ERR_CONNECTION_TIMED_OUT | Azure SNAT ports 1024-1087 blocked by website | Configure proxy or create Azure NAT Gateway or request website unblock | 🔵 7.5 | ADO Wiki |
| 4 📋 | Cloud PC (or Azure VM without public IP) cannot access certain websites. Website... | Azure Default Outbound Access uses SNAT with ephemeral ports starting from 1024-... | 1) Configure proxy inside Cloud PC guest OS to bypass Azure SNAT port allocation... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Cloud PC on Microsoft Hosted Network (MHN) experiences network session drops rel... | Palo Alto HIP checks (health checks on first network connect) fail, causing user... | Contact Palo Alto support to investigate HIP check failures. SNAT port allocatio... | 🔵 7.5 | ADO Wiki |
| 6 📋 | WVD no available resource error. O_AGENT_NOT_CONNECTED and E_LB_NO_SESSIONHOST_A... | Network routing UDR incorrect and VNet Peering missing between Azure Firewall VN... | Rectify routing and set up VNet Peering. | 🔵 7.5 | KB |
| 7 📋 | Users get error while accessing WVD hostpool: Oops, we could not connect to Host... | Two major reasons: 1) rdgateway.wvd.microsoft.com is not allowed through firewal... | Configure the DNS forwarders to forward DNS queries for Non-Authoritative Answer... | 🔵 6.5 | KB |
| 8 📋 | Azure KMS Activation on Azure VMs running Windows 10 Enterprise for Virtual desk... | Microsoft announced new KMS IP addresses 20.118.99.224 and 40.83.235.53 (azkms.c... | Add new Azure KMS IP addresses (20.118.99.224 and 40.83.235.53) to firewall rule... | 🔵 6.5 | KB |
| 9 📋 | On Windows 11 23H2 and later and Windows Server 2025&nbsp;platforms, including A... | This issue occurs after the modernization of the firewall dialog UI introduced s... | OS  Bug #  Resolving KB  Release Date  Comments  Windows 11 24H2/Windows Server ... | 🔵 6.5 | KB |
| 10 📋 | Issue - After clicking on Subscribe in the RDClient  Application, User gets the ... | Authentication fails because it cannot  reach out to Azure AD. As such, Activity... | Please  check the start value under following registry path : HKEY_LOCAL_MACHINE... | 🔵 6.5 | KB |
| 11 📋 | China users accessing AVD via HK proxy fail to authenticate. MFA/login page does... | Proxy/firewall blocks aadcdn.msftauth.net endpoint which is required for loading... | Whitelist the following URLs in proxy/firewall: aadcdn.msftauth.net, lgincdnvzeu... | 🔵 6.5 | OneNote |
| 12 📋 | China users accessing AVD via HK proxy fail to authenticate. MFA/login page does... | Proxy/firewall blocks aadcdn.msftauth.net endpoint which is required for loading... | Whitelist the following URLs in proxy/firewall: aadcdn.msftauth.net, lgincdnvzeu... | 🔵 6.5 | OneNote |
| 13 📋 | Windows 365 Migration API importSnapshot fails with InvalidSasUrl error - SAS UR... | The SAS URL provided is not from an Azure storage domain, or the Windows 365 ser... | Ensure the SAS URL points to an Azure page blob (not block blob). Verify the sto... | 🔵 6.0 | ADO Wiki |
| 14 📋 | Cloud PC cannot access certain web services because web service providers block ... | Web service providers block Azure Data Center IP ranges that Cloud PCs use for o... | Use browser developer mode to identify which web service component rejects the r... | 🔵 5.5 | ADO Wiki |
| 15 📋 | AVD random/intermittent connection failures in regular time pattern (e.g. at XX:... | Under PG investigation (ICM-261514251). Suspected environment scheduled tasks co... | Diagnose via Kusto DiagActivity/DiagError in WVD database (rdskmc.chinaeast2.kus... | 🔵 5.5 | OneNote |

## Quick Triage Path

1. Check: SSL inspection (by firewall/proxy) is intercepting `[Source: ADO Wiki]`
2. Check: Proxy ignoring W365/WVD URL exclusions, routing al `[Source: ADO Wiki]`
3. Check: Azure SNAT ports 1024-1087 blocked by website `[Source: ADO Wiki]`
4. Check: Azure Default Outbound Access uses SNAT with ephem `[Source: ADO Wiki]`
5. Check: Palo Alto HIP checks (health checks on first netwo `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-firewall-network.md#troubleshooting-flow)
