---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Ignore PDB on Delete"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FIgnore%20PDB%20on%20Delete"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Ignore PDB on Delete

## Overview

When deleting an agentpool, customers can ignore PDB and force nodes to delete using `--ignore-pod-disruption-budget true` parameter.

## Troubleshooting

Logs in AsyncContextActivity table:

1. **Frontend handled**: Look for `"This delete operation will ignore PodDisruptionBudget"`
2. **VMSS checking**: Look for `"ForcePodDelete is true/false"`
3. **RP Async using feature**: Look for `"ForcePodDelete is true, skip waitForDelete"`
