---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Android Devices/Device Registration and Authentication on Android"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=/Authentication/Device_Registration/Android_Devices/Device_Registration_and_Authentication_on_Android"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Device Registration and Authentication on Android

## 功能概览

### Device Registration on Android

设备注册触发场景：
- Intune Company Portal 注册
- 需要设备 CA 的资源（compliant device 或 approved app）
- Remote NGC key 设置
- 用户通过 Authenticator / Company Portal / Account Settings 手动注册

完成注册后，WPJ 证书可从 Company Portal 或 Authenticator 安装到设备用户证书存储（点击"Enable Browser Access"）。安装后用户可通过系统浏览器访问受设备 CA 保护的资源，**Edge 例外（无需 browser access 证书）**。

---

## 什么是设备身份（Device Identity）？

- 通过公私钥基础设施在 AAD 中建立设备身份
- 客户端称为 WPJ/DJ++/AADJ，服务端称为 Azure Device Registration Service (ADRS/DRS)
- 用于：Intune、NGC (WH4B, FIDO)、Device CA

设备认证支持方式：PKeyAuth（不需 broker）、PRT（需 broker）、Client TLS（Intune 注册设备）

---

## 移动设备认证流程（MSAL）

MSAL 认证流程：
1. 检查缓存中是否有有效 access token → 有则直接返回
2. 若无有效 access token，使用 refresh token 获取新 token（含 access/id/refresh token），缓存后返回
3. 若 refresh token 无效，返回错误 → 应用发起新的交互式请求（用户输入凭据、MFA 等）

**错误示例**：`AADSTS50097 DeviceAuthenticationRequired` = 策略要求设备认证

> 注意：第一方应用通常使用内部 SDK OneAuth，流程与 MSAL 类似

---

## Broker 认证

Broker 提供设备级别 SSO，满足 Conditional Access 要求（如设备合规）。

**Broker 使用 PRT（Primary Refresh Token）**：特殊 refresh token，由 Broker 安全存储，用于为客户端应用获取 token。

- Broker 宿主 App：Microsoft Authenticator、Intune Company Portal、Link-to-Windows (LTW)
- 支持工作账户和 MSA 个人账户
- 原生客户端应用满足设备认证要求时需要 Broker（Broker 管理 WPJ 数据，PRT 绑定设备）

---

## Conditional Access 与设备认证

> **重要**：Legacy authentication 不支持 MFA，且**不向 Azure AD 传递设备状态信息**，因此会被要求 MFA 或合规设备的 CA 策略 block。

---

## Android Broker 概览

- 有 2 个 Broker 宿主 App：Company Portal 和 Microsoft Authenticator
- 第一个安装的 App 成为 active broker；卸载后第二个自动接替
- Active broker 被卸载时，>= Android 6.0 的 WorkPlaceJoin 状态和账户信息会被清除
- Xamarin MSAL/ADAL 需要"Contacts"权限（用于访问 Android Account Manager 中的工作账户）

---

## Android 常见问题

- 第一方应用未正确使用 ADAL/Broker（不使用 broker 或 API 调用顺序错误），有设备 CA 时 sign-in 错误增加
- **电源优化**干扰客户端与 broker 之间的后台 IPC。Company Portal 和 Authenticator 必须排除在电源优化之外
  - 注：MSAL Android 1.5.2+ 使用 Android Content Provider 作为通信机制，已解决此问题
- 认证中断后不会自动恢复（MAM/MDM 注册后需返回客户端重新登录）
- Android WebView (Chrome) 不兼容某些 Symantec CA 颁发的证书
- SSL 连接失败时检查设备时钟，偏差超过几小时会导致认证失败
- 用户拒绝"Contacts"权限会导致应用无法连接 broker
- 设备登录方式变更（密码→PIN）可能导致 WPJ 证书和私钥不可访问，浏览器设备认证失败

---

## 数据收集

### 基本数据

- 客户端应用日志（Outlook、Teams 等）
- Broker 日志（Company Portal / Authenticator / Link-to-Windows）

### 收集 Broker 日志

日志文件前缀：`active-{brokerAppName}-broker.txt`（active broker）

**调查 Broker 日志关键词**：`Acquire`、`Acquiring`、`Silent`、`interactive`、`error`、`exception`、`PRT`

**确认 active broker**：查找 Files 中以 `active-` 开头、以 `broker.txt` 结尾的文件

---

## 网络连接问题排查

网络错误特征（Broker 日志）：`device_network_not_available`、`device_network_not_available_doze_mode`、`io_error`

常见原因：
1. 设备网络连接不稳定
2. 防火墙/代理拦截应用的网络请求
3. 服务端问题或维护
4. 应用版本过旧或不兼容
5. 配置错误

解决步骤：
1. 检查网络连接稳定性
2. 禁用可能拦截请求的防火墙/代理
3. 关闭 broker 应用的电池/电源优化
4. 验证设备能访问互联网（系统浏览器登录 Teams/Outlook）

---

## ICM PG 升级路径

- ADAL + Broker → Cloud Identity Authn Client → ADAL client and server middleware
- WPJ 问题 → ADRS → WPJ Client
- 均可在 Authentication → Device Registration Teams channel 讨论
