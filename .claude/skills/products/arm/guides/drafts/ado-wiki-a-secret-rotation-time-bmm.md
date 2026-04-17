---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/How to define Secret Rotation Time?"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Nexus%2FCustomer%20Scenarios%2FHow%20to%20define%20Secret%20Rotation%20Time%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to Define Secret Rotation Time on BMM

> **Warning:** This Wiki might be outdated. Pending PG automation through Geneva action.

## Overview
During troubleshooting, you may need to verify whether secret rotation was conducted successfully on BMM.

As of version 2504.1, there are 6 types of secret on BMM:
- local-path-credential-manager
- console-credential-manager
- root-credential-manager
- idrac-credential-manager
- nc-admin-credential-manager
- nc-readonly-credential-manager

## Method 1: CSS Nexus Dashboard (Quickest)

Use [CSS Nexus Dashboard](https://dataexplorer.azure.com/dashboards/286db334-a699-4a63-8090-4a9b9d86958c) (SAM and PME required) and go to BMMs Page to find the last rotation time of different secrets.

## Method 2: Kusto Logs

Query KubernetesContainers on [NetworkCloud Cluster](https://dataexplorer.azure.com/clusters/ncprod-hub.eastus/databases/NetworkCloud) (PME and SAW required):

```kql
macro-expand isfuzzy=true NetworkCloudEG as X (
    X.KubernetesContainers
| where TIMESTAMP between (datetime(20xx-xx-xxT00:00:00Z) ..datetime(20xx-xx-xxT00:00:00Z))
| where BMServerName == "BMM Name"
| project TIMESTAMP, BMServerName, ContainerImage, ContainerName, GenevaPodName, Node, originalRecord, PodName
)
```

### Log Markers per Secret Type

**local-path-credential-manager:**
- Begin: `{"log":"INFO - Start device password change"}`
- Begin: `{"log":"INFO - Start encrypted-data-volume-management.sh for /dev/disk/by-label/local-path-prov"}`
- End: `{"log":"New password enrolled as key slot 2."}`
- End: `{"log":"INFO - Password changed for /dev/sda1"}`

**console-credential-manager:**
- Begin: `{"log":"user console already exists, attempting to rotate password"}`
- End: `{"log":"user 'console' password rotated successfully"}`

**root-credential-manager:**
- Begin: `{"log":"user root already exists, attempting to rotate password"}`
- End: `{"log":"user 'root' password rotated successfully"}`

**nc-admin / idrac / nc-readonly:** Cannot find any logs currently.
