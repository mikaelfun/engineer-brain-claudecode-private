---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Domain Controller Locator (DCLocator)/WorkFlow: DcLocator: Dependency Information"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FDomain%20Controller%20Locator%20(DCLocator)%2FWorkFlow%3A%20DcLocator%3A%20Dependency%20Information"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**
This article provides a comprehensive guide on troubleshooting Dynamic Name Service (DNS) and domain controller (DC) discovery issues, focusing on dependencies, connectivity, site configuration data, and application requirements. It includes steps for using tools like NSLookup.exe and network capture methods, along with examples and visuals to aid understanding.

# Dependencies
- Dynamic Name Service (DNS) is needed to route TCP/IP packets to the proper domain controllers (DCs).
- Connectivity is essential since you want to leverage the services of a remote domain controller.
- Configuration data within Active Directory governs the decisions made by DCLocator when evaluating DCs to return to the client.
- Applications also dictate requirements of the discovered domain controllers, notably through the flags previously mentioned.

## DNS
One of the most common dependencies that might prevent proper DC discovery is DNS.

The DNS query's structure and form are dictated by flags passed into the DCLocator API. This often makes it easy to identify what flags a process passed to DCLocator simply from the DNS query.

For example:
The LDAPONLY flag naturally translates to the LDAP SRV record lookup:
```
_ldap._tcp.<DnsDomainName>
```
The GC flag correlates to an SRV record:
```
_ldap._tcp.gc._msdcs.<DnsForestName>
```
The two flags, KDC and SiteName values, correlate to an SRV record:
```
_kerberos._tcp.<SiteName>_sites.dc._msdcs.<DnsDomain>
```
Once the specific DNS SRV query to be leveraged is known, it may be tested using the nslookup.exe utility.

If the SRV record is valid yet cannot be resolved, investigate whether:
- The owner(s) of the record are not registering their records in DNS.
  > Located in C:\Windows\System32\config, the Netlogon.DNS cache file lists the DNS SRV records registered by the Netlogon service of the local DC. It may be reviewed to determine if Netlogon is or is not attempting to register SRV records.
- Improper restriction of SRV registrations has been configured. See https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/optimize-dc-location-global-catalog.
- If the investigation leads you to suspect a DNS resolution failure, use NSLookup.exe to evaluate. Set the record type to 'SRV', specify a server, and enter a properly formatted query.

## Connectivity
Network captures can help identify the nature of the failures. Methods for obtaining network captures:
- PowerShell (requires 3 cmdlets)
- Netsh
- Wireshark
- Network Monitor

Best practice:
1. Start a network capture.
2. Purge DNS caches (ipconfig /flushdns).
3. Reproduce the failure. Note system clock timestamps.

Filter the capture using "dns or udp.port==389". Review DNS and ping responses at the timestamps you noted.

After the DNS query, the potential DCs are pinged via LDAP over UDP:
- Request includes: DNS Domain Name, Host's short and DNS name, Domain GUID, and NTVER.
- Response includes: DC flags, Domain GUID, Domain & Forest names, DC Site, Client Site.

## Site Configuration Data
Another common configuration setting that dramatically affects DC selection is the site membership of domain controllers and clients.

DC site associations are determined by the location of DC server objects in the Configuration partition. Subnets map clients to sites.

Discovery over forest and external trusts may also be optimized, assuming that site names between the two domains/forests match. See https://techcommunity.microsoft.com/t5/core-infrastructure-and-security/how-domain-controllers-are-located-across-trusts/ba-p/256180.

## Application Requirements
It is up to the application or service to specify requirements of the domain controller being discovered. These are evident in the Netlogon.log file or Netlogon ETL.

DCLocator flag values:
```
DS_FORCE_REDISCOVERY            0x00000001
DS_DIRECTORY_SERVICE_REQUIRED   0x00000010
DS_DIRECTORY_SERVICE_PREFERRED  0x00000020
DS_GC_SERVER_REQUIRED           0x00000040
DS_PDC_REQUIRED                 0x00000080
DS_BACKGROUND_ONLY              0x00000100
DS_IP_REQUIRED                  0x00000200
DS_KDC_REQUIRED                 0x00000400
DS_TIMESERV_REQUIRED            0x00000800
DS_WRITABLE_REQUIRED            0x00001000
DS_GOOD_TIMESERV_PREFERRED      0x00002000
DS_AVOID_SELF                   0x00004000
DS_ONLY_LDAP_NEEDED             0x00008000
DS_IS_FLAT_NAME                 0x00010000
DS_IS_DNS_NAME                  0x00020000
DS_TRY_NEXTCLOSEST_SITE         0x00040000
DS_DIRECTORY_SERVICE_6_REQUIRED 0x00080000
DS_RETURN_DNS_NAME              0x40000000
DS_RETURN_FLAT_NAME             0x80000000
```

If no DCs match the specified flags, DCLocator fails with 1355 (ERROR_NO_SUCH_DOMAIN).

# Background
DCLocator benefits:
- DCs advertise their capabilities automatically.
- Clients leverage an API to use those advertisements.
- Load balancing and failover occur automatically.
- Site memberships are discovered, optimizing DC selection.

Developer APIs:
- NetApi32.dll library
- Domain.FindDomainController .NET framework method
- Get-ADDomainController PowerShell cmdlet

The Netlogon service (in lsass.exe) provides DCLocator on both DCs and clients.

Process flow:
1. Client process calls DCLocator API with flags.
2. Netlogon leverages DNS and LDAP to identify and verify DCs.
3. DCs respond with site associations and capabilities.
4. First suitable DC is cached; client site is stored.
5. DC information (name, IP, GUID, etc.) returned to client.
6. Process interacts with the DC.

**Additional note:** Workstations may contact excessive DCs in various domains due to search facilities in applications like SharePoint or unexpected LDAP referrals.
