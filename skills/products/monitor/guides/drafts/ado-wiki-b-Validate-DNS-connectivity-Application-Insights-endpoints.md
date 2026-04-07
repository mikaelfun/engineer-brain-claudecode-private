---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Networking/Network Connectivity/Validate DNS connectivity against Application Insights endpoints"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Learning%20Resources/Training/Course%20Materials/Networking/Network%20Connectivity/Validate%20DNS%20connectivity%20against%20Application%20Insights%20endpoints"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Validate DNS connectivity against Application Insights endpoints

## Overview

This guide shows how to validate proper DNS resolutions for Application Insights endpoints when investigating App Service web apps.

## Validate default name resolution in App Services

Using the web app, go to the Console blade in App Services and run:

```
nameresolver eastus-8.in.applicationinsights.azure.com
nameresolver dc.services.visualstudio.com
```

By default, if a VNET is not configured on a web app, inbound/outbound connectivity is unrestricted and the app uses Azure DNS (168.63.129.16) for name resolution.

**Note:** In App Services, the `nameresolver` command is equivalent to running `nslookup` in Windows/Linux.

## Specify a custom DNS server in App Services

You can overwrite the default DNS behavior by configuring an environment variable:

| **Key name**  | **Value name** |
|--|--|
| WEBSITE_DNS_SERVER | {DNS server IP} |

Set this in **Environment Variables** in App Services portal.

## Validate difference after changes

After setting a custom DNS:
- The Server section of output will show the custom DNS IP instead of Azure DNS (168.63.129.16)
- Setting to an unreachable IP (e.g., 10.0.0.1) causes DNS timeout failure
- This exemplifies what happens at the first stage when App Insights SDK attempts to establish a connection

## Public Documentation
- [Name resolution in App Service](https://learn.microsoft.com/en-us/azure/app-service/overview-name-resolution)
- [Environment variables and app settings reference](https://learn.microsoft.com/en-us/azure/app-service/reference-app-settings)

## Internal References
- [Validate DNS connectivity in Application Insights](/Application-Insights/How-To/Validate-Network-Connectivity/Validate-DNS-connectivity-in-Application-Insights)

---
_Created by: nzamoralopez, Nov 25th, 2024_
