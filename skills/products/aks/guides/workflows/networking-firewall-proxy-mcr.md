# AKS 防火墙与代理 — mcr — 排查工作流

**来源草稿**: ado-wiki-b-mcr-client-firewall-rules.md
**Kusto 引用**: 无
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Microsoft Container Registry (MCR) Client Firewall Rules Configuration
> 来源: ado-wiki-b-mcr-client-firewall-rules.md | 适用: 适用范围未明确

### 排查步骤

#### Microsoft Container Registry (MCR) Client Firewall Rules Configuration

MCR is an implementation of the OCI Distribution Specification which delivers artifacts, such as container images. The Distribution Spec defines two endpoints:

- **REST Endpoint**: providing content discovery. This is the url users are most familiar with with pulling an image: `docker pull mcr.microsoft.com/windows/servercore:1909`. The REST endpoint is load balanced across multiple worldwide regions, providing consistent content addressable artifacts.
- **Data Endpoint**: providing content delivery. As a registry client discovers the content requried, it negotiates a set of content urls, pulling from the data endpoint.

#### CDN Backed, Regionalized Data Endpoints

#### DATA ENDPOINT CHANGE

`To provide a consistent FQDN between the REST and data endpoints, on March 3, 2020 the data endpoint will be changing from *.cdn.mscr.io to *.data.mcr.microsoft.com . Once a change of the data endpoint is confirmed, clients can remove the *.cdn.mscr.io FQDN.`

##### To access MCR, the following FQDNs are required

| Protocol | Target FQDN              | Available           |
|----------|--------------------------|---------------------|
| https    | mcr.microsoft.com        | Now                 |
| https    | *.cdn.mscr.io            | Now - March 3, 2020 |
| https    | *.data.mcr.microsoft.com | March 3, 2020       |

##### PG Update: <https://github.com/microsoft/containerregistry/blob/master/client-firewall-rules.md>

#### Owner and Contributors

**Owner:** Naomi Priola <Naomi.Priola@microsoft.com>
**Contributors:**

- Ines Monteiro <t-inmont@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Arindam Dhar <ardhar@microsoft.com>

---
