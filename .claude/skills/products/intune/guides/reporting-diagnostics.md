# Intune 报告与诊断日志收集 — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 7 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Collecting diagnostic logs from Intune portal fails or takes ~8 hours. Issue happens on almost al... | Group Policy (GPO) has cloud notifications disabled. Registry key NoCloudAppl... | 1. Check GPO: Computer Configuration > Start Menu and Taskbar > Notifications > Turn off notifica... | 🟢 9.0 | OneNote |
| 2 | EPM elevation reporting data missing — no elevation reports appearing in Intune admin center | EPM elevation reports take 24 hours to populate; or EPM Reporting not enabled... | 1) Wait 24 hours for reports to process. 2) Verify OS supported. 3) Verify EPM Reporting enabled ... | 🟢 8.5 | ADO Wiki |
| 3 | Target OS list is empty when generating Update Device Readiness & Compatibility Risks Report | Prerequisites not met. Device diagnostics not enabled under Tenant Administra... | Enable Device diagnostics under Tenant Admin per https://learn.microsoft.com/mem/intune/remote-ac... | 🟢 8.5 | ADO Wiki |
| 4 | No devices found when Update Readiness (MEM-UR) report is generated | Multiple causes: telemetry AllowTelemetry <1, OneSettings disabled via GPO, O... | 1) Enable Windows data checkboxes under Tenant Admin > Connectors > Windows data 2) Check AllowTe... | 🟢 8.5 | ADO Wiki |
| 5 | When setting up Data Alert and Intune integration on iOS and Android devices, users receive an AD... | Still under investigation. | Check the following Service Principal with the AAD Service Principal Policy Diagnostic in ViewPoi... | 🔵 7.0 | ContentIdea KB |
| 6 | When wrapping a LOB application using Microsoft Intune App Wrapping Tool for Android, the tool cr... | The application being wrapped is at or near the Android dexfile 64k method li... | 1. Install latest Intune App Wrapping Tool for Android. 2. Enable Multidex. If unresolved: reduce... | 🔵 7.0 | ContentIdea KB |
| 7 | Intune device diagnostics log collection from portal fails intermittently or takes approximately ... | Intermittent issue with the log collection upload to logmanagerservice endpoi... | 1. Check HttpSubsystem for logcollect requests to see timing: HttpSubsystem \| where * contains '... | 🔵 6.5 | OneNote |

## 快速排查路径
1. 1. Check GPO: Computer Configuration > Start Menu and Taskbar > Notifications > Turn off notifications network usage must be Disabled or Not Configure `[来源: OneNote]`
2. 1) Wait 24 hours for reports to process. 2) Verify OS supported. 3) Verify EPM Reporting enabled in EPM Client Settings. 4) Check registry ConfigDevic `[来源: ADO Wiki]`
3. Enable Device diagnostics under Tenant Admin per https://learn.microsoft.com/mem/intune/remote-actions/collect-diagnostics `[来源: ADO Wiki]`
4. 1) Enable Windows data checkboxes under Tenant Admin > Connectors > Windows data 2) Check AllowTelemetry >=1 at both registry locations 3) Ensure Disa `[来源: ADO Wiki]`
5. Check the following Service Principal with the AAD Service Principal Policy Diagnostic in ViewPoint. The ServicePrincipal displays a Guid.Empty value  `[来源: ContentIdea KB]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/reporting-diagnostics.md#排查流程)
