# Monitor Application Insights Azure Functions 集成

**Entries**: 17 | **21V**: ALL | **Sources**: 2
**Last updated**: 2026-04-07

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Azure Function integrated with Application Insights via custom Startup class,... | When using a custom Startup class (FunctionsStartup) for DI, Azure Function r... | In custom Startup.Configure method, add builder.Services.AddLogging() with pr... | 9.0 | OneNote |
| 2 | KQL query calculating daily ingestion shows value below Daily Cap limit, but ... | Using Gibibyte (GiB - 1024) calculation (sum(_BilledSize)/1024/1024/1024) ins... | Use sum(_BilledSize)/1000/1000/1000 (Gigabyte/decimal) instead of /1024/1024/... | 8.5 | ADO Wiki |
| 3 | Daily Cap calculation using GiB (divide by 1024) shows ingestion below limit ... | Calculation method mismatch: Daily Cap uses Gigabyte/decimal (GB, divide by 1... | Use sum(_BilledSize)/1000/1000/1000 instead of /1024/1024/1024 when comparing... | 8.5 | ADO Wiki |
| 4 | Memory consumption linearly increases and never goes down with Application In... | Manual telemetry submission code creates multiple long-lifetime AI objects. C... | Review usage of telemetry classes from Application Insights libraries. Find p... | 8.5 | ADO Wiki |
| 5 | Application Insights telemetry not being ingested through AMPLS; ingestion fa... | App Service free tier does not support VNet integration. The application reso... | Ensure the web app or function app hosting the application is on a paid App S... | 8.5 | ADO Wiki |
| 6 | 配置 AMPLS 后，Application Insights 遥测端点（dc.services.visualstudio.com、live.applic... | 以下一项或多项缺失/错误：(1) Spoke VNET 的 Virtual Network Link 未添加到 AMPLs→PE→Private DNS ... | 从 App Service Console/SSH 执行 nslookup dc.services.visualstudio.com 和 nslookup... | 8.5 | ADO Wiki |
| 7 | Azure Function App telemetry randomly drops with 'e' (wrong endpoint) status ... | TelemetryConfiguration has mismatched IKey values between instrumentationKey ... | Delete APPINSIGHTS_INSTRUMENTATIONKEY setting, only use APPLICATIONINSIGHTS_C... | 8.5 | ADO Wiki |
| 8 | Authorization error on the Application Insights blade when navigating to Web ... | The AI blade on App Services requires RBAC action 'microsoft.web/sites/config... | Assign a role with 'microsoft.web/sites/config/list/actions' (Website Contrib... | 8.5 | ADO Wiki |
| 9 | Authorization error when clicking Application Insights blade on web app or fu... | Missing RBAC permission for action microsoft.web/sites/config/list/actions on... | Assign a role that allows microsoft.web/sites/config/list/actions (Website Co... | 8.5 | ADO Wiki |
| 10 | Function App with isolated worker (.NET out-of-process) shows different SDK v... | Out-of-process Functions use separate processes: Functions Host handles reque... | Expected behavior for .NET isolated Functions. Verify both SDK patterns: 1) R... | 8.5 | ADO Wiki |
| 11 | Out-of-process (.NET isolated) Azure Function App shows different SDK version... | In out-of-process Functions, the Functions Host process handles request telem... | This is expected behavior for out-of-process Functions. When investigating SD... | 8.5 | ADO Wiki |
| 12 | Internal (Microsoft) users see Failed to create API Key error in Azure Portal... | As part of SFI (Secure Future Initiative), Microsoft has blocked creation of ... | API Keys are deprecated. Migrate to Microsoft Entra ID authentication for que... | 8.5 | ADO Wiki |
| 13 | Logic Apps integration with Application Insights stops working; deprecated Ap... | Legacy Application Insights connector for Logic Apps relied on API Keys which... | Use Azure Monitor Logs connector (https://learn.microsoft.com/en-us/connector... | 8.5 | ADO Wiki |
| 14 | Distributed tracing breaks when Azure EventGrid is in the middle of a call ch... | EventGrid uses the CloudEvents protocol instead of standard HTTP Correlation ... | Workaround: Insert an intermediate API between the calling service and EventG... | 7.5 | ADO Wiki |
| 15 | AMPLS 私有链接配置后，Application Insights Ingestion Endpoint 和 Live Endpoint 的 DNS 解... | - | SSH 进入 Web App/Function App 控制台，对 Application Insights Ingestion Endpoint 和 L... | 7.5 | ADO Wiki |
| 16 | Node.js Application Insights SDK does not fully integrate with Next.js 13+ Ap... | The Node.js SDK's diagnostic-channel-publishers patching mechanism has compat... | PG was planning a sample/cleaner integration path for Next.js App Router + No... | 7.5 | ADO Wiki |
| 17 | Inbound Request telemetry stops appearing in Application Insights after enabl... | Azure Function auto-instrumentation for isolated worker does not natively sup... | Use StartOperation() from TelemetryClient to manually create inbound Request ... | 7.5 | ADO Wiki |

> This topic has fusion troubleshooting guide with detailed workflow
> [Full troubleshooting workflow](details/ai-azure-functions.md)
