# Intune Windows Hello for Business 与 KDC — 综合排查指南

**条目数**: 10 | **草稿融合数**: 1 | **Kusto 查询融合**: 0
**来源草稿**: onenote-whfb-kerberos-cloud-trust-intune.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: Whfb Kerberos Cloud Trust Intune
> 来源: OneNote — [onenote-whfb-kerberos-cloud-trust-intune.md](../drafts/onenote-whfb-kerberos-cloud-trust-intune.md)

**Windows Hello for Business — Kerberos Cloud Trust 部署指南（Intune 策略）**
**前提条件**
- AAD & Intune 许可证
- Hybrid AADJ 环境（DRS 已完成 + Intune 注册已完成）
- 参考：[Windows Hello for Business Deployment Prerequisites](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-identity-verification#hybrid-deployments)

**Step 1: 部署 MS Entra Kerberos**
```powershell

**安装模块（依赖 AzureADPreview）**

**配置参数**

**在 AD 中创建 Azure AD Kerberos Server 对象并发布到 Azure AD**

**验证**
```

**Step 2: 配置 Intune 策略**
1. **启用 WHFB**：Intune > Device configuration > Windows Hello for Business policy → Enable
2. **配置 Kerberos Cloud Trust profile**（自定义 OMA-URI）：

**Step 3: 验证 WHFB 配置**

**验证命令**
```cmd
```
- `OnPremTgt`（又称 rodctgt/mcticket）：Cloud Trust 开启后 AAD 作为 RODC 发给用户的 partial TGT，需联系 onprem DC 换取完整 TGT
- `CloudTgt`：AAD 发给用户的 TGT，用于访问支持 Kerberos 的 Azure 资源（如 Azure File Share）
```cmd
```

**注册表验证**

**参考链接**
- [Azure AD Kerberos Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/861817/Azure-AD-Kerberos)

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Hybrid Azure AD joined device fails to receive user-based SCEP certificate. SCEP profile is confi... | SCEP certificate profile Key Storage Provider (KSP) is set to Windows Hello f... | Change the SCEP certificate profile KSP setting from 'Windows Hello for Business' to 'Enroll to T... | 🟢 9.0 | OneNote |
| 2 | Windows Hello for Business (WHFB) Identity Protection profile set to Enabled for a user group doe... | Tenant-wide Windows Enrollment WHfB policy is set to Disabled. The Enrollment... | Set tenant-wide Windows Enrollment WHfB policy to 'Not Configured' (not Disabled), then use Ident... | 🟢 9.0 | OneNote |
| 3 | WHFB provisioning UI fails to load, CloudExperienceHost app cannot launch, ShellCore_Oper.evtx sh... | CXH app cache not cleared properly, known bug on OS versions below Nickel (22H2) | WAM recovery: 1) Rename %localappdata%\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy to .back... | 🟢 8.5 | ADO Wiki |
| 4 | WHFB configured but all Sign-in Options grayed out in Settings | AllowSignInOptions registry value set to 0 by Intune policy or GPO | Set HKLM\SOFTWARE\Microsoft\PolicyManager\default\Settings\AllowSignInOptions Value to 1, check I... | 🟢 8.5 | ADO Wiki |
| 5 | Key Admins and Enterprise Key Admins security group names not displayed after AD 2016 schema upgrade | RID 526/527 friendly name resolution requires Windows Server 2016 DC to hold ... | Move PDC Emulator FSMO to 2016 DC: Move-ADDirectoryServerOperationMasterRole -Identity dc2016 -Op... | 🟢 8.5 | ADO Wiki |
| 6 | Biometric data (fingerprint/facial recognition) lost after Windows in-place upgrade | Biometric device had Allow computer to turn off this device to save power che... | Before upgrade, uncheck Allow computer to turn off this device to save power for biometric reader... | 🟢 8.5 | ADO Wiki |
| 7 | WHFB provisioning fails after cross-domain migration with error 0x801C0451 (DSREG_E_USER_TOKEN_SW... | WAM cache contains stale tokens from old domain | 1) certutil -deletehellocontainer 2) dsregcmd /leave + /join if device also migrated 3) Clear WAM... | 🟢 8.5 | ADO Wiki |
| 8 | WHFB Key Trust PIN sign-in fails with That option is temporarily unavailable | Client can only access RODC, msDS-KeyCredentialLink attribute not replicated ... | Ensure client has access to writable Domain Controller (Writable DC), RODC does not support WHFB ... | 🟢 8.5 | ADO Wiki |
| 9 | Endpoint Security support boundary reference — which teams own which security features when setti... |  | Support boundaries: Defender Application Guard → Windows UEX \| Firewall → Windows Networking \| ... | 🟢 8.5 | ADO Wiki |
| 10 | WHFB provisioning fails at ADFS redirect with Error Code: 0X801C044F | ADFS configuration issue causing device registration service authentication f... | Collect ADFS logs and client User Device Registration/Admin event logs, verify ADFS DRS configura... | 🔵 7.5 | ADO Wiki |
