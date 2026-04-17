# Intune Windows Hello for Business 与 KDC — 排查工作流

**来源草稿**: onenote-whfb-kerberos-cloud-trust-intune.md
**Kusto 引用**: (无)
**场景数**: 4
**生成日期**: 2026-04-07

---

## Portal 路径

- `Intune > Device configuration > Windows Hello for Business policy`

## Scenario 1: Step 1: 部署 MS Entra Kerberos
> 来源: onenote-whfb-kerberos-cloud-trust-intune.md | 适用: Mooncake ✅

### 排查步骤

文档：[Install Azure AD Kerberos PowerShell module](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-passwordless-security-key-on-premises#install-the-azure-ad-kerberos-powershell-module)

```powershell
# 安装模块（依赖 AzureADPreview）
Install-Module -Name AzureADHybridAuthenticationManagement -AllowClobber

# 配置参数
$domain = $env:USERDNSDOMAIN
$userPrincipalName = "admin@yourtenant.partner.onmschina.cn"
$domainCred = Get-Credential

# 在 AD 中创建 Azure AD Kerberos Server 对象并发布到 Azure AD
Set-AzureADKerberosServer -Domain $domain -UserPrincipalName $userPrincipalName -DomainCredential $domainCred

# 验证
Get-AzureADKerberosServer -Domain $domain -UserPrincipalName $userPrincipalName -DomainCredential (Get-Credential)
```

> 注意：4 种认证方法本质上执行同一操作，区别仅在于认证方式，选择适合你环境的方法。

完成后，DC 上会生成 2 个对象，AAD Audit log 中可看到 "Add Kerberos Domain" 记录。

## Scenario 2: Step 2: 配置 Intune 策略
> 来源: onenote-whfb-kerberos-cloud-trust-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

参考：[WHFB cloud Kerberos trust configuration](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cloud-kerberos-trust-provision?tabs=intune)

1. **启用 WHFB**：Intune > Device configuration > Windows Hello for Business policy → Enable

2. **配置 Kerberos Cloud Trust profile**（自定义 OMA-URI）：
   | 字段 | 值 |
   |------|-----|
   | URI | `./Device/Vendor/MSFT/PassportForWork/{tenantId}/Policies/UseCloudTrustForOnPremAuth` |
   | 数据类型 | Boolean |
   | 值 | True |

## Scenario 3: 验证命令
> 来源: onenote-whfb-kerberos-cloud-trust-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

```cmd
dsregcmd /status
```

观察输出：
- `OnPremTgt`（又称 rodctgt/mcticket）：Cloud Trust 开启后 AAD 作为 RODC 发给用户的 partial TGT，需联系 onprem DC 换取完整 TGT
- `CloudTgt`：AAD 发给用户的 TGT，用于访问支持 Kerberos 的 Azure 资源（如 Azure File Share）

```cmd
klist cloud_debug
```

| 显示名 | 代码名 | 用途 |
|--------|--------|------|
| Cloud Primary (Hybrid logon) TGT available | mcticket / rodctgt | 用于 FIDO 登录或 WHFB Cloud Trust；提交给 onprem DC 换取完整 TGT |
| Cloud Referral TGT present in cache | cloudtgt | 获取 legacy Kerberos 应用的 service ticket（提交给 AAD） |

## Scenario 4: 注册表验证
> 来源: onenote-whfb-kerberos-cloud-trust-intune.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤

检查 PassportForWork 相关注册表项是否正确配置。

## 参考链接
- [Azure AD Kerberos Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/861817/Azure-AD-Kerberos)

---

> ⚠️ **21V (Mooncake) 注意**: 本主题包含 21V 特有的限制或配置，请注意区分 Global 与 21V 环境差异。
