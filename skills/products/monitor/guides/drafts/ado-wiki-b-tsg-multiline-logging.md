---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/Troubleshooting Guides/Agent Management TSGs/TSG Multiline Logging Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FInsights%2C%20Workbooks%20and%20Managed%20Products%2FContainer%20Insights%2FTroubleshooting%20Guides%2FAgent%20Management%20TSGs%2FTSG%20Multiline%20Logging%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# TSG Multiline Logging Issues

## Scenario
User has enabled multiline logging for Container Insights and stack traces are not being stitched into single log entries.

## Feature Capabilities
1. Default container runtime truncates log messages to 16KB. With multiline, max supported is up to 64KB.
2. Stitches exception call stack traces for supported languages: .NET, Go, Python, Java.
3. Except for .NET exception call stacks, all other scenarios use Fluent-bit built-in parser.

## Prerequisites
- ContainerLogV2 must be enabled

## Troubleshooting Steps

### Step 1: Validate programming language
Check if the application uses a supported language (.NET, Go, Python, Java). If unsupported, inform customer.

### Step 2: Check ConfigMap for multiline settings
```bash
kubectl get configmap container-azm-ms-agentconfig -n kube-system -o yaml
```
- No results: ConfigMap not applied, customer needs to follow setup steps
- Has results: Check `[agent_settings.multi_line_logs]` section to ensure multiline is enabled and correct language is specified

### Step 3: Verify ConfigMap is parsed correctly
```bash
kubectl logs <ama-logs-pod> -n kube-system -c ama-logs | grep multi
```
If the ConfigMap parsing message is not visible, the YAML may be incorrectly formatted.

### Step 4: YAML formatting issues
Reapply a fresh ConfigMap with correct modifications for multiline logging.

### Step 5: Arbitrary log lines
If customer expects arbitrary log lines (not call stacks/exceptions) to be stitched - this is NOT a supported scenario.

### Step 6: Escalation
If all above checks pass, collect [agent logs](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/614028/How-to-collect-logs-for-Container-Insights) and submit ICM. Also collect application logs from `/var/log/containers` directory.

## Known Issues
- Fluent-bit built-in multiline Java parser does not support custom exceptions (ICM 560446623)
- Multiline does not stitch arbitrary log lines (ICM 565341097)

## Resources
- [Container Insights Multiline Logging](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-logs-schema#multi-line-logging-in-container-insights)
- [Container Insights ConfigMap](https://learn.microsoft.com/azure/azure-monitor/containers/container-insights-data-collection-configmap#data-collection-settings)
