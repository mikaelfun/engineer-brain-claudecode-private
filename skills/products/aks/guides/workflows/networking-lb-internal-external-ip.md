# AKS 内部负载均衡器 — external-ip — 排查工作流

**来源草稿**: ado-wiki-a-ip-based-load-balancer.md, ado-wiki-aci-static-ip-lb-auto-sync.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: IP-based Load Balancer
> 来源: ado-wiki-a-ip-based-load-balancer.md | 适用: 适用范围未明确

### 排查步骤

#### IP-based Load Balancer

#### Overview

IP-based LB feature is enabled by setting `loadBalancerProfile.BackendPoolType` to `nodeIP`. Before this feature, all LB backend pools were NIC-based (VM associated via VMSS API + NIC). NIC-based LB performs badly in:

1. Creating a cluster with >750 nodes
2. Creating the first internal service in a large cluster
3. Scaling out many nodes

With IP-based LB, we attach the private IP of a VM to the LB by calling the LB API directly, without touching the VMSS.

Backend pool type defaults to `nodeIPConfiguration` and can be changed. `nodeIP` is supported since v1.23.0.

```bash
az aks create --load-balancer-backend-pool-type=nodeIP
az aks update --load-balancer-backend-pool-type=nodeIP
```

> The AKS-managed outbound backend pool is still NIC-based, as the outbound rule is not useful for IP-based pools.

#### Migration

There should be no service downtime during migration from NIC-based to IP-based backend pool with the migration API provided by NRP.

#### Key Differences

- NIC-based: `backendIPConfigurations` references VMSS NIC ipConfigurations
- IP-based: `loadBalancerBackendAddresses` contains `ipAddress` + `virtualNetwork` reference

---

## Scenario 2: Using a Static IP for Azure Container Instances via Azure Load Balancer with Automatic Syncing
> 来源: ado-wiki-aci-static-ip-lb-auto-sync.md | 适用: 适用范围未明确

### 排查步骤

#### Using a Static IP for Azure Container Instances via Azure Load Balancer with Automatic Syncing

#### Summary and Goals

This how-to uses an Azure Load Balancer and automatic syncing to expose an ACI deployment behind a static IP address.

##### Prerequisites

* Azure Automation account with the `Az.Accounts`, `Az.Automation`, `Az.Compute`, `Az.Network`, and `Az.ContainerInstances` modules added.
* A running Azure Container Instance container group

##### Involved Components

* Azure Monitor and Alerts
* Azure Automation
* Azure Load Balancer

#### Implementation Steps

1. Create an Azure Load Balancer (public or private) as the access point for your ACI container group.

    ```sh
    # Public LB variables
    lbName="aci-lb"
    rgName="aci-rg"
    backendPoolName="aci-lb-pool"
    healthProbeName="aci-lb-probe"
    healthProbePort=80
    frontendPort=80
    backendPort=80
    protocol="Tcp"
    containerGroupRG="aci-rg"
    containerGroupName="aci-container-group"
    containerGroupIPAddresss="$(az container show --resource-group $containerGroupRG --name $containerGroupName --query ipAddress.ip --output tsv)"

    frontendIpName="aci-lb-ip"

    # Create the LB (public)
    az network lb create --name $lbName --resource-group $rgName --frontend-ip-name $frontendIpName --backend-pool-name $backendPoolName --sku Standard --public-ip-address $frontendIpName

    # Create the LB (private)
    az network lb create --name $lbName --resource-group $rgName --frontend-ip-name $frontendIpName --backend-pool-name $backendPoolName --sku Standard --subnet $lbSubnetName --vnet-name $containerGroupVnetName
    ```

2. Configure health probes and load balancing rules:

    ```sh
    az network lb probe create --resource-group $rgName --lb-name $lbName --name $healthProbeName --protocol $protocol --port $healthProbePort

    az network lb rule create --resource-group $rgName --lb-name $lbName --name "aci-lb-rule" --protocol $protocol --frontend-port $frontendPort --backend-port $backendPort --frontend-ip-name $frontendIpName --backend-pool-name $backendPoolName --probe-name $healthProbeName
    ```

3. Add the container group to the backend pool:

    ```sh
    az network lb address-pool address add --resource-group $containerGroupRG --lb-name $lbName --pool-name $backendPoolName -n ACIBackend --ip-address $containerGroupIPAddresss --virtual-network $containerGroupVnetName
    ```

4. Create a PowerShell runbook in Azure Automation that compares the container group IP with the LB backend pool IP and updates if they differ. Key logic:

    ```powershell
    $containerGroupIPAddress = (Get-AzContainerGroup -ResourceGroupName $containerGroupRG -Name $containerGroupName).IpAddressIP
    $lbBackendIP = (Get-AzLoadBalancer -ResourceGroupName $rgName -Name $lbName).BackendAddressPools[0].LoadBalancerBackendAddresses[0].IpAddress

    If ("$containerGroupIPAddress" -eq "$lbBackendIP") {
        Write-Output "Container group IP address is same as backend pool."
    } Else {
        Write-Output "Changing backend pool IP to match Container group IP"
        $ip1 = New-AzLoadBalancerBackendAddressConfig -IpAddress $containerGroupIPAddress -Name "ACIBackend" -VirtualNetworkId $containerGroupVnetID
        $lb = Get-AzLoadBalancer -ResourceGroupName $rgName -Name $loadBalancerName
        $lb | Set-AzLoadBalancerBackendAddressPool -LoadBalancerBackendAddress $ip1 -Name $backendPoolName
    }
    ```

5. Create an alert rule on the container group for "Restart Container Group" event to trigger the runbook.

6. Create an additional alert rule using Log Analytics for platform maintenance restarts:

    ```kql
    ContainerEvents_CL
    | where ContainerGroup_s == "name-of-the-container-group"
    | where ResourceGroup contains "name-of-the-resource-group"
    | where Reason_s contains "started"
    ```

---
