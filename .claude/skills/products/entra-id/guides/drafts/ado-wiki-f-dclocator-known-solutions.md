---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Domain Controller Locator (DCLocator)/WorkFlow: DcLocator: Looking for Known Solutions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDomain%20Controller%20Locator%20(DCLocator)%2FWorkFlow%3A%20DcLocator%3A%20Looking%20for%20Known%20Solutions"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**
This guide provides structured troubleshooting steps for three common DCLocator failure scenarios: no logon servers available, random/unoptimized DC returned, and slow domain controller discovery.

# No logon servers available

When an application or service is unable to locate a domain controller, errors such as:
- 1355 0x54b ERROR_NO_SUCH_DOMAIN
- 1311 0x51f ERROR_NO_LOGON_SERVERS

**Action:**

1. **Verify DCLocator flags supplied by the application or service.**
   The process calling DCLocator must supply the domain name string and flags. Flags incompatible with the environment (e.g., requiring 2016 DCs when only 2012 R2 are available, unavailable FSMO role owners) will result in failures. Flags may be observed within Netlogon Logs (text and ETL).
   A reference for flag hex values can be found in the Dependency Information page.

2. **Verify DNS configuration and operation.**
   Observe DNS name resolution results within a network capture. Use NLTest to reproduce the failing operation:
   ```
   nltest /dsgetdc:<domainname> /flags:<hex_flags>
   ```
   Missing SRV records may be due to AD Replication failures, DNS mnemonic configuration, or advertising failures.
   Review c:\windows\system32\config\netlogon.dns for the SRV records that Netlogon is currently registering.

3. **Validate connectivity to DCs.**
   During failure conditions, gather network captures from both endpoints.
   Filter captures on DNS and UDP LDAP protocols: "DNS or udp.port==389".
   For busy environments, filter on SRV queries only:
   - Netmon: "DNS.QRecord.QuestionType == 0x21"
   - WireShark: "dns.qry.type == 33"
   UDP LDAP pings (CLDAP) commonly fail transmission over the network.

# Random or unoptimized domain controller returned

1. **Verify DCLocator flags.**
2. **Check site association of the client.**
   The DC maps the client IP to a site. Errors appear in Netlogon log as:
   ```
   NO_CLIENT_SITE: <hostname> <ip>
   ```
   Test IP-to-site mapping on the DC:
   ```
   NLTEST /DSADDRESSTOSITE: /ADDRESSES:xxx.xxx.xxx.xxx
   ```
   Review subnet definitions in Active Directory Sites and Services.

3. **Verify domain controller site associations** - locate DC Server objects and NTDS Settings in expected sites.
4. **Validate connectivity to in-site DCs.**
5. **Verify DNS records.**
6. **Check if target is in a separate forest.** Cross-forest DCLocator relies on both forests having identically named site names.
   See: https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/how-domain-controllers-are-located-across-trusts/ba-p/256180

# Slow domain controller discovery

1. **Check site association of the client** to evaluate if wrong site causes contact with remote/suboptimal DC. Identify site from:
   - Output of `nltest /dsgetsite`
   - Registry values at `HKLM\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters`:
     - **SiteName** (static override)
     - **DynamicSiteName** (auto-detected)
   > **NOTE:** SiteName will override DynamicSiteName and force DC discovery in the specified site.

2. **Verify domain controller site associations.**
3. **Validate connectivity to DCs.**
4. **Verify DNS.**
5. **Verify if target is in a separate forest.**
