---
source: onenote
sourceRef: "MCVKB/Intune/AAD PRT token log.md"
sourceUrl: null
importDate: "2026-04-04"
type: troubleshooting-guide
---

# AAD PRT Token Log Collection — Windows 设备

本指南适用于 Intune 管理的 Windows 设备，用于收集 AAD PRT (Primary Refresh Token) 日志以排查登录/身份验证问题。

## 步骤

1. 下载 [Auth 诊断工具](https://github.com/CSS-Windows/WindowsDiag/blob/master/ADS/AUTH/Auth.zip) 并解压到问题设备上（例如 `C:\temp\auth`）

2. 重命名文件：
   - `start-auth.txt` → `start-auth.cmd`
   - `stop-auth.txt` → `stop-auth.cmd`

3. **[开始捕获]** 以管理员身份运行 `cmd.exe`，执行：
   ```
   C:\temp\auth\start-auth.cmd
   ```
   提示时输入 `y` 确认。

4. **复现问题**：锁定设备 → 等待 5 秒 → 解锁并使用用户凭据登录

5. **[停止捕获]** 在管理员命令提示符中执行：
   ```
   C:\temp\auth\stop-auth.cmd
   ```
   提示时输入 `y` 确认。

6. 等待数据生成完成。日志文件夹 `authlogs` 将在 `C:\temp\auth\authlogs` 创建。

7. 将 `authlogs` 文件夹上传提供给支持工程师。

## 适用场景

- 设备无法完成 AAD 登录
- PRT 获取失败
- Intune 注册时身份验证失败
- Windows Hello for Business 配置问题
