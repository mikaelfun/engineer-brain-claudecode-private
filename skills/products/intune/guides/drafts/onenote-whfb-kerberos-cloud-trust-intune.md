---
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Azure AD _ Ms Entra ID/Authentication/Windows Hello for business/Lab record/Lab - WHFB Kerberos cloud trust with Intune.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Windows Hello for Business — Kerberos Cloud Trust 部署指南（Intune 策略）

## 前提条件

- AAD & Intune 许可证
- Hybrid AADJ 环境（DRS 已完成 + Intune 注册已完成）
- 参考：[Windows Hello for Business Deployment Prerequisites](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-identity-verification#hybrid-deployments)

## Step 1: 部署 MS Entra Kerberos

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

## Step 2: 配置 Intune 策略

参考：[WHFB cloud Kerberos trust configuration](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cloud-kerberos-trust-provision?tabs=intune)

1. **启用 WHFB**：Intune > Device configuration > Windows Hello for Business policy → Enable

2. **配置 Kerberos Cloud Trust profile**（自定义 OMA-URI）：
   | 字段 | 值 |
   |------|-----|
   | URI | `./Device/Vendor/MSFT/PassportForWork/{tenantId}/Policies/UseCloudTrustForOnPremAuth` |
   | 数据类型 | Boolean |
   | 值 | True |

## Step 3: 验证 WHFB 配置

策略生效后，用户下次重启或登录时将被引导配置 WHFB。

### 验证命令

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

### 注册表验证
检查 PassportForWork 相关注册表项是否正确配置。

## 参考链接
- [Azure AD Kerberos Overview](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/861817/Azure-AD-Kerberos)
