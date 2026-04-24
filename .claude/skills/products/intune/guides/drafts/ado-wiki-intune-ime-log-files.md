---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tip of the Week/Learning About Microsoft Intune IME Log Files"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTip%20of%20the%20Week%2FLearning%20About%20Microsoft%20Intune%20IME%20Log%20Files"
importDate: "2026-04-23"
type: guide-draft
---

# Microsoft Intune IME Log Files Reference

The Microsoft Intune Management Extension (IME) agent enhances Windows device management through MDM. It installs at C:\ProgramData\Microsoft\IntuneManagementExtension\Logs.

## IME Functionality
- Silently authenticates with Intune services before checking in
- Checks in every 8 hours (independent of MDM check-in)
- Periodically performs health checks for connectivity

## Log File Reference

| Log File | Description |
|----------|-------------|
| IntuneManagementExtension.log | Main log. Check-ins, policy requests, processing, reporting |
| AgentExecutor.log | PowerShell script executions deployed by Intune |
| AppActionProcessor.log | Detection and applicability checks for assigned apps |
| AppWorkload.log | Win32 app deployment activities |
| ClientCertCheck.log | Device client certificate checks |
| ClientHealth.log | Health of IME extension |
| DeviceHealthMonitoring.log | Hardware readiness, device inventory, data collectors |
| HealthScripts.log | Health of scheduled remediations |
| Sensor.log | Endpoint analytics data collection |
