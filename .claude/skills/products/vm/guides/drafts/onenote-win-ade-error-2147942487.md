---
id: vm-onenote-047
title: "Azure Disk Encryption 失败 error 2147942487 — FVE 策略冲突"
product: vm
quality: known-issue
tags: [ade, azure-disk-encryption, bitlocker, 2147942487, FVE, xts-aes-256, policy, registry]
sourceRef: "MCVKB/VM+SCIM/======= 4. Windows=======/4.9 [Win] Azure Disk Encryption failed to enable w.md"
---

## 症状

Windows VM 启用 Azure Disk Encryption (ADE) 失败，AzureDiskEncryption 扩展报错：

```
Error code: 2147942487
Win32EncryptableVolumeWrap::Encrypt failed with 2147942487
```

扩展日志路径：`C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Security.AzureDiskEncryption\<ver>\Bitlocker Extension`

## 根因

`HKLM\SOFTWARE\Policies\Microsoft\FVE` 下存在自定义 Group Policy 注册表键，与 ADE 所需的 **XTS_AES_256** 加密方法冲突。

例如：`EncryptionMethodWithXtsOs = XTS_AES_128`（与 ADE 默认不符）。

## 排查步骤

1. **检查日志**：
   - waagent: `C:\WindowsAzure\Logs\WaAppAgent`
   - ADE 扩展: `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Security.AzureDiskEncryption\<ver>\Bitlocker Extension`
   - 系统事件: `%SystemRoot%\System32\Winevt\Logs\System.evtx`

2. **对比 FVE 注册表**：
   - 与可正常启用 ADE 的 VM 对比 `HKLM\SOFTWARE\Policies\Microsoft\FVE`
   - 删除多余的自定义键（保留默认值即可）

3. **清理旧扩展**（如有之前失败的扩展残留）：
   ```bash
   az vm encryption disable --name <vm> --resource-group <rg> --volume-type all
   az vm extension delete -g <rg> --vm-name <vm> -n AzureDiskEncryption
   ```

4. 重试 ADE 启用

## 前置检查

启用 ADE 前确认满足所有先决条件：
- https://docs.microsoft.com/azure/virtual-machines/windows/disk-encryption-overview#supported-vms-and-operating-systems

## 参考

- Win32_EncryptableVolume Encrypt method: https://docs.microsoft.com/en-us/windows/win32/secprov/encrypt-win32-encryptablevolume
- ADE Quickstart: https://docs.azure.cn/zh-cn/virtual-machines/windows/disk-encryption-portal-quickstart
