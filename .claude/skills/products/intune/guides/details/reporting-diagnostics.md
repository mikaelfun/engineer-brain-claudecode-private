# INTUNE 报告与诊断日志收集 — 已知问题详情

**条目数**: 10 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: EPM automatic elevation rule Match=False for target file — elevation does not occur despite policy being assigned
**Solution**: Check EpmServiceLogs (EpmService_YYYYMMDD_0.log) for 'Match=False;Message=' entries. The Message field explains the mismatch (e.g., certificate type/payload validation failed). Fix the rule's certificate/hash/file criteria to match the target executable.
`[Source: ado-wiki, Score: 9.0]`

### Step 2: EPM elevation reporting data missing — no elevation reports appearing in Intune admin center
**Solution**: 1) Wait 24 hours for reports to process. 2) Verify OS supported. 3) Verify EPM Reporting enabled in EPM Client Settings. 4) Check registry ConfigDeviceHealthMonitoringScope contains PrivilegeManagement. 5) Check sensor.log exists at C:\ProgramData\Microsoft\IntuneManagementExtension\Logs. 6) In sensor.log search for GUID e4cd0c46-8d75-4d93-b5ac-99cf25388591 (diagnostic events) and 2ef6314a-cc15-487d-abfc-24a02cc9180f (elevation requests).
`[Source: ado-wiki, Score: 9.0]`

### Step 3: Target OS list is empty when generating Update Device Readiness & Compatibility Risks Report
**Solution**: Enable Device diagnostics under Tenant Admin per https://learn.microsoft.com/mem/intune/remote-actions/collect-diagnostics
`[Source: ado-wiki, Score: 9.0]`

### Step 4: No devices found when Update Readiness (MEM-UR) report is generated
**Solution**: 1) Enable Windows data checkboxes under Tenant Admin > Connectors > Windows data 2) Check AllowTelemetry >=1 at both registry locations 3) Ensure DisableOneSettingsDownloads not 1 4) Verify OS build 5) Allow diagnostics endpoints 6) Confirm DiagTrack running 7) If DiagTrack issue engage Windows UEX
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Update Readiness report generated but missing some devices
**Solution**: 1) Verify device meets OS prerequisites 2) Check for GPO overriding AllowTelemetry/DisableOneSettingsDownloads 3) Ensure device in assigned policy group 4) Follow no-devices-found steps
`[Source: ado-wiki, Score: 9.0]`

### Step 6: Device Readiness status shows Unknown in MEM-UR report
**Solution**: Run compattelrunner.exe -m:appraiser.dll -f:DoScheduledTelemetryRun ent on impacted devices. Wait 24-48h (max 52h latency)
`[Source: ado-wiki, Score: 9.0]`

### Step 7: Intune for Education reporting is limited - Device Inventory, App Inventory, Settings Error reports available as CSV.
**Solution**: Use Enterprise version of Intune for fuller reporting.
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: In our attempt to improve customer experience, we have made architectural level changes to our reporting infrastructure which will lead to better p...
**Solution**: This is by design. Customers should try accessing the reports again at a later time.
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | EPM automatic elevation rule Match=False for target file — elevation does not... | Certificate payload in the elevation rule does not match the actual certifica... | Check EpmServiceLogs (EpmService_YYYYMMDD_0.log) for 'Match=False;Message=' e... | 9.0 | ado-wiki |
| 2 | EPM elevation reporting data missing — no elevation reports appearing in Intu... | EPM elevation reports take 24 hours to populate; or EPM Reporting not enabled... | 1) Wait 24 hours for reports to process. 2) Verify OS supported. 3) Verify EP... | 9.0 | ado-wiki |
| 3 | Target OS list is empty when generating Update Device Readiness & Compatibili... | Prerequisites not met. Device diagnostics not enabled under Tenant Administra... | Enable Device diagnostics under Tenant Admin per https://learn.microsoft.com/... | 9.0 | ado-wiki |
| 4 | No devices found when Update Readiness (MEM-UR) report is generated | Multiple causes: telemetry AllowTelemetry <1, OneSettings disabled via GPO, O... | 1) Enable Windows data checkboxes under Tenant Admin > Connectors > Windows d... | 9.0 | ado-wiki |
| 5 | Update Readiness report generated but missing some devices | Device may not meet OS version prerequisites, GPO conflicts with AllowTelemet... | 1) Verify device meets OS prerequisites 2) Check for GPO overriding AllowTele... | 9.0 | ado-wiki |
| 6 | Device Readiness status shows Unknown in MEM-UR report | Data processing at EDP did not generate expected results for Intune data proc... | Run compattelrunner.exe -m:appraiser.dll -f:DoScheduledTelemetryRun ent on im... | 9.0 | ado-wiki |
| 7 | Intune for Education reporting is limited - Device Inventory, App Inventory, ... |  | Use Enterprise version of Intune for fuller reporting. | 7.5 | contentidea-kb |
| 8 | In our attempt to improve customer experience, we have made architectural lev... | This can occur if the request is being throttled. | This is by design. Customers should try accessing the reports again at a late... | 7.5 | contentidea-kb |
| 9 | Enterprise&nbsp;Privilege Management (EPM) Elevation reports take 24 hours to... |  |  | 7.5 | contentidea-kb |
| 10 | Intune device diagnostics log collection from portal fails intermittently or ... | Intermittent issue with the log collection upload to logmanagerservice endpoi... | 1. Check HttpSubsystem for logcollect requests to see timing: HttpSubsystem /... | 6.0 | onenote |
