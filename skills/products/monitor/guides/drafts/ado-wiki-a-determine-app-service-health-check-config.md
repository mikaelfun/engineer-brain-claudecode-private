---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/AppLens/Determine if App Service is configured for Health Check"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAppLens%2FDetermine%20if%20App%20Service%20is%20configured%20for%20Health%20Check"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
This article shows how to verify if Health Check is configured for an App Service.

#Considerations
___
Health Check uses a user supplied path which is pinged in 1-minute intervals. The response expected is a 2xx status code (302 redirects are not followed).

If any other response outside of 2xx is received, after X (configurable) failed requests, the instance is removed from the load balancer.

#Workflow
___
1. Go to AppLens and enter the name of the App Service resource you want to investigate.

2. Search 'Health Check' in the upper, left filter option.

3. Select the "Health Check feature" blade on the left.

#Public Documentation
___
https://learn.microsoft.com/azure/app-service/monitor-instances-health-check?tabs=dotnet

#Internal References
___
N/A

___
Feedback? Contact Thomas Holland (tholland)
Last Modified: 7/19/2023
