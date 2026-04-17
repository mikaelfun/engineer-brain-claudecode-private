---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Availability/Availability Tests/Availability Test Architecture"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FAvailability%2FAvailability%20Tests%2FAvailability%20Test%20Architecture"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Overview
---
Availability tests are web requests created to test a website's availability (to determine if the application is accessible or experiencing downtime).

These are synthetic transactions that are automated at specific intervals, sending constant requests to the application. If the correct threshold of failures occurs an alert can be sent to individuals to bring awareness of the situation.



# Workflow
---

<details closed>
<summary><b>1. Understand the basic architecture</b></summary>
<br>

- Behind the scenes, there are dedicated virtual machines distributed across many regions and sovereign clouds, that are prepared to execute the web test requests against the configured URL in an availability test.
- The supported regions and sovereign clouds are documented here: https://learn.microsoft.com/azure/azure-monitor/app/availability-standard-tests#location-population-tags
- These machines host code written by the Application Insights Product team to facilitate this functionality.
- The instances running these tests and the machines hosting them spin up and down like any other server. This means an instance executing a test could change at any time. 
</br>
</details>

<details closed>
<summary><b>2. Understand the basics of how Availability tests work</b></summary>
<br>

1. The application code running on these servers make a simple connectivity test to the domain name (URL) defined an availability test.
1. The application attempts resolve the provided domain name within the URL using stand Azure DNS 
1. This means the DNS needs to be publicly defined; any machine on the public internet should be able resolve the DNS. 
1. Once the DNS is resolved to an IP address a standard internet connection is attempted; this means not only does the DNS need to be publicly resolvable, but the general public also needs to be able to access the site.
1. Given the URL is accessible via the public Internet, a request is triggered against it, the site needs to accept inbound traffic over port 443 and then a TCP connection attempted followed by the defined HTTP request verb and a response is collected.
   - [Check URLs and Availability Test are Publicly accessible](/Application-Insights/How%2DTo/Additional-Reference-Material/Availability-Tests-References/Check-URLs-and-Availability-Test-are-Publicly-accessible)
   - [Availability Tests - No public internet accessibility](/Application-Insights/How%2DTo/Code-Samples-and-Lab-Walkthroughs/Code-Samples/Availability-Tests-%2D-No-public-internet-accessibility)
1. The response aka the results of each test are then logged within the respective Application Insights Component using the standard [trackAvailability()](https://learn.microsoft.com/dotnet/api/microsoft.applicationinsights.telemetryclient.trackavailability?view=azure-dotnet) method.
1. The portal experience exposes details of failed exceptions, see: https://learn.microsoft.com/azure/azure-monitor/app/availability-standard-tests#if-you-see-failures. 
</br>
</details>


# Public Documentation
---
- [Application Insights availability tests - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/app/availability?tabs=standard)
- [Monitor availability with URL ping tests - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/azure/azure-monitor/app/monitor-web-app-availability)
- [Application Insights availability tests - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/app/availability?tabs=standard)
- [TelemetryClient.TrackAvailability Method (Microsoft.ApplicationInsights) - Azure for .NET Developers | Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/microsoft.applicationinsights.telemetryclient.trackavailability?view=azure-dotnet)

# Internal References
---
- [Availability Tests - Support Topic](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/579971/Availability-Tests)


---
Last Modified date: 21/06/2024
Last Modified by: brafonso

