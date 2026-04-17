# AKS ACI 网络与 DNS — vnet -- Comprehensive Troubleshooting Guide

**Entries**: 11 | **Draft sources**: 11 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-aci-find-app-provision-deletion-flow.md, ado-wiki-a-aci-how-to-find-vm-id-for-aci-cg.md, ado-wiki-aci-billing-issues.md, ado-wiki-aci-diagnostic-tools.md, ado-wiki-aci-dns-label-reuse.md, ado-wiki-aci-keep-connection-alive.md, ado-wiki-aci-sbz-verifier-failures.md, ado-wiki-aci-sync-cg-ip-dns.md, ado-wiki-aci-terminologies.md, ado-wiki-azure-copilot-aci-handlers.md
**Generated**: 2026-04-07

---

## Phase 1: Subnet has active serviceAssociationLinks created 

### aks-404: Unable to delete subnet, error InUseSubnetCannotBeDeleted due to service associa...

**Root Cause**: Subnet has active serviceAssociationLinks created by Azure Container Instances (ACI). Azure prevents deletion of subnets that still have dependent resources or service association links attached.

**Solution**:
Use Azure REST API to delete the service association link first: az rest --method delete --uri https://management.azure.com/subscriptions/{subId}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{subnet}/providers/Microsoft.ContainerInstance/serviceAssociationLinks/default?api-version=2018-10-01. Then ensure all associated ACI resources are removed before retrying subnet deletion.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Subnet%20Deletion%20Error%3A%20InUseSubnetCannotBeDeleted)]`

## Phase 2: ACI network profile created during container group

### aks-406: Cannot delete subnet or VNet used by ACI. Error: Subnet is in use by Microsoft.N...

**Root Cause**: ACI network profile created during container group deployment is not properly deleted when removing the container group, leaving orphaned resources blocking subnet/VNet deletion

**Solution**:
Delete orphaned network profile: (1) Show hidden types in resource group, find and delete the network profile via Portal; (2) Use CLI: az network profile delete --ids $(az network vnet subnet show ... --query ipConfigurationProfiles[].id); (3) If both fail, update properties.containerNetworkInterfaceConfigurations=[] then delete; (4) Escalate via IcM to ACI team for manual cleanup

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/Unable%20to%20delete%20ACI%20Subnet%20or%20VNet%20Subnet%20is%20in%20use)]`

## Phase 3: Dangling ACI Service Association Link (acisal) rem

### aks-598: Cannot delete ACI subnet or VNet — error 'Subnet requires delegations [Microsoft...

**Root Cause**: Dangling ACI Service Association Link (acisal) remains on subnet after container groups are deleted. The acisal has a special flag allowing subnet deletion but cascaded delete from VNet/RG level may fail. Direct subnet deletion may succeed due to the special flag.

**Solution**:
1) Try explicit subnet deletion from Portal or CLI (not cascaded from VNet/RG). 2) If that fails, validate all deployments are deleted using Kusto SubscriptionDeployments query. 3) Delete SAL directly: az resource delete --ids /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Network/virtualNetworks/{vnet}/subnets/{subnet}/serviceAssociationLinks/acisal --api-version 2018-10-01. 4) If all fail, open IcM to ACIS for SAL deletion via ACIS action.

`[Score: [G] 9.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Cannot%20delete%20ACI%20Vnet%20or%20Subnet%20due%20to%20dangling%20Service%20Association%20Link)]`

## Phase 4: ACI Service Association Link (acisal) blocks resou

### aks-297: Cannot delete RG/VNET/Subnet due to ACI Service Association Link (SAL) blocking ...

**Root Cause**: ACI Service Association Link (acisal) blocks resource deletion. CSS/Cx mitigations in TSG may fail, requiring ACIS Action NRP/DeleteServiceAssociationLink.

**Solution**:
1) Follow TSG for CSS/Cx mitigations; 2) If all fail, escalate to EEE ACI for ACIS Action NRP/DeleteServiceAssociationLink (requires OaaS + R2D/SafeFly clearance).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 5: Race condition bug in NMAgent (Azure networking se

### aks-298: ACI container group in VNet goes into restart loop; Private Link or Private DNS ...

**Root Cause**: Race condition bug in NMAgent (Azure networking service) causes ACI to resolve the service endpoint's public IP instead of private IP. Stale records in DnsForwarder are not cleaned up, causing persistent incorrect DNS resolution for Private Link endpoints.

**Solution**:
1. Query Kusto SubscriptionDeployments with containerGroup resourceURI to get node and clusterId. 2. Query ClusterHealth with clusterId to get infra VM subscription ID from manifest. 3. Create IcM to Cloudnet\DNS Recursive team with infra VM subscription ID and VM name. 4. Link IcM to parent IcM 226910502. 5. Ask Cloudnet team to clean up stale DnsForwarder records. New deployments should resume normal functionality after cleanup.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/Private%20Link%20or%20Private%20DNS%20are%20resolving%20to%20azure%20resource%27s%20Public%20IP%20instead%20of%20private%20IP)]`

## Phase 6: Container Groups deleted but NICs remain in Networ

### aks-299: Cannot delete RG/VNET/Subnet due to orphan NICs in Network Profile

**Root Cause**: Container Groups deleted but NICs remain in Network Profile (orphan NICs), blocking resource deletion.

**Solution**:
1) Verify CGs deleted via ASC; 2) Confirm lingering NICs in Network Profile via ASC; 3) Escalate to EEE ACI for ACIS Action ACI/Remove Unused CNI (requires dedicated JIT clearance).

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required)]`

## Phase 7: Container groups created with API version >= 2021-

### aks-317: Cannot find VNET for ACI container group, network profile shows NetworkProfileId...

**Root Cause**: Container groups created with API version >= 2021-07-01 use subnet delegation to Microsoft.ContainerInstance/containerGroups instead of network profiles

**Solution**:
Use Kusto query on cluster('accprod').database('accprod').SubscriptionDeployments to find subnetId by filtering on subscriptionId and containerGroup name. For older API versions (< 2021-07-01), check network profile in ASC Resource Explorer > Networking section.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FView%20VNET%20used%20by%20ACI)]`

## Phase 8: ACI Spot Containers only support Standard SKU with

### aks-318: ACI Spot container deployment fails with unsupported feature error (GPU, VNET, o...

**Root Cause**: ACI Spot Containers only support Standard SKU without GPU, VNET, or PublicIP. Spot containers run on separate Spot clusters with no inbound connectivity (no gateway nodes).

**Solution**:
Remove GPU, VNET, and PublicIP configurations from Spot container deployments. Use Standard SKU only. Set priority property to 'Spot' in ARM template. For networking needs, consider regular-priority containers instead.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Spot%20Containers)]`

## Phase 9: NSG policy modifying the VNet/subnet on creation, 

### aks-331: Azure Image Builder (AIB) ACI container hangs and fails with FailedMountAzureFil...

**Root Cause**: NSG policy modifying the VNet/subnet on creation, adding deny-all rule that blocks traffic to the storage account needed for image build

**Solution**:
1) Check ARM logs for policy modifications to VNet; 2) Method 1: Add policy exemption to AIB resource group to prevent NSG rule injection; 3) Method 2: Use bring-your-own-VNET with proper permissions (docs.microsoft.com/azure/virtual-machines/linux/image-builder-networking); 4) Add resource lock to AIB resource group to inspect resources before auto-cleanup

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Azure%20Image%20Builder%20ACI%20Troubleshooting)]`

## Phase 10: NSG policy automatically adds a deny-all rule to t

### aks-451: Azure Image Builder (AIB) container in ACI fails to start with FailedMountAzureF...

**Root Cause**: NSG policy automatically adds a deny-all rule to the AIB-created NSG, blocking traffic to the storage account needed for Azure File volume mount

**Solution**:
1) Add policy exemption to the AIB resource group to prevent NSG modification. 2) Alternatively, use Bring Your Own VNET with proper permissions to allow required communication. Verify by checking ARM logs for policy modifications and storage account logs for traffic blocks.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Azure%20Image%20Builder%20ACI%20Troubleshooting)]`

## Phase 11: ACI does not support static IP addresses for VNet 

### aks-316: ACI container group private IP changes after stop/start or restart, causing DNS ...

**Root Cause**: ACI does not support static IP addresses for VNet container groups. When a container group is restarted or stopped/started, the IP address may change, making existing DNS records stale.

**Solution**:
Use an ACI init container to automate DNS updates on restart. Follow MS Learn module: https://docs.microsoft.com/learn/modules/secure-apps-azure-container-instances-sidecar/6-deploy-with-init-container. Also see: https://learn.microsoft.com/en-us/azure/container-instances/container-instances-init-container

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [B] 5.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FSync%20Container%20Group%20Private%20IP%20Changes%20With%20Customer%20DNS%20records)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Unable to delete subnet, error InUseSubnetCannotBeDeleted due to service associa... | Subnet has active serviceAssociationLinks created by Azure C... | Use Azure REST API to delete the service association link fi... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Subnet%20Deletion%20Error%3A%20InUseSubnetCannotBeDeleted) |
| 2 | Cannot delete subnet or VNet used by ACI. Error: Subnet is in use by Microsoft.N... | ACI network profile created during container group deploymen... | Delete orphaned network profile: (1) Show hidden types in re... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/Unable%20to%20delete%20ACI%20Subnet%20or%20VNet%20Subnet%20is%20in%20use) |
| 3 | Cannot delete ACI subnet or VNet — error 'Subnet requires delegations [Microsoft... | Dangling ACI Service Association Link (acisal) remains on su... | 1) Try explicit subnet deletion from Portal or CLI (not casc... | [G] 9.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Cannot%20delete%20ACI%20Vnet%20or%20Subnet%20due%20to%20dangling%20Service%20Association%20Link) |
| 4 | Cannot delete RG/VNET/Subnet due to ACI Service Association Link (SAL) blocking ... | ACI Service Association Link (acisal) blocks resource deleti... | 1) Follow TSG for CSS/Cx mitigations; 2) If all fail, escala... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 5 | ACI container group in VNet goes into restart loop; Private Link or Private DNS ... | Race condition bug in NMAgent (Azure networking service) cau... | 1. Query Kusto SubscriptionDeployments with containerGroup r... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACI/TSG/Private%20Link%20or%20Private%20DNS%20are%20resolving%20to%20azure%20resource%27s%20Public%20IP%20instead%20of%20private%20IP) |
| 6 | Cannot delete RG/VNET/Subnet due to orphan NICs in Network Profile | Container Groups deleted but NICs remain in Network Profile ... | 1) Verify CGs deleted via ASC; 2) Confirm lingering NICs in ... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FList%20of%20ACI%20issues%20where%20IcM%20is%20required) |
| 7 | Cannot find VNET for ACI container group, network profile shows NetworkProfileId... | Container groups created with API version >= 2021-07-01 use ... | Use Kusto query on cluster('accprod').database('accprod').Su... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FView%20VNET%20used%20by%20ACI) |
| 8 | ACI Spot container deployment fails with unsupported feature error (GPU, VNET, o... | ACI Spot Containers only support Standard SKU without GPU, V... | Remove GPU, VNET, and PublicIP configurations from Spot cont... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2FACI%20Spot%20Containers) |
| 9 | Azure Image Builder (AIB) ACI container hangs and fails with FailedMountAzureFil... | NSG policy modifying the VNet/subnet on creation, adding den... | 1) Check ARM logs for policy modifications to VNet; 2) Metho... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Azure%20Image%20Builder%20ACI%20Troubleshooting) |
| 10 | Azure Image Builder (AIB) container in ACI fails to start with FailedMountAzureF... | NSG policy automatically adds a deny-all rule to the AIB-cre... | 1) Add policy exemption to the AIB resource group to prevent... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FTSG%2F%5BTSG%5D%20Azure%20Image%20Builder%20ACI%20Troubleshooting) |
| 11 | ACI container group private IP changes after stop/start or restart, causing DNS ... | ACI does not support static IP addresses for VNet container ... | Use an ACI init container to automate DNS updates on restart... | [B] 5.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FSync%20Container%20Group%20Private%20IP%20Changes%20With%20Customer%20DNS%20records) |
