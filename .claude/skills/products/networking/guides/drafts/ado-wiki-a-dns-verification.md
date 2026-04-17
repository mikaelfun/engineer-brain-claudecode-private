---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Expert Troubleshooting/DNS verification"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/Expert%20Troubleshooting/DNS%20verification"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## Description

Application Gateway v2 depends on DNS for both control plane and data plane. Communications with Gateway Manager, Key Vaults, storage accounts, etc. depend on proper and stable DNS resolution. Also, for reaching backend servers DNS must work properly. DNS will affect control and data plane, especially if customers override custom DNS servers in the Virtual Network where Application Gateway is running.

This kind of troubleshooting could be difficult without logging in into instances and performing tests directly and real time, but Application Gateway team developed a Jarvis Action that helps on verifying this.

## How to check DNS

There's a [Jarvis Action](https://portal.microsoftgeneva.com/?page=actions&acisEndpoint=Public&managementOpen=false&selectedNodeType=3&extension=Brooklyn&group=Application%20Gateways&operationId=getlistofnonresolvabledomains&operationName=Get%20List%20of%20NonResolvable%20Domains&inputMode=single&params={}&actionEndpoint=Brooklyn%20-%20Prod):

**Brooklyn > Application Gateways > Get List of NonResolvable Domains**

This action will check:
- FQDN's needed for **control plane** (storage accounts, keyvaults, gateway manager, etc.) — enable via checkbox
- FQDN's needed for **data plane** (backend servers, etc.) — enable via checkbox
- **Specific FQDN**: include a specific FQDN to check like www.microsoft.com

## Result Interpretation

The output provides per-instance DNS resolution results with:
- `datapathEndpointsResults` — backend server DNS resolution
- `controlpathEndpointsResults` — control plane endpoint DNS resolution (blob storage, keyvault, etc.)
- `extraEndpointResults` — manually added FQDNs

Each result shows:
- `dnsServer` used (e.g., 168.63.129.16 = Azure DNS)
- `ipList` — resolved IPs
- `status` — "Succeeded" or "Failed"
- `resolutionError` — error details if failed

This way you can easily check the current DNS state as well as which DNS servers are in use **for each instance**.
