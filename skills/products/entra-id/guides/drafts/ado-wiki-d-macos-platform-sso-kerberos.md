---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Apple Devices/MacOS Platform SSO Configuring Kerberos SSO"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=/Authentication/Device_Registration/Apple_Devices/MacOS_Platform_SSO_Configuring_Kerberos_SSO"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# macOS Platform SSO — Configuring Kerberos SSO

在已配置 Platform SSO 的 macOS 环境中，进一步配置 Kerberos SSO MDM profile，可同时获得本地 AD 和 Microsoft Entra ID 的 Kerberos TGT，实现对各类资源的 SSO。

---

## 前提条件

- macOS 已配置 Platform SSO：https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1220619/MacOS-Platform-SSO-Extension
- 已在本地资源端配置 Microsoft Entra Kerberos：[Deploy Microsoft Entra Kerberos](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/deploy/hybrid-cloud-kerberos-trust?tabs=intune#deploy-microsoft-entra-kerberos)
- 从测试 Mac 可访问域控制器（DC）和本地资源
- Mac 引用的 DNS 服务器指向本地域控制器

---

## 需要执行的两个配置

参考公开文档：[Enable Kerberos SSO for on-premises AD and Entra ID Kerberos Resources in Platform SSO](https://learn.microsoft.com/en-us/entra/identity/devices/device-join-macos-platform-single-sign-on-kerberos-configuration)

1. Kerberos SSO MDM profile 配置（本地 AD 和 Entra ID Cloud Kerberos 各一个 profile）
2. Intune 配置步骤

> **注意**：通过 Entra ID 颁发 TGT 时，本地和云端 TGT 默认同时颁发，通常无需"Customize Kerberos TGT setting"步骤。

---

## Kerberos SSO MDM Profile 配置详细步骤

### 创建本地 Active Directory 的 Profile

1. 登录 [Intune admin center](https://intune.microsoft.com)
2. **Devices** → **macOS** → **Configuration**
3. **Create** → **New Policy**
4. Profile type：**Templates** → 模板：**Custom** → **Create**
5. Basics 页输入 Profile 名称
6. 访问公开文档，复制 XML 模板到文本编辑器：
   [Kerberos SSO MDM profile configuration for on-premises Active Directory](https://learn.microsoft.com/en-us/entra/identity/devices/device-join-macos-platform-single-sign-on-kerberos-configuration#kerberos-sso-mdm-profile-configuration-for-on-premises-active-directory)
7. 按文档说明编辑必要字段（本地域名等），保存为 `.mobileconfig` 格式文件
8. 在 Configuration settings 页：
   - Custom configuration profile name：输入任意名称
   - Deployment channel：选择 **Device channel**
   - Configuration profile file：上传步骤 7 保存的 `.mobileconfig` 文件（**不支持直接在线编辑**）
9. Assignments 页：选择**设备**作为目标（"Add all devices"或动态设备组）
10. 完成创建

### 创建 Microsoft Entra ID Kerberos 的 Profile

按上述相同步骤创建第二个 Profile，但使用：
[Kerberos SSO MDM profile configuration for Microsoft Entra ID Cloud Kerberos](https://learn.microsoft.com/en-us/entra/identity/devices/device-join-macos-platform-single-sign-on-kerberos-configuration#kerberos-sso-mdm-profile-configuration-for-microsoft-entra-id-cloud-kerberos)

完成后应看到两个独立 Profile：本地 AD + Entra ID Cloud Kerberos。

---

## 验证部署的 Profiles

macOS → **System Settings** → **Privacy & Security** → **Profiles**

应看到：
1. Microsoft Entra ID Cloud Kerberos configuration
2. On-premises Active Directory configuration

---

## 验证 Kerberos Tickets

打开 Terminal，运行：
```bash
app-sso platform -s
```

- **同步用户（Synced Users）**：User Configuration 下同时显示 `tgt_ad`（本地）和 `tgt_cloud`（Entra ID）
- **仅云账户（Cloud-Only Users）**：仅显示 `tgt_cloud`（本地 AD 不识别该账户）

---

## 实际 SSO 体验

获取两张 Kerberos ticket 后，通过 Finder **Connect to Server** 访问本地资源时无需输入凭据，实现完整 SSO。

更多详情：https://learn.microsoft.com/en-us/entra/identity/devices/device-join-macos-platform-single-sign-on-kerberos-configuration
