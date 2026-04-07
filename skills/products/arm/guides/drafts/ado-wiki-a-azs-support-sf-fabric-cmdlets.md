---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Stack Hub/Azs.Support Module/modules/AzureStack.Hub.Fabric.ps1"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Stack%20Hub%2FAzs.Support%20Module%2Fmodules%2FAzureStack.Hub.Fabric.ps1"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Azs.Support Module - Service Fabric Cmdlets (AzureStack.Hub.Fabric.ps1)

Reference for Azure Stack Hub Service Fabric diagnostic and remediation cmdlets in the Azs.Support module.

## Diagnostic Cmdlets

### Get-AzsSupportServiceFabricDetail

Retrieve all Service Fabric applications, Services, Partitions and Replicas and return them in PSObject.

**Parameters:**
- `-Ring` — A value from `[Enum]::GetValues([SFInfrastructureRole])`, e.g. ACS, FabricRingServices
- `-Unhealthy` — Show only unhealthy Applications, Services, Partitions, Replicas and Instances

**Examples:**
```powershell
Get-AzsSupportServiceFabricDetail -Ring FabricRingServices
Get-AzsSupportServiceFabricDetail -Ring FabricRingServices -Unhealthy
```

### Get-AzsSupportServiceFabricNode

Gets the Service Fabric cluster nodes for a given ring.

**Parameters:**
- `-Ring` — A value from `[Enum]::GetValues([SFInfrastructureRole])`

**Examples:**
```powershell
Get-AzsSupportServiceFabricNode -Ring ACS
Get-AzsSupportServiceFabricNode -Ring FabricRingServices
```

### Get-AzsSupportServiceFabricReplica

Gets the replicas for a specified service fabric service.

**Parameters:**
- `-Ring` — SF infrastructure role
- `-ApplicationName` — e.g. `fabric:/AzureStackCpiApplication`
- `-ServiceName` — e.g. `fabric:/AzureStackCpiApplication/VmOrchestrator`
- `-ServiceTypeName` — e.g. `VSwitchService`
- `-Primary` — Filter to show only the primary replicas

**Examples:**
```powershell
Get-AzsSupportServiceFabricReplica -Ring FabricRingServices -ServiceName 'fabric:/AzureStackCpiApplication/VmOrchestrator'
Get-AzsSupportServiceFabricReplica -Ring FabricRingServices -ServiceName 'fabric:/AzureStackCpiApplication/VmOrchestrator' -Primary
Get-AzsSupportServiceFabricReplica -Ring NC -ServiceTypeName 'VSwitchService'
```

### Get-AzsSupportServiceFabricRuntimeVersion

Gets the Service Fabric runtime version across all fabric cluster nodes in a specified ring. If no ring is specified, checks all Service Fabric rings.

**Parameters:**
- `-Ring` — Optional. A value from `[Enum]::GetValues([SFInfrastructureRole])`

**Examples:**
```powershell
Get-AzsSupportServiceFabricRuntimeVersion
Get-AzsSupportServiceFabricRuntimeVersion -Ring:FabricRingServices
```

### Get-AzsSupportServiceFabricService

Gets service fabric services on the specified ring.

**Parameters:**
- `-Ring` — SF infrastructure role
- `-Stateless` — Filter to include only Stateless services
- `-Stateful` — Filter to include only Stateful services
- `-ApplicationName` — e.g. `fabric:/TableServerApp`
- `-ServiceName` — e.g. `fabric:/TableServerApp/TableServerService_0`
- `-ServiceTypeName` — e.g. `VSwitchService`

**Examples:**
```powershell
Get-AzsSupportServiceFabricService -Ring ACS
Get-AzsSupportServiceFabricService -Ring ACS -Stateful
Get-AzsSupportServiceFabricService -Ring ACS -Stateless
Get-AzsSupportServiceFabricService -Ring ACS -ServiceName 'fabric:/TableServerApp/TableServerService_0'
Get-AzsSupportServiceFabricService -Ring NC -ServiceTypeName 'VSwitchService'
```

### Get-AzsSupportServiceFabricServiceManifestNames

Gets Service Fabric service manifest names of a given service fabric application.

**Parameters:**
- `-Ring` — SF infrastructure role
- `-ApplicationName` — Service fabric application being hotpatched

**Examples:**
```powershell
Get-AzsSupportServiceFabricServiceManifestNames -Ring FabricRingServices -ApplicationName fabric:/FCIR
```

## Action / Remediation Cmdlets

### Invoke-AzsSupportServiceFabricCommand

Connects to the provided service fabric ring and invokes a given script block against the service fabric cluster.

**Parameters:**
- `-Ring` — SF infrastructure role
- `-ScriptBlock` — A script block containing the SF commands to invoke

**Examples:**
```powershell
Invoke-AzsSupportServiceFabricCommand -Ring ACS -ScriptBlock { Get-ServiceFabricClusterHealth }
```

### Move-AzsSupportServiceFabricPrimaryReplica

Moves the primary replica of the provided service to an available node.

**Parameters:**
- `-Ring` — SF infrastructure role
- `-ApplicationName` — e.g. `fabric:/AzureStackCpiApplication`
- `-ServiceName` — e.g. `fabric:/AzureStackCpiApplication/VmOrchestrator`
- `-ServiceTypeName` — e.g. `VSwitchService`

**Examples:**
```powershell
Move-AzsSupportServiceFabricPrimaryReplica -Ring FabricRingServices -ServiceName 'fabric:/AzureStackCpiApplication/VmOrchestrator'
Move-AzsSupportServiceFabricPrimaryReplica -Ring NC -ServiceTypeName 'VSwitchService'
```

### Remove-AzsSupportActorsApplication

Remove the Actors application from Service Fabric.

**Examples:**
```powershell
Remove-AzsSupportActorsApplication
```

### Restart-AzsSupportServiceFabricPrimaryReplica

Restarts the primary replica of the provided service. Only supports services that contain 1 primary replica.

**Parameters:**
- `-Ring` — SF infrastructure role
- `-ServiceName` — e.g. `fabric:/AzureStackCpiApplication/VmOrchestrator`
- `-ServiceTypeName` — e.g. `VSwitchService`

**Examples:**
```powershell
Restart-AzsSupportServiceFabricPrimaryReplica -Ring FabricRingServices -ServiceName 'fabric:/AzureStackCpiApplication/VmOrchestrator'
Restart-AzsSupportServiceFabricPrimaryReplica -Ring NC -ServiceTypeName 'VSwitchService'
```
