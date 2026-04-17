---
source: onenote
sourceRef: "MCVKB/VM+SCIM/======= 13. Backup=======/13.3 [Backup]How Azure Backup Encryption works.md"
sourceUrl: null
importDate: "2026-04-04"
type: reference-guide
---

# Azure Backup 加密机制详解（DEK / KEK / Passphrase）

## 概述

Azure Backup（MARS agent）使用三层密钥体系：**Passphrase → KEK → DEK → 数据**

## 加密流程

1. **DEK（Data Encryption Key）**：Azure 为每台受保护机器自动生成唯一的 DEK，基于机器 GUID。数据压缩后用 DEK 加密，上传至 Recovery Services Vault (RSV)。

2. **KEK（Key Envelop Key）**：用用户设定的 **Passphrase** 加密 DEK，生成 KEK。加密后的 DEK 随每个 Recovery Point 一起存储。

3. **Passphrase**：由用户设定（最少 16 字符）或自动生成。Microsoft 不直接用 Passphrase 加密数据，而是用它加密 DEK。

## 关键问题解答

### 修改 Passphrase 后，旧备份还能恢复吗？

**可以**。修改 Passphrase 的过程：
1. 将加密的 DEK 发回本地（on-premises）
2. 用旧 Passphrase 解密 DEK
3. 用新 Passphrase 重新加密 DEK
4. 将新加密的 DEK 发回 RSV

因此只有 DEK 被重新加密，备份数据本身不需要传输，效率高。旧的 Recovery Point 仍然可以用（更新后的 DEK 已重新加密存储）。

### Passphrase 丢失会怎样？

如果受保护机器崩溃且 Passphrase 丢失，数据将无法恢复。**务必将 Passphrase 保存在安全位置**。

## 参考

- Azure Backup Deep Dive: https://novacontext.com/azure-backup-deep-dive/#data-transfer-compression-and-encryption
