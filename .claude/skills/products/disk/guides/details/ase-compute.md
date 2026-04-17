# Disk Azure Stack Edge: VM & Kubernetes — 综合排查指南

**条目数**: 6 | **草稿融合数**: 6 | **Kusto 查询融合**: 0
**来源草稿**: ado-wiki-a-identifying-ap5gc-cases-rerouting.md, ado-wiki-ase-collect-vm-logs.md, ado-wiki-ase-gpu-drivers-rhel.md, ado-wiki-ase-k8s-admin-access.md, ado-wiki-ase-k8s-memory-processor-limits.md, ado-wiki-common-errors-kubernetes.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: What is AP5GC
> 来源: ADO Wiki (ado-wiki-a-identifying-ap5gc-cases-rerouting.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Identifying AP5GC Cases and Customers for Rerouting and Collaboration"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FIdentifying%20AP5GC%20Cases%20and%20Customers%20for%20Rerouting%20and%20Collaboration"
3. importDate: "2026-04-06"
4. type: troubleshooting-guide
5. Azure Private 5G Core is an Azure cloud service for deploying and managing 5G core network functions on an Azure Stack Edge device, as part of an on-premises private mobile network for enterprises.
6. The 5G core network functions connect with standard 4G and 5G standalone radio access networks (RANs) to provide high performance, low latency, and secure connectivity for 5G Internet of Things (IoT) devices. Azure Private 5G Core gives enterprises f
7. For more information: [What is Azure Private 5G Core? | Microsoft Learn](https://learn.microsoft.com/en-us/azure/private-5g-core/private-5g-core-overview)
8. Packet core instances run on a Kubernetes cluster, **which is connected to Azure Arc and deployed on an Azure Stack Edge Pro with GPU device**.
9. These platforms provide security and manageability for the entire core network stack from Azure. Additionally, Azure Arc allows Microsoft to provide support at the edge.
10. The easiest way to clarify this is by asking the customer directly if they are running 5G workloads on the Azure Stack Edge.

### Phase 2: Collect VM Guest Logs on Azure Stack Edge
> 来源: ADO Wiki (ado-wiki-ase-collect-vm-logs.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Virtual Machines/Collect VM Guest Logs"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FVirtual%20Machines%2FCollect%20VM%20Guest%20Logs"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. 1. Enter Support Session on ASE
6. 2. Identify VM and resource group: `get-vm | fl Name, Notes`
7. 3. Import log collection module:
8. ipmo 'C:\Program Files\WindowsPowerShell\Modules\Microsoft.AzureStack.GuestLogCollectionTool\Microsoft.AzureStack.Common.Tools.GuestLogCollectionTool.PowershellModule.dll'
9. 4. Create log directory: `mkdir C:\VmGuestLogs`
10. $subscriptionid = Get-ArmSubscriptionId

### Phase 3: Manually Installing GPU Drivers on RHEL VM (Azure Stack Edge)
> 来源: ADO Wiki (ado-wiki-ase-gpu-drivers-rhel.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Virtual Machines/Manually Installing GPU Drivers on RHEL VM"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FVirtual%20Machines%2FManually%20Installing%20GPU%20Drivers%20on%20RHEL%20VM"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. **Note**: Customer requires Red Hat subscription for RHEL VM access.
6. 2. Enable RHEL repos:
7. sudo subscription-manager repos --enable=rhel-7-server-rpms
8. sudo subscription-manager repos --enable=rhel-7-server-optional-rpms
9. 3. Install prerequisites:
10. sudo yum install kernel kernel-tools kernel-headers kernel-devel

### Phase 4: Granting Kubernetes Admin Access on Azure Stack Edge
> 来源: ADO Wiki (ado-wiki-ase-k8s-admin-access.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Kubernetes/Granting Kubernetes Admin Access on Azure Stack Edge"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FKubernetes%2FGranting%20Kubernetes%20Admin%20Access%20on%20Azure%20Stack%20Edge"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. **IMPORTANT**: Confirm with Engineering (raise IcM with DBE Container Compute Team) before proceeding.
6. 1. Connect to ASE CLI via PowerShell (as Admin):
7. Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
8. Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell
9. 2. Run `Enable-HcsSupportAccess` - copy the generated key
10. 3. Decrypt key using Support Password Decrypter - this is the EdgeSupport password

### Phase 5: Changing Memory/Processor Limits for Kubernetes on Azure Stack Edge
> 来源: ADO Wiki (ado-wiki-ase-k8s-memory-processor-limits.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Stack Edge/Kubernetes/Changing Memory Processor Limits for Kubernetes on Azure Stack Edge"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Stack%20Edge%2FKubernetes%2FChanging%20Memory%20Processor%20Limits%20for%20Kubernetes%20on%20Azure%20Stack%20Edge"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. Set-Item WSMan:\localhost\Client\TrustedHosts $ip -Concatenate -Force
6. Enter-PSSession -ComputerName $ip -Credential $ip\EdgeUser -ConfigurationName Minishell -UseSSL
7. Get-AzureDataBoxEdgeRole
8. Set-AzureDataBoxEdgeRoleCompute -Name <Name> -MemoryInBytes <MemoryAmount> -ProcessorCount <No.OfProcessorCores>
9. - **Default memory**: 25% of device specification
10. - **Default processor count**: 30% of device specification

### Phase 6: Common Kubernetes Errors — Azure Container Storage Enabled by Azure Arc
> 来源: ADO Wiki (ado-wiki-common-errors-kubernetes.md)

1. sourceRef: "Supportability/AzureStorageDevices/AzureStorageDevices.wiki:/Azure Container Storage Enabled by Azure Arc/Common errors Kubernetes"
2. sourceUrl: "https://dev.azure.com/Supportability/AzureStorageDevices/_wiki/wikis/AzureStorageDevices.wiki?pagePath=%2FAzure%20Container%20Storage%20Enabled%20by%20Azure%20Arc%2FCommon%20errors%20Kubernetes"
3. importDate: "2026-04-05"
4. type: troubleshooting-guide
5. *A pod keeps restarting repeatedly due to failure in the application or container misconfiguration*
6. **Identify the failing pod:**
7. 1. `kubectl get pods -n <namespace>`
8. **Describe the pod:**
9. 2. `kubectl describe pod <pod-name> -n <namespace>`
10. **Check container logs:**

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Customer wants to monitor Azure Stack Edge hardware temperature; temperature not available in Azure portal metrics | Temperature monitoring is not included in Azure Stack Edge available metrics; only accessible via BM | Configure BMC interface via PowerShell with IP/Gateway/Subnet/Password; connect BMC port to host machine; access iDRAC p | 🟢 8.5 | [ADO Wiki] |
| 2 | Customer running Azure Private 5G Core (AP5GC) or AKS on Azure Stack Edge; case may need rerouting to Azure For Operator | AP5GC and AKS on ASE issues are owned by Azure For Operators team, not Azure Storage Devices team; A | Ask customer if running 5G workloads on ASE; if yes, reroute case to Azure For Operators support team; SAP for AP5GC and | 🟢 8.5 | [ADO Wiki] |
| 3 | Azure Stack Edge Kubernetes or custom VM showing alerts/errors for low or insufficient memory; VM performance degraded | K8s VMs default to 4GB memory; custom VMs depend on image used; workload requires more memory than a | Enter support session; Get-VM to find VM name; Stop-VM; Set-VMMemory -VMName <name> -StartupBytes <amount>; Start-VM. Fo | 🟢 8.5 | [ADO Wiki] |
| 4 | VM on Azure Stack Edge fails to boot after disk resize; OS error 0xC0000098 required file missing | File system corruption from disk resize operation on ASE VM | Connect to VM console; Option 1: create repair VM, attach disk, attempt fix; Option 2: rebuild VM from scratch | 🟢 8.5 | [ADO Wiki] |
| 5 | Windows Server VM on Azure Stack Edge stops unexpectedly after ~180 days; VM shows stopped in portal; repeats multiple t | Windows Server trial version expiration: wlms.exe initiates automated shutdown after 180 days | Check EventLog for wlms.exe shutdown pattern; extend trial period (up to 6 times, ~3 years); or activate with full licen | 🟢 8.5 | [ADO Wiki] |
| 6 | VM deployment on Azure Stack Edge fails at last step with ProvisioningTimeOut error | IP assigned to VM already in use by Kubernetes host IPs which ASE cannot detect; other causes: bad i | Check IP conflicts with K8s host IPs; try different IP; verify image preparation; check gateway/DNS; for Linux verify cl | 🟢 8.5 | [ADO Wiki] |
