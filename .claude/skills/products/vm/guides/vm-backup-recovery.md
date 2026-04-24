# VM 备份与恢复 — 排查速查

**来源数**: 3 (AW, KB, ON) | **条目**: 5 | **21V**: 4/5
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VM screenshot shows BOOTMGR is missing, Press Ctrl+Alt+Del to restart. | OS boot process could not locate an active system partition. The partition holdi | Offline troubleshooting: attach OS disk to rescue VM. Use diskpart to set the sy | 🔵 7.5 | AW |
| 2 | Azure VM recovery points are not being deleted/cleaned even after their retention period has expired | When backup is disabled with 'Retain Backup' option selected (sets IsUnprotectWi | This is expected behavior. Verify using Kusto: (1) query BCMBackupStats to check | 🔵 7.5 | ON |
| 3 | VMSS management operations (update/scale) on MR-enabled tenant hosting Service Fabric cluster stuck  | Three possible causes on MR-enabled SF cluster: (a) incorrect Service Fabric con | Investigate by checking: 1) SF cluster durability tier (Gold/Silver = MR enabled | 🔵 7 | ON |
| 4 | The vm deployment failed for specific site. It used to fail at Install VM components stage with belo | This can happen if the 443 is bound to other application certificate. In my case | In log we found that deployment is failed with this hex code 0x80072F0D That cod | 🔵 6 | KB |
| 5 | [container] VM+SCIM Backup section index page |  | Section container page. No actionable content. | 🔵 5 | ON |

## 快速排查路径

1. **VM screenshot shows BOOTMGR is missing, Press Ctrl+Alt+Del to restart.**
   - 根因: OS boot process could not locate an active system partition. The partition holding BCD is not marked as active.
   - 方案: Offline troubleshooting: attach OS disk to rescue VM. Use diskpart to set the system partition as active: select disk > select partition > active. The
   - `[🔵 7.5 | AW]`

2. **Azure VM recovery points are not being deleted/cleaned even after their retentio**
   - 根因: When backup is disabled with 'Retain Backup' option selected (sets IsUnprotectWithRetainData=1 in backend), Azure Backup
   - 方案: This is expected behavior. Verify using Kusto: (1) query BCMBackupStats to check RecoveryPointId and IsExpired status; (2) query BMSProtectionStats to
   - `[🔵 7.5 | ON]`

3. **VMSS management operations (update/scale) on MR-enabled tenant hosting Service F**
   - 根因: Three possible causes on MR-enabled SF cluster: (a) incorrect Service Fabric configuration settings, (b) job stuck at Po
   - 方案: Investigate by checking: 1) SF cluster durability tier (Gold/Silver = MR enabled); 2) Policy Engine job status; 3) SF configuration correctness. Ref I
   - `[🔵 7 | ON]`

4. **The vm deployment failed for specific site. It used to fail at Install VM compon**
   - 根因: This can happen if the 443 is bound to other application certificate. In my case Azure site recovery(ASR) application wa
   - 方案: In log we found that deployment is failed with this hex code 0x80072F0D That code translates to Certificate issue We have verified the certificate and
   - `[🔵 6 | KB]`

5. **[container] VM+SCIM Backup section index page**
   - 方案: Section container page. No actionable content.
   - `[🔵 5 | ON]`

