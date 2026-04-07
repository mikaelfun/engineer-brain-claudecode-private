---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Sampling/Manage Sampling with JAVA"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Sampling/Manage%20Sampling%20with%20JAVA"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

This material covers managing sampling scenarios with the Application Insights Java agent.

# Key Facts

- **Rate-limited sampling** is on by default starting with Java agent 3.4.0.
- Java 3.X agent only supports Fixed Rate sampling.
- Java 2.X has been **retired** — no support effort; only point to upgrade docs.

# Configuring

- Java auto-instrumentation (3.4 agent): [Sampling - Azure Monitor Application Insights for Java](https://docs.microsoft.com/azure/azure-monitor/app/sampling)
- Sampling overrides: [Sampling overrides - Java](https://learn.microsoft.com/azure/azure-monitor/app/java-standalone-sampling-overrides)
- App Services (Java apps): configure via JSON in the Portal Experience — [Auto-instrumentation through Azure Portal](https://docs.microsoft.com/azure/azure-monitor/app/azure-web-apps-java#auto-instrumentation-through-azure-portal)
- Alternative: App Setting `APPLICATIONINSIGHTS_SAMPLING_PERCENTAGE` (integer %). If both App Setting and JSON are set, **JSON takes precedence**.
  - Docs: [Configuration options - Java](https://docs.microsoft.com/azure/azure-monitor/app/java-standalone-config#sampling)

# Enabling

- Rate-limited sampling is on by default from Java agent 3.4.0.
- Same config methods as above (applicationinsights.json or App Setting).

# Disabling

- To capture all telemetry, use [fixed-percentage sampling](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config#fixed-percentage-sampling) and set sampling percentage to **100**.
- Docs: [Rate-limited sampling config](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config#rate-limited-sampling)

# Sampling Overrides

### Configuring Sampling Overrides

1. Reference: [Sampling overrides - Java](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-sampling-overrides)
2. Requires: a query against the AI component showing what you want to target, e.g.:
   ```kusto
   union *
   | where timestamp > datetime(9/29/2025 4:00:00 PM)
   | where timestamp < datetime(9/30/2025 4:00:00 PM)
   | where operation_Id == "607fe85ec91d7a21931e3b8d55f1d077"
   | order by timestamp asc
   ```
3. Find the row where `operation_ParentId == Id` — this is the initiating operation.
4. Enable self-diagnostic log at level=debug to capture the telemetry:
   - [Language Resource - Java](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890133/Language-Resource?anchor=java)
5. In the self-diagnostics log, find the span data for the target operation. Look for the `attributes` section:
   ```
   attributes=AttributesMap{data={az.namespace=Microsoft.ServiceBus, messaging.system=servicebus, messaging.destination.name=myres_sbtopic/subscriptions/myres_sbsubscription, messaging.operation=process, ...}}
   ```
6. Build the `applicationinsights.json` override using key/value pairs from the attributes. Example:
   ```json
   {
     "sampling": {
       "overrides": [
         {
           "telemetryType": "request",
           "attributes": [
             {
               "key": "messaging.destination.name",
               "value": "myres_sbtopic_cloud_01/subscriptions/myres_sbsubscription_cloud_reports",
               "matchType": "strict"
             }
           ],
           "percentage": 0
         }
       ]
     }
   }
   ```

> **Important**: Do NOT use attributes with key starting with `applicationinsights.internal.*` — these are invalid for override rules.

### Troubleshooting Overrides

- Requires same data: `applicationinsights.json`, self-diagnostics log at `level=debug`, query against AI component.
- Build a query showing the time range when overrides were working vs. not working.

# Java 2.X (Retired)

- Java SDK 2.X has been retired — no effort beyond pointing to upgrade docs.
- Java SDK 2.X does NOT have sampling on by default.
- Upgrade path: [Upgrading from 2.x - Azure Monitor Application Insights Java](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-upgrade-from-2x)
- See also: [Legacy SDK support](/Application-Insights/Support-Topics/Deprecated-features/Legacy-SDK-support)

# Public Documentation

- [Sampling in Azure Application Insights with OpenTelemetry](https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-sampling)
- [Configuration options - Java (sampling)](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config#sampling)
- [Sampling overrides - Java](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-sampling-overrides)

# Internal References

- [Language Resource - Java](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/890133/Language-Resource?anchor=java)
- [Identify if Sampling is enabled](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/580009/Identify-if-Sampling-is-enabled)
