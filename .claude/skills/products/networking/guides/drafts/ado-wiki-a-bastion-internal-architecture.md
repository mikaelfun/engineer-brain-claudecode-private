---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Internal Architecture and Component Flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FInternal%20Architecture%20and%20Component%20Flow"
importDate: "2026-04-06"
type: reference-guide
---

# Internal Architecture and Component Flow

[[_TOC_]]

## Internal Architecture

Azure Bastion is a regional service that deploys a Linux-based VMSS for service instances in a Microsoft subscription (VNet Injection service). RDP/SSH is used within the VNet from Bastion to the endpoint.

## Component Flow

> ARM --> NRP --> GWM --> Azure Bastion Service Instances (VMSS Linux - Regional)

```
graph TD
A(Portal, PowerShell, CLI, Template, REST) -->|Create Azure Bastion| B(ARM)
B --> C(NRP - Regional RP) 
C --> D(GWM - Regional)
D --> |GWM deploys Azure Bastion Service Instances| E[Azure Bastion Service Instances - VMSS Linux - Regional]
```

**Key components**:
- **ARM** – Azure Resource Manager (entry point for all management operations)
- **NRP** – Network Resource Provider (regional RP handling Bastion resources)
- **GWM** – Gateway Manager (regional, deploys and manages Bastion VMSS instances)
- **Azure Bastion Service Instances** – Linux-based VMSS running in the regional deployment

> **Source**: ADO Wiki - AzureNetworking/Wiki
> **Page**: /Azure Bastion/Internal Architecture and Component Flow
