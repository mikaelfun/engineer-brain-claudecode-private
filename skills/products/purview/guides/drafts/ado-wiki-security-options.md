---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Troubleshooting Guides (TSGs)/Security and Access Control/Security Options"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FTroubleshooting%20Guides%20(TSGs)%2FSecurity%20and%20Access%20Control%2FSecurity%20Options"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Purview Network Security Options

## I. Public Purview to Public Data Source
- Connection over secured public internet
- TLS 1.2+ used for HTTPS/TLS over TCP

## II. Private Purview to Private Data Source

### 1. Private Endpoint
- IPSec VPN or Azure ExpressRoute for on-prem → Azure
- SHIR on Azure VM or on-prem within the VNET

### 2. Service Endpoint
- Allow Trusted Resources for qualified Azure services (e.g., Key Vault)

### 3. Managed VNet IR
- Supported data sources only
- Setup: PE-enabled account → approve managed PEs → create managed PE for datasource + keyvault → scan

**Known Issue**: Azure Synapse Analytics — Allowed Trusted Services is NOT sufficient. Must add Firewall rule in Synapse Network.

## III. Public Purview to Private Data Source
- Purview = Trusted Azure Service
- Connect via Allow Trusted Services on data source
- If not supported: whitelist Purview Public IP or create NSG rule

## IV. Private Purview to Public Data Source
- Install SHIR on same VNET as Purview
- Key Vault needs: Public IP whitelist OR same VNet as SHIR
- Data source must qualify as Allowed Trusted Service
- Key Vault: Enable "Allow Trusted Azure Services" + add Secret for auth

Reference: [Azure Security baseline for Microsoft Purview](https://docs.microsoft.com/en-us/security/benchmark/azure/baselines/purview-security-baseline)
