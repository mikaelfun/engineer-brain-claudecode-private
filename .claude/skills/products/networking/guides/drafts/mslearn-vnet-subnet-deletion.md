# Cannot Delete/Modify VNet or Subnet — Resource Cleanup Guide

> Source: [Troubleshoot failure to delete or modify a virtual network or subnet](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-network/virtual-network-troubleshoot-cannot-delete-vnet)

## VNet Deletion Checklist

Delete in this order:
1. Gateway connections
2. VNet/Application gateways
3. Public IPs
4. VNet peerings
5. App Service Environment (ASE)

### Check for blocking resources:
- Portal: VNet > Overview > **Connected devices**
- VNet gateway running? → Remove gateway first
- VMs still running? → Stop/delete VMs
- Microsoft Entra Domain Services? → Delete managed domain
- Stuck in migration? → `Move-AzureVirtualNetwork -VirtualNetworkName <name> -Abort`
- Web app VNet integration? → Disconnect integration first

## Subnet Deletion Checklist

### Comprehensive diagnostic command:
```bash
az network vnet subnet show \
  --resource-group <rg> --vnet-name <vnet> --name <subnet> \
  --query "{addressPrefix:addressPrefix, delegations:delegations[].serviceName, serviceEndpoints:serviceEndpoints[].service, ipConfigurations:ipConfigurations[].id, privateEndpoints:privateEndpoints[].id, serviceAssociationLinks:serviceAssociationLinks[].linkedResourceType}" \
  --output json
```

### Blocking resources:

| Blocker | How to check | Fix |
|---------|-------------|-----|
| Private endpoints | `privateEndpoints[].id` | Delete each private endpoint |
| Subnet delegation | `delegations[].serviceName` | Remove service resources, then `--remove delegations` |
| Service association links | `serviceAssociationLinks` | Remove deployed resources, wait 10-15 min |
| Orphaned NICs | `ipConfigurations[].id` | `az network nic delete` |
| Azure Bastion | AzureBastionSubnet | Delete Bastion resource first |
| Azure Firewall | AzureFirewallSubnet | Deallocate/delete Firewall first |

### Common delegations:

| Delegation | Service |
|-----------|---------|
| Microsoft.ContainerInstance/containerGroups | ACI |
| Microsoft.DBforPostgreSQL/flexibleServers | PostgreSQL Flex |
| Microsoft.Web/serverFarms | App Service / Functions |
| Microsoft.ContainerService/managedClusters | AKS |
| Microsoft.Sql/managedInstances | SQL MI |
| Microsoft.Netapp/volumes | NetApp Files |

## Subnet Modification

### Resize with active resources:
- New range must include all existing IPs
- Azure reserves 5 IPs per subnet (first 4 + last)
- Check used IPs: `az network vnet subnet show --query "ipConfigurations | length(@)"`

### Change delegation:
1. Remove all resources using current delegation
2. `az network vnet subnet update --remove delegations`
3. Add new delegation

### Modify service endpoints:
- ⚠️ Brief connectivity disruption to target service
- Plan during maintenance window
- To remove specific endpoint, specify only endpoints to keep

## Common Error Messages

| Error | Meaning |
|-------|---------|
| `Subnet is in use and cannot be deleted` | Resources (NICs, PEs, services) still in subnet |
| `InUseSubnetCannotBeDeleted` | IP configurations from VMs/LBs remain |
| `SubnetHasDelegations` | Delegation active with deployed resources |
| `NetworkProfileCannotBeDeleted` | Legacy ACI network profile exists |
