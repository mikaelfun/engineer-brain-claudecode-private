---
source: onenote
sourceRef: "MCVKB/VM+SCIM/=======12. ASR=======/12.2 SLES 11 SP4 VM cannot enable ASR A2A replicat.md"
sourceUrl: "https://docs.microsoft.com/en-us/azure/site-recovery/site-recovery-azure-to-azure-troubleshoot-errors#trusted-root-certificates-error-code---151066"
importDate: "2026-04-04"
type: known-issue
knownIssueId: vm-onenote-057
---

# ASR A2A: SLES 11 SP4 VM 无法启用复制（SSL 证书不信任）

## 症状

- SLES 11 SP4 VM 无法启用 ASR Azure-to-Azure (A2A) 复制
- Mobility Service 安装失败
- `/var/log/AzureRcmCli.log` 中出现：
  ```
  ERROR: FAILED Could not perform curl. Curl error: (60) Peer certificate cannot be authenticated with given CA certificates
  ERROR: Post failed: Get bearer token request failed. Error: 60
  ERROR: RegisterMachine failed with error: 20498
  ```

## 根本原因

SLES 11 SP4 的 `/etc/ssl/certs` 中缺少以下根 CA 证书，或未创建 hash 符号链接：

| 证书 | 说明 |
|------|------|
| VeriSign_Class_3_Public_Primary_Certification_Authority_G5.pem | Symantec 根 CA |
| Baltimore_CyberTrust_Root.pem | DigiCert 根 CA |
| DigiCert_Global_Root_CA.pem | DigiCert 根 CA |

## 诊断步骤

1. 检查 Extension 日志：
   ```bash
   cat /var/log/azure/Microsoft.Azure.RecoveryServices.SiteRecovery.LinuxSLES11SP4/1.0.0.6/CommandExecution.log
   cat /var/log/AzureRcmCli.log
   ```

2. 确认 curl error 60 存在

## 修复步骤

```bash
cd /etc/ssl/certs

# 1. 检查 VeriSign 证书
ls VeriSign_Class_3_Public_Primary_Certification_Authority_G5.pem
# 如不存在则下载
wget https://www.symantec.com/content/dam/symantec/docs/other-resources/verisign-class-3-public-primary-certification-authority-g5-en.pem \
     -O VeriSign_Class_3_Public_Primary_Certification_Authority_G5.pem

# 2. 检查 Baltimore 证书
ls Baltimore_CyberTrust_Root.pem
# 如不存在则下载
wget http://www.digicert.com/CACerts/BaltimoreCyberTrustRoot.crt.pem \
     -O Baltimore_CyberTrust_Root.pem

# 3. 重新生成 hash 符号链接
c_rehash

# 4. 手动创建 hash 副本（SLES 11 SP4 特殊要求）
cp VeriSign_Class_3_Public_Primary_Certification_Authority_G5.pem b204d74a.0
cp Baltimore_CyberTrust_Root.pem 653b494a.0
cp DigiCert_Global_Root_CA.pem 3513523f.0

# 5. 验证
ls -l 653b494a.0 b204d74a.0 3513523f.0
```

## 最终步骤

禁用复制 → 删除复制项 → 重新启用复制。

> ⚠️ 此 workaround 仅适用于 SLES 11 SP4 VM。
