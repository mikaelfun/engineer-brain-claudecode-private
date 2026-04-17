---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Case Management/Collaboration"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FCase%20Management%2FCollaboration"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purview Governance Support Boundary Matrix

Purview Governance connects to a lot of data sources to obtain asset and lineage information. The following table summarizes the guidelines for collaboration between different CSS teams.

## Queue & Contact
- Azure Purview Support Queue Name: **DnAI - DGP - Data Governance**
- Azure Purview Queue Owner: asmaahmad@microsoft.com
- Azure Purview CSS Team Alias: asma_directs@microsoft.com

## Product Relationship with Purview

| CSS Partners | Overlapping Component | Isolation Method | CSS Partner Queue |
|--|--|--|--|
| Data Factory | SHIR | SHIR setup, registration, start/stop service | |
| Azure SQL DB | Connectivity | | |
| Azure Synapse Analytics | Connectivity | Connect to the SQL pools or SQL ADW instance from outside Purview e.g., Synapse Studio or SSMS. If connection fails outside Purview, involve the Synapse support team. | |
| Storage (Blob, ADLS Gen 1/2) | Storage access, Storage types | Connect to the storage outside Purview using Azure Storage Explorer. If access to the storage fails, engage respective storage support group. | |
| Power BI | | | |
| Security and Compliance Center (SCC) | Sensitivity Labels – Creation/Configuration/Policy issues. Any permission or GUI issues related to the compliance portal | Enterprise – Security Compliance (RAVE) | O365 SCC Global Support (SCCSupport@microsoft.com) |
| Azure Key Vault | Connectivity | | |
| Azure Networking | Private Endpoint | | |
| SQL Server (On prem) | Connectivity | Test the connection to the SQL server using a UDL file. If the connection from UDL file fails, engage SQL connectivity team. If the connection from UDL succeeds, then the issue is either with Purview or SHIR. | MSaaS SQL Networking Tier 1/2 (SQLCONNIS@microsoft.com) |
| All 3rd party connectors | N/A. Support is best effort | Test the connection to the data sources outside of Purview and Azure if possible. If connectivity fails from outside Azure, Customer needs to fix their infra. | |

## Swarm First
Before creating a collaboration, use the swarming channel for VM, Network, and AAD questions.
