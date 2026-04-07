---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======2. VM & VMSS=======/2.13 [VMSS] Autoscale using guest metrics (memory-.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# VMSS Autoscale Using Guest Metrics (Memory) on Linux

Reference: https://docs.azure.cn/zh-cn/virtual-machine-scale-sets/virtual-machine-scale-sets-mvss-guest-based-autoscale-linux

## Background

Azure portal does not natively show memory consumption as an autoscale metric for VMSS. To use guest OS memory metrics, you must configure it via ARM template with the diagnostics extension.

## Steps

1. **Create VMSS** in Azure portal with Manual Scale
2. **Export template** from VMSS → Settings → Export template
3. **Create Template Deployment** via Marketplace
4. **Edit template.json**:
   - 5.1: Add parameters for `storageAccountName` and `storageAccountSasToken`
   - 5.2: Modify extensionProfile to include diagnostics extension
   - 5.3: Add `autoscaleSettings` resource for memory-based autoscale (change `myScaleSet` to actual VMSS name)
5. **Create Storage Account** and record SAS token
6. **Deploy** custom template with the parameters (must select same resource group as VMSS)
7. **Wait** for deployment to complete
8. **Verify** autoscale metric now shows memory consumption
9. **Upgrade instances** to latest model

> Note: If pending changes require reboot, instances will reboot during upgrade. Adding extension alone won't cause reboot.
