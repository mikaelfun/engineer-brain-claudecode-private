# ARM Azure Stack Hub 通用问题 — 排查速查

**来源数**: 6 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | CimException from Get-DSCLocalConfigurationManager on Azure Stack Hub infrastructure VMs and physic… | DSC Local Configuration Manager encounters a CIM exception on infrastructure nodes, indicating pote… | Run Test-AzsSupportKIDSCConfigManagerCimException from CSSTools Azs.Support module to detect the is… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 2 | Raw performance data counters cannot be returned on Azure Stack Hub physical hosts, indicating perf… | Performance counter registry settings on physical hosts are corrupted, preventing retrieval of raw … | Run Test-AzsSupportKIPerfCounterDataCorruption to detect. Use -Remediate flag to automatically run … | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 3 | Event ID 5612 from Microsoft-Windows-WMI provider on Azure Stack Hub indicating WMI quota violation… | WMI provider host exceeds its quota limit, triggering Event ID 5612 and forceful restart of WMIPRVS… | Run Test-AzsSupportKIWMIID5612QuotaViolation from CSSTools Azs.Support module to detect WMI quota v… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 4 | WMI Provider Host process (WMIPRVSE) memory leak on Azure Stack Hub physical hosts | WMI Provider Host process has a memory leak on physical hosts, consuming increasing amounts of memo… | Run Test-AzsSupportKIWMIPrvseMemoryLeak to detect. Use -Remediate flag to automatically address the… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 5 | Missing WinRM registry keys on Azure Stack Hub infrastructure nodes causing remote management failu… | Required WinRM registry keys are missing from infrastructure nodes, preventing proper Windows Remot… | Run Test-AzsSupportKIWinrmRegistryKeysMissing to detect. Use -Remediate flag to automatically resto… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 6 | InfraVM and Baremetal computers not accessible through WinRM on Azure Stack Hub (connection timeout) | WinRM transport layer connectivity issue causing timeouts when connecting to infrastructure VMs and… | Run Test-AzsSupportKIWinrmTransportTimeout from CSSTools Azs.Support module to verify WinRM accessi… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run Test-AzsSupportKIDSCConfigManagerCimException from CSSTools Azs.Support mod… `[来源: ado-wiki]`
2. Run Test-AzsSupportKIPerfCounterDataCorruption to detect. Use -Remediate flag t… `[来源: ado-wiki]`
3. Run Test-AzsSupportKIWMIID5612QuotaViolation from CSSTools Azs.Support module t… `[来源: ado-wiki]`
