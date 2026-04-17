---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======2. VM & VMSS=======/2.10 [VM]How to enable local administrator if you.md"
sourceUrl: null
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Enable Local Administrator Without RDP Access

## Scenario

Windows VMs managed by domain accounts with local administrator disabled. If VM loses DC connectivity, no way to login for troubleshooting.

## Solutions

### Option 1: VMAccess Extension (VM Agent Running)

Reset password via VMAccess extension in Azure portal:

- **Different name** than current local admin → creates new local admin account with specified password
- **Same name** as existing local admin → resets password
- **Disabled account** → enables it automatically

### Option 2: Offline Method (VM Agent Not Responding)

Follow the official guide to reset local password without agent:
https://docs.azure.cn/zh-cn/virtual-machines/troubleshooting/reset-local-password-without-agent

This involves:
1. Detach OS disk
2. Attach to repair VM
3. Modify registry to enable local admin
4. Reattach OS disk to original VM
