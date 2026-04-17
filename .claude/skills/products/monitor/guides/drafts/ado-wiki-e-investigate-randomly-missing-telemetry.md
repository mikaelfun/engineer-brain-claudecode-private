---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/Ingestion References/Investigate randomly missing telemetry"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Additional%20Reference%20Material/Ingestion%20References/Investigate%20randomly%20missing%20telemetry"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Investigate Randomly Missing Telemetry

## Scenario

Users report telemetry flowing into Application Insights but specific items are missing from the logs. This is NOT latent telemetry that eventually shows up, NOT metric data via MDM, and NOT <1% expected loss.

## Investigation Process

### 1. Rule out ingestion issues
- Verify issue is NOT an ingestion latency issue (see: Identify Ingestion Issues)

### 2. Check for dropped telemetry
- Use ASC Read Aggregate by Dropped

### 3. Check telemetry correlation
- If issue is about missing operations, see: Telemetry Correlation Issues

### 4. Verify sampling
- Most common culprit for missing telemetry
- Determine if sampling is contributing:
  1. Find an operation ID where an item WAS lost
  2. Find an operation ID where the item was NOT lost
  3. Run `union *` for each operation ID
  4. If both return results and only the single missing item differs → NOT sampling
  5. Sampling is operation-ID-based: if it drops one item, ALL items in that operation are dropped

### 5. Check Data Collection Rules (DCRs)
- DCRs can filter out specific telemetry types

### 6. Determine scope of missing data
- Is it isolated to a single telemetry type or random across many?
- Check what types are being collected:
  ```kql
  union * | summarize count() by itemType, cloud_RoleName
  ```
- Check if a type recently stopped:
  ```kql
  union * | summarize count() by bin(startofday(timestamp), 1d), itemType, sdkVersion
  ```

### 7. Missing specific telemetry types
- **Auto Instrumentation**: Check supported auto-collected dependency types
- **.NET/.NET Core**: See [Automatically tracked dependencies](https://learn.microsoft.com/azure/azure-monitor/app/asp-net-dependencies#automatically-tracked-dependencies)
- **Java 3.X**: See [Auto-instrumentation](https://learn.microsoft.com/azure/azure-monitor/app/java-in-process-agent#auto-instrumentation)
- **Important**: With .NET Core, enabling Auto Instrumentation with "Interop with Application Insights SDK Preemptive" (XDT_MicrosoftApplicationInsights_PreemptSdk) will override manual SDK and stop collecting custom telemetry

### 8. Application lifecycle patterns
- **Shutdown data loss**: SDK buffer not flushed before process terminates → implement proper Flush() on shutdown
- **Specific dependency type not collected**: Not in SDK auto-collection list → implement manual dependency tracking

### 9. Truly random missing telemetry
- If loss rate <1% of total telemetry → considered normal/expected due to ingestion pipeline complexity
- If loss rate >1%:
  - Check if SDK is recent version
  - Collect SDK diagnostic logs during the time when data loss actually occurs
  - Compare expected data volume (from external logs) with actual Application Insights data
