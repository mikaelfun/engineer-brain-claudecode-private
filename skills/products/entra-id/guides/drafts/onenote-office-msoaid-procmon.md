# Office MSOAID + Process Monitor Log Collection

> Source: OneNote - M365 Identity IDO / Log collection

## 场景

Office 应用认证问题需要深度日志分析时，使用 MSOAID 工具配合 Process Monitor 收集完整诊断日志。

## 准备工作

1. 下载 MSOAID: [https://aka.ms/msoaid](https://aka.ms/msoaid)
2. 下载 Process Monitor: [Sysinternals ProcMon](https://learn.microsoft.com/en-us/sysinternals/downloads/procmon)
3. [可选] 关闭所有 Office 应用 (Outlook/Word/Excel/PPT/OneNote，不包含 Teams)
4. 配置 Office 日志级别 (Regedit)：
   ```
   [HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\Common\Logging]
   "EnableLogging"=dword:00000001
   "DefaultMinimumSeverity"=dword:000000c8
   ```

## 抓取步骤

**Best Practice: 抓两遍日志，一遍不开 Fiddler，一遍开 Fiddler**

1. 管理员运行 procmon64.exe → 先暂停抓取并清空记录
2. 管理员运行 MSOAID → 选择所有选项 + 配置 Fiddler 开/关 + 设置保存路径
3. ProcMon 中开启抓取
4. MSOAID 点 Next → 如出现 screen recorder 警报点 OK → 等待窗口停止闪烁
5. [可选] 打开 Office 应用
6. 在应用中复现问题
7. 关闭 Office 应用
8. 回到 ProcMon → 停止抓取 → 保存时选 All Events
9. 回到 MSOAID → 点 Finish → 等待日志输出

## 收尾

1. 删除 Regedit 中的 Logging 键
2. 打包日志上传

## 注意

- 开启 Fiddler 会导致 WAM 日志增大很多
- 如果只需分析 WAM 日志，查看**没有**开 Fiddler 的那次
