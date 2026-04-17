# AVD GPO 配置 — 排查工作流

**来源草稿**: ado-wiki-a-track-power-on-events.md
**Kusto 引用**: (无)
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: **This is mostly useful for Frontline Dedicated, where the machines are deallocated after use and started when the user is trying to connect.**
> 来源: ado-wiki-a-track-power-on-events.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Tracking the Power On events involves two directions: Hyper-V Level Power states and VM Goal state reported by the custom script extension. When a customer reports something like: "We are seeing our Frontline Dedicated CloudPCs starting slowly" or "It takes 30 mins, 90 mins to start the CloudPC until the user is able to connect" you have to decide based on the scenario, where to look.
1. **If the CloudPC takes longer to start and the user is eventually able to connect**
In this scenario, most likely the Hyper-V Power Event went well and the problem is related to the Goal State only where the custom script extension cannot obtain the VM State because of a Guest Agent system issue (Wire Server).
2. **If the CloudPC takes longer to start and the customer cannot confirm it really started because the user cannot connect at all.**
In this scenario the issue might be related to the actual power state of the VM itself: not powering On at all, BSOD, Reboot Loop
In both scenarios, make sure you ask the customer to try to connect so the CPC is powering On to be able to collect IAAS Disk logs and check the screenshot in ASC. Aside from an actual issue, if the event only occurred once, the problem might have been related to a Windows Update which, in case of feature updates, will take longer and the CPC will be in a state of "Installing Update" when it will not be available, but still Powered On. Screenshot (if the machine is in this state at the moment of troubleshooting) or IAAS Disk logs will show any trace of windows updates.
To use Kusto troubleshooting, you will need access to the following clusters (FTE Only):
azcrp.kusto.windows.net
azcore.centralus.kusto.windows.net
**Kusto Troubleshooting**
To check GoalState events:
````
// 1. get operation id. You need the CPC VM Name (NOT Device Name)
cluster("azcrp.kusto.windows.net").database("crp_allprod").ApiQosEvent
| where TIMESTAMP >=ago(17d)
| where resourceName contains "VN NAME (CPC_XXXXXXXXXXXX)" //VMName
| where operationName contains "Start.POST"// or operationName contains "Deallocate.POST"
| extend level = iif(resultType == 0, iif(httpStatusCode < 300, "Info", "Error" ), "Error")
| extend resultType = case(resultType == 0, "Success",
 resultType == 1, "Client Failure",
 resultType == 2, "Server Failure",
 "Unknown")
| extend StartTime = datetime_add('millisecond', -e2EDurationInMilliseconds, PreciseTimeStamp)
| project StartTime, PreciseTimeStamp, operationId, operationName, resourceName,resultType, correlationId, clientApplicationId,e2eMin = (e2EDurationInMilliseconds/1000/60), httpStatusCode, resultCode, exceptionType, errorDetails, labels, requestEntity, goalSeekingActivityId, level
| extend errorDetails = iif(strlen(errorDetails)<500, errorDetails, strcat(substring(errorDetails, 0, 492), " ... ..."))
| where e2eMin > 1
| order by StartTime asc;
```
![image.png](/.attachments/image-fa6b0b8c-e8fa-4614-8bbc-83b6b40b7e61.png)
Look for events where the E2EMin is high, eg more than 5 mins:
![image.png](/.attachments/image-e1306e28-f672-40f1-b045-32861bcc3b26.png)
Once you have the Operation ID for the desired timestamp, use it in the following query:
````
//2 use operation id
let local_operationId = "operation ID";
cluster("azcrp.kusto.windows.net").database("crp_allprod").ContextActivity
| where PreciseTimeStamp >=ago(17d)
| where activityId =~ local_operationId
| where traceLevel <= 8
| project PreciseTimeStamp, traceLevel, callerName, message
| extend level = case(
 traceLevel == 4, 'warn',
 traceLevel == 2, 'error',
 'info'
)
| order by PreciseTimeStamp asc
```
An example result showing Goal State Seek failure because the Guest Agent did not communicate the state back.
![image.png](/.attachments/image-8dee56c6-f947-4124-9cba-b503dad66932.png)
With the status 'Transitioning' repeating over and over until it receives the state or is timesout.
The above query is very detailed, so take your time to familiarize yourself with it.
At the same time, it's worth, in any scenario, to verify the Hyper-V Power Report, to see if the VM has been indeed powered On ALL THE TIME during the period it took to finalize the Goal State checks. For example, a case where the user had to wait 90 mins, a successful Hyper-V Power Event log will NOT show the state On,Off,On,Off during that time, but only the machine as On.
````
//VM Power States at HyperV Level
//1. AZCore VMPower
let starttime = datetime("2025-12-03T08:36:49.013Z");
let endtime = datetime("2025-12-05T08:36:49.013Z");
let vmId = "VMID"; //VM ID
cluster('azcore.centralus').database('Fa').VmHealthRawStateEtwTable
| where PreciseTimeStamp between (starttime..endtime)
| where VirtualMachineUniqueId == vmId
| project PreciseTimeStamp, VmPowerState,VmHyperVIcHeartbeat,Context
| extend StartTime = PreciseTimeStamp
| order by PreciseTimeStamp asc
| extend flag = case (VmPowerState <> prev(VmPowerState) or isempty(next(VmPowerState)), "changed", "")
| where flag <> ""
| extend StartTime = PreciseTimeStamp
| extend EndTime = case(isnotempty(next(StartTime)), next(StartTime), StartTime)
| extend Health = case(VmPowerState in ("EnabledStatePaused", "EnabledStateStopping","NotMonitored"), "Unhealthy", VmPowerState == "PowerStateEnabled", "Healthy", "Neutral")
| order by PreciseTimeStamp asc, Health asc
| extend Duration = toint((EndTime - StartTime) / 1m)
| project PreciseTimeStamp, VmPowerState,VmHyperVIcHeartbeat,Context,StartTime,flag,EndTime,Health,DurationInMins=Duration
| render columnchart with (xcolumn=StartTime, ycolumns=DurationInMins, series=VmPowerState, kind=stacked, xtitle="Time", ytitle="State")
```
An example here above, the VM took 90 mins to "Be available", from 09:10 until 10:40, but if we check the Hyper-V Power event above we can see that the VM Level Power State has been On consistently from 09:10 until late afternoon when the user most likely disconnected, for 641 mins:
![image.png](/.attachments/image-218eed4e-e764-4f6c-9ca6-b906f48d4ec1.png)
![image.png](/.attachments/image-b93a0e11-b40e-449b-bbfb-fd5b23f14c81.png)
Hyper-V Heartbeat is also ok:
````
//2.. AZCore HyperV Level Heartbeat
let starttime = datetime("2025-12-03T08:36:49.013Z");
let endtime = datetime("2025-12-05T08:36:49.013Z");
let vmId = "VMID"; //VMID
cluster('azcore.centralus').database('Fa').VmHealthRawStateEtwTable
| where PreciseTimeStamp between (starttime .. endtime)
| where VirtualMachineUniqueId == vmId
| project PreciseTimeStamp, Content = VmHyperVIcHeartbeat, VmPowerState,Context
| extend StartTime = PreciseTimeStamp
| order by PreciseTimeStamp asc
| extend flag = case (Content <> prev(Content) or isempty(next(Content)), "changed", "")
| where flag <> ""
| extend StartTime = PreciseTimeStamp
| extend EndTime = case(isnotempty(next(StartTime)), next(StartTime), StartTime)
| extend Health = case (Content in ("HeartBeatStateNoContact", "HeartBeatStateLostCommunication", "HeartBeatStateNonRecoverableError","NotMonitored"), "Unhealthy", Content == "HeartBeatStateOk", "Healthy", "Neutral")
| order by PreciseTimeStamp asc, Health asc
```
![image.png](/.attachments/image-bca12de5-b966-48fd-a2d5-e0dd325c8bbd.png)
Which means the problem here is indeed not from the Hyper-V Level, like VM not powering On, reboot loop, BSOD and rebooting/turning off, but the problem is with the VM Goal State not ready because of the VM Guest Agent.
