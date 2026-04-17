---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/How Tos/Microsoft Container Registry (MCR) Client Firewall Rules Configuration"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FMicrosoft%20Container%20Registry%20%28MCR%29%20Client%20Firewall%20Rules%20Configuration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Container Registry (MCR) Client Firewall Rules Configuration

MCR is an implementation of the OCI Distribution Specification which delivers artifacts, such as container images. The Distribution Spec defines two endpoints:

- **REST Endpoint**: providing content discovery. This is the url users are most familiar with with pulling an image: `docker pull mcr.microsoft.com/windows/servercore:1909`. The REST endpoint is load balanced across multiple worldwide regions, providing consistent content addressable artifacts.
- **Data Endpoint**: providing content delivery. As a registry client discovers the content requried, it negotiates a set of content urls, pulling from the data endpoint.

## CDN Backed, Regionalized Data Endpoints

## DATA ENDPOINT CHANGE

`To provide a consistent FQDN between the REST and data endpoints, on March 3, 2020 the data endpoint will be changing from *.cdn.mscr.io to *.data.mcr.microsoft.com . Once a change of the data endpoint is confirmed, clients can remove the *.cdn.mscr.io FQDN.`

### To access MCR, the following FQDNs are required

| Protocol | Target FQDN              | Available           |
|----------|--------------------------|---------------------|
| https    | mcr.microsoft.com        | Now                 |
| https    | *.cdn.mscr.io            | Now - March 3, 2020 |
| https    | *.data.mcr.microsoft.com | March 3, 2020       |

### PG Update: <https://github.com/microsoft/containerregistry/blob/master/client-firewall-rules.md>

## Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:**

- Ines Monteiro <t-inmont@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Arindam Dhar <ardhar@microsoft.com>
