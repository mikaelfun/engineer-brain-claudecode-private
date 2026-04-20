# AVD ContentIdea KB Legacy (Part 2) - Comprehensive Troubleshooting Guide

**Entries**: 4 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ContentIdea

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| How to disable Maximize/Minimize buttons from Remote Desktop Connectio... |  | Enable displayconnectionbar:i:0 under hostpool RDP properties. Note: o... |
| Similar remote apps (e.g. Chrome) on AVD desktop client overlap on the... | Taskbar grouping controlled by local Windows settings, not AVD. | On client system: Settings -> Taskbar -> Combine Taskbar buttons -> Se... |
| WVD ARM deployment fails with terminal provisioning state Failed when ... |  |  |
| Introduction of AVD Diag Tool     AVD Diag Tool serves as a centralize... |  |  |

### Phase 2: Detailed Investigation

#### Entry 1: How to disable Maximize/Minimize buttons from Remote Desktop...
> Source: ContentIdea | ID: avd-contentidea-kb-034 | Score: 6.5

**Symptom**: How to disable Maximize/Minimize buttons from Remote Desktop Connection so WVD users cannot take screenshots.

**Root Cause**: 

**Solution**: Enable displayconnectionbar:i:0 under hostpool RDP properties. Note: only works with WVD sessions, not MSTSC.

> 21V Mooncake: Applicable

#### Entry 2: Similar remote apps (e.g. Chrome) on AVD desktop client over...
> Source: ContentIdea | ID: avd-contentidea-kb-060 | Score: 6.5

**Symptom**: Similar remote apps (e.g. Chrome) on AVD desktop client overlap on the taskbar.

**Root Cause**: Taskbar grouping controlled by local Windows settings, not AVD.

**Solution**: On client system: Settings -> Taskbar -> Combine Taskbar buttons -> Select NEVER.

> 21V Mooncake: Applicable

#### Entry 3: WVD ARM deployment fails with terminal provisioning state Fa...
> Source: ContentIdea | ID: avd-contentidea-kb-021 | Score: 5.5

**Symptom**: WVD ARM deployment fails with terminal provisioning state Failed when processing extension dscextension. DeploymentFailed error in JSON output.

**Root Cause**: 

**Solution**: 

> 21V Mooncake: Applicable

#### Entry 4: Introduction of AVD Diag Tool     AVD Diag Tool serves as a ...
> Source: ContentIdea | ID: avd-contentidea-kb-129 | Score: 5.5

**Symptom**: Introduction of AVD Diag Tool     AVD Diag Tool serves as a centralized Dashboard for examining AVD problems.      You can access the AVD Diag from https://aka.ms/avddiagtool   *If you do not have permission, please contact someone with Editor access to grant you the necessary permissions. *We would like to understand the number of users of this tool quantitatively in order to assess its impact. By accessing the tool via the shortlink we created above, we can count the number of accesses. Therefore, when using AVD Diag, please bookmark the shortlink and access the tool through it.      Training Video   The link below offers detailed instructions on how to use the AVD Diag Tool.  The below recording video shows AVD Diag tool overview and how to use with its demo. Introduction of AVD Diag  A Tool for AVD Investigation-20250808_002100UTC-Meeting Recording.mp4   Tutorial for Beginner     The following site allows you to experience the investigation process using the AVD Diag Tool by utilizing a tutorial prepared on the actual AVD Diag Tool, which guides you step by step through the operation checks.  AVD Diagnostics   Description   The following explains each feature displayed under &quot;Activity Diagnostics&quot; when launching the AVD Diag Tool. &nbsp;  Activity - Activities are displayed based on the information entered at the top of the page. You can refer to the displayed data and adjust the input at the top of the page if necessary.     Diag Error - Displays logs marked as errors within the Kusto Diag Activity.   Chart of ErrorCodeSymbolic - Shows a list of ErrorCodeSymbolic related to the specified information you filtered.   Error Internal Rate&nbsp; - Displays the percentage of errors that include Internal Error among the shown errors.   RDP Shortpath or NOT - Indicates whether the connection is using RDP Shortpath.   Infra Trace - Displays information recorded in the Kusto RD Infra Trace table.   Client Trace - Displays information recorded in the Kusto RDClientTrace table.   Session Host Trace - Displays information recorded in the RDPCoreTSEventLog table, related to the Session Host.   Agent to Broker Heartbeat - Displays heartbeat information to confirm connectivity between the Session Host and the control plane.   FSLogix Trace - Displays information recorded in the RDFSLogixTrace table.   HostPool Info - Displays information related to the specified AVD environment and Host Pool.   Session Host Info - Displays information about the specified Session Host (ShoeboxAgentHealth data).   VM Operations - Displays operations performed on the specified Session Host. (Same as VM Operations shown in ASC.)  Deploy Error - Displays VM deployment errors for a specific Session Host.  Logon Delay - Shows the time taken to complete logon, broken down by each component.   Agent Update Failure Check - Displays information about failed agent updates.   TooManyRequests (429) - Displays the number of failed TokenRequest API calls due to TooManyRequests based on specified conditions. (If this spikes, it may indicate that the number of requests to VMs within a certain time frame has hit a limit.)  Estimated RTT/Bandwidth - Displays the Round Trip Time based on specified conditions  the time it takes for data to travel across the network and return.

**Root Cause**: 

**Solution**: 

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
