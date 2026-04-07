# AKS Node Log Collection

> Source: OneNote - Mooncake POD Support Notebook
> Related: aks-onenote-028 (node access methods)

## Method 1: kubectl debug (Recommended)

### Step 1 — SSH to node
```bash
kubectl get node                    # get node name
kubectl debug node/<node-id> -it --image=mcr.azk8s.cn/aks/fundamental/base-ubuntu:v0.0.11
chroot /host                        # IMPORTANT: must chroot to access real node filesystem
```

### Step 2 — Collect logs
```bash
cd /tmp/
mkdir logsCollection
journalctl -u kubelet > logsCollection/kubelet.log
date > logsCollection/dateOutput.txt
last > logsCollection/lastOutput.txt
cd /var/log/
cp -r azure/ auth.log* messages* syslog* waagent.log* dmesg* /tmp/logsCollection/
ls /tmp/logsCollection/
cd /tmp/
tar zcvf logsCollection.tgz logsCollection/*
sudo chown azureuser:azureuser logsCollection.tgz
```

### Step 3 — Copy logs out
```bash
kubectl cp <debugger-pod-name>:host/tmp/logsCollection.tgz ./logsCollection.tgz
```

## Method 2: From local Azure CLI
```bash
kubectl get nodes > nodes_info.txt
kubectl describe node <node-name> > node_describe.txt
# After SSH to node:
sudo journalctl -u kubelet -o cat
```

## Method 3: Disk Snapshot (for deleted nodes)
PowerShell script to create VMSS instance disk snapshot, then create managed disk, then create VM from disk to access logs:

```powershell
Connect-AzAccount -EnvironmentName AzureChinaCloud
$subscriptionId = "<sub-id>"
Set-AzContext -Subscription $subscriptionId
$vmssinstance = Get-AzVmssVM -ResourceGroupName $rg -VMScaleSetName "<VMSS>" -InstanceId 2
$manageDiskID = $vmssinstance.StorageProfile.OsDisk.ManagedDisk.Id
$snapshot = New-AzSnapshotConfig -SourceUri $manageDiskID -CreateOption Copy -Location $region
New-AzSnapshot -ResourceGroupName $rg -Snapshot $snapshot -SnapshotName $snapshotName
# Then create disk from snapshot and VM from disk
```

> Note: Snapshot method may no longer be available for all scenarios.

## Reference
- Official SSH guide: https://docs.azure.cn/zh-cn/aks/ssh
- ADO Wiki: https://supportability.visualstudio.com/AzureContainers/_wiki/wikis/Containers%20Wiki/560713/Collect-kubelet-logs-using-debugger-pod
