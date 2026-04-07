---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/SAP IDM Migration to Microsoft Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FSAP%20IDM%20Migration%20to%20Microsoft%20Entra%20ID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# SAP IDM Migration to Microsoft Entra ID

## Summary

SAP confirmed end of maintenance for SAP Identity Management (SAP IDM) - support ends 2027, extended maintenance until 2030. SAP directs customers to provision to Microsoft Entra ID instead.

## SAP IDM Migration Scenarios

| SAP IDM Scenario | Entra ID Solution |
|---|---|
| SuccessFactors employee data -> create/change identities | SuccessFactors inbound provisioning to AD/Entra ID |
| Existing users/groups from AD | Entra Cloud Sync or Connect Sync |
| Provision to SAP NetWeaver AS ABAP/Java | Entra provisioning to SAP ECC via on-premises connector |
| Provision to SAP Cloud Identity Services | SAP Cloud Identity Services auto provisioning tutorial |
| Provision to non-MS directories (LDAP) | Entra provisioning to LDAP directories |
| Provision to databases (SQL/Oracle/DB2) | ECMA Connector host for SQL-based apps |
| Password reset (AD) | On-premises password writeback with SSPR |
| Integration with ILM/FIM/MIM | Microsoft Identity Manager connector for Microsoft Graph |

## Support Topics

- Azure/Microsoft Entra User Provisioning and Synchronization/Migrating to Entra from SAP IDM/Synchronizing identities from Entra ID into SAP apps
- Azure/Microsoft Entra User Provisioning and Synchronization/Migrating to Entra from SAP IDM/Synchronizing identities with HR

## Key Links

- Plan: https://learn.microsoft.com/en-us/entra/identity/app-provisioning/plan-sap-user-source-and-target
- Migration guide: https://aka.ms/MigrateFromSAPIDM
- SuccessFactors integration: https://learn.microsoft.com/en-us/entra/identity/app-provisioning/sap-successfactors-integration-reference

## Note

SAP promotes other IAM providers besides Entra ID. If customer asks which provider, refer to Microsoft public FAQ: https://aka.ms/MigrateFromSAPIDM
