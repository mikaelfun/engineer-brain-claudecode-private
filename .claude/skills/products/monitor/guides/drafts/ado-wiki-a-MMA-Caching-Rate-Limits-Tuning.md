---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Microsoft Monitoring Agent (MMA) for Windows/How-To/How to modify MMA Caching, Rate Limits, Tuning Parameters"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Microsoft%20Monitoring%20Agent%20%28MMA%29%20for%20Windows/How-To/How%20to%20modify%20MMA%20Caching%2C%20Rate%20Limits%2C%20Tuning%20Parameters"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
[[_TOC_]]


#Scenario
---
OMS agent collects events using pluggable modules known as Management Pack. Post event collection agent buffers events, both in memory and then on disk-based queue, before sending out to ingestion pipeline.  There are different factors that can affect latency from agent. 

#Throughput
---
- Agents sustainable Events per second (EPS) rate out of the box is ~400 EPS. Various factors can affect this such as underlying machine capacity etc.

#Latency
---
This is total time to discover an event, collect it, and then send it. Data is collected by a 
Management Pack running in hosted environment of MonitoringHost.exe. HealthService then store data on disk based queue before sending out to Log Analytics services. Upload frequency varies between 30 seconds and 2 minutes depending on the type of data. Most data is uploaded in under 1 minute. Network conditions may negatively affect the latency of this data. Typical local latency of agent is under 3 to 5 minutes. It can increase for agents under load.

#Agents Under Load
---
Agents under huge load can face issue in event reading, uploading. You can expect to see event from agent complaining about Event logs getting wrapped, increased latency in event uploading etc.

# How long is the data cached/buffered for?
The data is cached or buffered for a maximum of 8.5 hours. The Monitoring Agent tries to upload every 20 seconds. If it can't upload, it will wait 30 seconds, and then try to upload again. After that, the wait time goes from 30 seconds to 60 seconds to 120 seconds, and so on, up to a maximum of nine minutes between retries. The agent will retry 10 times for a given "chunk" of data before it discards the data and advances to the next “chunk.” This cycle continues until the agent can successfully upload again. In practice, this means that data is buffered for up to 8.5 hours before being discarded. Any data that has been uploaded is cleared. The retry time is slightly randomized to avoid having all agents retry simultaneously. Public Doc [Reference](https://learn.microsoft.com/troubleshoot/azure/azure-monitor/log-analytics/mma-troubleshoot-basics#frequently-asked-questions-faq) 

# What occurs if the connection to the workspace isn't available?
The agent gradually backs off the retry process exponentially for up to 8.5 hours per retry. It will continue to retry every 8.5 hours indefinitely and discard the oldest data when the buffer limit is reached. When the agent can successfully connect, it will upload data until it returns to processing the latest data.

#AgentTelemetry
---
Agent telemetry can be used for troubleshooting issues. All Error events are reported in AgentError table. AgentQoS Table has fields such as,
- AvgBatchEventCount, AvgEventSize, AvgLocalLatencyInMs, BatchCount, MaxBatchEventCount, MaxEventSize, MaxLocalLatencyInMs, MinBatchEventCount, MinEventSize, MinLocalLatencyInMs, NetworkLatencyInMs, Source, AgentId, WorkspaceId.

Relevant kusto cluster is genevaagent.kusto.windows.net and database is Telemetry.  

#Tuning Parameters
---
The default minimum value is 100 MB, and the maximum value is 1.5 GB. This setting can be modified in the following registry value:

1. Size of disk-based queue
    * Symptom: Event id 2023 with Source as HealthService will be present in Operations Manager event logs. This means some of the events are being dropped.
    * Resolution: Tune following registry.
    * Key: HKLM\SYSTEM\CurrentControlSet\Services\HealthService\Parameters\Management Groups\<Management Group Name>
    * Value: MaximumQueueSizeKb
    * Type: DWORD
    * Default:   102400 (100MB)
    * Min Value: 5120   
    * Max Value: 1536000 (1.5GB)

2. Buffer size to read ETW event

   * Symptom: Event id 26007 or 26008 will be present in Operations Manager event logs. Events reading may fail with buffer size being too small. 
   * Agent traces will have error “Error rendering event, EvtRender failed with 122(ERROR_INSUFFICIENT_BUFFER)”
   * Resolution: Tune following registry.
   * Key: HKLM\Software\Microsoft\Microsoft Operations Manager\3.0\Modules\Global\NT Event Log DS
   * Value: MaxEventBufferSize. * 
   * Type: DWORD
   * Default:   131072
   * Min Value: 512
   * Max Value: 524288

3. Maximum Size of an Event Log.
   * Symptom: Event id 26013 or 26017 will be present in Operations Manager event logs. This means agent is not able to keep up with events reading. This can also happened as by product of “Buffer size to read ETW event” is small.

   * Resolution: Increase Maximum log size of event logs. One way to do this is using Event Viewer (eventvwr.msc). Right-click on the target event log and select Properties. Beside Maximum Log Size, update new value and click OK.

4. Batch to read event is small.

   * Symptom: Either of event 26012, 26013, 26009 will be present in Operations Manager event logs. This means agent is failing to read events.
   * Resolution: Tune following registry.
   * Key: HKLM\Software\Microsoft\Microsoft Operations Manager\3.0\Modules\Global\NT Event Log DS
   * Value: EventBatchSize
   * Type: DWORD
   * Default:   20
   * Min Value: 5
   * Max Value: 100

# References
---
https://docs.microsoft.com/azure/azure-monitor/platform/data-ingestion-time
