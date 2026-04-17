---
source: onenote
sourceRef: "MCVKB/Intune/Android/Android App Store.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# Android 应用分发 — 中国大陆（无 Google Play）

由于 Google Play Store 在中国大陆不可用，Microsoft 已通过国内第三方应用商店分发必要应用。

## 官方下载渠道

### Company Portal
- 官方文档：[在中国安装 Intune 公司门户应用](https://learn.microsoft.com/en-us/mem/intune/user-help/install-company-portal-android-china)
- 通过国内主流应用商店（豌豆荚、应用宝等）分发

### Outlook for Android
- 参考：[Outlook for iOS and Android in Exchange Online: FAQ](https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/outlook-for-ios-and-android/outlook-for-ios-and-android-faq)
- 通过国内主流应用商店分发

### Microsoft Teams
- 参考：[Get clients for Microsoft Teams](https://learn.microsoft.com/en-us/microsoftteams/get-clients)
- 通过国内主流应用商店分发

## 注意事项

- Android 在中国只支持 **DA (Device Administrator)** 模式，不支持 Android Enterprise / AOSP（依赖 Google Mobile Services）
- 21v 不支持 SafetyNet Device Attestation（依赖 GMS）
- ARCore 支持设备列表：https://developers.google.com/ar/discover/supported-devices#android_china

## LOB 应用部署

对于企业自定义 LOB 应用，通过 Intune 直接推送 APK（不依赖 Google Play）。注意：
- 在中国大陆蜂窝网络上下载大 APK 可能失败（HTTP 499）→ 建议使用 Wi-Fi 或点击"同步"重试
