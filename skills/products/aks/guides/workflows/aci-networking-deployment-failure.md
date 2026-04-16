# AKS ACI 网络与 DNS — deployment-failure — 排查工作流

**来源草稿**: ado-wiki-aci-msi-token-request-failure.md, ado-wiki-b-Application-Failure-Tooling-Guide.md, ado-wiki-b-check-aci-quota-for-subscription.md, ado-wiki-b-collaborate-with-automation-account-team.md
**Kusto 引用**: 无
**场景数**: 4
**生成日期**: 2026-04-07

---

## Scenario 1: TSG MSITokenRequestFailure
> 来源: ado-wiki-aci-msi-token-request-failure.md | 适用: 适用范围未明确

### 排查步骤

#### TSG MSITokenRequestFailure

#### Check the Token Request Failure in Kusto

```kql
AccessTokenRequestEvent
| where TIMESTAMP >= datetime("2023-01-18T01:01:33.7790000Z") - 5m //update the time
| where TIMESTAMP <= datetime("2023-01-18T02:01:33.7790000Z") + 5m
| where Tenant contains "WARP-Prod-MWH" //update the region
| where successful == "False"
```

Check the incident message for detail on the failure.

#### For BadRequest error

Make sure the subscription has access to identity.

#### Check if a limitation exists

```kql
let start = datetime(2022-09-28 10:00:00);
let end = 2d;
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where PreciseTimeStamp between (start..end)
| where subscriptionId == "{sub_ID}"
| where httpMethod == "PUT"
| join kind=inner (Traces
    | where PreciseTimeStamp between (start..end)
    | where * contains "Limitation") on correlationId
| order by PreciseTimeStamp asc
| project PreciseTimeStamp, operationName1, message
```

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-b-Application-Failure-Tooling-Guide.md | 适用: 适用范围未明确

### 排查步骤

##### When ASI Data is Stale or Missing

- ASI data may have a slight delay (minutes) as all data is streamed via Kusto which is not real-time
- For real-time data, use Geneva Actions via ASC
- If cluster is off/unreachable, ASI may not show current state

##### When Geneva Actions Fail

- Verify cluster connectivity (API server accessible)
- Check if cluster is in failed state
- Try simpler commands first (`get pods`) to verify access
- Geneva Actions are read-only; they cannot modify cluster state
- See [How-to-pull-logs-via-Serial-Access-Console-when-Jarvis-is-failing](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/Tools/Jarvis/How-to-pull-logs-via-Serial-Access-Console-when-Jarvis-is-failing)

##### When AppLens Detectors Don't Show Data

- Check the time range - detectors may not have recent data
- Some detectors require specific conditions to trigger
- Use Kusto queries for more granular investigation

##### When Logs Are Empty or Truncated

- Container may have crashed before writing logs
- **Geneva Actions can only access kube-system pod logs** - for customer app logs, use Log Analytics
- Check if Log Analytics is enabled (top of ASC resource page)
- If Log Analytics not enabled, request customer to run `kubectl logs` and share output
- Look at events instead of logs for immediate crash scenarios

##### When Kusto Returns No Results

- Verify SubscriptionId and ClusterName filters are correct
- Expand the time range (`ago(7d)` instead of `ago(24h)`)
- Check if telemetry is enabled for the cluster
- Try broader queries first, then narrow down

---

---

## Scenario 3: Checking ACI Quotas on a Subscription
> 来源: ado-wiki-b-check-aci-quota-for-subscription.md | 适用: 适用范围未明确

### 排查步骤

#### Checking ACI Quotas on a Subscription


#### Overview

This guide demonstrates how to check ACI quota utilization and limits for a customer subscription as well as options for increasing
the available quota.

#### Checking quota utilization

##### Kusto

This Kusto query ran against the database ACCPRod will show you the quota for ACI per Region, just fill in the SubscriptionId

```sql
cluster("Accprod").database("accprod").SubscriptionPolicy
| where subscriptionId == "{Sub_ID}"
| extend containerquota = parse_json(quotas)[0]
| extend coresquota = parse_json(quotas)[1]
| extend requestquota = parse_json(requestLimits)[0]
| evaluate bag_unpack(containerquota, 'containerQuota_')
| evaluate bag_unpack(coresquota, 'coresQuota_')
| evaluate bag_unpack(requestquota, 'requestQuota_')
| summarize arg_max(TIMESTAMP,*) by location, subscriptionId
| project subscriptionId, location, containerQuota_type, containerQuota_value, coresQuota_type, coresQuota_value, requestQuota_pT5M, requestQuota_pT1H
```

```sql
//check quotas
cluster("Accprod").database("accprod").SubscriptionPolicy
| summarize max(PreciseTimeStamp) by subscriptionId, location, quotas, requestLimits
| where subscriptionId == "ab5ebc06-6ad0-4205-8090-6e27039f329f"
| project max_PreciseTimeStamp, subscriptionId, location, parse_json(quotas), parse_json(requestLimits)
```

```sql
// Check quota for GPU SKUs (K80, V100, P100)
cluster("Accprod").database("accprod").SubscriptionPolicy
| where subscriptionId == "{Sub_ID}"
| extend containerquota == parse_json(quotas)[0]
| extend corequota == parse_json(quotas)[1]
| extend v100quota == parse_json(quotas)[2]
| extend k80quota == parse_json(quotas)[3]
| extend p100quota == parse_json(quotas)[4]
| extend requestquota == parse_json(requestLimits)[0]
| summarize arg_max(TIMESTAMP,*) by location, subscriptionId
| project subscriptionId, location, containerquota, coresquota, v100quota, k80quota, p100quota, requestquota
```

#### Notes

The queries above will show current utilization on the target subscription.

- `pt5M` is the upper limit for the sum of create/delete operations in a 5 minute window.
- `pt1H` is the upper limit for the sum of create/delete operations in a 1 hour window.
- `coresQuota` value is equal to the number of cores currently in use.
- `containerQuota_value` is equal to the number of container groups they have deployed.

`pt5M` and `pt1H` information is not displayed in the [List Usage API output](https://docs.microsoft.com/en-us/rest/api/container-instances/location/list-usage)
so share with the customer as-needed.

#### Check the regional availability

```sql
cluster("Accprod").database("accprod").ResourceAvailability
| where PreciseTimeStamp >ago(1d)
| where cpu < 64
| extend memoryInGB = iif(memoryInGB == 3.5 or memoryInGB == 7, real(8), iif(memoryInGB == 14, real(16), memoryInGB))
| extend  perc = (availableNodes*100/totalNodes)
| extend ['Available Nodes %']=iif(perc >0, perc,0),['Availabel Nodes Count'] = availableNodes
| extend  usedNodes = totalNodes-availableNodes
| extend util =toint( (usedNodes*100/totalNodes))
| summarize arg_max(PreciseTimeStamp,*) by location,osType,osVersion,cpu,memoryInGB,networkPolicy
| order by util desc
| summarize arg_max(cpu,*) by location,osType,osVersion,networkPolicy,memoryInGB
| summarize arg_max(memoryInGB,*) by location,osType,osVersion,networkPolicy
| order by util
| project location,osType,osVersion,cpu,memoryInGB,networkPolicy,['Clusters'] = totalClusters ,['Utilization'] =strcat(util,'%')
```

#### Increasing Quotas for ACI

To increase the available quota for ACI, you'll need to open an ICM, use this [template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=23QA1u), with the following details:

Note that this quota increase request is done by a Geneva action through the IcM, be accurate in what your request details are in the template because that is what will be automatically done by the Geneva action. There is no person behind the request.

```txt
- Cloud instance: Public or goverment (if goverment, which one).
- Quota Type: StandardCores, StandardSpotCores or StandardV100Cores.
- Subscription ID.
- Region.
- ContainerGroup Network Type: All, OutboundOnly, PublicIP, VNET.
- Container Orchestration Type: Azure Container Instances or Virtual node in AKS.
- ContainerType: All, Confidential or Regular.
- Azure Availability Zone: All, NA, Zone1, Zone2 or Zone3.
- Total Container Group Count.
- Total Core Count.
- vCPU per Container Group.
- GB per Container Group.
- Container Deployment Environment: Production or Testing.
```

#### Public Docs

- ACI Quotas: <https://docs.microsoft.com/en-us/azure/container-instances/container-instances-quotas>

---

## Scenario 4: Collaborating with the Azure Automation Account Team
> 来源: ado-wiki-b-collaborate-with-automation-account-team.md | 适用: 适用范围未明确

### 排查步骤

#### Collaborating with the Azure Automation Account Team


#### Background

Azure Automation Runbooks utilize Azure Container Instances (ACI) as a backend to execute PowerShell scripts. The customer is not aware of the underlying infrastructure used by the product team. Engineers from the Automation Account team frequently assign collaboration tasks to the ACI support team via SAP (Azure\Container Instances\Configuration and Setup\Unable to deploy Windows ACI).

#### Collaboration Guidelines

_For AKS Collaboration Owners:_

Please refrain from contacting the customer directly. Always communicate with the case owner.

[Kusto Repo ACI](/Azure-Kubernetes-Service-Wiki/ACT-Team/Tools/Kusto-Repo/Kusto-Repo-ACI)

_For Case Owners:_

Task note should including ACI resource ID issue description

**Known Issues:**

- [Known issues in ACI](https://supportability.visualstudio.com/AAAP_Code/_queries/query/?tempQueryId=0d3c4e4b-9e70-403a-8730-d8e5af5136cb)
- [known issues and limitations in docs](https://learn.microsoft.com/azure/automation/automation-runbook-types?tabs=lps72%2Cpy10#limitations-and-known-issues)
- [KI: Azure PowerShell cmdlet returns HttpRequestException](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1696336/KI-Azure-PowerShell-cmdlet-returns-HttpRequestException)
- [HT: Identify memory issues while jobs are running in ACI](https://supportability.visualstudio.com/AAAP_Code/_wiki/wikis/AAAP/1696219/HT-Identify-memory-issues-while-jobs-are-running-in-ACI)

[Reference TSG: Debug container-based automation cloud job](https://supportability.visualstudio.com/AzureAutomation/_wiki/wikis/Azure-Automation.wiki/745742/TSG-Debug-container-based-automation-cloud-job?anchor=known-issues)

---
