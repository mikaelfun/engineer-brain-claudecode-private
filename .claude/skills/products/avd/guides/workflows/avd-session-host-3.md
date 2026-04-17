# AVD Session Host (Part 3) — 排查工作流

**来源草稿**: ado-wiki-b-determine-session-host-image-type.md
**Kusto 引用**: health-check.md, heartbeat.md, session-host.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: [[_TOC_]]
> 来源: ado-wiki-b-determine-session-host-image-type.md | 适用: \u901a\u7528 \u2705

### 排查步骤

#### Purpose
The main idea of this article is to help you identify if a Session Host was created from a custom or from a gallery image using **Azure Support Center (ASC)**

#### Steps to identify it
1. Open the case on ASC
2. Go to the Resource Explorer module and select Resource Provider
![image.png](/.attachments/image-95eb229f-9be5-44e2-9344-14bc872d3ac3.png)
3. If you have the name of the Virtual Machine that you want to check, type its name on the search bar and then click on **Virtual machine name + (Microsoft.Compute/VirtualMachines)**
![image.png](/.attachments/image-7fd715cc-5f94-4f3e-9904-0deedd387666.png)
4. In case you do not have the name of the Session Host, _click_ on **Microsoft.DesktopVirtualization**, Hostpools, _click_ on the Host Pool and find the name of the **Session Host** on the right chart. After that, proceed with the **Step 3**
![image.png](/.attachments/image-489d138e-2162-46f9-832e-edb81258a0cb.png)
5. Once you _click_ on the **Virtual Machine** name, it will open the Virtual Machine section. By default, the tab **V2 Properties** is selected, but in case it is not opened, please open that tab.
![image.png](/.attachments/image-fc32394f-8a45-4b59-bdbe-085b3fef9f37.png)
6. Scroll down until the **Storage Profile** module and look for the **Create Option** setting
![image.png](/.attachments/image-9ceee791-3883-411c-92b2-5178614b80f3.png)
7. Also, scroll down until the **OS Profile** module and look for the **OS Created From** setting
![image.png](/.attachments/image-99b6c016-b036-492b-b3a8-f2fa65786e4c.png)

#### Summary
   - If **OS Created From** is set as **Platform Image** that means this Virtual Machine was created using a _Gallery_ Image
   - If **OS Created From** is set as **Generalized Disk** that means the Virtual Machine was created using a _Custom_ Image

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| where Name == "SxSStackListenerCheck" 
    or Name == "DomainReachableHealthCheck" 
    or Name == "DomainTrustCheckHealthCheck" 
    or Name == "DomainJoinedCheck" 
    or Name == "FSLogixHealthCheck" 
    or Name == "MonitoringAgentCheck" 
    or Name == "SessionHostCanAccessUrlsCheck" 
    or Name == "RDAgentCanReachRDGatewayURL" 
    or Name == "RdInfraAgentConnectToRdBroker" 
    or Name == "WebRTCRedirectorHealthCheck"
| project TIMESTAMP, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where AADTenantId == "{AADTenantId}"
| where TIMESTAMP >= ago(1d)
| where Name endswith "Check"
| where ResType != "Success"
| project TIMESTAMP, HostPool, HostInstance, Name, ResType, ResSignature, ResDesc
| order by TIMESTAMP desc
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where PreciseTimeStamp > ago(1d)
| where Role == 'RDAgent'
| where Name endswith "Check"
| where AADTenantId != ""
| summarize arg_max(PreciseTimeStamp, ResType) by Env, Ring, HostPool, HostInstance, Name, AADTenantId
| order by Env, Ring, HostPool, HostInstance
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDOperation
| where TIMESTAMP >= ago(7d)
| where Name endswith "Check"
| where ResType != "Success"
| summarize FailureCount = count() by bin(TIMESTAMP, 1h), Name
| order by TIMESTAMP desc
```
`[来源: health-check.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDInfraTrace
| where HostInstance has "{SessionHostName}"
| where PreciseTimeStamp > ago(8h)
| where Category contains "Heartbeat" or Msg contains "Heartbeat"
| where Category != "Microsoft.RDInfra.Diagnostics.DataSink.RestPipelineSink"
| project PreciseTimeStamp, Level, Category, Role, HostInstance, Msg
| order by PreciseTimeStamp desc
| take 100
```
`[来源: heartbeat.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').RDAgentMetadata
| where HostInstance has "{SessionHostName}"
| where TIMESTAMP >= ago(1d)
| summarize arg_max(TIMESTAMP, *) by HostInstance
| project TIMESTAMP, SubscriptionId, HostPool, HostInstance, 
          Location, OsType, Sku, VmSize, AzureResourceId
```
`[来源: session-host.md]`

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').DiagActivity
| where SessionHostName has "{SessionHostName}"
| where env_time >= ago(1d)
| where Type == "Connection"
| summarize 
    TotalConnections = count(),
    SuccessCount = countif(Outcome == "Success"),
    FailureCount = countif(Outcome == "Failure")
| extend SuccessRate = round(100.0 * SuccessCount / TotalConnections, 2)
```
`[来源: session-host.md]`
