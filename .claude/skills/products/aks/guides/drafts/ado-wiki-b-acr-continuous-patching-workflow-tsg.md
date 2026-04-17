---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACR/TSG/Continuous Patching"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FContinuous%20Patching"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Continuous Patching Workflow Troubleshooting

## Overview

Continuous Patching is a feature in Azure Container Registry that enables scan and patch of specified artifacts for OS-level vulnerabilities within a registry.

When the customer enables Continuous Patching, three ACR tasks are created on their registry named `cssc-trigger-workflow`, `cssc-scan-image` and `cssc-patch-image`.

As the name implies, the trigger task runs on a specified set cadence and queues up scan and patch tasks on the configured list of images for vulnerabilities scan and patches using Trivy and Copacetic (Copa) respectively.

## Check if Continuous Patching Workflow is enabled on Cx Registry

[Run Query](https://dataexplorer.azure.com/clusters/acr/databases/acrprod?query=H4sIAAAAAAAAA5VSPW%2FbMBDd%2BysOmiRAjoNk6VBlqDs0RZHBdqaiMC7UVWIskQLvGEVFfnyPrqUkQJdOJO%2Fde%2Ffx%2BDnarv7qWfYBDX14gbGlQEDu6SC2J7gBbHx%2BfVkXsF7DZrfbgCAfGbj1sauhxSeCEB2gdIQs4J0hsA6kJehS4PoSapx4kd5jAywYhEcrLWTb6LbEsZNMU4bgH8nIUr9UrmA1YGA6PLJ3%2BRd9f9NLodn0LORq2MWH27oSHSJY1%2BQ8dFbyxLsI1FiNTlrAx2Doti6zdVb8uPpZlFtq7rCn%2F%2BJ9VN67BAVOHV6kpSS51xlWOOJ0ApfR0%2BMwZ6Yl5ZlhNiut3zQUVqMPx1%2BdH7Pyb5wNupXtsaE5MqCY9hwqFt3zKFBVkH0ykcX3FGDu8SZT6%2B4HLU7qimUQf3JnxsEl7uQjjOgkoaYlc1R1jn2Pwf4m2PioUAUmnXlRwne1Vp3bpz9SQY%2FP%2BWxZAQ%2FT3FGpbp%2BnrWBZ9Ls1FG9cfyNa%2FlNivv4BsF5N7rYCAAA%3D)

```sql
BuildHostTrace
| where env_time > ago(30d) // CSSC tasks should have run atleast once in the last 30 days
| where Tag startswith "RunResult"
| project env_time, data=parse_json(DataJson)
| extend SubId=tostring(split(data.registryResourceId,"/")[2]),RegName=tostring(split(data.registryResourceId,"/")[8]),data.registryId, data.taskName
| project-away data
| where data_taskName in ("cssc-trigger-workflow","cssc-scan-image","cssc-patch-image")
| where RegName == "<customer registry>" // Update this to the registry name you want to check
| summarize Count = count(), LastRunTime = max(env_time) by RegName, TaskName = tostring(data_taskName)
| project LastRunTime, RegName, TaskName = TaskName
```

Result should return 1-3 rows for each cssc task type and when was it last run in the last 30 days.

## Common Issues and Troubleshooting Steps

### Case 1: Customer reports failures during Patching in their registry

Use the query below to get customer **SubscriptionId** and failed patch task **RunIds** for the customer's registry

```sql
BuildHostTrace
| where env_time > ago(5d) //Update this to the time range you want to check
| where Tag startswith "RunResult"
| project env_time, data=parse_json(DataJson)
| extend subId=tostring(split(data.registryResourceId,"/")[2]),RegName=tostring(split(data.registryResourceId,"/")[8]), RunIds=data.id, data.registryLocation,data.taskName, data.status, data.runDuration
| project-away data
| where RegName == "<customer registry>" //Update this to the registry name you want to check
| where data_status == "Failed"
| where data_taskName == "cssc-patch-image"
```

### Case 2: Customer reports failures during Scanning in their registry

Use the query below to get customer **SubscriptionId** and failed scan task **RunIds** for the customer's registry

```sql
BuildHostTrace
| where env_time > ago(5d) //Update this to the time range you want to check
| where Tag startswith "RunResult"
| project env_time, data=parse_json(DataJson)
| extend subId=tostring(split(data.registryResourceId,"/")[2]),RegName=tostring(split(data.registryResourceId,"/")[8]), RunIds=data.id, data.registryLocation,data.taskName, data.status, data.runDuration
| project-away data
| where RegName == "<customer registry>" //Update this to the registry name you want to check
| where data_status == "Failed"
| where data_taskName == "cssc-scan-image"
```

## ACIS

- Use the ACIS action to get failed patch and/or scan task logs using the Subscription Id and RunIds from the previous step.
- Analyze the logs to see what went wrong during the scan/patch task run.
- Refer to [Common Issues TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-cloud-native-and-management-platform/containers-bburns/azure-container-registry/registry/topics/cssc/continuous-patching-workflow-common-issues) for common error patterns.

## Patch Failures

### 1. Patch task failure due to cache rule

- **Issue**: Patch task failed at "push-image" step due to cache rule error
- **Solution**: CSSC workflows are not supported on repositories containing just PTC (Pull-Through Cache) based rules. Customer can either switch to Artifact sync based cache rules or use the CSSC workflow on a different repository that does not contain PTC based rules.

### 2. Patch task failure due to image "not found" in MCR

- **Issue**: Patch task failed with image "not found" in MCR error
- **Solution**: This happens when the tooling image that copa uses for patching is not available in MCR. Contact upstream team (azcu-publishing@microsoft.com) or raise a PR to pull the missing image to MCR.

### 3. Patch task failure during "patch-image" step

For any other failures during patch-image step, the issue could be due to copa. Contact the Copa team.

## External resources

### Contact Copa team

Copacetic and Trivy are projects external to Microsoft, not covered by Microsoft's support policies (IcM tracking). Support is provided on a best-effort basis through GitHub issues.

- Confidential issues: copacetic@microsoft.com
- Key contacts: Sertac Ozercan (seozerca@microsoft.com), Robbie Cronin (robbiecronin@microsoft.com)
- [Copa Team TSG](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/722923/TSG-Copa)
- [Copa external FAQ](https://project-copacetic.github.io/copacetic/website/faq)
- [Copa troubleshoot guide](https://project-copacetic.github.io/copacetic/website/troubleshooting)
