---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Determine instrumentation method"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/General%20References/Determine%20instrumentation%20method"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Determine Instrumentation Method

## Overview

Determining what instrumentation method was used and SDK used.

## Considerations

- Instrumentation method cannot be assumed.
- Understanding the instrumentation method surfaces the SDK in use and is crucial in troubleshooting effort as it will determine what actions are necessary later in an investigation.

## Step by Step Instructions

1. There is no defined step-by-step instruction for determining instrumentation method used.
2. Leverage the sections below — it often takes looking at the situation from multiple angles to arrive at a theory and then attempt to confirm it.

### ASC — Querying Customer Data Tab

- `sdkVersion` will show what language and instrumentation method (auto or manual).
- See: Break down SDKs used and their versions.

**Notes:**
- `cloud_RoleName` is typically the app service web app or function name.
- `cloud_RoleInstance` is typically either an instance of an app service resource or even machine or container instance.
- Query the `requests` table and look at the `url` column — it will show the domain name(s) of the applications sending data.
- Expand Resource Explorer and group by Resource Provider → navigate to `microsoft.web` → check if there is a subtype of sites with a matching value.
- Use AppLens and its detectors to validate.

### AppLens

Detectors can show if Application Insights has auto-instrumentation enabled as well as the status of attach:
- Detector - App Insights Feature Status
- Detector - Application Insights Auto Instrumentation

### Validate Auto-Instrumentation

- See: Determine if Auto Instrumentation (codeless) is being used.
