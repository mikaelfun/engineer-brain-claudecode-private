---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Additional Information about Replication/Active Directory topology (sites, subnets, and connection objects)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FAdditional%20Information%20about%20Replication%2FActive%20Directory%20topology%20(sites%2C%20subnets%2C%20and%20connection%20objects)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# AD Sites, DC Locator, and DNS Registration

[Designing the site topology](https://learn.microsoft.com/windows-server/identity/ad-ds/plan/designing-the-site-topology)

## DC Locator Process

Client uses LDAP queries to determine the closest DC.

### Client Request Attributes
- DNS domain name, Host name, Domain GUID, Domain SID

### Server Response Attributes
- DomainControllerName, DomainControllerAddress, DomainControllerAddressType
- DomainGUID, DomainName, DNSForestName
- **DCSiteName** and **ClientSiteName** (critical for site-aware locator)

### Site-Aware Behavior
- Same site: response contains one site name
- Different site: response contains both DCSiteName and ClientSiteName
- Client then queries DNS for a DC in its own site and switches
