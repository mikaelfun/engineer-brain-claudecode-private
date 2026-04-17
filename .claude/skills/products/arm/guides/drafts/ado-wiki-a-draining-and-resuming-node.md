---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Infrastructure/Node Management/Suspend & Resume/Draining and Resuming an Azure Local Node"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Infrastructure/Node%20Management/Suspend%20%26%20Resume/Draining%20and%20Resuming%20an%20Azure%20Local%20Node"
importDate: "2026-04-06"
type: troubleshooting-guide
---

 Draining and Resuming an Azure Local Node
=============================================

This article outlines the steps to safely**drain**,**remove**, and later**resume**a node in an Azure Local Disconnected environment. It includes PowerShell commands and validation steps.

***

###  Process Overview

The node maintenance workflow consists of the following key stages:

1.  [**Perform Health Checks**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2180257/Draining-and-Resuming-an-Azure-Local-Node?anchor=%E2%9C%85-perform-health-checks) 
Before initiating any changes, verify the health of the cluster. This includes checking that all nodes are online, storage volumes are healthy, no background jobs are running, and virtual machines are in a stable state. This ensures the environment is ready for a safe drain. 
    
2.  [**Drain the Node from the Failover Cluster**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2180257/Draining-and-Resuming-an-Azure-Local-Node?anchor=%F0%9F%93%A4-drain-the-node-from-the-failover-cluster) 
The node is gracefully drained, meaning workloads are safely migrated to other nodes in the cluster. This step ensures no active services are disrupted during the maintenance.
    
3.  [**Remove the Node from Azure Local (MOC)**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2180257/Draining-and-Resuming-an-Azure-Local-Node?anchor=%E2%9D%8C-**remove-the-node-from-azure-local-configuration-(moc)**)  
The node is deregistered from the Azure Local VM configuration to prevent new workloads from being assigned to it during the maintenance window.
    
4.  **Perform the Maintenance Activity**  
This could include rebooting the node, applying firmware or OS updates, or replacing hardware components.
    
5.  [**Resume the Node into the Cluster**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2180257/Draining-and-Resuming-an-Azure-Local-Node?anchor=%F0%9F%94%81-resume-the-node-into-the-cluster)  
 Once maintenance is complete, the node is brought back online and rejoined to the failover cluster.
    
6.  [**Re-add the Node to Azure Local (MOC)**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2180257/Draining-and-Resuming-an-Azure-Local-Node?anchor=%E2%9E%95-re-add-the-node-to-azure-local-configuration-(moc))  
The node is re-registered in the Azure Local configuration so it can resume hosting workloads.
    
7.  [**Perform Health Checks**](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2180257/Draining-and-Resuming-an-Azure-Local-Node?anchor=%E2%9C%85-perform-health-checks) 
After reintegration, repeat the initial health checks to confirm the node is fully operational and the cluster is stable.

* * *
 Perform Health Checks
--------------------------------------------------

Before initiating a node drain operation in an Azure Local (disconnected) cluster, it's critical to validate the health of the system to avoid service disruption or data loss. The following checks ensure that the node is in a stable state and that workloads can be safely migrated.


### 1.**Cluster Node Status**

Ensure all nodes are online and participating in the cluster:

```PowerShell
# confirm all nodes are up in the cluster
Get-ClusterNode
```
![image.png](/.attachments/image-e0a56036-14bf-4c9e-9be4-81a284d43503.png)
> All nodes should report`Up`and`Running`. If any node is`Paused`,`Down`, or`Joining`, investigate before proceeding.

### 2.**Cluster Shared Volumes (CSV)**

Check the status of CSVs to ensure they are online and accessible:

```PowerShell
# check CSVs status
get-clustersharedvolume
```
![image.png](/.attachments/image-0ecde1f0-7ec9-4e05-b860-8ce8434e37d6.png)

> CSVs should be in the`Online`state. Offline or Redirected I/O states may indicate underlying storage issues

### 3.**Validate Virtual Disks (VDs)**

Ensure all virtual disks are healthy:
```PowerShell
# Check VDs status
get-virtualdisks
```
![image.png](/.attachments/image-4089fc55-b064-43b9-a646-4c95607e42b2.png)

> Check for any disks in a degraded or unhealthy state. These must be resolved before proceeding.

### 4.**Monitor Storage Jobs**

Confirm that no background storage operations are running:

```PowerShell
# confirm storage jobs status
get-storagejob
```
> Pending jobs (e.g., repair, optimization) should complete before draining to avoid data inconsistency.

### 5.**Audit VM Distribution and Status**

Collect VM information across all nodes to ensure workloads are balanced and healthy:

```PowerShell
$cred = Get-Credential
# Retrieve all nodes from the current failover cluster
$nodes = Get-ClusterNode 
# Collect structured VM info from all nodes
$allVMs = Invoke-Command -ComputerName $nodes.Name -Credential $cred -ScriptBlock {
    $cp_IPv4Addresses = @{N='IPv4Addresses';E={$_.NetworkAdapters.IPAddresses.Where({$_ -match '^\d{1,3}(\.\d{1,3}){3}$'})}}
    Get-VM | Select-Object Name, VMId, Uptime, State, Status, $cp_IPv4Addresses
}
# Output in table format
$allVMs | sort Name| Format-Table -AutoSize
```
![image.png](/.attachments/image-acb185f1-2c92-4357-8f93-3f972c397ffb.png)

> This helps identify any VMs in a failed or paused state that might block the drain operation.

### 6.**Verify Node Agent Registration in MOC**

Ensure the node is properly registered and communicating with the MOC (Management of Cluster):

```PowerShell
# CHeck Node agents registered in MOC
$nodes = Get-MocNode -Location MocLocation
$formattedNodes = @()
for ($i = 0; $i -lt $nodes.Name.Count; $i++) {
    $formattedNodes += [PSCustomObject]@{
        Name            = $nodes.Name[$i]
        FQDN            = $nodes.Properties.fqdn[$i]
        Port            = $nodes.Properties.port[$i]
        AuthorizerPort  = $nodes.Properties.authorizerPort[$i]
        OSVersion       = $nodes.Tags.osVersion[$i]
        Version         = $nodes.Version[$i]
    }
}
$formattedNodes | Format-Table -AutoSize
```
![image.png](/.attachments/image-f6b5ecf8-79cb-4d8a-bb5d-df794a0dc282.png)
> This ensures the node is visible and manageable from the control plane.


* * *

Drain the Node from the Failover Cluster
------------------

### 1.**Suspend the Node**

```PowerShell
# Suspend cluster node
$node="vhci01-s1-n02"
Suspend-ClusterNode -Name $node -Drain
```
  

This initiates a safe drain of workloads from the node.

>  If`Suspend-ClusterNode`fails with "Currently unsafe to perform the operation", you would need to investigate why node is not being drained from FC.

once node is drained, you can re-check the health of the system by following:

- [ ] Check nodes status in FC
- [ ] Check VDs
- [ ] Check storage jobs
- [ ] Confirm VMs are migrated from drained node

***  


### **Remove the Node from Azure Local (MOC)**

To ensure that no new VMs are placed on the node from Arc Resource Bridge aspect, remove the node from the active Azure Local VM Configuration. This step can only be done using PowerShell.

```powershell
$node="vhci01-s1-n02"
Remove-MocPhysicalNode -nodeName $node
```
  

* * *
**Perform the Maintenance Activity**
 This could include rebooting the node, applying firmware or OS updates, or replacing hardware components.

***

Resume the Node into the Cluster
------------------

### 1.**Resume the Node**

```PowerShell
$node="vhci01-s1-n02"
Resume-ClusterNode -Name $node
```

 ***

###Re-add the Node to Azure Local Configuration (MOC)
The node is re-registered in the Azure Local configuration so it can resume hosting workloads from Arc Resource Bridge aspect.
```PowerShell
$node="vhci01-s1-n02"
New-MocPhysicalNode -NodeName $node
```
> expected output is below:
![image.png](/.attachments/image-8dadace1-2fec-4383-86ce-487ec71ffb30.png)

also you can run script MOC script from Health check section to confirm that Node is registered again in MOC. so that you get output similar to the below:

![image.png](/.attachments/image-c231f8f8-bf1c-41dc-9039-5b6cf802a1a6.png)
***
**Perform Post-Resume Health Checks**
once node is resumed, perform health check from [Perform Health Checks](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2180257/Draining-and-Resuming-an-Azure-Local-Node?anchor=%E2%9C%85-perform-health-checks)

* * *
