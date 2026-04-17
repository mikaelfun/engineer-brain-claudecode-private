---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Conceptual/Understanding Self-Diagnostics in Application Insights/When to use it?"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FConceptual%2FUnderstanding%20Self-Diagnostics%20in%20Application%20Insights%2FWhen%20to%20use%20it%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

:::template /.templates/Sandbox-Header.md
:::

[[_TOC_]]


# Overview
---

This section describes **when to use Self-Diagnostics** in the context of Application Insights troubleshooting.

# Workflow
---
You should enable and review Self-Diagnostics logs in the following scenarios:

*   **Telemetry is missing or incomplete in the Azure portal:**  
    Use Self-Diagnostics to investigate why expected telemetry data is not appearing, which can help identify issues such as dropped data, misconfigurations, or connectivity problems. This should be a final step once narrowing the issue to reside in the Application Insights instrumentation itself and not network, ingestion, or configuration related.
    
*   **Diagnosing performance issues or misconfigurations:**  
    If the instrumentation is not behaving as expectedsuch as delays in telemetry transmission (client-side latency), unexpected errors, or configuration problemsSelf-Diagnostics provides detailed logs to help pinpoint the root cause. These logs are very effective in troubleshooting telemetry processor or sampling override related issues for Java 3.X.
    
*   **Before submitting an ICM to the SDK Product Group:**  
    Collecting and attaching Self-Diagnostics logs when escalating issues ensures the Product Group has the necessary context to investigate and resolve the problem efficiently.


# Public Documentation
---
Links to public docs


# Internal References
---
- [Filter or modify collected telemetry - Overview](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/583839/Filter-or-modify-collected-telemetry)

---
Last Modified date: 29/09/2025
Last Modified by: damanue

