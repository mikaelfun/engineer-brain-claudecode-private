# AKS 外部负载均衡器与 SNAT — general — 排查工作流

**来源草稿**: ado-wiki-aci-service-unavailable-error.md, ado-wiki-c-Service-Allowed-IP-Ranges-Annotation.md, ado-wiki-capture-incoming-service-traffic.md, ado-wiki-runbook-automation-vmss-windows.md, ado-wiki-using-service-principals-deploy-with-ado.md, mslearn-internal-pod-service-connectivity.md, mslearn-pods-namespaces-terminating.md
**Kusto 引用**: 无
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: TSG Service Unavailable Error
> 来源: ado-wiki-aci-service-unavailable-error.md | 适用: 适用范围未明确

### 排查步骤

#### TSG Service Unavailable Error


#### Error Message

The requested resource is not available in the location 'usgovvirginia' at this moment. Please retry with a different resource request or in another location. Resource requested: '2' CPU '4' GB memory 'Linux' OS virtual network. ServiceUnavailable (409).

#### Verify customer request

1. Check customer is deploying to an available region

    1. [Resource availability by region - Azure Container Instances | Microsoft Docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-region-availability)

2. Check customer is using an available feature

    1. [Location - List Capabilities (Azure Container Instances) | Microsoft Docs](https://docs.microsoft.com/en-us/rest/api/container-instances/location/listcapabilities)

    2. You can verify available features per region by clicking "Try it" button

        1. Use the ACI Development sub

3. Check customer request for unsupported features (i.e. limitations)

4. Run:

```
let start = datetime(2022-06-23 19:07);
let end = datetime(2022-06-23 20:07);
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where PreciseTimeStamp between (start..end)
| where targetUri contains "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/CAZ-W4GHAA-TAGCORE-T-RGP-NET/providers/Microsoft.ContainerInstance/containerGroups/myaccess"
| where httpStatusCode == 409
| join kind=inner (Traces
    | where PreciseTimeStamp between (start..end)
    | where * contains "Limitation") on correlationId
 | order by PreciseTimeStamp asc
 | project PreciseTimeStamp, operationName1, message
```

#### Verify regional service capacity

1. For Atlas regions, check the availability of cores through [InventoryManager | Jarvis](https://portal.microsoftgeneva.com/dashboard/AzureSeabreeze/Seabreeze/InventoryManager)

2. For k8s regions, check available capacity

#### Known issue - Clusters are disabled due to K8s Service unhealthy / Cluster not scheduleEnabled

```kql
// Capacity by region
ClusterHealth
| where PreciseTimeStamp > ago(1h)
| extend os=iif(osVersion=="", "Linux", iif(osVersion hasprefix "10.0.14393", iif(osVersion hasprefix "3b", "WindowsRS1_3b", "WindowsRS1"), iif(osVersion hasprefix "3b", "WindowsRS5_3b", "WindowsRS5")))
| extend feature=iif(cpu==72, "Dedicated", iif(networkPolicy=="Azure", "VNET", iif(nodeSelectingMode=="ByProvider", "GPU", "")))
| extend sku=strcat(os, feature)
| extend scheduleEnabled = tobool(parse_json(clusterAllocationState)['scheduleEnabled'])
| extend maxReplicas = toint(parse_json(clusterAllocationState)['maxReplicas'])
| extend reservedReplicas = toint(parse_json(clusterAllocationState)['reservedReplicaCount'])
| extend replicasUnavailable = toint(parse_json(clusterAllocationState)['replicasReservedForUnavailability'])
| extend availableReplicas = maxReplicas - reservedReplicas - replicasUnavailable
| extend availableReplicas = iif(availableReplicas < 0, 0, availableReplicas)
| extend maxPorts = toint(parse_json(clusterAllocationState)['maxPorts'])
| extend reservedPortCount = toint(parse_json(clusterAllocationState)['reservedPortCount'])
| extend availablePorts = toint(maxPorts - reservedPortCount)
| summarize arg_max(PreciseTimeStamp, *) by clusterId
| where ['state'] == "Enabled" and provisioningState == "Succeeded" and scheduleEnabled and not(isUnderConstruction)
| project location, clusterId, sku, availableReplicas, maxReplicas, availablePorts, totalNodes, cpu, ['state'], provisioningState, scheduleEnabled, daysBeforeCACertificateExpires
| extend totalNodes = iif(sku startswith "Linux", totalNodes-6, totalNodes)
| extend cores=cpu * availableReplicas
| summarize clusters=dcount(clusterId), availableCapacity=sum(availableReplicas), totalCapacity=sum(maxReplicas), cores=sum(cores) by location, sku, cpu
| summarize availableCapacity=sum(availableCapacity), totalCapacity=sum(totalCapacity), cores=sum(cores) by location, sku
| order by sku asc, location asc
| summarize Linux=sumif(availableCapacity, sku == "Linux"),VNET=sumif(availableCapacity, sku == "LinuxVNET"),RS5_3b=sumif(availableCapacity, sku == "WindowsRS5_3b"),RS1_3b=sumif(availableCapacity, sku == "WindowsRS1_3b") by location
| order by location asc
```

```kql
// Check cluster health by region
ClusterHealth
| where PreciseTimeStamp > ago(2d)
| extend feature=iif(cpu==72, "Dedicated", iif(networkPolicy=="Azure", "VNET", iif(nodeSelectingMode=="ByProvider", "GPU", "")))
| extend sku=strcat(osType, osVersion, feature)
| extend subscription = tostring(parse_json(manifest).subscriptionId)
| extend scheduleEnabled = parse_json(clusterAllocationState)['scheduleEnabled']
| extend maxReplicas = toint(parse_json(clusterAllocationState)['maxReplicas'])
| extend reservedReplicas = toint(parse_json(clusterAllocationState)['reservedReplicaCount'])
| extend replicasUnavailable = toint(parse_json(clusterAllocationState)['replicasReservedForUnavailability'])
| extend availableCapacity = (maxReplicas - reservedReplicas - replicasUnavailable) * scheduleEnabled
| summarize arg_max(PreciseTimeStamp, *) by clusterId
| extend isAzureDNCHealthy = iif(networkPolicy =~ "None", 1, tolong(isAzureDNCHealthy)),isVNetCustomControllerHealthy = iif(networkPolicy =~ "None", 1, tolong(isVNetCustomControllerHealthy))
| project subscription, location, clusterId, cpu, sku, certExpiry=daysBeforeCACertificateExpires, availableCapacity, usedCapacity=appDeployments, maxCapacity=maxReplicas, nodesOptimizing=nodesInOptimization, nodesInService, cores=cpu * maxReplicas, ['state'], provisioningState, scheduleEnabled, isApiServerHealthy, isMSIConnectorHealthy, isControllerManagerHealthy, isAzureDNCHealthy, isVNetCustomControllerHealthy
| order by location asc, sku asc, clusterId asc
| where location == "<target_location>"
```

---

## Scenario 2: Service Allowed IP Ranges Annotation
> 来源: ado-wiki-c-Service-Allowed-IP-Ranges-Annotation.md | 适用: 适用范围未明确

### 排查步骤

#### Service Allowed IP Ranges Annotation


#### Overview

Currently, there are two options available to control `LoadBalancer` traffic:

- allowing specified IP ranges to access through the `spec.loadBalancerSourceRanges` property.
- allowing services with specific tags to access through the `azure-allowed-service-tag` annotation.

Using either one individually is fine, but conflict arises when we attempt to use both of them simultaneously. It�s important to understand how these two options, **kube-proxy** and **cloud-controller-manager**, filter traffic differently. When applying `spec.loadBalancerSourceRanges`, both **kube-proxy** will set **iptables** and **cloud-controller-manager** will set **NSG**. However, only **cloud-controller-manager** will set **NSG** when applying the `azure-allowed-service-tag` annotation.

Conflict Scenario: Suppose a service is configured with `spec.loadBalancerSourceRanges = 10.0.0.1/32` and `azure-allowed-service-tag = Foo`. If a source from the service tag `Foo` comes with the IP `10.0.0.2`, it won�t be able to access this service. Even though the **NSG** would permit this traffic, the **iptable** would block it because only the IP within `10.0.0.1/32` is allowed access.

Therefore, we are proposing this feature to allow customers to use both service tags and IP ranges simultaneously to manage LoadBalancer access traffic, rather than using them separately.

#### service.beta.kubernetes.io/azure-allowed-ip-ranges

This annotation allows you to specify IP ranges that can access your service. The value should be a comma-separated list of valid CIDR blocks.

1. **DON'T** use this annotation if the property `spec.loadBalancerSourceRanges` is also set, as they will conflict with each other.

##### Common issues

#### Invalid CIDR format

If an invalid CIDR format is provided, you'll see an error like this when describing the service:

```txt
Events:
  Type     Reason                Age   From                  Message
  ----     ------                ----  ----                  -------
  Normal   EnsuringLoadBalancer  15s   service-controller    Ensuring load balancer
  Warning  InvalidConfiguration  4s    azure-cloud-provider  Found invalid LoadBalancerSourceRanges [10.0.0.0], ignoring and adding a default DenyAll rule in security group.
  Normal   EnsuredLoadBalancer   1s    service-controller    Ensured load balancer
```

#### Unable to connect to the service after configuring IP ranges

If you're unable to connect to the service after configuring IP ranges:

1. Describe the service to check for any error or warning events:

   ```bash
   kubectl describe service <service-name>
   ```

2. Verify the Network Security Group (NSG) configuration:
   - Locate the NSG associated with the cluster in the Azure portal
   - Confirm the allowed IP ranges are correctly configured as inbound security rules
   - Validate that your client IP falls within one of the allowed ranges

3. Review cloud-controller-manager logs for potential issues:

   ```kusto
   let queryCCP = "<namespace>";
   cluster("akshuba.centralus").database("AKSccplogs").CloudControllerManager
   | where PreciseTimeStamp > ago(2d)
   | where namespace == queryCCP
   | project PreciseTimeStamp, pod, log
   | order by PreciseTimeStamp desc
   ```

#### service.beta.kubernetes.io/azure-allowed-service-tags

This annotation allows you to specify Azure service tags that can access your service. Service tags represent groups of IP address prefixes from Azure services.

1. **DON'T** use this annotation if the property `spec.loadBalancerSourceRanges` is also set, as they will conflict with each other. If you need to allow traffic from both service tags and specific IP ranges, use the `service.beta.kubernetes.io/azure-allowed-ip-ranges` annotation instead.

##### Common service tag issues

#### Unable to connect to the service after configuring service tags

If you're unable to connect after configuring service tags:

1. Verify the service tags are valid Azure service tags
2. Check that your client IP is included in the IP ranges defined by the service tags
3. Inspect the Network Security Group rules in the Azure portal to confirm they were created properly

#### Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Jordan Harder <Jordan.Harder@microsoft.com>

---

## Scenario 3: Capture incoming service traffic to nodes and pods
> 来源: ado-wiki-capture-incoming-service-traffic.md | 适用: 适用范围未明确

### 排查步骤

#### Capture incoming service traffic to nodes and pods

#### Summary

Clarifies how requests from Load Balancers reach AKS pool nodes and how to capture this traffic with tcpdump on both nodes & pods. There are significant differences compared to a typical LB + backend pool setup and even compared to a regular LB + VMSS deployment (without AKS).

#### Key Findings

- **Probe source IP**: The source IP for probe packets is **168.63.129.16** (Azure WireServer), not an internal LB address as expected in a typical LB→Backend probe setup.
- **Client request destination IP**: Client requests arriving at the node use the **service's public/private IP** (same as LB frontend IP), not the node or pod IP. Packets are forwarded by iptables to the appropriate pod IP/port.
- **Service port not listening on node**: The service port is not open for connections on the node (only the probe port is in LISTEN state). This differs from a normal LB+VMSS setup where packets arrive with the node's private IP as destination.

#### Diagrams

##### Kubenet
- Load Balancer → Node (destination IP = service frontend IP) → iptables → Pod

##### Azure CNI
- Load Balancer → Node (destination IP = service frontend IP) → iptables → Pod

#### tcpdump Commands

Adapt the tcpdump commands from the diagrams to your specific needs for capturing incoming traffic on both Kubenet and Azure CNI clusters.

#### Owner

Naomi Priola <Naomi.Priola@microsoft.com>

**Contributors:** Ines Monteiro, Karina Jacamo, Joao Tavares

---

## Scenario 4: Creating Azure Automation Account
> 来源: ado-wiki-runbook-automation-vmss-windows.md | 适用: 适用范围未明确

### 排查步骤

#### Creating Azure Automation Account

The following how-to provide the solution for running remote scripts on Windows instance of VMSS. This script can be run in following ways:

- By Schedule, configure direct in Automation Account
- One Time Only - Executing from Automation Account
- Event initiated from different Azure resources

The running of this script is stateless and Job based, no information are saved between different running sessions. Also it does support only a temporary storage space that is used for creating this script. It is not saved between sessions.

The procedure for creating and managing Automation Account is as follows:

1. Searching in Azure Portal for Automation Account
2. Creating Automation Account in desired Resource Group
3. For interacting with different subscription resources, we need to create a RunAs Account. We select **Run As** Account in the left menu and follow the steps described. This will create a **Service Principal** that will be used for interactions with resources.
4. As we will use the **PowerShell** Runbook with **Managed Identity**, we need to provide the SPN used by this account the necessary RBAC roles on our resources. For sake of simplicity will provide the _Contributor Role_ at the Subscription level.
5. We select our newly created Automation Account, open the Runbook Tab and select AzureAutomationTutorialwithIdentity. Select **Edit** and replace the code with the provided Code Snippet.

#### Code Snippet

```powershell
$vmssName = "akswinx"   #VMSS Name
$vmssRG = "MC_aks_aks_westeurope" #VMSS Resource Group
try
{
    "Logging in to Azure..."
    Connect-AzAccount -Identity
}
catch {
    Write-Error -Message $_.Exception
    throw $_.Exception
}

#### Creating a temporary file on Automation Account for PowerShell script
New-Item -Path 'C:\Temp\script.ps1' -ItemType File

#### Here starts the content of the script used to configure VMSS
Add-Content C:\Temp\script.ps1 'Add-MpPreference -ExclusionPath  "C:\Program Files\Docker"'

#### The following part will loop through Instances of the VMSS machines and will run the configuration on every instance
Get-Content -Path c:\Temp\script.ps1
$vmss = Get-AzVmssVM -ResourceGroupName $vmssRG -VMScaleSetName $vmssName
foreach ($item in $vmss.InstanceID) {
    Write-Host "Applying Configuration Change for " $item
    $converted = Out-String -InputObject $vmss.InstanceID
    $val = $item.InstanceID -as [Int]
    Write-Output $val
    Invoke-AzVmssVMRunCommand -ResourceGroupName $vmssRG -VMScaleSetName $vmssName -InstanceId $val -CommandId 'RunPowerShellScript' -ScriptPath ("C:\Temp\script.ps1")
}
```

---

## Scenario 5: Using Service Principals to Access Clusters and Deploy with Azure DevOps
> 来源: ado-wiki-using-service-principals-deploy-with-ado.md | 适用: 适用范围未明确

### 排查步骤

#### Using Service Principals to Access Clusters and Deploy with Azure DevOps

#### Objective

Implement production-grade deployment procedure to deploy applications directly into the Kubernetes cluster using Azure DevOps with manually created SPN (service principal).

#### Prerequisites

- AKS cluster
- Application Administrator or relevant rights to create app registration in AAD
- Test project in Azure DevOps

#### Implementation

1. Create SPN via app registrations in Azure Active Directory
2. Create the SPN client secret for authentication (set expiration date)
3. Record: SPN Name, Value, Secret, Client ID (application id), Tenant ID
4. Give required access to SPN over the cluster (e.g., Contributor access to cluster RG)
5. In Azure DevOps project settings → Service Connections:
   - New Service Connection → Azure Resource Manager → Service principal (manual)
   - Enter subscription details, SPN client ID, tenant ID
   - Under Service principal key: use SPN client secret **value** (not client secret ID)
   - Verify & Save
6. Use the SPN service connection in build/release pipelines
   - In classic editor: `azureSubscription: '<service-connection-name>'`
   - Select the service connection in Azure Subscription field
   - Configure kubectl tasks with file path or inline commands

---

## Scenario 6: Internal Pod/Service Connectivity Troubleshooting (AKS)
> 来源: mslearn-internal-pod-service-connectivity.md | 适用: Mooncake ✅

### 排查步骤

#### Internal Pod/Service Connectivity Troubleshooting (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-connection-pods-services-same-cluster
> Status: draft (from mslearn-scan)

#### Overview
Structured checklist for diagnosing connectivity issues between pods and services within the same AKS cluster.

#### Step 1: Set Up Test Pod
```bash
kubectl run -it --rm aks-ssh --namespace <ns> --image=debian:stable
apt-get update -y && apt-get install dnsutils curl netcat-openbsd -y
```

Test connectivity:
```bash
curl -Iv http://<pod-ip>:<port>
nc -z -v <endpoint> <port>
```

#### Step 2: Verify Pod Status
```bash
kubectl get pods -n <ns>          # Check Running + READY
kubectl logs <pod> -n <ns>        # Check for errors
kubectl logs <pod> --previous     # Check previous crash logs
```

#### Step 3: Check Network Policies
```bash
kubectl get networkpolicies -A
```
Look for custom policies that may block pod-to-pod traffic.

#### Step 4: Verify Service and Endpoints
```bash
kubectl get services -n <ns>
kubectl describe services <svc> -n <ns>    # Check Endpoints field
kubectl get endpoints                       # Verify pod IP listed
```

If endpoint is missing: pod selector label mismatch or pod not ready.

#### Step 5: Test via Service IP
```bash
curl -Iv http://<service-cluster-ip>:<port>
```

#### Step 6: Restart System Pods (if needed)
```bash
kubectl delete pods -n kube-system -l component=kube-proxy
kubectl delete pods -n kube-system -l k8s-app=kube-dns
```

#### Step 7: Check Node Resource Usage
```bash
kubectl top nodes
kubectl top pods
```

#### Key Diagnostics
- Pod IP not in service endpoints → check label selectors
- Service unreachable → check kube-proxy and CoreDNS
- Intermittent → check node resources and network policies

#### 21V Applicability
Fully applicable to 21V environments.

---

## Scenario 7: Troubleshooting Flow
> 来源: mslearn-pods-namespaces-terminating.md | 适用: 适用范围未明确

### 排查步骤

##### 1. Identify stuck pod
```bash
kubectl get pod --all-namespaces
```

##### 2. Delete pod
```bash
kubectl delete <pod-name> --namespace <ns>
```

##### 3. Force delete if stuck
```bash
kubectl delete pod <pod-name> -n <ns> --grace-period=0 --force --wait=false
```

##### 4. Find resources in namespace
```bash
kubectl get all --namespace <ns>
```

##### 5. Delete all resources in namespace
```bash
kubectl delete <resource> <name> -n <ns> --grace-period=0 --force --wait=false
```

##### 6. Delete namespace
```bash
kubectl delete namespace <ns> --grace-period=0 --force --wait=false
```

##### 7. If namespace still stuck - remove finalizers
```bash
kubectl patch namespace <ns> --patch '{"metadata": {"finalizers": null}}'
```
Then retry `kubectl delete namespace`.

---
