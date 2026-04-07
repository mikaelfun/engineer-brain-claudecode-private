---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Availability Tests/Firewall and network"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Topics/Availability%20Tests/Firewall%20and%20network"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Firewall and Network Configuration for Availability Tests

## Scenario
Help configuring firewall to allow availability test probes through hybrid/on-premises firewall or Azure NSG.

## Decision Tree

### 1. Is the endpoint publicly resolvable and accessible?
- **Yes** -> Proceed to firewall configuration
- **No** -> Use TrackAvailability() custom test (see Private Testing section)

### 2. Firewall Type

#### Hybrid or On-Premises Firewall
- Download IP addresses from: https://learn.microsoft.com/azure/virtual-network/service-tags-overview#discover-service-tags-by-using-downloadable-json-files
- Allow TCP connections from ApplicationInsightsAvailability service tag IPs

#### Azure Network Security Group (NSG)
- Use service tag `ApplicationInsightsAvailability`
- Reference: https://learn.microsoft.com/azure/virtual-network/service-tags-overview

### 3. Troubleshooting Steps

1. **Verify public DNS**: Run `nslookup` from Azure VM to confirm Azure DNS can resolve domain
2. **Configure firewall**: Allow TCP from availability test agent IPs per cloud:
   - [Public Cloud](https://www.microsoft.com/en-us/download/details.aspx?id=56519)
   - [US Government](https://www.microsoft.com/en-us/download/details.aspx?id=57063)
   - [China Cloud](https://www.microsoft.com/en-us/download/details.aspx?id=57062)
3. **Cannot configure firewall**: Use TrackAvailability() custom code running behind firewall with outbound access to App Insights ingestion endpoint
4. **Private/internal sites**: See [Private testing](https://learn.microsoft.com/azure/azure-monitor/app/availability-private-test) and [Azure Functions custom tests](https://learn.microsoft.com/azure/azure-monitor/app/availability-azure-functions)

### Key References
- [Availability tests - Testing behind a firewall](https://learn.microsoft.com/azure/azure-monitor/app/availability?tabs=standard#testing-behind-a-firewall)
- [IP addresses used by Azure Monitor](https://learn.microsoft.com/azure/azure-monitor/ip-addresses)
- [Diagnose ping test failure](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/app-insights/availability/diagnose-ping-test-failure)
