---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Review mdsd.info"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Review%20mdsd.info"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
The mdsd process in the Linux AMA performs many functions related to agent operation. The mdsd records its operational logs in four different log files (mdsd.info, mdsd.warn, mdsd.err, and mdsd.qos). In this article, we'll explore reviewing mdsd.info logs for different agent scenarios. 

The mdsd.info log can be found here:
```VM|Arc: /var/opt/microsoft/azuremonitoragent/log/mdsd.info```
```Troubleshooter: ...\mdsd\logs\mdsd.info```

# Scenario: All scenarios
The below known issues apply to all scenarios.

## Known Issues (All Scenarios)
#95597

# Scenario: Start-up/initialization
These are the logs that we expect to see during agent start-up/initialization. Some of these events can help to inform us about the agent's running configuration and different activities occurring that might inform us for other scenarios.

```systemctl restart azuremonitoragent && tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.info```

- Start process/initialize

```
2025-02-25T18:50:30.7630300Z: [DAEMON] START mdsd daemon ver(1.33.1) pid(2056) uid(989) gid (985)
2025-02-25T18:50:30.7737170Z: Trying to lock '/run/azuremonitoragent/default.lock', fd=0
2025-02-25T18:50:30.7737630Z: Lock '/run/azuremonitoragent/default.lock'  was taken successfully.
```

- Define parameters and limits

```
2025-02-25T18:50:28.0433960Z: [PERSISTENCE] Local Persistency is enabled
2025-02-25T18:50:30.7735910Z: Msgpack array size is not set. Will use default 10485760 items.
Msgpack map size is not set. Will use default 10485760 items.
Msgpack string size is not set. Will use default 10485760 bytes.
Msgpack bin size is not set. Will use default 10485760 bytes.
Msgpack ext size is not set. Will use default 10485760 bytes.
Msgpack nesting is not set. Will use default 10 levels.
2025-02-25T18:50:30.7736730Z: Event ingestion rate limiting (EPS) is set to 20000 events per second.
2025-02-25T18:50:30.8698750Z: Using disk quota specified in AgentSettings: 10240
2025-02-25T18:50:55.0834940Z: TcMalloc reading tcmalloc.max_total_thread_cache_bytes=33554432 Bytes
2025-02-25T18:50:55.0835480Z: TcMalloc release frequency is set to 1.
2025-02-25T18:50:55.0835650Z: TcMalloc release rate is set to 10.
2025-02-25T18:50:55.0835850Z: [BackPressure] periodic timer was set to 1000 milliseconds.
2025-02-25T18:50:55.0836000Z: [BackPressure] memory threshold was set to 3584 MB.
2025-02-25T18:50:55.0836270Z: [BackPressure] throttling interval period is 1000ms, quota is 0.95 (95%), throttle time is 950ms
```

- Get config

```
2025-02-25T18:50:30.8469770Z: Detected cloud region "westus2" via IMDS
2025-02-25T18:50:30.8470390Z: Detected cloud environment "azurepubliccloud" via IMDS; the domain ".com" will be used
2025-02-25T18:50:30.8650540Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/FetchIMDSMetadata.cpp:140,FetchMetadataFromIMDS]Setting resource id from IMDS: /subscriptions/{SUBID}/resourceGroups/{RGNAME}/providers/{ResourceProvider}/{ResourceType}/{ResourceName}
2025-02-25T18:50:30.8651260Z: [/__w/1/s/external/WindowsAgent/src/shared/mcsmanager/lib/src/McsManager.cpp:428,Initialize]McsManager successfully initialized
```

- Parsing/loading DCRs

```
2025-02-25T18:50:30.8692740Z: Parsing Mcs document /etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.json
2025-02-25T18:50:30.8693300Z: Loaded Mcs document /etc/opt/microsoft/azuremonitoragent/config-cache/mcsconfig.lkg.json
2025-02-25T18:50:30.8697760Z: Loading Azure Monitor configuration dcr-24015c34de114a3083d873c8c5390394
2025-02-25T18:50:30.8698150Z: Parsing content for configuration with id dcr-24015c34de114a3083d873c8c5390394
2025-02-25T18:50:30.8698950Z: Loaded Azure Monitor configuration dcr-24015c34de114a3083d873c8c5390394
2025-02-25T18:50:54.8347080Z: Loaded Azure Monitor configuration dcr-61ab199c0bab41f1a6bd407d0798a956
2025-02-25T18:50:55.0601610Z: Local config content parsed. Loaded data sources for configuration id: dcr-61ab199c0bab41f1a6bd407d0798a956
```

# Scenario: Heartbeat
When reviewing the logs for this scenario, it may be easiest to first restart the AMA service and wait two minutes for the agent to initialize and attempt to send a Heartbeat and then review the logs.

```systemctl restart azuremonitoragent && tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.info```

## Review Related Logs
- Start the mdsd daemon

- Successful Heartbeats
    - These records will not appear in the log if the Heartbeat was not successfully transmitted
    - [Get Log Analytics Workspace ResourceID from workspaceId](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590098/AMA-HT-Get-Log-Analytics-Workspace-ResourceID)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: The time of the most recent heartbeat should be within 1 minute of the time in which the logs were collected (the name of the .tgz file will have the time in which the logs were collected).
</div>

```
2024-10-23T17:41:41.4464250Z: Heartbeating for ODSUploader https://{workspaceId}
2024-10-23T17:42:41.4113210Z: Heartbeating for ODSUploader https://{workspaceId}
2024-10-23T17:43:41.4428270Z: Heartbeating for ODSUploader https://{workspaceId}
```
## Known Issues (Heartbeat)
{Pending from 2411080030008078 & Associated IcM}
#85723

# Scenario: Syslog
In this scenario, we need to enable [mdsd tracing option -T 0x2 for EventIngest](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779088/AMA-Linux-HT-Set-mdsd-tracing-options?anchor=scenario%3A-syslog). 

- This is the raw message received from the daemon and written to the buffer

```
2025-02-20T20:27:11.1666030Z: void ProtocolHandlerSyslog::Run() (.../mdsd/ProtocolHandlerSyslog.cc +1027) Received packet with size=216 Bytes, fd=878, combinedBuffer='<189>Feb 20 20:27:11 10.0.1.31 1 2025-02-20T20:27:11.170958+00:00 ama-rhel10 labadmin - - [timeQuality tzKnown="1" isSynced="1" syncAccuracy="268185"] Test syslog message from ama-rhel10 Thu Feb 20 20:27:11 UTC 2025
'
```

- This is the result of the ProtocolHandlerSyslog parsing the message

```
2025-02-20T20:27:11.1667320Z: void ProtocolHandlerSyslog::Run() (.../mdsd/ProtocolHandlerSyslog.cc +1077) Parsed Syslog Event: pri=189 facility=local7 severity=notice time_mds=2025-02-20T20:27:11.1666610Z time_tm=2025-2-20 20:27:11 hostname='10.0.1.31' procname='1' procid='' msgid='' sd='' msg='2025-02-20T20:27:11.170958+00:00 ama-rhel10 labadmin - - [timeQuality tzKnown="1" isSynced="1" syncAccuracy="268185"] Test syslog message from ama-rhel10 Thu Feb 20 20:27:11 UTC 2025'

```

If we do not see these messages or there are related errors surrounding this message, this is indicative of an issue.

## Known Issues (Syslog)
#89463

# Scenario: Text Logs
In this scenario, we need to enable [mdsd tracing option -T 0x400000002 for GigLAConnector and EventIngest](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779088/AMA-Linux-HT-Set-mdsd-tracing-options?anchor=scenario%3A-text-logs)

On startup shown below, "Fluent Port:" identifies port 28230 will be used for log file collection
```
2025-04-01T14:53:31.0222670Z: static void ProtocolListenerMgr::Init(const string&, int, int, int, int, bool, bool, bool, const std::optional<std::filesystem::path>&, long int) (.../mdsd/ProtocolListenerMgr.cc +47) Prefix: /run/azuremonitoragent/default, Port: 28130, Fluent Port:28230, Influx Db Port:-1, Syslog Port:28330, Use abstract domain sockets:0
```

Place the socket into a listening state to receive inbound messages from Fluentbit
```
2025-04-01T14:53:31.2338860Z: virtual void ProtocolListenerUnix::openListener() (.../mdsd/ProtocolListenerUnix.cc +19) Creating socket '/run/azuremonitoragent/CAgentStream_CloudAgentInfo_AzureMonitorAgent', use_abstract_domain_sockets=0 socket_type=1
```

Task to processes and upload records received from Fluentbit
```
2025-04-01T14:55:30.7800360Z: virtual pplx::task<ExecuteResult> GigLAConnector::executeAsync(const MdsTime&, uint) (.../mdsd/GigLAConnector.cc +289) Start time 2025-04-01T14:54:00.0000000Z, end time 2025-04-01T14:55:00.0000000Z
2025-04-01T14:55:30.7994180Z: virtual pplx::task<ExecuteResult> GigLAConnector::executeAsync(const MdsTime&, uint) (.../mdsd/GigLAConnector.cc +398) Uploading 13 Custom-Text-CustomTextLog_CL rows to Gig.
2025-04-01T14:55:31.1171880Z: GigLAConnector::executeAsync(const MdsTime&, uint)::<lambda(ExecuteResult)> (.../mdsd/GigLAConnector.cc +468) All lines processed
```

## Known Issues (Text Logs)

# Scenario: JSON Logs
In this scenario, we need to enable [mdsd tracing option -T 0x400000002 for GigLAConnector and EventIngest](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779088/AMA-Linux-HT-Set-mdsd-tracing-options?anchor=scenario%3A-json-logs)

## Known Issues (JSON Logs)
#106073