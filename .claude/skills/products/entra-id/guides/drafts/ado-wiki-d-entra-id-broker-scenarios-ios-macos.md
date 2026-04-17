---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Apple Devices/Entra ID device registration and broker scenarios on iOS and macOS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=/Authentication/Device_Registration/Apple_Devices/Entra_ID_device_registration_and_broker_scenarios_on_iOS_and_macOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Entra ID Device Registration and Broker Scenarios on iOS and macOS

## 核心概念

### Brokers

Broker 是在客户端应用和身份提供商之间提供安全通信的应用，管理认证请求、token，确保安全策略执行。iOS/macOS 上的 broker（Authenticator、Company Portal）负责启用 SSO 和设备合规。

**设备认证必须包含密码学握手**（如签名 JWT、Client TLS 握手），而非简单传递 deviceId。Client TLS 机制可能被网络代理、杀毒软件等影响。

### 设备管理（MDM）

MDM 在 Apple 设备上由 Apple 完全控制（通过配置文件）。我们的客户端代码在配置文件安装后的 MDM 集成中作用有限。

### 设备合规

要求合规设备时，用户需：MDM 注册 → Entra ID 注册 → MDM backend 与 Entra ID 链接。

- **Intune**：Company Portal 或 Authenticator 发送带 Entra ID 设备注册密钥签名的 blob 给 MDM backend（JIT-registration）
- **第三方 MDM on iOS**：通过 MSAL + claims request parameter 请求含 deviceId claim 的 token，broker 编排注册过程

---

## Broker 支持的场景

### iOS Broker 类型

| 类型 | 说明 |
|------|------|
| **Unmanaged broker** | 仅用于交互式请求；使用 iOS URL scheme；broker 返回 refresh token 给 App |
| **Managed broker (SSO extension)** | 仅在 MDM 管理设备可用；支持静默 token 操作；需管理员在 MDM profile 中启用 |

### macOS Broker

当前仅支持 managed broker（Entra ID SSO extension），功能与 iOS SSO extension 类似，不返回 refresh token 给应用。

**XPC（即将推出）**：Apple 开发中的替代方案，无需 SSO extension，预计 2025 上半年发布，不支持 Platform SSO。

### SSO Extension 操作模式

**Operation Mode（原生应用）**：
- 使用 MSAL/OneAuth 库，通过 operation APIs 调用 broker
- 若 broker 无 PRT 则自动获取；PRT 不足时提示用户补充操作

**Browser SSO Mode（浏览器/非 MSAL 应用）**：
- 使用 Browser SSO APIs，broker 提供临时 SSO artifact
- Safari：无需额外配置
- Chrome：需安装 [Microsoft Single Sign-On 扩展](https://chromewebstore.google.com/detail/microsoft-single-sign-on/ppnbnpeolgkicgegkbkbjmhlideopiji)
- Edge：需登录 Edge profile
- 最多支持 3 个 PRT；支持 PRT recovery（密码变更、MFA 需求、SIF 策略）

### SSO Extension 前提条件

- 需要成功完成 associated domain 验证
- Browser SSO 依赖 Apple 在底层 CFNetwork API 中使用 SSO extension；不使用 CFNetwork 的应用不支持

### Platform SSO（macOS）

用户可将本地 Mac 登录与 Entra ID 登录关联。详细排查指南：
https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1220619/MacOS-Platform-SSO-Extension

---

## Broker Apps

- **iOS**：Microsoft Authenticator
- **macOS**：Microsoft Company Portal

---

## 设备注册

### iOS

| 触发场景 | 说明 |
|----------|------|
| Company Portal Intune 注册 | — |
| Authenticator + Intune 应用保护策略 | — |
| Authenticator + 第三方 MDM 链接 | — |
| Authenticator 共享设备模式 | — |
| Authenticator 手机登录 | — |
| 用户手动注册 | Authenticator 设置中 |

- 最多 1 个注册/租户，不支持 Guest 注册
- 密钥存储于 iOS keychain（Q3 CY25 升级为 Secure Enclave 硬件绑定）
- 始终为 Workplace Join / Entra ID registered

### macOS

- 最多 1 个注册，注册新租户会删除旧注册
- 非 PSSO 设备密钥存储于 Mac login keychain（Q3 CY25 升级为 Secure Enclave）
- PSSO 设备为 Entra Joined；其他为 Workplace Join

---

## 日志收集

### iOS SSO Extension 日志

1. 打开 Microsoft Authenticator
2. 菜单 → **Send feedback** → **Having trouble** → **View diagnostic** → **Send**
3. 提供 Incident ID 给工程师
4. 工程师在 ASC → Sign-Ins → Authenticator App Logs 中输入 Incident ID 检索

- SSO extension 日志：`MicrosoftAuthenticatorSSOExtensionLogs`
- 非 SSO extension 日志：`MicrosoftAuthenticatorLogs`

### macOS SSO Extension 日志

通过 Company Portal：
1. 启动 Company Portal（无需登录）
2. Company Portal → Settings → Advanced logging → **Turn on advanced logging**
3. Help → **Save diagnostic report**
4. 完成后关闭 Advanced logging
5. 解压 `Company Portal.zip` → 打开 `SSOExtension.log`

### MSAL JS Platform Broker 日志（macOS）

1. 确认 SSO Extension 已启用，且 Microsoft Single Sign On 扩展已安装
2. 检查 `/Library/Google/Chrome/NativeMessagingHosts/com.microsoft.browsercore.json` 中 path 是否指向 Company Portal 中的 BrowserCore
3. 收集 BrowserCore 日志：Console app → 设备 → 搜索 "BrowserCore"（Process 过滤）→ 启用 Info messages
4. 收集浏览器控制台日志和 .har 格式网络追踪（login.microsoft.com）

---

## 已知问题

### iOS 已知问题

#### 1.1.1 第三方 MFA app-flip Unknown Error
**症状**：Duo 批准后用户直接打开 Outlook，显示 unknown error  
**原因**：需返回 Authenticator 由其完成流程后自动跳转  
**解决**：Duo 批准后先返回 Authenticator，等待 Authenticator 自动跳转

#### 1.1.2 NFC YubiKey 无密码提示（iOS 18.1.x）
**症状**：NFC YubiKey 只显示通知，无密码弹窗  
**原因**：iOS 18.1.x 已知 bug（Yubico 报告）  
**解决**：升级至 iOS 18.2.x+

#### 1.6.1 MAM + SIF 策略组合导致高频提示
**症状**：Broker 日志大量 prompt=login，MAM 日志 AuthenticationEnabled=true  
**原因**：MAM 非活动策略与 AAD SIF CA 策略互不感知，同时触发两次提示  
**解决**：移除其中一个策略；优先保留 AAD SIF CA 策略

### macOS 已知问题

#### 2.3 Chrome/Edge + Webnativebridge + AADSTS50210
**症状**：AADSTS50210: non-retriable error from the operating system  
**原因**：broker 返回 PERSISTENT_ERROR，最常见为 associated domain 验证失败  
**解决**：修复 associated domain 验证；如未启用 SSO extension 则移除 Chrome 扩展

#### 2.5.1 PSSO Device Auth Challenge 失败（PkeyAuth header 被防火墙删除）
**症状**：PSSO 注册设备 Device Auth 失败，提示重新注册；环境有 SSL Inspection  
**原因**：3rd party MDM 产生 deviceless PRT，防火墙删除了 x-ms-PkeyAuth+ header  
**解决**：网络抓包确认 header 是否存在；联系防火墙厂商配置放行

#### 2.5.2 PSSO biometric 策略用户反复提示重新注册
**症状**：se_key_biometric 策略下持续提示重新注册  
**原因**：Apple Secure Enclave API 签名失败（ACM requirement: 8），触发强制重新注册  
**解决**：联系 Apple 支持

#### 2.6.1 macOS 原生应用 -1205 错误（SSL Inspection + 客户端证书）
**症状**：原生应用认证失败（-1205）；Defender for Cloud Apps 有自定义 Root cert；浏览器正常  
**原因**：原生应用未提供完整证书链，验证失败  
**解决**：上传完整证书链至 Defender for Cloud Apps；work item 3138696 跟踪

### iOS + macOS 共同已知问题

#### 3.1.1 Associated Domain 验证失败（1000/1001/1003 错误）
**症状**：SSO Extension 启动失败，OneAuth 错误 1001/1000/1003，sub status 6008  
**原因**：Apple 在调用 SSO extension 前的 associated domain 验证失败  
**解决**：修复 associated domain 配置；参考 [SSO extension troubleshooting](https://learn.microsoft.com/en-us/entra/identity/devices/troubleshoot-mac-sso-extension-plugin)

---

## 更多排查资源

- [SSO extension troubleshooting](https://learn.microsoft.com/en-us/entra/identity/devices/troubleshoot-mac-sso-extension-plugin)
- [Mac Platform SSO troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1220619/MacOS-Platform-SSO-Extension)
- [Public SSO extension documentation](https://learn.microsoft.com/en-us/entra/identity-platform/apple-sso-plugin)
- [Entra ID WPJ troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/509381/MacOS-WorkplaceJoin-troubleshooting)
