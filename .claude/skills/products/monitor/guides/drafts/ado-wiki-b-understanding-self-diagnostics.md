---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Learning Resources/Training/Course Materials/Conceptual/Understanding Self-Diagnostics in Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FLearning%20Resources%2FTraining%2FCourse%20Materials%2FConceptual%2FUnderstanding%20Self-Diagnostics%20in%20Application%20Insights"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview

This learning objective introduces **Self-Diagnostics in the Application Insights SDK** as a foundational tool for engineers who need to troubleshoot SDK-related issues effectively.

# What is Self-Diagnostics?

Self-Diagnostics, also commonly referred to as SDK Logs, is a built-in logging feature in the Application Insights SDK that helps engineers troubleshoot SDK-related issues by capturing internal logging about the SDK's own behaviour.

Self-Diagnostics logs can be enabled across all supported SDKs, regardless of the programming language.

# How to Enable Self-Diagnostics

## .NET (Classic SDK)
[Self-diagnostics for Application Insights SDKs - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/enable-self-diagnostics)

## Java 3.x SDK
[Configuration options - Azure Monitor Application Insights for Java](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-config#self-diagnostics)

## Python SDK (OpenTelemetry)
[Troubleshoot OpenTelemetry issues in Python](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/opentelemetry-troubleshooting-python#enable-diagnostic-logging)

## Node.js 3.x SDK (OpenTelemetry)
[Troubleshoot OpenTelemetry issues in Node.js](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/opentelemetry-troubleshooting-nodejs#step-1-enable-diagnostic-logging)

# Prerequisites

At least one of these environments should be set up:

1. App Service Web app .Net Core
2. App Service Web app Java
3. App Service Web app Python
4. App Services Web app Node.js
5. ASP.Net on-premises agent
