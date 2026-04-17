# AVD Licensing & KMS Activation Reference (Mooncake)

> Source: OneNote - Mooncake POD Support Notebook / AVD / Common Issues / Licensing

## 1. License Requirements

- AVD session host VMs require appropriate licensing per [Azure China docs](https://docs.azure.cn/en-us/virtual-desktop/prerequisites#operating-systems-and-licenses)
- Windows Enterprise E3 license holders do not need additional activation for AVD VMs

## 2. KMS Activation (Mooncake)

Azure China KMS servers:
- `kms.core.chinacloudapi.cn:1688`
- `azkms.core.chinacloudapi.cn:1688`

Reference: [Troubleshoot activation problems](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/troubleshoot-activation-problems)

## 3. licenseType Parameter

- AVD deployment templates automatically include `"licenseType": "Windows_Client"` on VM objects
- This parameter is equivalent to checking "I already have a Windows license" during VM creation
- **With** `licenseType: Windows_Client` → billed as "Dsv5 Series" (compute only, no Windows license fee)
- **Without** `licenseType` → billed as "Dsv5 Series Windows" (includes Windows license fee)

### Known Issue: ASR Replication Drops licenseType

- Azure Site Recovery (ASR) confirmed by PG: VM replication **discards** the `licenseType` parameter
- Result: replicated VMs are created without license benefit → higher billing
- Fix: manually set `licenseType` after failover

## 4. Pricing Note (azure.cn)

- The Azure.cn AVD pricing page states AVD VMs are charged at "Linux compute rate" — this is technically inaccurate
- Correct description: AVD VMs do not charge Windows license fee, only base compute instance fee
- Linux VMs also only charge base compute fee, so the cost is the same, but it should not be described as "Linux rate"

## 5. How to Apply License

- [Apply Windows license to session host VM](https://docs.azure.cn/en-us/virtual-desktop/apply-windows-license#apply-a-windows-license-to-a-session-host-vm)
