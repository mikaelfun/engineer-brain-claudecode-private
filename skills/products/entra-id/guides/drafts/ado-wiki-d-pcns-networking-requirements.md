---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Microsoft Identity Manager/MIM 2016 Overview/Password Management/PCNS/Troubleshooting Guides/Networking Requirements"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FMicrosoft%20Identity%20Manager%2FMIM%202016%20Overview%2FPassword%20Management%2FPCNS%2FTroubleshooting%20Guides%2FNetworking%20Requirements"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
      
Password synchronization on MIM 2016 requires RPC ports to be open for the management agent for Active Directory, and for the Active Directory servers running the password change notification service (PCNS).

## Minimum Permissions


| **Operation** | **Minimum Permissions** |
|--|--|
|        Install PCNS | If the Active Directory schema needs to be updated, you must be a member of Schema Admins groups or Enterprise Admins group. If the Active Directory schema is already updated, you need to be a member only in the Domain Admins group.
|Synchronize passwords from one Active Directory forest to another Active Directory forest, when MIM 2016 is installed on a domain controller within one of the forests. | There must be a two-way forest trust established between the Active Directory forests.


## Communication Protocols and Ports

|**Service**|**Protocol**  |**Port**  |
|--|--|--|
| RPC Endpoint Manager |TCP  |135  |
| Dynamic RPC Ports (PCNS) |TCP  |5000-5100  |
| Dynamic RPC ports (management agent for Active Directory) |TCP  |       57500 - 57520  |
|Kerberos Change Password|UDP|464

