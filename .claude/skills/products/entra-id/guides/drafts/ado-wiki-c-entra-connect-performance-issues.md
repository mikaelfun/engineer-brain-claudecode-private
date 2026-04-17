---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Wizard and ADSync service/Troubleshooting guides/Troubleshooting Entra Connect Performance Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FWizard%20and%20ADSync%20service%2FTroubleshooting%20guides%2FTroubleshooting%20Entra%20Connect%20Performance%20Issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Entra Connect Performance Issues

## Overview

Performance issues for Entra Connect can be some of the most complicated cases to troubleshoot due to the high number of dependencies that exist. This article is intended to help with understanding of the primary dependencies and performance factors so that a systematic investigation can be performed to determine what factors are and are not relevant based on the symptoms presented.

## Understanding and Troubleshooting Performance Issues

### Understanding where the issue is occurring

Frequently, customers will open cases saying "My Entra Connect is syncing slowly". In reality, it is usually a specific operation that is exhibiting slowness. Understanding what connectors the slowness is occurring on, and what run profiles are impacted goes a long way towards determining what components in an Entra Connect environment may or may not be responsible for the issue. The default run profiles in Entra Connect are:

- Delta Import
- Delta Synchronization
- Full Import
- Full Synchronization
- Export

By taking a look at the start/end times for each run profile in a sync cycle, you should be able to evaluate the issue and define it with statements such as:

- "The slowness is only happening on the imports and exports from ad.contoso.com"
- "The slowness is happening only when importing or exporting on the Azure connector"
- "The slowness is happening across the board with all connectors and all run profiles"

### Entra Connect + SQL relationship

There are two scenarios that can exist with regards to an Entra Connect server's relationship to the SQL server hosting its database:

- Entra Connect is located on the same server as the installation of SQL Server (Express or Local)
- Entra Connect is located on one server, and SQL Server (Full) is installed on a remote server, either standalone or as part of a cluster

In instances where customers have a remote SQL server, in many instances the two servers are not properly allocated resources and resource restraints can be the driver of performance issues. Whenever possible, collocating Entra Connect and SQL on the same server has been shown to deliver the best performance as multiple layers of complexity and dependencies are removed, as Entra Connect no longer needs to traverse.

#### Suggestions for optimal performance for all large (approx. 500K+ objects) Entra Connect SQL servers

- Use SSD storage when possible, if not then 15K SaaS drives
- Have isolated storage so that the Windows OS, SQL DB, and SQL logging are all going to logically separate storage.
  - If Entra Connect is on the same server as SQL, locate it on the Windows OS storage
- Don't have other SQL databases using the same storage or SQL instance as Entra Connect's ADSync DB
- Documented minimum requirements for RAM should be considered just for RAM allocated to the SQL instance that Entra Connect's ADSync DB is using - factor in extra for the OS, antivirus, etc.
- SQL maintenance scripts, reindexing scripts, etc being run on the database while any Entra Connect operations are happening can lead to performance issues

#### Suggestions specifically for Entra Connect with remote SQL servers

- Locate the SQL server as close as possible infrastructure-wise to the Entra Connect server
  - Ideally same physical host, if not then same datacenter + same subnet, minimal network distance away
- The SQL instance hosting the ADSync database needs allocated/available RAM matching what the prerequisites document states just for the SQL Instance - budget this ONLY for the ADSync DB, if other databases exist in the same instance, allocate more RAM as appropriate
- The Entra Connect server that is separate from the SQL server should have at least 50% of the required RAM as the SQL instance's amount - so if the SQL instance has 32GB of RAM allocated, allocate at least 16GB for the server running Entra Connect

### Entra Connect + AD Domain Controller relationship

- Entra Connect should be talking to a domain controller that is as close as network topology wise - ideally on the same subnet
- If Active Directory Sites and Services is misconfigured, the Entra Connect server may reach out to a faraway domain controller that has more latency between requests and their responses, increasing the time any communications take
- If performance issues exist related to imports or exports on an AD Connector, ensure that the domain controller being contacted meets the above guidance
- If the DC is close infrastructure-wise, confirmation that the domain controller is healthy can be obtained via collaboration with the Directory Services team
  - In some cases domain controllers can be overburdened (not enough RAM/CPU, too many requests for authentication or LDAP queries, etc)

### Large groups

Large groups can cause performance issues both on import and synchronization steps as the "member" attribute is a referential attribute. Referential attributes such as "member" are populated with values that reference another object or source of data. As part of the import and synchronization steps, the values present in these attributes are validated through a process called reference resolution. The design of Entra Connect engine is such that, in a group with 100,000 members, if a single member is added or removed from that group, or if the DN of a single member change, it will trigger a reevaluation of all members of that group. Groups above 50,000 members (ExportApiv1) and Groups above 250,000 members (ExportApiv2) will not be exported to Azure AD, but they will be imported into the AD connector space and projected to the metaverse.

#### Locating large groups when not present in the metaverse

Sometimes customers will filter the groups with custom sync rules so that they do not go to the metaverse. This stops the slowness on the synchronization step, but sync rules apply only on the synchronization step, not during the import step, and slowness on imports can still remain. Use the following SQL query on SQL Server Management Studio:

```SQL
SELECT ma.ma_name, cs.rdn, mv.displayName, link.[object_id],count(link.[object_id]) AS MemberCount FROM mms_cs_link link
inner join mms_connectorspace cs
on link.[object_id] = cs.[object_id]
inner join mms_management_agent ma
on cs.ma_id=ma.ma_id
inner join mms_csmv_link csmvlink
on csmvlink.cs_object_id = cs.object_id
inner join mms_metaverse mv
on mv.object_id = csmvlink.mv_object_id
group by ma.ma_name,cs.rdn, mv.displayname,link.[object_id],link.attribute_name
having count(link.[object_id]) > 10000
and ma.ma_name='ACTIVE DIRECTORY CONNECTOR NAME'
and link.attribute_name='member'
order by count(link.[object_id]) desc
```

Change "ACTIVE DIRECTORY CONNECTOR NAME" to the case-sensitive value of the AD connector.

#### Options to deal with large groups

The preferred method is to remove the large groups from synchronization scope by moving them to an out of scope OU. In instances where this is not possible, an explicit read DENY ACL can be set on the AD connector's service account so that the group cannot be seen during the import.

### What run profiles use what resources (cheat-sheet)

**Issues occur ONLY on**:

|  | Likely | Less Likely | Comments |
|--|--|--|--|
| Imports/Exports from AD | Domain Controllers, Networking between AADC <-> DC, Large Groups | SQL | SQL issues would typically present on all run profiles |
| Imports/Exports from AAD | Firewall, proxy config allowing partial access to Azure | SQL | IP based firewall whitelisting can allow some outbound attempts but block others |
| Synchronization Run Profiles | SQL, Resourcing Issue | AD, Firewall | Synchronization run profiles only utilize the connection between Entra Connect and the SQL server |

**Issues occur during all steps somewhat equally**: SQL/Resourcing is the most likely issue. Investigate SQL/Resourcing first and then branch out as the situation leads.
