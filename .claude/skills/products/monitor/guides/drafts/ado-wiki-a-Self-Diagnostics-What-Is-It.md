---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Conceptual/Understanding Self-Diagnostics in Application Insights/What is Self-Diagnostics?"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FConceptual%2FUnderstanding%20Self-Diagnostics%20in%20Application%20Insights%2FWhat%20is%20Self-Diagnostics%3F"
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
This article explains what Self-Diagnostics  also commonly referred to as SDK Logs  means in the context of Application Insights SDK troubleshooting.

# Workflow
---

**Self-Diagnostics** is a built-in logging mechanism within the Application Insights and it exists for both Classic and OpenTelemetry implementations. It records the the internal operations, such as configuration loading, telemetry transmission, and internal exceptions.

This feature is designed to provide visibility into the internal behavior, especially when telemetry data is missing, incomplete, or behaving unexpectedly.

Think of Self-Diagnostics as a key to the black box for the implemented instrumentation as it captures detailed logs about whats happening under the hood, making it easier to identify and troubleshoot issues that affect telemetry collection and functionality.


**Key points:**
*   Self-Diagnostics is internal to the Application Insights instrumentation method and separate from your applications own logging.
*   It is primarily intended for troubleshooting and complex support scenarios.
*   The logs can help pinpoint misconfigurations, connectivity issues, or unexpected SDK failures.

---
Last Modified date: 29/09/2025
Last Modified by: damanue

