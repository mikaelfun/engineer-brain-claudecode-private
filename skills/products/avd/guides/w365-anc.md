# AVD W365 ANC 网络连接 - Quick Reference

**Entries**: 11 | **21V**: partial
**Keywords**: allsigned, anc, byon, cname, conditional-forwarders, deletion, dns, domain-join
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | ANC health check fails with DNS resolution error: '_ldap._tcp.domain.com: This o... | DC DNS SRV records (_ldap._tcp.domain.local) were manually added in the DNS Serv... | Verify DNS Servers configured in the VNET are reachable, Domain Join ports are n... | 🔵 7.5 | ADO Wiki |
| 2 📋 | ANC deploy failure due to 'Environment and configuration is ready' check failing... | GPO with 'AllSigned' execution policy for PowerShell blocks DSC extension, or re... | Solution 1: Move ANC to blank GPO (remove AllSigned execution policy). Solution ... | 🔵 7.5 | ADO Wiki |
| 3 📋 | ANC configuration fails during Environment and configuration checks with Interna... | WinRM service incorrectly configured via image, GPO deployment, or Intune CSP co... | Reconfigure WinRM service to allow messages from IP addresses. Check GPO: see ht... | 🔵 7.5 | ADO Wiki |
| 4 📋 | ANC endpoint connectivity check shows warning for http://login.microsoftonline.c... | ANC checks both TCP and HTTP for login.microsoftonline.com; HTTP check encounter... | Whitelist www.office.com as workaround. Dev team and PM are aware and working on... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Cannot delete unused Azure Network Connection (ANC) via Graph API - error 'Faile... | Provisioning policy that previously referenced the ANC was deleted but backend r... | 1) Run Kusto query on CloudPCEvent with TenantID and ANC ID to check if ANC is s... | 🔵 7.5 | ADO Wiki |
| 6 📋 | ANC Endpoint Connectivity check fails each time for different endpoints - interm... | DNS Conditional Forwarders on the Domain Controller only include main domains bu... | 1) Collect trace logs from DC during ANC checks to identify all accessed endpoin... | 🔵 7.5 | ADO Wiki |
| 7 📋 | ANC health check fails with ResourceAvailabilityCheckNoSubnetIP - subnet has no ... | Delete Lock or ReadOnly Lock on the resource group prevents W365 DeleteAzureReso... | 1) Go to Azure Portal > Resource Groups > affected RG > Settings > Locks, note l... | 🔵 7.5 | ADO Wiki |
| 8 📋 | ANC (Azure Network Connection) health checks fail with Endpoint Connectivity, Lo... | Default outbound connectivity on subnets within MCAPS tenants was disabled due t... | Set up an Azure NAT Gateway for outbound connectivity on the affected subnet. Af... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Windows 365 Cloud PC provisioning or ANC (Azure Network Connection) fails when t... | Built-in DSC scripts used during Windows 365 provisioning are internally signed ... | AllSigned execution policy is not supported for Windows 365 Cloud PCs. Switch to... | 🔵 7.5 | ADO Wiki |
| 10 📋 | Large Cloud PC provisioning batch fails with 'We encountered a service error'; u... | Default route sends all Cloud PC traffic through VPN Gateway, overwhelming it; p... | Options: 1) Upgrade VPN Gateway to higher SKU; 2) Change encryption algorithm to... | 🔵 6.0 | ADO Wiki |
| 11 📋 | Cloud PC provisioning fails with 'Not Enough IP Addresses' error when customer u... | The subnet serving the Azure Network Connection (ANC) has exhausted all availabl... | Customer must extend the address space for the subnet serving the ANC in their V... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: DC DNS SRV records (_ldap._tcp.domain.local) were `[Source: ADO Wiki]`
2. Check: GPO with 'AllSigned' execution policy for PowerShe `[Source: ADO Wiki]`
3. Check: WinRM service incorrectly configured via image, GP `[Source: ADO Wiki]`
4. Check: ANC checks both TCP and HTTP for login.microsofton `[Source: ADO Wiki]`
5. Check: Provisioning policy that previously referenced the `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-anc.md#troubleshooting-flow)
