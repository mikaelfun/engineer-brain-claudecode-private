---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======18. AKS=======/18.11 [MCVKB][AKS]Easy method of accessing AKS nod.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# AKS 节点访问方法汇总

排查 AKS 节点问题时，多种方式可用于登录或获取节点日志。

## 方法一：kubectl node-shell（推荐，最简单）

适用于 VMSS 和 avset 类型 AKS 集群。

```bash
# 1. 安装 kubectl node-shell
# 参考：https://github.com/kvaps/kubectl-node-shell

# 2. 获取凭据
az aks get-credentials --resource-group <rg> --name <cluster>

# 3. 列出节点
kubectl get nodes

# 4. 进入节点 shell
kubectl node-shell <node-name>
```

## 方法二：SSH（按官方文档）

参考：https://docs.microsoft.com/en-us/azure/aks/ssh

## 方法三：给节点添加 Public IP

临时添加 Public IP 到节点 NIC，直接 SSH。

## 方法四：在同 Subnet 创建 Jumpbox VM

在 AKS 节点所在 subnet 创建 VM，重置密码后 SSH 到 jumpbox，再 SSH 到节点。

## 方法五：磁盘快照 + 创建 VM（获取离线日志）

当节点已不可访问时，通过磁盘快照方式获取日志：

```powershell
# Windows PowerShell（管理员模式）
Connect-AzAccount -EnvironmentName AzureChinaCloud
$subscriptionId = "<subscriptionId>"
Set-AzContext -Subscription $subscriptionId
$region = "chinaeast2"
$resourceGroupName = "MC_<rg>_<cluster>_<region>"

# 获取 VMSS 实例磁盘 ID
$vmssinstance = Get-AzVmssVM -ResourceGroupName $resourceGroupName -VMScaleSetName "<vmss-name>" -InstanceId <id>
$manageDiskID = $vmssinstance.StorageProfile.OsDisk.ManagedDisk.Id

# 创建快照
$snapshot = New-AzSnapshotConfig -SourceUri $manageDiskID -CreateOption Copy -Location $region
New-AzSnapshot -ResourceGroupName $resourceGroupName -Snapshot $snapshot -SnapshotName "<snapshot-name>"

# 从快照创建托管磁盘
$Snapshot = Get-AzSnapshot -ResourceGroupName $resourceGroupName -SnapshotName "<snapshot-name>"
$NewOSDiskConfig = New-AzDiskConfig -AccountType Standard_LRS -Location $Snapshot.Location -SourceResourceId $Snapshot.Id -CreateOption Copy
New-AzDisk -Disk $NewOSDiskConfig -ResourceGroupName $resourceGroupName -DiskName "<disk-name>"
```

创建 VM 挂载该磁盘后，收集日志：

```bash
cd /tmp/ && mkdir logsCollection
journalctl -u kubelet > logsCollection/kubelet.log
cp -r /var/log/azure/ /var/log/auth.log* /var/log/messages* /var/log/syslog* /var/log/waagent.log* /tmp/logsCollection/
tar zcvf logsCollection.tgz logsCollection/*
```
