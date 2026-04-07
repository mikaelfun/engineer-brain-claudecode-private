---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] check APIServer proxy logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20check%20APIServer%20proxy%20logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

In the scenario of AKS nodes failing to connect to APIServer (eg. error message below), it might be useful to check for APIServer's proxy logs - available in CCP.

## Sample error messages

```
Get https://<cluster>.hcp.<region>.azmk8s.io:443/api/v1/nodes/<node>?resourceVersion=0&timeout=10s: net/http: request canceled (Client.Timeout exceeded while awaiting headers)
```

```
cannot connect once" err="rpc error: code = Unavailable desc = connection error: desc = \"transport: Error while dialing dial tcp <IP>:443: i/o timeout\""
```

```
Error preparing data for projected volume kube-api-access for pod kube-system/<pod>: failed to fetch token: Post "https://<cluster>.hcp.<region>.azmk8s.io:443/api/v1/namespaces/kube-system/serviceaccounts/kube-proxy/token": dial tcp <IP>:443: i/o timeout
```

## Diagnostic Kusto Query

Check proxy logs in CCP to determine if external traffic is reaching the envoy proxy:

```kusto
cluster('aksccplogs.centralus.kusto.windows.net').database('AKSccplogs')
ControlPlaneEventsAll
| where PreciseTimeStamp between(datetime(YYYY-MM-DD HH:mm)..datetime(YYYY-MM-DD HH:mm))
| where ccpNamespace == "{ccpNamespace}"
| where category == "proxy"
| where properties !contains "GET /ready"
| where properties contains '"apiserver'
| extend p = parse_json(properties)
| extend l = parse_json(tostring(p.log))
| extend ss=split(tostring(l.sourceIP), ":")
| project PreciseTimeStamp, l.chain, sourceIP=tostring(ss[0]), l.duration, properties
| where ipv4_is_private(sourceIP) == false
| summarize count() by bin(PreciseTimeStamp, 30m)
| render columnchart
```

If proxy logs show no external incoming traffic during the failure window, the issue is likely happening before reaching the APIServer (e.g., a load balancer issue).
