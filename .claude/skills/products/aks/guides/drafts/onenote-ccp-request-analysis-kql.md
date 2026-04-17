# AKS CCP Request Analysis KQL

> Source: OneNote — ##统计ccp请求数据
> Status: guide-draft (pending SYNTHESIZE review)

## Purpose

Analyze AKS control plane (CCP) API server request patterns — count requests by user agent over time windows.

## KQL Query

```kql
let starttime = datetime(2022-12-15 7:55:00);
let endtime = datetime(2022-12-15 8:05:00);
union cluster('akscn.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEvents,
      cluster('akscn.kusto.chinacloudapi.cn').database('AKSccplogs').ControlPlaneEventsNonShoebox
| where PreciseTimeStamp >= starttime and PreciseTimeStamp < endtime
| where ccpNamespace == '<cluster-ccpNamespace>'
| where category == 'kube-audit'
| extend p = parse_json(properties)
| extend event = parse_json(tostring(p.log))
| where event.stage == "ResponseComplete"
| where event.verb != "watch"
| where event.objectRef.subresource !in ("proxy", "exec")
| extend verb = tostring(event.verb)
| extend agent = tostring(event.userAgent)
| extend code = tostring(event.responseStatus.code)
| extend subresource = tostring(event.objectRef.subresource)
| extend pod = tostring(p.pod)
| extend lat = datetime_diff('Millisecond', todatetime(event.stageTimestamp), todatetime(event.requestReceivedTimestamp))
| summarize count() by agent, bin(PreciseTimeStamp, 5m)
//| render linechart
```

## Usage Notes

- Replace `ccpNamespace` with the target cluster's CCP namespace ID
- Adjust `starttime` / `endtime` for the investigation window
- Uncomment `| render linechart` for visual output
- Filter by specific `agent` to isolate controller/client traffic
- Add `| where agent == "Go-http-client/2.0"` to filter specific agents

## Applicable Environment

- Mooncake (21Vianet): `akscn.kusto.chinacloudapi.cn` / `AKSccplogs`
- Global: adjust cluster URI accordingly
