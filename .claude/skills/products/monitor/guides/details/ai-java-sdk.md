# Monitor Application Insights Java SDK 与代理 - Comprehensive Troubleshooting Guide

**Entries**: 18 | **Drafts fused**: 7 | **Kusto queries**: 0
**Draft sources**: ado-wiki-a-manage-sampling-with-java.md, ado-wiki-b-java-sdk-2x-diagnostic-logs.md, ado-wiki-b-java-telemetry-validation-portal-asc.md, ado-wiki-b-self-diagnostics-logs-java.md, ado-wiki-e-troubleshooting-performance-impact-java-agent.md, ado-wiki-f-analyze-java-dumps-traces.md, ado-wiki-h-collect-java-dumps-traces.md
**Generated**: 2026-04-07

---

## Quick Troubleshooting Path

### Step 1: Application Insights Java 3.0 Agent self-diagnostics configured with TRACE level but only captures DEBUG level output

**Solution**: Check if the environment variable APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL is set. Remove it or set it to TRACE to allow TRACE-level self-diagnostic log collection

`[Source: ADO Wiki, Score: 8.5]`

### Step 2: Java 3.X Application Insights: operation_Name / request name values only contain HTTP method (POST or GET) but no actual route/path information

**Solution**: Configure a telemetry processor in applicationinsights.json under preview.processors: use type 'span', include matchType 'regexp' with spanNames ['POST|GET'], and set name.fromAttributes to ['http.request.method', 'url.path'] with separator ' '. Use diagnostic logs (search for AgentSpanExporter e...

`[Source: ADO Wiki, Score: 8.5]`

### Step 3: Java 3.X Application Insights agent: self-diagnostics configured at TRACE level in applicationinsights.json but only DEBUG level output appears in logs

**Solution**: Check if the environment variable APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL is set. If so, either update it to TRACE or unset it to allow the JSON configuration to take effect. Reference: https://learn.microsoft.com/azure/azure-monitor/app/java-standalone-config#self-diagnostics

`[Source: ADO Wiki, Score: 8.5]`

### Step 4: Adaptive sampling not available or not working in .NET OpenTelemetry SDK for Application Insights

**Solution**: For .NET OpenTelemetry: use Fixed-Rate sampling or Ingestion sampling instead of Adaptive. For Java: Rate-limited sampling provides similar behavior to Adaptive. See OpenTelemetry sampling docs: https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-sampling

`[Source: ADO Wiki, Score: 8.5]`

### Step 5: Performance counters not collected on Linux environment for Application Insights

**Solution**: Use Metrics instead of Performance Counters for Linux environments. For Java on Linux, use JMX metrics. For .NET Core on Linux, use EventCounters or custom metrics.

`[Source: ADO Wiki, Score: 8.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Application Insights Java 3.0 Agent self-diagnostics configured with TRACE le... | The environment variable APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL takes pre... | Check if the environment variable APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL ... | 8.5 | ADO Wiki |
| 2 | Java 3.X Application Insights: operation_Name / request name values only cont... | Default span naming in OpenTelemetry Java agent uses only the HTTP method wit... | Configure a telemetry processor in applicationinsights.json under preview.pro... | 8.5 | ADO Wiki |
| 3 | Java 3.X Application Insights agent: self-diagnostics configured at TRACE lev... | The environment variable APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL takes pre... | Check if the environment variable APPLICATIONINSIGHTS_SELF_DIAGNOSTICS_LEVEL ... | 8.5 | ADO Wiki |
| 4 | Adaptive sampling not available or not working in .NET OpenTelemetry SDK for ... | Adaptive sampling has been removed from OpenTelemetry for .NET. Only Fixed-Ra... | For .NET OpenTelemetry: use Fixed-Rate sampling or Ingestion sampling instead... | 8.5 | ADO Wiki |
| 5 | Performance counters not collected on Linux environment for Application Insights | Performance counters only apply to Windows. Linux does not support Windows pe... | Use Metrics instead of Performance Counters for Linux environments. For Java ... | 8.5 | ADO Wiki |
| 6 | Application Insights Java SDK (classic, 2.x) has unresolved bugs, missing tel... | The Java SDK 2.x (classic API) is deprecated and no longer actively maintaine... | Migrate from Java SDK 2.x to the Java Agent (OpenTelemetry-based). Migration ... | 8.5 | ADO Wiki |
| 7 | Trace/log items appear duplicated 3-4 times in the Application Insights trace... | By design (external). The Boomi platform's default logging behavior causes re... | Set the 'Write Once Per Execution' flag to true in the Boomi configuration. R... | 8.5 | ADO Wiki |
| 8 | Application Insights Java SDK starts successfully but no telemetry data is co... | The JVM does not have any of the TLS cipher suites supported by the Applicati... | 1) Enable Java SDK self-diagnostics to capture detailed logs. 2) Check logs f... | 8.5 | ADO Wiki |
| 9 | Azure Monitor OpenTelemetry Java agent does not work with Quarkus native appl... | The Azure Monitor OpenTelemetry Java agent is not compatible with Quarkus nat... | Use the community Quarkus OpenTelemetry Exporter for Azure instead of the sta... | 8.5 | ADO Wiki |
| 10 | Application Insights telemetry ingestion fails with connection refused/closed... | Application or server using deprecated TLS version (TLS 1.0, TLS 1.1, or SSL3... | Set SecurityProtocol to TLS 1.2 or TLS 1.3. Verify with Qualys SSL Labs tool ... | 8.5 | ADO Wiki |
| 11 | Application Insights telemetry still not flowing after migrating from instrum... | The application runtime or OS does not support TLS 1.2. App Insights classic ... | 1) Check runtime TLS defaults: .NET depends on OS + .NET runtime version + an... | 8.5 | ADO Wiki |
| 12 | Duplicate logs in Application Insights when using Java Azure Functions with l... | Distributed tracing for Java Functions captures console output, creating dupl... | For log4j: add ThresholdFilter with level=ALL onMatch=DENY to Console appende... | 7.5 | MS Learn |
| 13 | JVM fails to start with Error opening zip file or JAR manifest missing when u... | Agent JAR file not found at specified path or corrupted during file transfer | Verify -javaagent JVM argument points to valid JAR path. Re-download agent JA... | 7.5 | MS Learn |
| 14 | Java 应用的 Application Insights 遥测完全停止流入，Java 自诊断日志中出现警告：'WARN c.m.applicationi... | JVM 参数 -Djsse.enableSNIExtension=false 禁用了 SSL 握手中的 Server Name Indication（SN... | 移除 -Djsse.enableSNIExtension=false 或将其改为 true（默认值）。若参数出现多次，确保没有重复出现设为 false 的... | 7.0 | ADO Wiki |
| 15 | Application Insights Java agent JAR file corrupted (about half expected size)... | Browser download mechanism corrupts the JAR file during download | Download using curl or wget instead of browser: curl --location --output appl... | 6.5 | MS Learn |
| 16 | Warning during Spring Boot native image startup: The OpenTelemetry version is... | Incompatible OpenTelemetry version with spring-cloud-azure-starter-monitor de... | Import the OpenTelemetry Bills of Materials (BOM) following the OpenTelemetry... | 6.5 | MS Learn |
| 17 | Tomcat application takes several minutes to start after enabling Application ... | Tomcat JAR scanning mechanism scans Application Insights JAR files during sta... | Exclude Application Insights JAR files from Tomcat list of scanned files in c... | 6.5 | MS Learn |
| 18 | UnknownHostException after upgrading Application Insights Java agent to versi... | Java agent versions >3.2.0 use new ingestion endpoint v2.1/track which redire... | Upgrade network configuration to resolve the new ingestion endpoint shown in ... | 6.5 | MS Learn |
