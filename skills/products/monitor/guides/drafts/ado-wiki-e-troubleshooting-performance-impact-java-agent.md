---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Troubleshooting performance impact involving Java agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FTroubleshooting%20performance%20impact%20involving%20Java%20agent"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Performance Impact Involving Java Agent

## Overview

Comprehensive guidelines for troubleshooting performance-related issues associated with the Application Insights Java Agent.

## Considerations

The scenarios and suggestions outlined in this material are not exhaustive. Various combinations of host environments, framework versions, and libraries could potentially result in unexpected performance issues. This article serves as general guidance on the types of diagnostics to collect if the Java Agent is suspected of causing performance problems.

If your specific scenario is not addressed in this guidance, or if you require assistance in finding the appropriate reference, please consider reaching out to one of the Subject Matter Experts (SMEs) or Technical Advisors (TAs) on the team for support.

## Troubleshooting Guide (TSG)

### Step 1: Identify the performance issue affecting the application

Leverage the findings reported by customers in their support requests to understand the nature of the performance issues. Common performance issues include:

- **High memory consumption**
- **High CPU usage**
  - You can visualize the CPU usage of Java applications with and without Application Insights by using the `top` command.
  - To understand the `%CPU` column in the `top` output, you need to know the number of available CPUs on your system (`nproc` command).
  - Example: if your system has four CPUs, a `%CPU` value of 81.5% means 81.5% of total 400% (4 CPUs x 100%).
- **Slow startup times**
- **Unexpected application crashes or hangs**
- **General application slowness**

Additionally, request evidence from the customer to validate the issue, such as thread dumps, heap dumps, and profiler traces.

### Step 2: Confirm whether the Java Agent is the driving factor

Before initiating an in-depth debugging process, determine whether the issue persists in the absence of the Java Agent. If the problem continues without the agent, the agent is not the root cause and the Azure Monitoring team is not responsible for further analysis.

If the problem only manifests when the agent is present, proceed to the next step.

### Step 3: Validate conditions under which the problem happens

Performance debugging is complex and iterative. Invest time understanding the conditions:

- **SDK Version**: Is the customer using a recent SDK version? Can they upgrade and confirm if the issue persists?
- **Recent Changes**: Were there code changes (library upgrades, infrastructure changes, code deployments) before the issue? Can these be rolled back?
- **Nature of the Issue**:
  - Is the behavior gradual (resource consumption steadily increasing)?
  - Are there spikes in resource usage?
  - How long does it take for the issue to manifest?
  - Does the issue occur only during specific hours/days?
  - Is the issue consistently present?

### Step 4: Collect diagnostics from the affected app

For detailed instructions, refer to internal wiki: [Collect Java Dumps and Traces](/Application-Insights/How-To/Diagnostics-and-Tools/Tools/Collect-Java-Dumps-and-Traces).

| Issue Type | Diagnostic to Collect |
|---|---|
| High memory / OutOfMemory | Java heap dump |
| Memory continuously growing | Java heap dump |
| Memory spikes | JFR trace |
| High CPU consumption | JFR trace (preferred) or Java thread dump |
| Slow startup times | See below |
| Unexpected crashes/hangs | Java thread dump + application logs |
| General slowness | JFR trace (preferred) or Java thread dump |

**High CPU - Reactor/Reactor Netty instrumentation note:**

The Reactor and Reactor Netty instrumentations can significantly increase CPU usage. Check via self-diagnostics at `DEBUG` level:
- `DEBUG i.o.j.e.i.InstrumentationModule - Applying instrumentation: reactor`
- `DEBUG i.o.j.e.i.InstrumentationModule - Applying instrumentation: reactor-netty`

Disable these instrumentations with environment variables:
- `OTEL_INSTRUMENTATION_REACTOR_ENABLED=false`
- `OTEL_INSTRUMENTATION_REACTOR_NETTY_ENABLED=false`

Or Java system properties:
- `-Dotel.instrumentation.reactor.enabled=false`
- `-Dotel.instrumentation.reactor.netty.enabled=false`

**Slow startup times:**

1. Public guidance: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/java-standalone-troubleshoot#slow-startup-time-in-application-insights
2. If unresolved, enable startup stack trace collection:
   - Add JVM arg: `-Dapplicationinsights.debug.startupProfiling=true`
   - Restart the app
   - Collect `stacktrace.txt` for diagnosis

### Step 5: Analyze collected diagnostics

Verify:
1. **Timing**: Diagnostics were collected while the issue was being reproduced.
2. **Java Agent Presence**: The Java Agent appears to be contributing to the behavior.

If both conditions are met, review the information in [Collect Java Dumps and Traces](/Application-Insights/How-To/Diagnostics-and-Tools/Tools/Collect-Java-Dumps-and-Traces) for analysis strategies based on the specific diagnostics collected (JFR traces, thread dumps, heap dumps).

Once analysis is done, submit an escalation to the Java Agent PG team.

## Public Documentation

- [Application Insights Java Profiler](https://learn.microsoft.com/en-us/azure/azure-monitor/app/java-standalone-profiler)
- [Java Agent Thread Dump](https://github.com/microsoft/ApplicationInsights-Java/wiki/Thread-dump)
- [Slow startups in Java Agent](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-monitor/app-insights/telemetry/java-standalone-troubleshoot#slow-startup-time-in-application-insights-and-java-8)
