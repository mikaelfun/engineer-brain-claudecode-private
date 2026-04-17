# Disk Azure Stack Edge: VM & Kubernetes — 排查速查

**来源数**: 6 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: aks, ap5gc, azure-for-operators, azure-stack-edge, bmc, boot-failure, hardware, idrac, ip-conflict, kubernetes

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Customer wants to monitor Azure Stack Edge hardware temperature; temperature not available in Azure portal metrics | Temperature monitoring is not included in Azure Stack Edge available metrics; only accessible via BM | Configure BMC interface via PowerShell with IP/Gateway/Subnet/Password; connect BMC port to host machine; access iDRAC p | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Customer running Azure Private 5G Core (AP5GC) or AKS on Azure Stack Edge; case may need rerouting to Azure For Operator | AP5GC and AKS on ASE issues are owned by Azure For Operators team, not Azure Storage Devices team; A | Ask customer if running 5G workloads on ASE; if yes, reroute case to Azure For Operators support team; SAP for AP5GC and | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Azure Stack Edge Kubernetes or custom VM showing alerts/errors for low or insufficient memory; VM performance degraded | K8s VMs default to 4GB memory; custom VMs depend on image used; workload requires more memory than a | Enter support session; Get-VM to find VM name; Stop-VM; Set-VMMemory -VMName <name> -StartupBytes <amount>; Start-VM. Fo | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | VM on Azure Stack Edge fails to boot after disk resize; OS error 0xC0000098 required file missing | File system corruption from disk resize operation on ASE VM | Connect to VM console; Option 1: create repair VM, attach disk, attempt fix; Option 2: rebuild VM from scratch | 🟢 8.5 | [ADO Wiki] |
| 5 📋 | Windows Server VM on Azure Stack Edge stops unexpectedly after ~180 days; VM shows stopped in portal; repeats multiple t | Windows Server trial version expiration: wlms.exe initiates automated shutdown after 180 days | Check EventLog for wlms.exe shutdown pattern; extend trial period (up to 6 times, ~3 years); or activate with full licen | 🟢 8.5 | [ADO Wiki] |
| 6 📋 | VM deployment on Azure Stack Edge fails at last step with ProvisioningTimeOut error | IP assigned to VM already in use by Kubernetes host IPs which ASE cannot detect; other causes: bad i | Check IP conflicts with K8s host IPs; try different IP; verify image preparation; check gateway/DNS; for Linux verify cl | 🟢 8.5 | [ADO Wiki] |

## 快速排查路径

1. Customer wants to monitor Azure Stack Edge hardware temperature; temperature not → Configure BMC interface via PowerShell with IP/Gateway/Subnet/Password; connect BMC port to host mac `[来源: ado-wiki]`
2. Customer running Azure Private 5G Core (AP5GC) or AKS on Azure Stack Edge; case  → Ask customer if running 5G workloads on ASE; if yes, reroute case to Azure For Operators support tea `[来源: ado-wiki]`
3. Azure Stack Edge Kubernetes or custom VM showing alerts/errors for low or insuff → Enter support session; Get-VM to find VM name; Stop-VM; Set-VMMemory -VMName <name> -StartupBytes <a `[来源: ado-wiki]`
4. VM on Azure Stack Edge fails to boot after disk resize; OS error 0xC0000098 requ → Connect to VM console; Option 1: create repair VM, attach disk, attempt fix; Option 2: rebuild VM fr `[来源: ado-wiki]`
5. Windows Server VM on Azure Stack Edge stops unexpectedly after ~180 days; VM sho → Check EventLog for wlms `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ase-compute.md#排查流程)
