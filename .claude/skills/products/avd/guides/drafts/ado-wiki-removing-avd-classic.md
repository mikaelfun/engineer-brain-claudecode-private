---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/🔄Workflows/AVD Classic/Removing AVD Classic"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2F%F0%9F%94%84Workflows%2FAVD%20Classic%2FRemoving%20AVD%20Classic"
importDate: "2026-04-23"
type: guide-draft
---

# Removing AVD Classic Resources

## Official Documentation

For removal of AVD Classic resources in a tenant, refer to:
https://docs.microsoft.com/en-us/azure/virtual-desktop/virtual-desktop-fall-2019/manual-delete

## Scripted Method (Bulk Removal)

> **Disclaimer**: This is a custom script provided as-is. It is not officially supported for troubleshooting. It is meant as a way for customers to quickly remove large AVD Classic deployments.

### Prerequisites
- Install the RDInfra PowerShell module: https://docs.microsoft.com/en-us/powershell/windows-virtual-desktop/overview

### Script

'''powershell
Add-RdsAccount -DeploymentUrl "https://rdbroker.wvd.microsoft.com"

 = (Get-RdsTenant).TenantName

foreach ( in ) {
     = Get-RdsHostPool -TenantName  | Select HostPoolName
    foreach ( in ) {
        # Remove Remote Apps
         = Get-RdsAppGroup -HostPoolName .HostPoolName -TenantName 
        foreach ( in ) {
             = Get-RdsRemoteApp -HostPoolName .HostPoolName -TenantName  -AppGroupName .AppGroupName | Select RemoteAppName
            foreach ( in ) {
                Remove-RdsRemoteApp -HostPoolName .HostPoolName -TenantName  -AppGroupName .AppGroupName -Name .RemoteAppName
            }
        }
        # Remove App Groups
        foreach ( in ) {
            Remove-RdsAppGroup -HostPoolName .HostPoolName -TenantName  -AppGroupName .AppGroupName
        }
        # Remove Session Hosts
         = Get-RdsSessionHost -HostPoolName .HostPoolName -TenantName 
        foreach ( in ) {
            Remove-RdsSessionHost -HostPoolName .HostPoolName -TenantName  -Name .SessionHostName
        }
        # Remove Host Pool
        Remove-RdsHostPool -Name .HostPoolName -TenantName 
    }
    # Remove Tenant
    Remove-RdsTenant -Name 
}
'''

### Removal Order
1. Remote Apps (within each App Group)
2. App Groups (within each Host Pool)
3. Session Hosts (within each Host Pool)
4. Host Pools
5. Tenant
