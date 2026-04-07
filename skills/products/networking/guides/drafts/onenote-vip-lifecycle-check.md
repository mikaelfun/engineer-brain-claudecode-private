# VIP Lifecycle & Related Resource Check

> Source: MCVKB 3.13 | Author: Wenyi Li | Updated: 2023-07

## 1. Check VIP Lifecycle (Kusto)

**Cluster**: `https://aznwchinamc.chinanorth2.kusto.chinacloudapi.cn`
**Database**: `aznwmds`

```kql
ResourceLifeCycleEvent
| where Resource == "<PUBLIC_IP_ADDRESS>"
| where TIMESTAMP > ago(30d)
```

## 2. Check DeploymentID & Cluster of VIP (Jarvis)

- ServiceId = Deployment ID
- FabricId = Cluster
- Use Jarvis NRP dashboards to look up these values

## 3. Check Resources by ServiceId (Kusto)

```kql
//cluster('aznwchinamc').
database('aznwmds').ResourceLifeCycleEvent
| where SubscriptionId == "<SUBSCRIPTION_ID>"
| where PreciseTimeStamp > ago(1h)
| where ServiceId contains "<DEPLOYMENT_ID>"
```

## 4. Check Service Instance ID by ServiceId (Jarvis)

Use Jarvis link with appropriate genevatraceguid parameters.

## 5. Check Resources by Service Instance ID (Jarvis)

Use Jarvis link with appropriate genevatraceguid parameters.
