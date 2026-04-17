# INTUNE 报告与诊断日志收集 — 排查速查

**来源数**: 3 | **21V**: 全部适用
**条目数**: 10 | **最后更新**: 2026-04-17

## 快速排查路径

1. **EPM automatic elevation rule Match=False for target file — elevation does not occur despite policy being assigned**
   → Check EpmServiceLogs (EpmService_YYYYMMDD_0.log) for 'Match=False;Message=' entries. The Message field explains the mismatch (e.g., certificate type/payload validation failed). Fix the rule's certi... `[ado-wiki, 🟢 9.0]`

2. **EPM elevation reporting data missing — no elevation reports appearing in Intune admin center**
   → 1) Wait 24 hours for reports to process. 2) Verify OS supported. 3) Verify EPM Reporting enabled in EPM Client Settings. 4) Check registry ConfigDeviceHealthMonitoringScope contains PrivilegeManage... `[ado-wiki, 🟢 9.0]`

3. **Target OS list is empty when generating Update Device Readiness & Compatibility Risks Report**
   → Enable Device diagnostics under Tenant Admin per https://learn.microsoft.com/mem/intune/remote-actions/collect-diagnostics `[ado-wiki, 🟢 9.0]`

4. **No devices found when Update Readiness (MEM-UR) report is generated**
   → 1) Enable Windows data checkboxes under Tenant Admin > Connectors > Windows data 2) Check AllowTelemetry >=1 at both registry locations 3) Ensure DisableOneSettingsDownloads not 1 4) Verify OS buil... `[ado-wiki, 🟢 9.0]`

5. **Update Readiness report generated but missing some devices**
   → 1) Verify device meets OS prerequisites 2) Check for GPO overriding AllowTelemetry/DisableOneSettingsDownloads 3) Ensure device in assigned policy group 4) Follow no-devices-found steps `[ado-wiki, 🟢 9.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | EPM automatic elevation rule Match=False for target file — elevation does not occur despite polic... | Certificate payload in the elevation rule does not match the actual certificate of the target exe... | Check EpmServiceLogs (EpmService_YYYYMMDD_0.log) for 'Match=False;Message=' entries. The Message ... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FEndpoint%20Privilege%20Management) |
| 2 | EPM elevation reporting data missing — no elevation reports appearing in Intune admin center | EPM elevation reports take 24 hours to populate; or EPM Reporting not enabled in Client Settings;... | 1) Wait 24 hours for reports to process. 2) Verify OS supported. 3) Verify EPM Reporting enabled ... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEndpoint%20Security%2FEndpoint%20Privilege%20Management%2FTroubleshooting%20Guide%20for%20Endpoint%20Privilege%20Management) |
| 3 | Target OS list is empty when generating Update Device Readiness & Compatibility Risks Report | Prerequisites not met. Device diagnostics not enabled under Tenant Administration | Enable Device diagnostics under Tenant Admin per https://learn.microsoft.com/mem/intune/remote-ac... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FManage%20Software%20Updates%2FWindows%2FUpdate%20Readiness%20Reports%2FTroubleshooting) |
| 4 | No devices found when Update Readiness (MEM-UR) report is generated | Multiple causes: telemetry AllowTelemetry <1, OneSettings disabled via GPO, OS too old, network e... | 1) Enable Windows data checkboxes under Tenant Admin > Connectors > Windows data 2) Check AllowTe... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FManage%20Software%20Updates%2FWindows%2FUpdate%20Readiness%20Reports%2FTroubleshooting) |
| 5 | Update Readiness report generated but missing some devices | Device may not meet OS version prerequisites, GPO conflicts with AllowTelemetry or DisableOneSett... | 1) Verify device meets OS prerequisites 2) Check for GPO overriding AllowTelemetry/DisableOneSett... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FManage%20Software%20Updates%2FWindows%2FUpdate%20Readiness%20Reports%2FTroubleshooting) |
| 6 | Device Readiness status shows Unknown in MEM-UR report | Data processing at EDP did not generate expected results for Intune data processor | Run compattelrunner.exe -m:appraiser.dll -f:DoScheduledTelemetryRun ent on impacted devices. Wait... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FManage%20Software%20Updates%2FWindows%2FUpdate%20Readiness%20Reports%2FTroubleshooting) |
| 7 | Intune for Education reporting is limited - Device Inventory, App Inventory, Settings Error repor... |  | Use Enterprise version of Intune for fuller reporting. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4041159) |
| 8 | In our attempt to improve customer experience, we have made architectural level changes to our re... | This can occur if the request is being throttled. | This is by design. Customers should try accessing the reports again at a later time. | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4646184) |
| 9 | Enterprise&nbsp;Privilege Management (EPM) Elevation reports take 24 hours to process/populate. V... |  |  | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/5028757) |
| 10 | Intune device diagnostics log collection from portal fails intermittently or takes approximately ... | Intermittent issue with the log collection upload to logmanagerservice endpoint. Backend shows cr... | 1. Check HttpSubsystem for logcollect requests to see timing: HttpSubsystem / where * contains '<... | 🔵 6.0 | onenote: Mooncake POD Support Notebook\POD\VMS... |

> 本 topic 有排查工作流 → [排查工作流](workflows/reporting-diagnostics.md)
> → [已知问题详情](details/reporting-diagnostics.md)
