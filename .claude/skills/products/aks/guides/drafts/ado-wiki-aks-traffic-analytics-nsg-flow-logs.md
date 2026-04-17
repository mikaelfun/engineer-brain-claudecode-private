---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/AKS Traffic Analytics with NSG Flow Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/pages?path=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20Traffic%20Analytics%20with%20NSG%20Flow%20Logs"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS Traffic Analytics with NSG Flow Logs

## Objective

Network traffic analysis in context of Azure Kubernetes Services managed cluster could be a complex task as it could involve installation of third-party products on the cluster's Node, manually capturing network traffic with or without the necessary filters and exporting the results to an external destination in order to be analyzed. NSG FlowLogs combined with Traffic Analytics will simplify the process and would provide a significant support in troubleshooting network connectivity.

## Setup Steps

1. **Enable NSG Flow Logs**: Open the Network Security Group Resource -> Monitoring -> NSG flow logs panel
2. Click Create, select the NSG to monitor and provide a Storage Account for records
3. Set retention day value
4. Choose **Version 2** of Flow Logs and enable **Traffic Analytics**
5. Provide a **Log Analytics Workspace** for flow logging data

## Viewing Traffic Analytics

Once NSG Flow Logs is linked to Log Analytics Workspace, go to **Network Watcher -> Logs -> Traffic Analytics** in Azure Portal.

Select resources including the Resource Group where NSG is located and the Time Interval.

The dashboard provides:
- Number of flows
- Deployed Region and VNet
- Total number of NSG monitored
- Subnets
- Traffic distribution (Total, Malicious, Blocked, Frequent conversation flows)

## Raw Capture Data

Raw traffic capture is available as JSON from the configured Storage Account in a hierarchical structure:
`Subscription -> Resource Group -> Microsoft Network -> NSG -> NodePool name -> year/month/day/hour`

Flow log JSON format example:
```json
{
  "records": [
    {
      "time": "2023-01-06T08:00:32.7787936Z",
      "macAddress": "6045BDF32344",
      "category": "NetworkSecurityGroupFlowEvent",
      "resourceId": "/SUBSCRIPTIONS/.../NETWORKSECURITYGROUPS/AKS-AGENTPOOL-...-NSG",
      "properties": {
        "Version": 2,
        "flows": [
          {
            "rule": "DefaultRule_AllowInternetOutBound",
            "flows": [
              {
                "mac": "6045BDF32344",
                "flowTuples": [
                  "timestamp,srcIP,dstIP,srcPort,dstPort,protocol,direction,action,state,..."
                ]
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## Log Analytics Tables

Traffic Analytics logs are sent to Log Analytics Workspace through custom logging tables:
- **AzureNetworkAnalytics_CL** — main traffic analytics data
- **AzureNetworkAnalyticsIPDetails_CL** — IP detail information
