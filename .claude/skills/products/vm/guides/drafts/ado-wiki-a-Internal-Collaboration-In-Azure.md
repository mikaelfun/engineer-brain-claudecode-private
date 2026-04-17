---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/How It Works/Internal Collaboration In Azure_How It Works"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FHow%20It%20Works%2FInternal%20Collaboration%20In%20Azure_How%20It%20Works"
importDate: "2026-04-06"
type: troubleshooting-guide
tags:
  - cw.How-It-Works
  - cw.Reviewed-10-2021
---

| Item | Desc |
| --- | --- |
| Created on | 10/18/2021 |
| Modified on | 1/25/2022 |
| Contributors | Kenichiro Hirahara (khiraha) |

[[_TOC_]]

# Summary

The purpose of this document makes how components in Azure are collaborating between them clear, from a high-level overview. Some public documents provide information about this but this provides more details which can be useful when troubleshooting issues happening in Azure — understanding why you have to look into certain Kusto logs or other information, and providing investigation results more quickly.

Components are explained from ARM (Azure Resource Manager) moving to lower components, focusing on IaaS compute stack.

---

# Overview of Control Layer

This is a logical diagram showing the relationship between components in the control layer of Azure. This is a sample of components' collaboration of region X (any). Basically every region should have the same structure. Every connection from outside goes through ARM. ARM has an endpoint (management.azure.com) exposed to customers.

Customers can connect to ARM through 4 methods:
- Azure Management Portal
- Azure PowerShell
- Azure CLI
- Raw REST calls

In any case, a certain REST API call is made in ARM by a client before it reaches ARM.

Useful reference documents:
- [RESTful web API design](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [Azure REST API get started](https://docs.microsoft.com/en-us/rest/api/gettingstarted/)
- [Azure REST API reference](https://docs.microsoft.com/en-us/rest/api/azure/)
- [Azure control plane and data plane](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/control-plane-and-data-plane)

---

> **Note:** This document is 28,376 characters. The above covers the high-level overview section. For the full content including detailed component interaction descriptions, ARM/CRP/Fabric collaboration flows, and Kusto investigation patterns, refer to the full wiki page at the sourceUrl above.
>
> Key topics covered in the full document:
> - ARM → CRP → Fabric Controller request flow
> - Network Resource Provider (NRP) and Storage RP collaboration
> - Control plane vs data plane operations
> - Logging and Kusto query patterns for tracing cross-component requests
> - CRP internal operation flow and state machine
> - Fabric Controller node lifecycle management
