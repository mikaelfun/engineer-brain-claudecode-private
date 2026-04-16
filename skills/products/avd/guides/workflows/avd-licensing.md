# AVD 许可证 — 排查工作流

**来源草稿**: ado-wiki-a-billing-solution.md, onenote-avd-licensing-reference.md
**Kusto 引用**: (无)
**场景数**: 7
**生成日期**: 2026-04-07

---

## Scenario 1: AVD Licensing & KMS Activation Reference (Mooncake)
> 来源: onenote-avd-licensing-reference.md | 适用: Mooncake \u2705

### 排查步骤
> Source: OneNote - Mooncake POD Support Notebook / AVD / Common Issues / Licensing

## Scenario 2: 1. License Requirements
> 来源: onenote-avd-licensing-reference.md | 适用: Mooncake \u2705

### 排查步骤
   - AVD session host VMs require appropriate licensing per [Azure China docs](https://docs.azure.cn/en-us/virtual-desktop/prerequisites#operating-systems-and-licenses)
   - Windows Enterprise E3 license holders do not need additional activation for AVD VMs

## Scenario 3: 2. KMS Activation (Mooncake)
> 来源: onenote-avd-licensing-reference.md | 适用: Mooncake \u2705

### 排查步骤
Azure China KMS servers:
   - `kms.core.chinacloudapi.cn:1688`
   - `azkms.core.chinacloudapi.cn:1688`
Reference: [Troubleshoot activation problems](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshoot-activation-problems)

## Scenario 4: 3. licenseType Parameter
> 来源: onenote-avd-licensing-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - AVD deployment templates automatically include `"licenseType": "Windows_Client"` on VM objects
   - This parameter is equivalent to checking "I already have a Windows license" during VM creation
   - **With** `licenseType: Windows_Client` → billed as "Dsv5 Series" (compute only, no Windows license fee)
   - **Without** `licenseType` → billed as "Dsv5 Series Windows" (includes Windows license fee)

## Scenario 5: Known Issue: ASR Replication Drops licenseType
> 来源: onenote-avd-licensing-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Azure Site Recovery (ASR) confirmed by PG: VM replication **discards** the `licenseType` parameter
   - Result: replicated VMs are created without license benefit → higher billing
   - Fix: manually set `licenseType` after failover

## Scenario 6: 4. Pricing Note (azure.cn)
> 来源: onenote-avd-licensing-reference.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - The Azure.cn AVD pricing page states AVD VMs are charged at "Linux compute rate" — this is technically inaccurate
   - Correct description: AVD VMs do not charge Windows license fee, only base compute instance fee
   - Linux VMs also only charge base compute fee, so the cost is the same, but it should not be described as "Linux rate"

## Scenario 7: 5. How to Apply License
> 来源: onenote-avd-licensing-reference.md | 适用: Mooncake \u2705

### 排查步骤
   - [Apply Windows license to session host VM](https://docs.azure.cn/en-us/virtual-desktop/apply-windows-license#apply-a-windows-license-to-a-session-host-vm)
