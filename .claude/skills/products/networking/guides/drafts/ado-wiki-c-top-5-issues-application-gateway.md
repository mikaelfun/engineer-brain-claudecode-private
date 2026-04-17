---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Top 5 Issues for Application Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FTop%205%20Issues%20for%20Application%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Top 5 Application Gateway issues

## Top Issues over Jan-Mar 2021 Quarter

| Rank | Support Area Path | SR Volume | Relevant Wiki Articles | TSG Available in ASC |
|---:|:--|:-:|:--:|:-:|
| 1 | Connectivity/Connection timed outs | 5254 | [502 Bad Gateway Errors](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134172/Application-Gateway-502-Bad-Gateway-Errors) / [Troubleshooting HTTP 5xx Errors](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/140201/Troubleshooting-Application-Gateway-HTTP-5xx-Errors) / [Information Log Reason Codes](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/312769/Information-Log-Reason-Codes) | Azure/Application Gateway/502 errors |
| 2 | Configuration update failure | 4126 | [Troubleshooting CRUD Failures](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/140206/Troubleshooting-Azure-Networking-CRUD-Failures) | TBD |
| 3 | Configuration and Setup/Configure App service | 4124 | [Common Integration Scenarios](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/400654/Common-Integration-Scenarios) | TBD |
| 4 | Web Application Firewall (WAF)/Configure WAF | 3326 | [Public Doc: Enable WAF](https://docs.microsoft.com/en-us/azure/web-application-firewall/ag/application-gateway-web-application-firewall-portal) | TBD |
| 5 | 502 errors/Unhealthy backend pool | 2984 | [502 Bad Gateway Errors](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/134172/Application-Gateway-502-Bad-Gateway-Errors) / [Information Log Reason Codes](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/312769/Information-Log-Reason-Codes) / [How to work with Certs for AppGW](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/333203/How-to-work-with-Certs-for-application-gateway) | Azure/Application Gateway/Connectivity/502 errors |

## Key Takeaways

- **502 errors / connectivity timeouts** dominate (Ranks 1 + 5), combined ~8000+ SR/quarter
- **CRUD/config update failures** are the #2 issue — see Troubleshooting CRUD Failures wiki
- **App Service integration** is a top configuration challenge — see Common Integration Scenarios
- **WAF configuration** is #4 by volume — mainly configuration/setup questions
