# WAM Tool by Global Auth Team

> Source: OneNote - M365 Identity IDO / Common operation_TSG

## 场景

分析 WAM (Web Account Manager) 日志以排查 Office/Windows 应用的认证问题。

## 工具

| 工具 | 链接 |
|------|------|
| WAMToolScript (下载) | [WAMToolScript v1.0.1](https://dev.azure.com/CSSChinaAADAuth/2dc4ffd3-956c-4b85-bb4c-c56c71087519/_apis/git/repositories/47b1cb00-a48b-4344-887f-137b17ca067b/Items?path=/.attachments/WAMTool/WAMToolScript_v1.0.1.zip) |
| WAMTroubleshooter Web App | [https://wamtsapp.z7.web.core.windows.net/](https://wamtsapp.z7.web.core.windows.net/) |

## 用法

1. 收集 WAM 日志 (Event Viewer → Applications and Services Logs → Microsoft → Windows → AAD)
2. 使用 WAMToolScript 导出日志
3. 上传到 WAMTroubleshooter Web App 进行自动分析
4. 分析结果包含：token 请求/响应、错误码解析、建议操作
