---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Application Insights setup and customization/Telemetry through proxy or firewall"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FSupport%20Topics%2FApplication%20Insights%20setup%20and%20customization%2FTelemetry%20through%20proxy%20or%20firewall"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Telemetry Through Proxy or Firewall

## Scenario

Allow Application Insights telemetry to pass through proxy servers or firewalls by configuring the correct endpoints, IP addresses, and ports.

## Endpoint Categories

### Application Insights SDKs and Status Monitor

URL endpoints, IPs, and Ports for data ingestion including Live Metrics:
- [Outgoing ports](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses#outgoing-ports)

Status Monitor configuration endpoint/port requirements:
- [Status Monitor](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses#status-monitor)

JavaScript SDK additional requirement:
- [Application Insights SDKs](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses#application-insights-sdks)

### Availability Tests

Service tags and IP addresses for availability test infrastructure:
- [Availability tests](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses#availability-tests)
- [Service Tags](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses#service-tag)
- [IP addresses list](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses#ip-addresses)

Location population tags (GOV, China, Public):
- [Location population tags](https://docs.microsoft.com/azure/azure-monitor/app/monitor-web-app-availability#location-population-tags)

### Query API

- [Application Insights and Log Analytics APIs](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses#application-insights-and-log-analytics-apis)

## References

- [IP addresses used by Azure Monitor](https://docs.microsoft.com/azure/azure-monitor/app/ip-addresses)
