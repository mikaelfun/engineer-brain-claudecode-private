---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services - Authentication Data Collection"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20Domain%20Services%2FMicrosoft%20Entra%20Domain%20Services%20-%20Authentication%20Data%20Collection"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# AADDS Authentication Data Collection

Use the following auth troubleshooting scripts to collect data for debugging Kerberos and NTLM authentication issues on Microsoft Entra Domain Services.

## Customer Instructions

```
1. Download Auth.zip from https://aka.ms/authscripts to the affected device.
2. Unzip Auth.zip to C:\temp\Auth
3. Open admin PowerShell and cd to C:\temp\Auth
4. Start collection:
   .\start-auth.ps1 -vauth -acceptEULA
5. Reproduce MEDS auth failure (e.g., RDP failure, domain join failure, file share mount failure).
6. Stop collection:
   .\stop-auth.ps1
7. Zip contents of the "authlogs" folder and upload to the case DTM link.
```

Reference: https://docs.microsoft.com/en-us/azure/active-directory/devices/troubleshoot-hybrid-join-windows-current#step-5-collect-logs-and-contact-microsoft-support

## Key Log Files

| File | Purpose |
|--|--|
| `.\AuthLogs\Dsregcmd.txt` | Verify AD/Entra join status; MEDS joined shows DomainJoined=YES |
| `.\AuthLogs\Netsetup.txt` | Domain join debug logs with error timestamps |
| `.\AuthLogs\Ipconfig-info.txt` | DNS resolver IPs (must point to MEDS DC IPs) |
| `.\AuthLogs\Whoami.txt` | User details: username, SID, Group Membership |
| `.\AuthLogs\Tickets.txt` | List of Kerberos tickets |
| `.\AuthLogs\Netmon.etl` | Network capture — open with Microsoft Network Monitor or convert to PCAP via ETL2PCAPNG |

## Verifying MEDS Domain in DNS

To verify a domain name is a MEDS domain:
- Azure Portal → Microsoft Entra Domain Services → Overview
- Or use [Jarvis query example](https://portal.microsoftgeneva.com/s/124CE643) to search domain name

DNS resolvers must point to MEDS DC IPs (see: [MEDS DNS wiki](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/427577/Azure-AD-Domain-Services-DNS-Troubleshooting))
