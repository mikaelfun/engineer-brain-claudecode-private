---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Azure Elastic SAN/How Tos/How to check Elastic SAN configuration_Storage"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/pages/SME%20Topics/Azure%20Elastic%20SAN/How%20Tos/How%20to%20check%20Elastic%20SAN%20configuration_Storage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Check Elastic SAN Configuration

## Azure Support Center (ASC)

### Elastic SAN Properties and Scalability Limits
1. Go to [ASC](https://azuresupportcenter.azure.com/) > Resource Explorer
2. Locate the Elastic SAN resource
3. From Summary tab, check **Properties** and **Scalability Limits**

### Volume Groups
1. ASC > Resource Explorer > Elastic SAN resource
2. Select **Volume Group** tab
3. Review volume group(s) and their properties

### Volumes
1. Open Volume Groups section
2. Use **Volume Name** search to locate the volume
3. View volume properties

## Jarvis DGrep

Open [Jarvis DGrep](https://portal.microsoftgeneva.com/s/B9202605) with these parameters:

```
Endpoint: Diagnostics PROD
Namespace: ElasticSan
Events: ElasticSanStatisticsEvent, VolumeGroupStatisticsEvent, VolumeStatisticsEvent
Time range: <Time range>
Filtering: SubscriptionId == <SubscriptionId>
```

### Sample Queries
- Elastic SAN Properties: https://portal.microsoftgeneva.com/s/9458E4CD
- Volume Groups: https://portal.microsoftgeneva.com/s/BE846E93
- Volumes: https://portal.microsoftgeneva.com/s/EDAC3CCA
- All Resources: https://portal.microsoftgeneva.com/s/B9202605

### Key Properties

**Elastic SAN**: BaseSizeTB, ExtendedSizeTB, ProvisionedIops, ProvisionedMBps, MasterStorageAccountName, TotalSizeTB, VolumeGroupCount, AvailabilityZones

**Volume Group**: EncryptionType, ProtocolType, PrivateEndpointConnections

**Volume**: VolumeSize, StorageAccount, TargetIqn, StorageTargetState, TargetPortalHostname, TargetPortalPort

## Jarvis Actions

1. Access [Jarvis Actions](https://jarvis-east.dc.ad.msft.net/actions)
2. Filter by **ElasticSAN**
3. Select operation (Get ElasticSan, Get VolumeGroup, etc.)
4. Enter Endpoint (**Production**), subscription, and region
5. Click **Run**

> **Important**: Must use SAW machine to access Jarvis Actions.
