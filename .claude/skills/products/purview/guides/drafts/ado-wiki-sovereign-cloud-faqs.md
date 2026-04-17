---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/Processes/Sovereign Cloud/FAQs on Sovereign Clouds - Fairfax & Mooncake"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2FProcesses%2FSovereign%20Cloud%2FFAQs%20on%20Sovereign%20Clouds%20-%20Fairfax%20%26%20Mooncake"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Sovereign Cloud FAQs - Fairfax & Mooncake

## How to check Purview Kusto logs on Sovereign cloud

**NOTE:** Unlike public cloud, Sovereign clouds like Mooncake and Fairfax have higher security requirements and Kusto logs of those clouds cannot be viewed directly on dev machines.

1. Open Kusto explorer and add connection, then the logs can be used like in public cloud.
2. More details like cluster info and add connection settings:
   - **Mooncake**: dSTS-Federated auth, cluster: `https://purviewadxcn3.chinanorth3.kusto.chinacloudapi.cn`
   - **Fairfax**: JIT access via SAVM, cluster: `https://purviewadxbn.usgovvirginia.kusto.usgovcloudapi.net`

## How to check ADF Kusto logs on Sovereign cloud

1. ADF Kusto logs on Sovereign cloud have to be accessed from Escort jump box through JIT.
2. Follow JIT process to create ICM for access to open the JIT portal.
3. After JIT approved, ICM PG will provide the jump box info.
4. Kusto explorer is installed on the jump box and you can add Purview Kusto connection there.

## How to login different Purview portal?

| Cloud | Portal URL |
|-------|-----------|
| Public | https://portal.azure.com |
| Mooncake | https://portal.azure.cn |
| Fairfax | https://portal.azure.us |

## How to check Jarvis/Geneva logs in sovereign clouds

Geneva endpoints are different between clouds:

| | Public | Mooncake | Fairfax |
|--|--------|----------|---------|
| Geneva Endpoint | Diagnostics Prod | CA Mooncake | CA Fairfax |

Select the correct endpoint in Geneva portal based on the cloud environment.
