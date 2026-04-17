---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Azure Support Center/Use Query Draft Telemetry via Log Analytics workspace resource"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAzure%20Support%20Center%2FUse%20Query%20Draft%20Telemetry%20via%20Log%20Analytics%20workspace%20resource"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Use Query Draft Telemetry via Log Analytics workspace resource

## Overview

Draft API is the querying service behind Application Insights and Log Analytics. Anytime you run a query in the Logs blade or access an experience that results in queries being ran in the backend, Draft is in place accepting that request and providing back the telemetry records that were requested. This article provides a walk-through of how to query Draft API telemetry to diagnose issues related to failed queries.

## Considerations

- The Query Draft Telemetry tab is found on every Log Analytics workspace resource.
- This tab allows you to query customer's query attempts against their Log Analytic and Application Insights resources.
- This allows you to see if a query reached our query service or not and details on what transpired.
- Regardless of whether the Application Insights resource is classic or workspace-based, telemetry on query attempts should be available in Draft for both scenarios.
- Draft telemetry is accessible through _any_ LA workspace. You don't need to query Draft telemetry through the workspace that's associated with the Application Insights resource; any workspace will work.
- The underlying data being queried in this tab is an Application Insights (classic schema) resource, so you have access to all the usual tables you find related to Application Insights.
   - Applying the above knowledge
      1. A query made by the user from the Logs blade will be in the 'requests' table.
      1. Other key data can be found in other tables like 'traces', 'exceptions', or 'customEvents' so 'union *' can be very enlightening in its output but be sure to scope the query as noted in the next bullet.
      1. It is important to use smart queries in this experience, use WHERE clauses to narrow the timestamp range and 'operation_Id' to optimize the query. Some examples are available in the Workflow section.

## Workflow

1. Go to any Log Analytics workspace resource in ASC. They are found under the Microsoft.OperationalInsights Resource Provider. One of the tabs is called 'Query Draft Telemetry', access that tab.

2. The UI offers many useful sample queries in the lower half of the tab. Some examples are the following:

   - Get the reported error message for a request id:

   ```kql
   let requestId = '<request-id>';
   requests
   | where operation_ParentId == requestId
   | extend Failure_message_ = todynamic(customDimensions.['Failure.message'])
   | extend Failure_message_1 = todynamic(customDimensions.['Response.errorMessage'])
   | extend message = iff(isnotempty(Failure_message_ ),Failure_message_ ,Failure_message_1 )
   | extend json = parse_json(tostring(message))
   | project json
   | evaluate bag_unpack(json)
   ```

   - Get relevant details for a request id:
   ```kql
   let requestId = '<request-id>';
   requests
   | where operation_ParentId == requestId
   | project name, duration, performanceBucket, resultCode, success, customDimensions['Request.rawBody']
   ```

   - Pull all associated telemetry from a single request id:
   ```kql
   let requestId = '<request-id>';
   union *
   | where operation_ParentId == requestId
   | take 50
   ```

   **Note:** Sometimes Draft investigations for failed/timed out queries may result in no failures reported by Draft. Some issues may be reflected in Draft as high duration calls while waiting for a response from an upstream component, think of ADX for example. For that reason, it is recommended to execute the second query if you're not able to find any error details using the first query. Additionally, query using a union operation may also bring out any relevant exceptions that are tied to a failed query experience.

   **Note:** The 'duration' field in these tables is represented in milliseconds, so if you see a duration of 11000, that means 11 seconds.

## Obtaining a request ID

Whenever a user runs a query in the Logs blade, a "Request ID" is available in the portal experience. This can be obtained by clicking the "Query Details" link at the bottom of the page, which opens a right-hand tab showing details of the query, the last item being the Request ID.

Another way to obtain this is through a .HAR trace by investigating the browser call made to Draft.

## Public Documentation

N/A

## Internal References

N/A
