---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Apple Devices/How_to_manually_configure_a_shared_device_mode_for_iOS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=/Authentication/Device_Registration/Apple_Devices/How_to_manually_configure_a_shared_device_mode_for_iOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Manually Configure Shared Device Mode for iOS

无需 ABM/ADE，通过 Intune 手动为 iOS 设备配置 Shared Device Mode 的步骤。

参考公开文档：https://learn.microsoft.com/ja-jp/entra/msal/objc/set-up-ios-device-shared-mode#manual-setup

---

## 步骤概览

**A. 在 Intune 配置 Enterprise SSO Plug-in（启用 Shared Device Mode）的设备配置文件**  
**B. 从 Intune Company Portal app 注册 iOS 设备**  
**C. 从 Authenticator 删除并重新注册 Device ID**

---

## A. 设置设备配置文件

1. 登录 [Intune admin center](https://intune.microsoft.com)
2. 选择 **Devices** → **iOS/iPadOS** → **Configuration**
3. 选择 **Create** → **New Policy**
4. Profile type 选择 **Template** → 模板选择 **Device Features** → **Create**
5. 在 Basics 页输入配置文件名称
6. 在 Configuration settings 中：
   - SSO App Extension Type：选择 **Microsoft Entra ID**
   - Enable Shared Device Mode：选择 **Yes**
   - 点击 **Next**
7. 在 Assignments 中添加用户/设备（验证用途可选 All users / All devices）
8. 完成创建

---

## B. iOS 设备注册

1. 从 App Store 安装 Microsoft Authenticator 和 Intune Company Portal
2. 通过 Company Portal 注册设备到 Intune
3. 确认步骤 A 中创建的配置文件已应用到设备
4. 若设备曾用于测试且有残留缓存，建议重新安装 Authenticator 并重置 iOS

---

## C. 删除并重新注册 Device ID

1. 打开 Authenticator → **Settings** → **Enroll Devices**
2. 删除现有 Device ID
3. 重新打开 Authenticator，应看到 Shared Device Mode 设置界面
4. 使用具有 **Cloud Device Administrator** 角色（或更高权限）的账户进行认证
5. 认证成功后，新 Device ID 被颁发，设备进入 Shared Device Mode

> **注意**：若认证请求发出时设备已显示 Device ID（正常状态），但认证失败，可能需要重新打开 App 并再次删除 Device ID，极端情况下需重置 iOS。

---

## 验证 Shared Device Mode 是否生效

尝试登录任意应用，若出现"检测到多个用户"的提示消息，说明 Shared Device Mode 已正确启用。
