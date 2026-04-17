---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/AKS enabled by Azure Arc/02-Monitor AKS Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FReadiness%2FWorkloads%2FAKS%20enabled%20by%20Azure%20Arc%2F02-Monitor%20AKS%20Deployment"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Monitoring Kubernetes (K8s) Deployment on AKS (Arc or HCI)

## Prerequisites
- Administrator access on the nodes
- PowerShell Remoting (WinRM) enabled on all cluster nodes
- Azure CLI installed and logged in
- az CLI commands run from MGMT VM; Hyper-V commands from Azure Local nodes

## Step 1: Get Credential and Cluster Nodes
```powershell
$cred = Get-Credential
$nodes = Get-ClusterNode
```

## Step 2: Retrieve VM Details from All Cluster Nodes
```powershell
$allVMs = Invoke-Command -ComputerName $nodes.Name -Credential $cred -ScriptBlock {
    $cp_IPv4Addresses = @{N='IPv4Addresses';E={$_.NetworkAdapters.IPAddresses.Where({$_ -match '^\d{1,3}(\.\d{1,3}){3}$'})}}
    Get-VM | Select-Object Name, VMId, Uptime, State, Status, $cp_IPv4Addresses
}
$allVMs | Format-Table -AutoSize
```

## Step 3: Monitor AKS Clusters via Azure CLI
```powershell
$aks = az aksarc list | ConvertFrom-Json
$aks | Select-Object `
    @{Name='ResourceGroup'; Expression={$_.resourceGroup}},
    @{Name='Name'; Expression={$_.properties.resourceName}},
    @{Name='K8sVersion'; Expression={$_.properties.kubernetesVersion}},
    @{Name='State'; Expression={$_.properties.provisioningState}} |
    Format-Table -AutoSize
```

## Step 4: Check Cluster Group for Specific AKS Deployment
```powershell
$aksClusterName = "aksarc01"
Get-ClusterGroup | Where-Object { $_.Name -match $aksClusterName }
```

## Outcome
- Gather live VM state and network IPs from all cluster nodes
- Validate provisioning and health of AKS deployment
- Map AKS resources back to failover cluster groups
