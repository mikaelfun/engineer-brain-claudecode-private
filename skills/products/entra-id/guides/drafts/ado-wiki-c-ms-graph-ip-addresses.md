---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph IP Addresses"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20IP%20Addresses"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Graph IP Addresses

## Outbound IP Addresses

See Office 365 URLs and IP addresses:
- https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges?view=o365-worldwide

Product team affirms ALL IP addresses must be allowed from the above list, no exceptions.

## Inbound IP Addresses

For MS Graph services calling into customer environments (e.g., Change Notification service):
- https://learn.microsoft.com/en-us/microsoft-365/enterprise/additional-office365-ip-addresses-and-urls?view=o365-worldwide

## Troubleshooting

### IP Address Location
- For exact IP address, customer needs MS Graph Activity Logs (internal logs truncate IP)
- IP geolocation: https://tools.keycdn.com/geo

### DNS Resolution
```
ping graph.microsoft.com
nslookup -d2 graph.microsoft.com
```
Note: IP may resolve outside customer's region - DNS logic attempts closest datacenter but may fallback to next closest if primary is down/overloaded.

### Connectivity Testing
- PsPing: `psping64 graph.microsoft.com:443`
- TCP Traceroute: `tracetcp graph.microsoft.com:443` (requires WinPCap)
- If "PacketInterface::sendPacket Failed" error: uninstall npcap and reinstall winpcap

### TLS Certificates
Ensure all Root and Intermediate certs from Azure TLS Certificate Changes are installed:
- https://docs.microsoft.com/en-us/azure/security/fundamentals/tls-certificate-changes

## Datacenter Identification

Navigate to `https://graph.microsoft.com/ping` to see:
- DataCenter, Ring, ScaleUnit, RoleInstance, ADSiteName
- Useful for pattern analysis (issue only in specific DC/Ring/Instance)

## All MS Graph IP Addresses List
- https://ashy-mushroom-0655f0f1e.azurestaticapps.net/#/

Tip: To target specific datacenter, update HOSTS file with the specific IP address.
