---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Additional Information about Replication/Active Directory Ports - Client_Server"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FAdditional%20Information%20about%20Replication%2FActive%20Directory%20Ports%20-%20Client_Server"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Active Directory Ports - Client/Server

[Service overview and network port requirements for Windows](https://learn.microsoft.com/troubleshoot/windows-server/networking/service-overview-and-network-port-requirements)

| Application Protocol | Protocol | Ports |
|---|---|---|
| Active Directory Web Services (ADWS) | TCP | 9389 |
| AD Management Gateway Service | TCP | 9389 |
| Global Catalog | TCP | 3269 |
| Global Catalog | TCP | 3268 |
| ICMP | - | No port number |
| LDAP Server | TCP | 389 |
| LDAP Server | UDP | 389 |
| LDAP SSL | TCP | 636 |
| RPC | TCP | 135 |
| RPC high TCP ports | TCP | 1024-50000 / 49152-65535 |
| SMB | TCP | 445 |

Notes:
- RPC high port range: 1024-50000 (legacy), 49152-65535 (Win Server 2008 R2+)
- ICMP pings used by LDAP client to verify server availability
- Port 9389 also used for WMI/DCOM in DC promotion (Server 2012+)
