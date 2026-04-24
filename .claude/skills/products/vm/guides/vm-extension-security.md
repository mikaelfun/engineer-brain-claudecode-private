# VM 安全扩展 (Defender) — 排查速查

**来源数**: 1 (AW) | **条目**: 6 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Defender for Cloud 显示 'Windows/Linux virtual machines should enable Azure Disk Encryption or Encrypt | VM 未配置系统分配的托管标识（System-assigned managed identity），或未在 Extensions + applications  | 1. 为 VM 启用系统分配的托管标识；2. 在 VM 的 Extensions + applications 下启用 Azure Policy（Azure A | 🔵 7.5 | AW |
| 2 | Customer reports vulnerability scanner findings or alerts on Azure VM (Microsoft Defender or 3rd-par |  | 1) Gather: scanner name/vendor, Microsoft vs 3rd-party, version (if Defender), a | 🔵 7.5 | AW |
| 3 | Azure Advisor category score (Reliability, Security, Cost, Operational Excellence, or Performance) s | Possible causes: (1) No applicable resources for that category to compute score, | Query Advisor Score Kusto cluster (advscoreadxwus3prod.westus3.kusto.windows.net | 🔵 7.5 | AW |
| 4 | Cannot RDP to Azure VM. netsh advfirewall show allprofiles state returns error 0x45b. Windows Defend | Duplicate SIDs accumulated in registry HKLM\SYSTEM\ControlSet001\Services\mpssvc | Create rescue nested VM (Hyper-V). Open regedit, navigate to HKLM\SYSTEM\Control | 🔵 7.5 | AW |
| 5 | Azure VM has no RDP connectivity. VM screenshot shows OS at credentials screen. Windows Firewall ser | Windows Firewall service (MpsSvc) is not running due to: (1) service disabled, ( | OFFLINE: Attach OS disk to rescue VM. Fix 1 (disabled): Enable service via regis | 🔵 7.5 | AW |
| 6 | Azure Advisor Security Score displays "No Data" instead of a numerical value; security category scor | Latency refresh issue between Microsoft Defender for Cloud (MDC) Secure Score an | Wait 24-48 hours for refresh to complete; compare MDC Secure Score with Advisor  | 🔵 6.5 | AW |

## 快速排查路径

1. **Defender for Cloud 显示 'Windows/Linux virtual machines should enable Azure Disk E**
   - 根因: VM 未配置系统分配的托管标识（System-assigned managed identity），或未在 Extensions + applications 中启用 Azure Automanage Machine Configurati
   - 方案: 1. 为 VM 启用系统分配的托管标识；2. 在 VM 的 Extensions + applications 下启用 Azure Policy（Azure Automanage Machine Configuration）；详细选项参见内部 TSG：https://supportability.v
   - `[🔵 7.5 | AW]`

2. **Customer reports vulnerability scanner findings or alerts on Azure VM (Microsoft**
   - 方案: 1) Gather: scanner name/vendor, Microsoft vs 3rd-party, version (if Defender), alert details, OS versions, number of VMs affected, alert type, screens
   - `[🔵 7.5 | AW]`

3. **Azure Advisor category score (Reliability, Security, Cost, Operational Excellenc**
   - 根因: Possible causes: (1) No applicable resources for that category to compute score, (2) Subscription status changed from Ac
   - 方案: Query Advisor Score Kusto cluster (advscoreadxwus3prod.westus3.kusto.windows.net) database AdvisorScore table Advisor_Score filtering by Category and 
   - `[🔵 7.5 | AW]`

4. **Cannot RDP to Azure VM. netsh advfirewall show allprofiles state returns error 0**
   - 根因: Duplicate SIDs accumulated in registry HKLM\SYSTEM\ControlSet001\Services\mpssvc\Parameters\AppCs\DebugedLoopbackApps. E
   - 方案: Create rescue nested VM (Hyper-V). Open regedit, navigate to HKLM\SYSTEM\ControlSet001\Services\mpssvc\Parameters\AppCs. Rename DebugedLoopbackApps to
   - `[🔵 7.5 | AW]`

5. **Azure VM has no RDP connectivity. VM screenshot shows OS at credentials screen. **
   - 根因: Windows Firewall service (MpsSvc) is not running due to: (1) service disabled, (2) service crashing, (3) service hanging
   - 方案: OFFLINE: Attach OS disk to rescue VM. Fix 1 (disabled): Enable service via registry HKLM\SYSTEM\ControlSet001\Services\MpsSvc - set Start=2 (Automatic
   - `[🔵 7.5 | AW]`

