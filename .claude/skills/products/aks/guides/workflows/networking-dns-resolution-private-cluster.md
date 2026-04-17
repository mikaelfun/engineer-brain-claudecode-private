# AKS DNS 解析排查 — private-cluster — 排查工作流

**来源草稿**: ado-wiki-aci-sync-ip-private-dns.md
**Kusto 引用**: cluster-snapshot.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Automate Sync of ACI IP to a Private DNS Zone
> 来源: ado-wiki-aci-sync-ip-private-dns.md | 适用: 适用范围未明确

### 排查步骤

#### Automate Sync of ACI IP to a Private DNS Zone

#### Summary and Goals

ACI deployed on a VNet doesn't offer a way to have a Static IP Address or a FQDN. A common workaround is deploying an Application Gateway with automation to sync ACI IP changes, but this adds complexity and cost.

A more cost-effective alternative: use a Private DNS Zone linked to the ACI VNet (and client VNets), with an Azure Automation runbook to update the A record when ACI IP changes.

##### Prerequisites

* Existing Application Gateway
* ACI deployment
* Azure Automation account
* A Private DNS zone with an A record for the ACI container group

##### Involved Components

* Azure Automation
* PowerShell

#### Implementation Steps

##### Implementation Overview

1. Create Automation Account (if not exist)
2. Create PowerShell RunBook (updates the Private DNS A record)
3. Create Alert (triggered by ACI restart) with Action Group to start the Runbook
4. Enable ACI logs via Log Analytics

##### Creating the PowerShell runbook

Create a runbook using the following script:

```pwsh
#Variables declarations
$RGACI="aks-egress-2-rg"      # Resource Group of Azure Container Instance
$ACINAME="appcontainer"     # Azure Container Instance name

$RGZONE = "aks-egress-2-rg" # Resource Group of PrivateDNS Zone
$ZONENAME = "private-apps.aci.com" # PrivateDNS Zone name
$RECORDTYPE = "A" # Record Type (by default should be A)
$RECORDNAME = "appcontainer" # Record name, either a custom one or the name from ACI

#login to Azure
$connectionName = "AzureRunAsConnection"
try
{
    $servicePrincipalConnection = Get-AutomationConnection -Name $connectionName
    "Logging in to Azure..."
    $connectionResult =  Connect-AzAccount -Tenant $servicePrincipalConnection.TenantID `
                             -ApplicationId $servicePrincipalConnection.ApplicationID   `
                             -CertificateThumbprint $servicePrincipalConnection.CertificateThumbprint `
                             -ServicePrincipal
    "Logged in."
}
catch {
    if (!$servicePrincipalConnection)
    {
        $ErrorMessage = "Connection $connectionName not found."
        throw $ErrorMessage
    } else{
        Write-Error -Message $_.Exception
        throw $_.Exception
    }
}

#### Get Current ACI IP address
$ipaddraci=(Get-AzContainerGroup -ResourceGroupName $RGACI -Name $ACINAME).IpAddress

#### Get PrivateDNS Zone Object
$zone = Get-AzPrivateDnsZone -Name $ZONENAME -ResourceGroupName $RGZONE
#### Get Record Object from PrivateDNS Zone
$record = Get-AzPrivateDnsRecordSet -Name $RECORDNAME -RecordType $RECORDTYPE -Zone $zone

#### Check if current ACI IP address is different from on at PrivateDNS Zone Record
if ("$record.Records[0].Ipv4Address" -ne "$ipaddraci.ip") {
    Write-Host "Updating record '$RECORDNAME.$ZONENAME'..."

    # Remove Old ACI IP address on PrivateDNS Zone Record
    $RecordSet = Get-AzPrivateDnsRecordSet -Name $RECORDNAME -RecordType $RECORDTYPE -ResourceGroupName $RGZONE -ZONENAME $ZONENAME
    Remove-AzPrivateDnsRecordConfig -RecordSet $RecordSet -Ipv4Address $record.Records[0].Ipv4Address
    Set-AzPrivateDnsRecordSet -RecordSet $RecordSet

    # Add New ACI IP address on PrivateDNS Zone Record
    $RecordSet = Get-AzPrivateDnsRecordSet -Name $RECORDNAME -RecordType $RECORDTYPE -ResourceGroupName $RGZONE -ZONENAME $ZONENAME
    Add-AzPrivateDnsRecordConfig -RecordSet $RecordSet -Ipv4Address $ipaddraci.ip
    Set-AzPrivateDnsRecordSet -RecordSet $RecordSet
}
```

**Required modules**: Az.Accounts, Az.Automation, Az.Compute, Az.Network, Az.PrivateDNS, Az.ContainerInstance

##### Create Alert (Triggered by ACI)

1. Azure Portal → ACI → Select Instance → Alerts → + New Alert Rule
2. Select Condition → "Restart Container Group" (Microsoft.ContainerInstance/containerGroups) → Done
3. For platform maintenance restarts, create a Log Analytics alert:
   ```sql
   ContainerEvent_CL
   |where ContainerGroup_s contains "<container_name>"
   |where ResourceGroup contains "<resource_group_name>"
   |where Reason_s contains "started"
   ```
4. Run query → Select "New Alert Rule"

##### Configure Alerting Rules to Trigger the Runbook

1. Open alert rule → Action Group → Create Action Group
2. Fill in action group details
3. Actions tab → Add Action → Type: "Automation Runbook"
4. Configure Runbook: Source = "User", select your Automation account and runbook
5. Complete alert rule creation

#### References

* Creating an Azure Automation account: https://docs.microsoft.com/en-us/azure/automation/automation-create-standalone-account
* Creating an Automation Runbook: https://docs.microsoft.com/en-us/azure/automation/learn/automation-tutorial-runbook-textual-powershell
* Configuring Log Analytics for ACI: https://docs.microsoft.com/en-us/azure/container-instances/container-instances-log-analytics

---

## 附录: Kusto 诊断查询

### 来源: cluster-snapshot.md

# 集群快照查询

## 用途

获取 AKS 集群的基础信息、CCP Namespace、FQDN、Underlay Name 等关键信息。

## 查询 1: 获取集群基础信息

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {subscription} | 是 | 订阅 ID |
| {resourceGroup} | 是 | 资源组名称 |
| {cluster} | 是 | 集群名称 |

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project namespace, apiServerServiceAccountIssuerFQDN, UnderlayName, provisioningState, powerState, clusterNodeCount
| take 1
```

### 结果字段说明

| 字段 | 说明 |
|------|------|
| namespace | CCP 命名空间（用于控制平面日志查询） |
| apiServerServiceAccountIssuerFQDN | API Server FQDN |
| UnderlayName | Underlay 名称 |
| provisioningState | 预配状态 |
| powerState | 电源状态 |
| clusterNodeCount | 节点数量 |

---

## 查询 2: 查询集群状态历史

### 查询语句

```kql
let _fqdn = cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(1d)
| where subscription == "{subscription}"
| where customerResourceGroup == "{resourceGroup}"
| where clusterName == "{cluster}"
| sort by PreciseTimeStamp desc
| project apiServerServiceAccountIssuerFQDN
| take 1;
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where PreciseTimeStamp > ago(90d)
| where apiServerServiceAccountIssuerFQDN in (_fqdn)
| project apiServerServiceAccountIssuerFQDN, PreciseTimeStamp, name, provisioningState, powerState, clusterNodeCount, UnderlayName
| order by PreciseTimeStamp asc
```

---

## 查询 3: 检查集群异常状态

### 查询语句

```kql
cluster('https://mcakshuba.chinaeast2.kusto.chinacloudapi.cn').database('AKSprod').ManagedClusterSnapshot
| where TIMESTAMP > ago(3d)
| where clusterName contains "{cluster}" and subscription == "{subscription}"
| where ['state'] contains "degraded" or ['state'] == 'Unhealthy'
| project PreciseTimeStamp, provisionInfo, provisioningState, powerState, clusterNodeCount,
         autoUpgradeProfile, clusterName, resourceState
| sort by PreciseTimeStamp desc
```

---

## 查询 4: 检查 Extension Addon Profiles (如 Flux)

### 必要参数

| 参数 | 必填 | 说明 |
|------|------|------|
| {starttime} | 是 | 开始时间 |
| {endtime} | 是 | 结束时间 |
| {ccpNamespace} | 是 | CCP 命名空间 |

### 查询语句

```kql
let queryFrom = datetime('{starttime}');
let queryTo = datetime('{endtime}');
let queryCcpNamespace = '{ccpNamespace}';
ManagedClusterSnapshot
| where PreciseTimeStamp between(queryFrom..queryTo)
| where ['cluster_id'] == queryCcpNamespace
| summarize arg_max(PreciseTimeStamp, clusterName, extensionAddonProfiles) by cluster_id
| extend extensionAddonProfiles = parse_json(extensionAddonProfiles)
| mv-apply extensionAddonProfiles on (
    project extAddonName = tostring(extensionAddonProfiles.name),
            ProvisionStatus = tostring(extensionAddonProfiles.provisioningState)
)
| extend flux_enabled = tobool(iff(extAddonName=='flux', True, False))
| project extAddonName, flux_enabled, ProvisionStatus
```

## 关联查询

- [operation-tracking.md](./operation-tracking.md) - 追踪操作详情
- [controlplane-logs.md](./controlplane-logs.md) - 控制平面日志

---
