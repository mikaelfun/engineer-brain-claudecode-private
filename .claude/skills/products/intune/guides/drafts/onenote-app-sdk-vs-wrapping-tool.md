---
source: onenote
sourceRef: "MCVKB/Intune/APP SDK VS APP Wrapping tool.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Intune App SDK vs App Wrapping Tool — 功能对比

## 选择指南

- **App SDK**：需要集成到源代码中；支持所有 MAM 功能，包括多身份、选择性擦除
- **App Wrapping Tool**：对已编译的 APK/IPA 进行处理，无需源代码；不支持部分高级功能

官方文档：[Prepare apps for mobile application management](https://docs.microsoft.com/en-us/intune/developer/apps-prepare-mobile-application-management)

## 功能对比表

| 功能 | App SDK | App Wrapping Tool |
|------|---------|-------------------|
| 限制 Web 内容在受管浏览器中显示 | ✅ | ✅ |
| 阻止 Android/iTunes/iCloud 备份 | ✅ | ✅ |
| 允许向其他应用传输数据 | ✅ | ✅ |
| 允许从其他应用接收数据 | ✅ | ✅ |
| 限制剪切/复制/粘贴 | ✅ | ✅ |
| 指定可复制字符数量 | ✅ | ✅ |
| 要求简单 PIN 访问 | ✅ | ✅ |
| 指定 PIN 重置前尝试次数 | ✅ | ✅ |
| 允许指纹代替 PIN | ✅ | ✅ |
| 允许面部识别代替 PIN（仅 iOS） | ✅ | ✅ |
| 要求公司凭据访问 | ✅ | ✅ |
| 设置 PIN 过期时间 | ✅ | ✅ |
| 阻止受管应用在越狱/Root 设备运行 | ✅ | ✅ |
| 加密应用数据 | ✅ | ✅ |
| 指定次数后重新检查访问要求 | ✅ | ✅ |
| 指定离线宽限期 | ✅ | ✅ |
| 阻止屏幕截图（仅 Android） | ✅ | ✅ |
| 支持无设备注册的 MAM | ✅ | ✅ |
| 完全擦除应用数据 | ✅ | ✅ |
| **多身份场景下的选择性擦除** | ✅ | ❌ |
| **阻止"另存为"** | ✅ | ❌ |
| **目标应用配置（MAM channel）** | ✅ | ❌ |
| **多身份支持** | ✅ | ❌ |
| **自定义样式** | ✅ | ❌ |
| On-demand VPN（Citrix mVPN） | ✅ | ✅ |
| 禁用联系人同步 | ✅ | ✅ |
| 禁用打印 | ✅ | ✅ |
| 要求最低应用版本 | ✅ | ✅ |
| 要求最低操作系统版本 | ✅ | ✅ |
| 要求最低 Android 安全补丁（仅 Android） | ✅ | ✅ |
| 要求最低 Intune SDK for iOS（仅 iOS） | ✅ | ✅ |
| SafetyNet 设备证明（仅 Android）⚠️21v不支持 | ✅ | ✅ |
| 应用威胁扫描（仅 Android） | ✅ | ✅ |

> ⚠️ **21V 注意**：SafetyNet 设备证明在 21Vianet 环境不可用（依赖 Google Mobile Services）。

## App Wrapping Tool 额外限制

- iOS：移除管理配置文件时，应用也会被移除
- 不支持多身份、MAM channel 配置、选择性擦除
