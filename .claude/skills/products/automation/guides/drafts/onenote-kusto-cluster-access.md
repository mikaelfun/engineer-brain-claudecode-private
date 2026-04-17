# Kusto Cluster Access for Azure Automation (Mooncake)

## Source
- OneNote: Mooncake POD Support Notebook > AUTOMATION > Troubleshooting > Kusto

## Cluster Info

| Item | Value |
|------|-------|
| Cluster URL | https://oaasprodmc.chinanorth2.kusto.chinacloudapi.cn |
| Permission SG | Redmond\OaaSKustoGovUsers |
| Join SG | http://idwebelements/GroupManagement.aspx?Group=OaaSKustoGovUsers&Operation=join |

## Notes
- This is the Mooncake (21v) production Kusto cluster for Azure Automation
- Must join the security group before querying
- For Kusto query examples, see the Runbook and Update Management query guides
