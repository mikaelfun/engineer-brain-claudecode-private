---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/SDK and Agents References/Validate javascript functionality"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FSDK%20and%20Agents%20References%2FValidate%20javascript%20functionality"
importDate: "2026-04-05"
type: troubleshooting-guide
---

#Overview
___
How to examine javascript activity from a browser to know if it is impacting the lack of JavaScript SDK.

#Considerations
___
Often times client-side telemetry suddenly stops working or never works or works in some situations but not others making the scenario very confusing. Often times it can be related to CORS being impacted by browser settings or add-ons. The key is to be able to look at things and getting the cause narrowed down. 

This guide looks at baseline to understand a known good and then expands on that to start expanding on that to identify what is causing the javascript SDK not being able to send telmetry but not necessarily why. They why can get deep and not be effective within the Application Insights support boundaries.

Assumptions made here is basic DNS resolution and TCP connectivity is working.

#Step by Step Instructions
___
 
## Baseline of known good:
1. HAR trace is an easy means to examine if javascript is able to send telemetry to the ingestion endpoint.
1. Open a browser session and the Developer tools
1. Drag and drop the HAR file into the Developer tool UI
1. Hit the "Search" / magnifying glass in the toolbar
1. in the search dialog type "/track"
1. click on the item under a matching result as this will position things in the trace on that track call
1. Check the Header of the track call — a successful call shows POST method with Response Headers
1. Check the Payload tab to verify the instrumentation key (ikey) matches the expected Application Insights component

## Example CORS operations getting blocked by the browser settings

1. javascript sdk is going to be reliant on CORS functionality and is an additional layer not called out above.
1. Here is a base line where telemetry is NOT successfully sent: NO response headers, call stalled due to it not actually being sent
1. Note the CORS Preflight check: `1.0/?cors=true...` entry followed by an OPTIONS method track call — these need to occur for telemetry to be sent to the ingestion endpoint
1. It is not consistent behavior how the CORS and track calls are captured:
   - first track - no Payload (OPTIONS method)
   - second track with Payload (POST method — actual sending of telemetry)
1. If the only track call found is a POST with NO Payload or a Payload but NO Response Headers there is most likely an issue with the browser
1. If this issue is isolated to an Edge browser, policy changes could be rolled out and custom domain names might have been appropriately added to the AllowTrackingForUrls list. This is ONLY ONE possible cause but there can be many.

#Public Documentation
___
- [Microsoft Edge Browser Policy Documentation AllowTrackingForUrls | Microsoft Learn](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-browser-policies/allowtrackingforurls)

#Internal References
___
- [Understanding CORS - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/820700/Understanding-CORS)

___
Created by: matthofa
Created: Nov 05, 2025
Last Modified by: matthofa
Last Modified on: Nov 05, 2025
