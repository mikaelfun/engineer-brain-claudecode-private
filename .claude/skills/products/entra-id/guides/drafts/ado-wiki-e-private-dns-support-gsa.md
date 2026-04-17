---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Private DNS Support for GSA"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FPrivate%20DNS%20Support%20for%20GSA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Private DNS Support for GSA

With Private DNS Support for Entra Private Access, customers can query their own internal DNS servers to resolve IP addresses for internal domain names through Global Secure Access.

## Case Handling

Supported by the **Hybrid Auth Experiences** community.

SAP: Azure\Global Secure Access (Microsoft Entra Internet and Private Access) - Private Access\Private DNS issues

## Licensing

See: [What is Global Secure Access? - Feature comparison table](https://learn.microsoft.com/en-us/entra/global-secure-access/overview-what-is-global-secure-access#feature-comparison-table)

## Prerequisites

1. Enable the Microsoft Entra Private Access forwarding profile at Global Secure Access > Connect > Traffic Forwarding
2. Download the latest Private Network Connector agent (**>= 1.5.3829.0**) from the Entra Portal (GSA blade > Connect > Connectors > Download connector service)
3. The connector server(s) must be able to resolve all domains being targeted via Global Secure Access
4. Install the latest GSA Client (**>= 2.0.0.0**) on client devices from https://aka.ms/GSAWinLatest
5. On each client, **disable IPv6 and Secure DNS or DNS over TCP**: https://learn.microsoft.com/entra/global-secure-access/how-to-install-windows-client

## Known Limitations

- Toast notifications not implemented for DNS
- Cache hit rate is low in DNS Proxy
- Private DNS/Internet access co-existence issues
- Some unsupported record types (e.g. NSEC)
- No method to clear the DNS proxy cache in Entra (records stored based on TTL)
- Public Cloud only

## Architecture

- DNS traffic acquired using NRPT (admin-configured suffixes)
- Traffic sent to special IP `6.6.255.254` (acquired by client when private DNS is enabled)
- Tunnel-server sends private DNS traffic to dns-proxy; other TCP/UDP traffic to proxy (envoy/talon)
- DNS proxy caches responses for lower latency, sends requests to porto BE if not cached
- Porto BE tunnels DNS request to connector
- Connector looks up DNS in customer network

### Single Label Handling

- Uses magic suffix: `<appid>.globalsecureaccess.local`
- Added to search suffix list and NRPT
- Suffix stripped off at edge and forwarded to porto BE
- Connector looks up single label DNS query using customer-configured suffixes on connector
- Client machine first tries resolving with client's configured suffixes, falls back to "magic" suffix

## Configuration

### From Entra Portal

1. Browse to **Global Secure Access** > **Applications** > **Quick Access**
2. Select the **Private DNS** tab
3. Enable the **Enable Private DNS** checkbox
4. Click **Add DNS suffix** and add the desired suffixes
5. Click **Save**

### Via Graph API

**Enable Private DNS:**
```
PATCH https://graph.microsoft.com/beta/applications/{AppID}/onPremisesPublishing
{ "isDnsResolutionEnabled": true }
```

**Create new suffix:**
```
POST https://graph.microsoft.com/beta/applications/{AppID}/onPremisesPublishing/segmentsConfiguration/microsoft.graph.ipSegmentConfiguration/applicationSegments
{ "destinationHost": "app1.dns.lab", "destinationType": "dnsSuffix" }
```

## Traffic Logs

Private DNS traffic can be monitored in **Global Secure Access > Monitor > Traffic logs > Transactions** tab.

When reviewing DNS entries, destination FQDN `dns.gsa.internal.` indicates the DNS proxy instance. Useful optional columns:
- DNS Query Name, DNS Record Type, DNS Resolved IP, DNS Response Code
- DNS Response Origin, DNS Response Time, DNS TTL

**DNS Response Origin values:**
- **OnPrem**: Resolved by on-premises DNS infrastructure
- **Cache**: Served from DNS proxy internal cache

## Troubleshooting

### Verify Configuration via ASC

1. From ASC navigate to **Global Secure Access** > **Profiles** tab
2. Select **Private access profile** and click Run
3. Record the **App ID** under Private Access Applications
4. In Graph Explorer run `/applications?filter=appId eq '{AppID}'` and record the **id**
5. Run `/applications/{id}/onPremisesPublishing` and verify `isDnsResolutionEnabled: true` and `isAccessibleViaZTNAClient: true`
6. Run `/applications/{id}/onPremisesPublishing/segmentsConfiguration/microsoft.graph.ipSegmentConfiguration/applicationSegments` to see published IPs, protocols, ports, and DNS suffixes

### Client Side Config

Run `netsh name show policy` to see NRPT entries. You should see:
- Entries for each admin-configured DNS suffix
- An entry for `{GUID}.globalsecureaccess.local`
- Generic DNS Servers should show `6.6.255.254`

### NRPT Troubleshooting

See: [Global Secure Access - NRPT issues](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1980902/Global-Secure-Access-NRPT-issues)

### Client Side DNS Tracing

1. Flush DNS cache; ensure hosts file has no entry for the test FQDN
2. Right-click GSA client icon > **Advanced diagnostics**
3. Navigate to **Advanced Log Collection** tab
4. Click **Start recording**
5. Attempt DNS resolution using `Resolve-DNSName` PowerShell command
6. Click **Stop recording** (zip saved in `C:\Program Files\Global Secure Access Client\Logs`)
7. Open **NetworkTrace.pcap** in Wireshark, filter on DNS
8. Verify DNS requests for internal names go through GSA tunnel (destination IP = `6.6.255.254`)
9. If not, check: GSA client version >= 1.7.376, restart client, ensure client is authenticated, verify DNS suffix in Entra portal, review `ForwardingProfile.json` for `privateDnsRules` section

### Checking Connector Version

Connector must be >= 1.5.3829.0. On each connector server:
1. Open Entra portal > Global Secure Access > Applications > Quick Access, note the connector group
2. Go to Global Secure Access > Connect > Connectors, find server name(s)
3. On each server, browse to `C:\Program Files\Microsoft Entra private network connector\`
4. Right-click `MicrosoftEntraPrivateNetworkConnectorService.exe` > Properties > Details > Product version

### Checking GSA Client Version

Client must be >= 2.0.0.0 (version 1.7.376+):
1. Right-click GSA client icon > **Advanced diagnostics**
2. On Overview tab confirm **Client version** >= 1.7.376

### Kusto Query

| Cluster  | idsharedwus   |
|----------|---------------|
| Database | NaasProd      |
| Table    | DnsProxyDebug |

```sql
DnsProxyDebug
| where TIMESTAMP > ago(2h)
| where log contains "mysite.contoso.lab"
| parse log with *" - " id " " type " IN " tenantid"."fqdn". udp" reqid "false 512" status " " sz " " flag " " resptime " [" respip "]"
| where type == "A"
| project ['time'], tenantid, fqdn, status, flag, respip, log
```

**DNS Status Codes:**

| Status   | Meaning                                      |
|----------|----------------------------------------------|
| NOERROR  | Success                                      |
| SERVFAIL | Internal server error, timeout               |
| NXDOMAIN | Name does not exist                          |
| REFUSED  | DNS refuses to perform operation             |
| FORMERR  | Format error                                 |
| NOTIMP   | Server does not support operation            |
| NOTAUTH  | Server is not authoritative for the zone     |

If no entry found for a client's query, the request was not proxied to GSA - focus on client-side troubleshooting.

## ICM Escalations

See: [Microsoft Entra Global Secure Access (ZTNA) - ICM escalations and AVA tags](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/979096/Microsoft-Entra-Global-Secure-Access-(ZTNA)?anchor=icm-escalations-and-ava-tags)

## PG TSGs

- [Private DNS Config TSG](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/59538/Private-DNS-Config)
- [Porto Control Plane TSG](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/53729/Porto-Control-Plane-TSG)
