# PowerShell / Graph API to Query Intune Policy Assignments

## Overview
Use Microsoft.Graph PowerShell module to query which Intune policies (compliance/configuration) are assigned to specific groups. No single command exists; you must retrieve policies via Graph API and filter by assignment.

## Prerequisites
- Microsoft.Graph PowerShell module (recommended over legacy MSGraph module)
- App registration with appropriate permissions

## Sample Code

```powershell
# Install modules
Install-Module Microsoft.Graph -AllowClobber
Update-Module Microsoft.Graph
Install-Module Microsoft.Graph.Beta -AllowClobber

# Connect to Mooncake (21Vianet) environment
Connect-MgGraph -Scopes "DeviceManagementManagedDevices.Read.All", "DeviceManagementManagedDevices.ReadWrite.All" `
  -Environment China `
  -ClientId <Your application Client ID> `
  -TenantId <Your Tenant ID>

# Query compliance policy assignments
Get-MgDeviceManagementDeviceCompliancePolicyAssignment -DeviceCompliancePolicyId '<Policy ID>'

# Query configuration policy assignments
Get-MgDeviceManagementDeviceConfigurationAssignment -DeviceConfigurationId '<Policy ID>'
```

## Key Points
- Use `-Environment China` for Mooncake/21Vianet tenants
- Use `Microsoft.Graph` module (NOT legacy `MSGraph`)
- There is no single command to find all policies assigned to a given group; iterate over policies and check assignments

## References
- [Microsoft Graph PowerShell authentication](https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands)
- [Get-MgDeviceManagementDeviceCompliancePolicyAssignment](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.devicemanagement/get-mgdevicemanagementdevicecompliancepolicyassignment)
- [Get-MgDeviceManagementDeviceConfigurationAssignment](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.devicemanagement/get-mgdevicemanagementdeviceconfigurationassignment)

## Source
- OneNote: Mooncake POD Support Notebook > Intune > How To > PowerShell/Graph API to Intune
- Related case: 2409180030007869
