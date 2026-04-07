# VM Vm Disk Storage F — 排查速查

**来源数**: 1 | **21V**: 未标注
**条目数**: 4 | **关键词**: disk, storage, f
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Need to perform Windows Server in-place upgrade on Azure VM (e.g. 2012R2->2016/2019, 2016->2019/2022... | Windows Server in-place upgrade requires following specific supported upgrade pa... | 1) Always snapshot before upgrade; 2) Supported: 2012->2012R2/2016, 2012R2->2016... | 🔵 7.5 | OneNote |
| 2 | After CrowdStrike BSOD fix, Azure VM fails to boot with winload.exe error 0xC000000E or winload.efi ... | BCD corruption or incorrect OS disk reference after OS disk swap during CrowdStr... | 0xC000000E: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machine... | 🔵 7.5 | OneNote |
| 3 | During CrowdStrike BSOD repair, BitLocker-encrypted disk requires recovery key that customer cannot ... | BitLocker recovery key location depends on join type: AD-joined, AAD-joined, or ... | AD: Get-ADObject -Filter msFVE-RecoveryInformation on DC/RSAT server. AAD (Moonc... | 🔵 7.5 | OneNote |
| 4 | Palo Alto firewall VM fails to convert from unmanaged disk to managed disk; extensions (OMSAgentForL... | Azure VM extensions are not in the support matrix for Palo Alto OS. Extension op... | 1) Attempt extension removal: az vm extension delete -g <RG> --vm-name <VM> -n <... | 🔵 7.5 | OneNote |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-disk-storage-f.md)
