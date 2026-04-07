# CN1/CE1 Region Migration - ARM Resource Move Compatibility Matrix

> Source: CN1/CE1 Migration Guide (Mooncake CSS internal)
> CSS lab-tested resource move results for RG-to-RG migration during CN1/CE1 region retirement

## Key Concepts

- **Resource Group location cannot be changed** after creation. PG is developing backend solution; interim use PowerShell scripts (project-scrub-jay, contact frances.hu@microsoft.com).
- **VNET-integrated/injected resources** generally do NOT support Resource Mover.
- Always verify in customer's environment before executing moves.

## Resource Move Support Matrix

| Resource Type | Move Supported | Business Interruption | CSS Notes |
|---|---|---|---|
| microsoft.cache/redis | Yes (no VNet) | No | Only feasible without private endpoint |
| microsoft.network/bastionhosts | Yes | **Yes** | All existing connections terminated |
| microsoft.network/publicipprefixes | Yes | No | Associated public IP must move separately |
| microsoft.dbformysql/flexibleservers | Yes | No | Not supported with HA enabled; disable HA first. VNet injection + move fails for VNet itself |
| microsoft.network/privateendpoints | Partial | No | Depends on target resource type |
| microsoft.apimanagement/service | Yes | No | Only without private endpoint |
| microsoft.automation/automationaccounts/runbooks | Yes | **Yes** | Pause triggers/stop jobs before move |
| microsoft.network/applicationgatewaywebapplicationfirewallpolicies | No | - | - |
| microsoft.network/natgateways | No | **Yes** | Recreate new NATGW, can reuse old public IP |
| microsoft.sql/servers | Yes | No | Public access tested |
| microsoft.web/certificates | No | - | - |
| microsoft.eventgrid/systemtopics | Yes | No | - |
| microsoft.network/networkinterfaces | Yes | No | Can move NIC without VM/PE |
| microsoft.containerservice/managedclusters | No | - | - |
| microsoft.compute/sshpublickeys | No | - | - |
| microsoft.compute/virtualmachines | Yes | No | Must move attached disks, NIC, NSG, public IP together |
| microsoft.compute/availabilitysets | Yes | No | If associated with VM, must move together |
| microsoft.app/managedenvironments | No | - | - |
| microsoft.compute/disks | Yes | No | Can move even when attached to VM |
| microsoft.containerregistry/registries | Yes | No | - |
| microsoft.datafactory/factories | Yes | **Yes** | Functions inaccessible during move, pipeline works |
| microsoft.servicebus/namespaces | Yes | No | - |
| microsoft.storage/storageaccounts | Yes | No | - |
| microsoft.dbforpostgresql/flexibleservers | Yes (partial) | No | Not supported: VNet move of injected server, or server with read replica |
| microsoft.documentdb/databaseaccounts | Yes | No | - |
| microsoft.eventhub/namespaces | Yes | No | - |
| microsoft.keyvault/vaults | Yes | No | - |
| microsoft.kusto/clusters | Yes (partial) | No (some delay) | Fails with private endpoint. Without PE, queries/inserts have minor delay |
| microsoft.web/serverfarms | Yes | No | Base service for App Service / Function / Logic |
| microsoft.insights/autoscalesettings | Yes | No | - |
| microsoft.synapse/workspaces | No | - | - |
| microsoft.network/publicipaddresses | Yes | No | Works even if associated to LB or NIC |
| microsoft.operationsmanagement/solutions | Partial | **Yes** | Delete solutions that rely on linked services (e.g., MDC) before moving LAW |
| microsoft.insights/scheduledqueryrules | Yes | No | - |
| microsoft.network/networkwatchers | Yes | No | - |
| microsoft.network/virtualnetworks | Yes | No | Remove peering first; not supported with PaaS resources deployed into VNet |
| microsoft.streamanalytics/streamingjobs | Yes | **Yes** | Stop job first, then move |
| microsoft.managedidentity/userassignedidentities | No | - | - |
| microsoft.web/sites | Yes | **Yes** | App Service/Function App restart if App Insight configured |
| microsoft.app/containerapps | No | - | - |
| microsoft.appplatform/spring | Yes | No | - |
| microsoft.network/applicationgateways | No | **Yes** | Export ARM template and redeploy |
| microsoft.insights/datacollectionendpoints | Yes | No | RG/sub migration only, not region migration |
| microsoft.operationalinsights/workspaces | Yes | **Yes** | Changes Resource ID! Breaks Diagnostic Settings, AKS Insights, DCR |
| microsoft.network/loadbalancers | Yes | No | - |
| microsoft.automation/automationaccounts | Yes | **Yes** | Disable features before migration, re-enable after |
| microsoft.network/networksecuritygroups | Yes | No | - |
| microsoft.insights/components | Yes | No | - |
| microsoft.synapse/privatelinkhubs | No | - | - |

## Known Issues

### Issue 1: NIC move fails with MoveCannotProceedWithResourcesNotInSucceededState

When moving network resources, ARM validates ALL resources in the same VNet. If any resource has concurrent CRUD operations (e.g., Databricks VM deletion), the move is blocked with HTTP 409.

**Kusto investigation pattern:**

```kql
// Step 1: Find validation operation from correlationId
let corrId = '<correlationId-from-error>';
FrontendOperationEtwEvent
| where PreciseTimeStamp between (datetime(<start>) .. datetime(<end>))
| where Message has corrId
| where Message has 'validateMoveResources' or OperationName has 'ValidateMove'
| project PreciseTimeStamp, OperationId, OperationName, Message

// Step 2: Find blocker details
let validateOpId = '<operationId-from-step1>';
FrontendOperationEtwEvent
| where OperationId == validateOpId
| where Message has 'Another operation' and Message has 'is ongoing on the Resource'
| project PreciseTimeStamp, Message

// Step 3: Investigate blocker operation
let blockerOps = dynamic(['<blocker-op-id1>', '<blocker-op-id2>']);
FrontendOperationEtwEvent
| where OperationId in (blockerOps)
| project PreciseTimeStamp, OperationId, OperationName, Message
| order by PreciseTimeStamp asc
```

### Issue 2: LAW move breaks dependent services

Moving Log Analytics Workspace changes its Resource ID, causing linked services to fail with "resource not found":
- Diagnostic Settings
- AKS Container Insights  
- Data Collection Rules

**Mitigation**: Stop/disable dependent services before move, reconfigure after.
