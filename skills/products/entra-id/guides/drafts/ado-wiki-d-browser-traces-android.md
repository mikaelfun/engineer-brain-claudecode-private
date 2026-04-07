---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Android Devices/Browsers traces for Android"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD.wiki?pagePath=/Authentication/Device_Registration/Android_Devices/Browsers_traces_for_Android"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Browser Traces for Android

Android 应用通常会验证域名与证书的匹配，导致使用 HTTPS 解密证书的网络嗅探工具（如 Fiddler）无法工作。在这种情况下，可以直接从浏览器获取 HAR 追踪。

---

## Chromium 浏览器（Edge / Chrome）— Net-Export 追踪

1. 在 Edge 中输入 `edge://net-export`，Chrome 中输入 `chrome://net-export`
2. 勾选 **Include Raw Bytes**
3. 点击 **Start logging to disk**
4. 在同一浏览器新标签页中复现问题
5. 返回追踪标签页，点击 **Stop logging**
6. 日志文件位置：`/data/user/0/com.android.chrome/cache/net-export/chrome-net-export-log.json`（Chrome）

---

## Firefox — USB 远程调试

Firefox 没有内置网络追踪工具，需通过 USB 连接 PC 使用开发者工具。

### 准备步骤

**PC 端：**
1. 打开 Firefox，地址栏输入 `about:debugging`
2. 启用 **Enable USB devices**

**Android 设备端：**
1. 启用开发者菜单：设置 → 关于手机 → 软件信息 → 连续点击 **Build number** 7 次
2. 启用 USB 调试：设置 → 开发者选项 → USB debugging
3. 启用 Firefox 远程调试：Firefox → 菜单（三点）→ 设置 → Remote Debugging via USB

### 连接步骤

1. 用 USB 线连接 Android 设备到 PC
2. 在 PC Firefox 的 `about:debugging` 页面点击 **Refresh devices** → **Connect!**
3. 在 Tabs 下点击 **Inspect**，即可使用 Firefox 开发者工具捕获网络流量

参考：https://firefox-source-docs.mozilla.org/devtools-user/about_colon_debugging/index.html

> **安全提醒**：完成后请还原 Android 设备设置。启用 USB 调试不符合 Microsoft/Intune 合规策略。
