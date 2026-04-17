---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Automatic Cert Rotation"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FAutomatic%20Cert%20Rotation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Confirming if Certificate Auto-Rotation Occurred

## Summary

AKS platform automatically rotates cluster certificates (not customer TLS certificates) to reduce operational overhead. This can surprise customers.

## Investigation Flow

### Step 1: Identify if a cert rotation occurred

Query AsyncQoSEvents. The `operationName` is `RotateClusterCertificatesHandler.POST` and `correlationID` is `00000000-0000-0000-0000-000000000000` (indicates system-initiated).

```kusto
cluster('Aks').database('AKSprod').AsyncQoSEvents
| where subscriptionID has '{subID}'
| where PreciseTimeStamp >= ago(10d)
| where resourceName == '{resource_Name}'
| project PreciseTimeStamp, resourceName, agentPoolName, subscriptionID, correlationID, operationID, operationName, suboperationName, result, errorDetails, propertiesBag, resourceGroupName
```

Add `UserAgent` column to identify which component triggered it. Example:
`UserAgent = Go/go1.18 (amd64-linux) go-autorest/v14.2.1 AKS-regionallooper`

### Step 2: Track down the reason in Regional Looper logs

```kusto
cluster("Aks").database("AKSprod").RegionalLooperEvents
| where TIMESTAMP > ago(3d)
| where msg contains "{SubID}" or "{CCP_ID}"
```

See also: [PG Rotate certs TSG](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/aks-troubleshooting-guide/240790/Rotate-certs-TSG)

### Step 3: Fallback - Using Kusto Search++

If nothing found in RegionalLooper:
1. Go to Kusto Home menu > "Search++"
2. Select AKS cluster and AKSProd database
3. Select all tables
4. Search with SubID and/or OperationID, or keywords "certificate", "rotate"
5. Click result squares in the timeline to drill into specific tables

Example follow-up query:
```kusto
cluster('Aks').database('AKSprod').AKSAlertmanager
| where PreciseTimeStamp between (datetime({startDate})..datetime({endDate}))
| where (* has @'{subID}' and * has @'certificate')
| limit 10000
```

Common finding: `EtcdCertificatesExpireSoon` alert - ETCD client certificate was going to expire soon, triggering auto-rotation.
