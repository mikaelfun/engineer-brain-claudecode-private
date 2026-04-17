---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Center for SAP Solutions (ACSS)/Azure Center for SAP Solutions (ACSS) Home"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAzure%20Center%20for%20SAP%20Solutions%20(ACSS)%2FAzure%20Center%20for%20SAP%20Solutions%20(ACSS)%20Home"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azure Center for SAP Solutions (ACSS) - Reference Guide

## Overview

In Azure Center for SAP solutions, you either create a new SAP system or register an existing one, which then creates a Virtual Instance for SAP solutions (VIS). The VIS brings SAP awareness to Azure by providing management capabilities such as status/health monitoring and quality checks/insights.

- [Public documentation](https://learn.microsoft.com/en-us/azure/sap/center-sap-solutions/overview)

## Case Routing (SAP → VM Team)

| SAP Path | Routing |
|----------|---------|
| Azure Center for SAP solutions | (root) |
| Deployment Issue | VM Configuration |
| Deployment Issue/Compute(VM) | VM Configuration |
| Deployment Issue/Keyvault | VM Configuration |
| Deployment Issue/Storage | VM Configuration |
| Deployment Issue/Virtual Network | VM Networking |
| Deployment Issue(General) | VM Configuration |
| Registering existing SAP System to ACSS | VM Configuration |
| Help Installing SAP software | VM Configuration |
| Monitoring for SAP solutions | Azure Specialized |
| Integrating with Azure monitoring | Azure Specialized |
| Issue with Health and Status | Azure Specialized |
| Performance | VM Management |
| Portal Issue | VM Management |
| Starting and Stopping of SAP systems | VM Management |
| Start/Stop Application Tier | VM Management |
| Start/Stop Database instance | VM Management |
| Issue with Quality Insights | VM Management |
| Any other issue | VM Configuration |

## Escalation

### Engaging SME
- OneVM team members: engage ACSS SMEs through the AVA channel in Teams
- Delivery partner team members: work with TA and follow team process

### ICM Path (Autopopulates in ASC)
- **Service Name**: Azure Workloads Platform as Service
- **Team**: Azure SAP Business Platform as Service - Customer Support Incident (CSI)

## Kusto Access

- **Cluster**: WaasServices
- **Access Request**: Security Group `acssCSSTeam@microsoft.com` in [IDWeb](https://idweb.microsoft.com/IdentityManagement/aspx/groups/AllGroups.aspx)

## Training Resources

- [ACSS Brownbag sessions](https://microsoft.sharepoint.com/:f:/t/VMHub/ErSDwYcTU99CmDLUM1dsyFIBsft7-fw3gOu6EPL72ZP9ag?e=c4GdnT)
- [GA/PG Update Blog](https://techcommunity.microsoft.com/t5/running-sap-applications-on-the/announcing-general-availability-for-microsoft-azure-center-for/ba-p/3818493)
- [ACSS Portal](https://aka.ms/ACSSPortal)
- [Overview Video](https://learn.microsoft.com/en-us/events/sap-on-azure-training-videos/azure-center-for-sap-solutions-overview)
- [Demo Video](https://learn.microsoft.com/en-us/events/sap-on-azure-training-videos/azure-center-for-sap-solutions-demo)
