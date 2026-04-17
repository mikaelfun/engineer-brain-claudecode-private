# Disk Azure Stack Edge: Device Management — 排查速查

**来源数**: 4 | **21V**: 全部适用
**最后更新**: 2026-04-07
**关键词**: 403-error, activation-key, automation, az.stackedge, azure-policy, azure-stack-edge, bios, clusterperformancehistory, no_param, powershell

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Unable to generate activation key for Azure Stack Edge (ASE); 403 error: Resource was disallowed by policy | Azure Policy blocking creation of public endpoints, or user account lacks owner/contributor rights o | Verify account has owner or contributor rights; check for Azure Policy blocking endpoint creation; remove or adjust the  | 🟢 8.5 | [ADO Wiki] |
| 2 📋 | Need to find BIOS version of Azure Stack Edge device | BIOS version information is not directly accessible via portal or CLI; it is only available in the s | Collect support package from ASE device; BIOS version can be found at \cmdlets\platform\systeminfo.txt in the support pa | 🟢 8.5 | [ADO Wiki] |
| 3 📋 | Azure Stack Edge upgrade failing from Azure Portal with error code NO_PARAM; update process fails | Cluster Virtual Disk (ClusterPerformanceHistory) resource is Offline; can occur when updating from v | Enter Support Session; Start-ClusterResource for ClusterPerformanceHistory; confirm Online; retry upgrade from Azure Por | 🟢 8.5 | [ADO Wiki] |
| 4 📋 | Need to set up and use Az.StackEdge PowerShell module for Azure Stack Edge automation |  | Install Azure Az PowerShell module; Connect-AzAccount; verify subscription with Get-AzContext (Set-AzContext if needed); | 🟢 8.0 | [ADO Wiki] |

## 快速排查路径

1. Unable to generate activation key for Azure Stack Edge (ASE); 403 error: Resourc → Verify account has owner or contributor rights; check for Azure Policy blocking endpoint creation; r `[来源: ado-wiki]`
2. Need to find BIOS version of Azure Stack Edge device → Collect support package from ASE device; BIOS version can be found at \cmdlets\platform\systeminfo `[来源: ado-wiki]`
3. Azure Stack Edge upgrade failing from Azure Portal with error code NO_PARAM; upd → Enter Support Session; Start-ClusterResource for ClusterPerformanceHistory; confirm Online; retry up `[来源: ado-wiki]`
4. Need to set up and use Az.StackEdge PowerShell module for Azure Stack Edge autom → Install Azure Az PowerShell module; Connect-AzAccount; verify subscription with Get-AzContext (Set-A `[来源: ado-wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/ase-hardware.md#排查流程)
