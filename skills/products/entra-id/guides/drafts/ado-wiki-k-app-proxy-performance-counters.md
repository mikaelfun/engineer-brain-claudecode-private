---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra application proxy/Microsoft Entra Application Proxy - Performance Counters"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20application%20proxy%2FMicrosoft%20Entra%20Application%20Proxy%20-%20Performance%20Counters"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Microsoft Entra Application Proxy - Performance Counters

Use Perfmon performance counters to monitor the Application Proxy connector service load and usage.

## Data Collection

Starting from connector version 17.1, the [Microsoft Entra Application Proxy Data Collector script](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/293681) can be configured with the `-Perfmon` switch to collect performance data (also collects CPU, memory, network data).

## Capacity Planning

- [Capacity Planning guide](https://learn.microsoft.com/azure/active-directory/app-proxy/application-proxy-connectors#capacity-planning)
- [Entra service limits](https://learn.microsoft.com/azure/active-directory/enterprise-users/directory-service-limits-restrictions)
- [HTTP 429 rate limiting for App Proxy](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/296528)

## Microsoft Entra Private Network Connector Counters

| Counter | Description |
|---------|-------------|
| **current active backend websockets** | Current number of actively used WebSocket connections between connector and backend server |
| **new backend websockets / sec** | New WebSocket connections per second between connector and backend server |
| **requests** | Total requests received from App Proxy Cloud Service since service start |
| **requests / sec** | Requests per second received from App Proxy Cloud Service |
| **responses** | Total responses received from the backend web application since service start |
| **responses / sec** | Responses per second from the backend web application |
| **transactions completions** | Total completed transactions (request + response + sent to cloud service) since service start |
| **transactions completions / sec** | Completed transactions per second |
| **transactions failed** | Total failed transactions since service start |
| **transactions failed / sec** | Failed transactions per second |
