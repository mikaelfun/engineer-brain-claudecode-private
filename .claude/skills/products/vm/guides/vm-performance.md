# VM VM 性能问题 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 8 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Black screen after RDP on Windows 10 RS3 VM deployed with single CPU (MicrosoftWindowsDesktop.Window | Known issue with Windows 10 RS3 image: when deployed with only 1 CPU, the OS han | Resize the VM to a size with 2 or more CPUs. With 2 CPUs the OS will complete in | 🔵 7.5 | AW |
| 2 | Azure Advisor returns zero recommendations for newly created resources or no usage/performance-based | Advisor needs minimum data history: general recommendations require at least 24  | Verify resource age. Wait at least 24 hours for general recommendations and up t | 🔵 7.5 | AW |
| 3 | Burstable VM (B-series / Bsv2 / Basv2 / Bpsv2) CPU performance suddenly drops or throttles, workload | CPU credit balance exhausted. Burstable VMs use a credit-based model: credits ac | 1) Verify via Azure Metrics: check 'CPU Credits Remaining' metric. 2) If credits | 🔵 7.5 | AW |
| 4 | Customer reports poor CPU performance on B-series VM, comparing it unfavorably to other VM SKUs of s | B-series VMs have a baseline CPU percentage (e.g., 10-40% of vCPU). Only when cr | Educate customer on Burstable VM credit model: baseline CPU %, credit accumulati | 🔵 7.5 | AW |
| 5 | Error: 'Swapping OS Disk is not allowed since CPU Architecture property X for the VM size Y is not s | Customer tried to swap the OS disk on an Arm64 VM with an x86/x64 OS disk; the r | When swapping the OS disk on an Arm64 VM, the replacement OS disk must also be a | 🔵 6.5 | AW |
| 6 | Mooncake 应用完成 AAD 登录后，持续重复调用 login.microsoftonline.com/common/discovery/instance 和 openid-configurat | 应用使用 MSAL 库获取 token 时，代码实现导致登录完成后仍反复触发 metadata discovery 请求 | 检查 MSAL token 获取代码，确保使用 token cache 避免重复 discovery 调用；参考 MSAL 官方文档优化 token acqui | 🔵 6.5 | ON |
| 7 | NVv3 VM (Nvidia Tesla M60) GPU issues with GRID driver version 17.x — driver incompatibility | GRID Driver version 17.x is incompatible with NVv3 series VMs using Tesla M60 GP | Follow TSG: AzureIaaSVM wiki 'NVv3 (Nvidia Tesla M60) GRID Driver version 17.x I | 🔵 6.5 | ON |
| 8 | Error 'Swapping OS Disk is not allowed since CPU Architecture property for the VM size is not suppor | The replacement OS disk uses a different CPU architecture (e.g. x64) from the Ar | When swapping OS disk on an Arm64 VM, the replacement OS disk must be an Arm64-c | 🔵 6.5 | AW |

## 快速排查路径

1. **Black screen after RDP on Windows 10 RS3 VM deployed with single CPU (MicrosoftW**
   - 根因: Known issue with Windows 10 RS3 image: when deployed with only 1 CPU, the OS hangs during initialization while trying to
   - 方案: Resize the VM to a size with 2 or more CPUs. With 2 CPUs the OS will complete initialization (though slowly at first). More CPUs = faster first boot c
   - `[🔵 7.5 | AW]`

2. **Azure Advisor returns zero recommendations for newly created resources or no usa**
   - 根因: Advisor needs minimum data history: general recommendations require at least 24 hours, usage/performance-based recommend
   - 方案: Verify resource age. Wait at least 24 hours for general recommendations and up to 14 days for usage/performance recommendations. For Security recommen
   - `[🔵 7.5 | AW]`

3. **Burstable VM (B-series / Bsv2 / Basv2 / Bpsv2) CPU performance suddenly drops or**
   - 根因: CPU credit balance exhausted. Burstable VMs use a credit-based model: credits accumulate when CPU < baseline, are consum
   - 方案: 1) Verify via Azure Metrics: check 'CPU Credits Remaining' metric. 2) If credits depleted, this is expected platform behavior — not a platform fault. 
   - `[🔵 7.5 | AW]`

4. **Customer reports poor CPU performance on B-series VM, comparing it unfavorably t**
   - 根因: B-series VMs have a baseline CPU percentage (e.g., 10-40% of vCPU). Only when credit balance > 0 can the VM burst to 100
   - 方案: Educate customer on Burstable VM credit model: baseline CPU %, credit accumulation rate, and burst behavior. B-series is designed for workloads with l
   - `[🔵 7.5 | AW]`

5. **Error: 'Swapping OS Disk is not allowed since CPU Architecture property X for th**
   - 根因: Customer tried to swap the OS disk on an Arm64 VM with an x86/x64 OS disk; the replacement disk architecture must match 
   - 方案: When swapping the OS disk on an Arm64 VM, the replacement OS disk must also be an Arm64 OS disk (Gen2, with Arm64-compatible OS image).
   - `[🔵 6.5 | AW]`

