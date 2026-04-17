# AKS Blob CSI / BlobFuse — blobfuse — 排查工作流

**来源草稿**: ado-wiki-a-aci-automate-sync-ip-appgw-backend-pool.md, onenote-blobfuse2-csi-setup.md
**Kusto 引用**: 无
**场景数**: 2
**生成日期**: 2026-04-07

---

## Scenario 1: Automate Sync of ACI IP to Backend Pool of AppGw
> 来源: ado-wiki-a-aci-automate-sync-ip-appgw-backend-pool.md | 适用: 适用范围未明确

### 排查步骤

#### Automate Sync of ACI IP to Backend Pool of AppGw

#### Summary

ACI deployed on a VNet does not support static IP or FQDN. This guide automates updating an Application Gateway backend pool IP whenever ACI restarts and gets a new IP, enabling customers to use a stable endpoint for ACI via Application Gateway.

**Related:** [Automate Sync to Private DNS Zone](ado-wiki-a-aci-automate-sync-ip-private-dns-zone.md)

#### Prerequisites

- Existing Application Gateway
- ACI deployment on a VNet
- Azure Automation account ([docs](https://docs.microsoft.com/en-us/azure/automation/automation-create-standalone-account#create-a-new-automation-account-in-the-azure-portal))
- ACI logs enabled ([docs](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics))

#### Required Modules

Import before running: `Az.Accounts`, `Az.Automation`, `Az.Compute`, `Az.Network`, `Az.ContainerInstance`
Reference: [Import Az modules](https://docs.microsoft.com/en-us/azure/automation/shared-resources/modules#import-az-modules)

#### Implementation Steps

##### 1. Create PowerShell Runbook

```pwsh
#Variables declarations
$RGAPPGW="automate-aci-rg"           # Resource Group of Application Gateway
$APPGWNAME="appgw"                    # Application Gateway name
$APPGWBKNAME="appGatewayBackendPool"  # Application Gateway backend pool name
$RGACI="automate-aci-rg"             # Resource Group of Azure Container Instance
$ACINAME="aci"                        # Azure Container Instance name
$subscriptionID = "xxxxxxxxxxx-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxx"
$resourceGroup = "automate-aci-rg"
$automationAccount = "aci-automation"

try {
    "Logging in to Azure..."
    Disable-AzContextAutosave -Scope Process
    Connect-AzAccount -Identity
    $AzureContext = Set-AzContext -SubscriptionId $subscriptionID
}
catch {
    Write-Error -Message $_.Exception
    throw $_.Exception
}

$Ipaddraci = (Get-AzContainerGroup -ResourceGroupName $RGACI -Name $ACINAME).IPAddressIP

$AppGw1 = Get-AzApplicationGateway -Name $APPGWNAME -ResourceGroupName $RGAPPGW
$Ipaddraappgwbk1 = (Get-AzApplicationGatewayBackendAddressPool -Name $APPGWBKNAME -ApplicationGateway $AppGw1)
$Ipaddraappgwbk = $Ipaddraappgwbk1.BackendAddresses.ToArray().IpAddress

"IP Address of ACI: $Ipaddraci"
"IP Address of AppGw Backend: $Ipaddraappgwbk"

If ($Ipaddraci -eq $Ipaddraappgwbk) {
    'IPs are equal. No update needed.'
} Else {
    'IPs are not equal. Updating backend pool...'
    $AppGw = Get-AzApplicationGateway -Name $APPGWNAME -ResourceGroupName $RGAPPGW
    $AppGw = Set-AzApplicationGatewayBackendAddressPool -ApplicationGateway $AppGw -Name $APPGWBKNAME -BackendIPAddresses $Ipaddraci
    $UpdatedAppGw = Set-AzApplicationGateway -ApplicationGateway $AppGw
}
```

##### 2. Create Alert Triggered by ACI Restart

**Condition 1 — Portal restart event:**
Azure Portal → ACI → Alerts → New Alert Rule → Condition: `Restart Container Group (Microsoft.ContainerInstance/containerGroups)`

**Condition 2 — Platform maintenance/outages (via Log Analytics):**
Run query in LA workspace:
```kql
ContainerEvent_CL
|where ContainerGroup_s contains "<container_name>"
|where ResourceGroup contains "<resource_group_name>"
|where Reason_s contains "started"
```
Then select **New Alert Rule** from query results.

##### 3. Configure Action Group to Trigger Runbook

For each alert rule:
1. Open alert rule → Action Group → Create Action Group
2. Actions tab → Add Action → Type: **Automation Runbook**
3. In "Configure Runbook": Runbook source = **User**, select your Automation account + the runbook

#### References

- [Create Automation Account](https://docs.microsoft.com/en-us/azure/automation/automation-create-standalone-account)
- [Create Textual Runbook](https://docs.microsoft.com/en-us/azure/automation/learn/automation-tutorial-runbook-textual-powershell)
- [Configure Log Analytics for ACI](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics)

---

## Scenario 2: Blobfuse2 CSI Driver Setup on AKS
> 来源: onenote-blobfuse2-csi-setup.md | 适用: Mooncake ✅

### 排查步骤

#### Blobfuse2 CSI Driver Setup on AKS

> Source: OneNote - Mooncake POD Support Notebook

#### Prerequisites
- AKS cluster with blob CSI driver enabled
- Storage account and container created

#### Step-by-step

##### 1. Enable CSI blob driver
```bash
az aks update --enable-blob-driver --resource-group <rg> --name <cluster>
```

##### 2. Create storage secret
```bash
kubectl create secret generic azure-secret \
  --from-literal=azurestorageaccountname=<account> \
  --from-literal=azurestorageaccountkey=<key>
```

##### 3. Define StorageClass
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: blobfuse2
provisioner: blob.csi.azure.com
parameters:
  skuName: Standard_LRS
  containerName: <container-name>
  protocol: fuse2
reclaimPolicy: Retain
volumeBindingMode: Immediate
```

##### 4. Create PVC
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: blobfuse2-pvc
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: blobfuse2
  resources:
    requests:
      storage: 5Gi
```

##### 5. Create Pod with mount
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: blobfuse2-pod
spec:
  containers:
    - name: blobfuse2-container
      image: nginx
      volumeMounts:
        - mountPath: "/mnt/blob"
          name: blob-storage
  volumes:
    - name: blob-storage
      persistentVolumeClaim:
        claimName: blobfuse2-pvc
```

##### 6. Validate
```bash
kubectl get pvc blobfuse2-pvc       # should be Bound
kubectl get pod blobfuse2-pod       # should be Running
kubectl exec -it blobfuse2-pod -- ls /mnt/blob
```

#### Notes
- For managed identity auth, see aks-onenote-178 (static mount with MSI)
- For troubleshooting blobfuse mount issues, see aks-onenote-060, aks-onenote-049
- YAML capacity field is informational only for blob storage (see aks-onenote-170)

---
