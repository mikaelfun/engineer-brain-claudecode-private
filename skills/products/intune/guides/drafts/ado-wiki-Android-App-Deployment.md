---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/App Management/Android"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FApp%20Management%2FAndroid"
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Intune Android App 部署 — 排查指南

> ⚠️ **21V 注意事项**：Android Enterprise 和 Managed Google Play 功能在 21V（Mooncake）**不支持**（依赖 Google Mobile Services）。以下指南中 Android Enterprise 相关部分不适用于 21V 环境。

## 功能简介

Android App 部署是通过 Intune 将应用添加并分配给用户/设备组的过程，支持自动安装（Required）或用户主动安装（Available）。

## 支持的应用类型

| 类型 | 说明 |
|------|------|
| Store Apps | 通过 Google Play Store 链接添加，手动填写应用信息 |
| Managed Google Play | 仅适用于 Android Enterprise 托管设备 ⚠️ 21V 不支持 |
| Android Enterprise System Apps | 系统应用 ⚠️ 21V 不支持 |
| Built-In Apps | 推荐用于部署 Office 365 等内置应用 |
| LOB (Line of Business) | 企业自定义 APK |

## Scoping Questions

1. 什么类型的设备（品牌、型号）？
2. Android OS 版本？
3. 应用类型（LOB、Store、Built-in、WebClip 等）？
4. 应用分配方式（User、Group 或 Device）？
5. 问题如何影响客户？是完全阻塞还是有变通方法？
6. 设备是否已注册？
7. 应用分配为 Available 还是 Required？
8. 分配中包含/排除的用户、组、设备是什么？（Assist365 可查）
9. 此应用之前是否部署过？
10. 是更新现有应用还是新部署？
11. 设备或 Intune Admin Console 是否有错误信息？
12. 问题何时开始？环境中发生了什么变更？
13. 能否复现？
14. 是单个应用还是所有应用受影响？
15. 是单个用户/设备还是全部受影响？
16. 应用名称和 ID、受影响用户 UPN、设备序列号/DeviceID？

## Support Boundaries

> Intune **不支持**仅在应用安装过程中发生（非 Intune 管理/注册导致）的安装失败。
> - 如果手动安装或在未注册设备上安装也失败 → 非 Intune 问题，是设备或应用本身问题
> - 如需进一步帮助，请将客户转给应用供应商

## 常见问题排查

### 安装失败（Install Failed）

1. 查看 OMADM 日志，找 `"Error installing application <app name>, result code: <code>"` 
2. 该 result code 来自 Android OS，搜索此 Android 错误码获取详情
3. 常见失败原因：
   - APK 文件损坏（bad APK）
   - 设备未允许来自未知来源的安装
   - APK 未签名

### 可用应用安装后状态不更新

**原因**：状态通过 IWS（非设备直接上报）更新，安装完成后需 1-2 分钟延迟。离开页面后不再自动刷新。
**解决**：离开 App Details 页面后重新导航回来手动刷新。

### 如何检查 LOB APK 版本

使用 Android Studio 打开 .apk 文件，查看根目录下 `AndroidManifest.xml`：
```xml
<manifest ... android:versionCode="3" android:versionName="1.0" ...>
```
- `android:versionCode`：构建号，Intune 依赖此值判断是否有更新
- `android:versionName`：显示给用户的版本号
- **更新的 APK versionCode 必须高于现有版本**

## 排查工具和资源

- OMADM 日志分析：参考 ContentIdea#121254 (How to Analyze OMADM Log)
- Available Installs 排查：KB4612733
- Required Installs 排查：KB4612734
- 完全托管 Android Enterprise 设备 debug 日志：KB4570081

## Kusto 查询

参考 Intune 通用 Kusto 最佳实践（见 Intune: Kusto Examples and Best Practices evergreen topic）。

## 培训资料

- Microsoft Endpoint Manager - Intune - Client Apps - Part VIII - Apps — Android（视频链接见 Wiki）
- Intune Deep Dive Walkthroughs（产品团队）

## 获取帮助

- App Deployment Teams Channel：https://teams.microsoft.com/...（App Deployment 频道）
- 如 1 个工作日内无回复，通过 TA/Lead 提交 Assistance Request
- SME 联系：https://aka.ms/IntuneSMEs
