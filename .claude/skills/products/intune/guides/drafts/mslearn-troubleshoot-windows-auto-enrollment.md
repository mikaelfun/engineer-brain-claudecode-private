---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/troubleshoot-windows-auto-enrollment"
importDate: "2026-04-21"
type: guide-draft
---

# Troubleshooting Windows 10 GP-based Auto-Enrollment in Intune

## Verification Checklist
1. Valid Intune license assigned to user
2. Auto-enrollment enabled (MDM user scope = All)
3. MAM User scope = None (otherwise overrides MDM)
4. MDM discovery URL: https://enrollment.manage.microsoft.com/enrollmentserver/discovery.svc
5. Windows 10 version 1709+
6. Entra hybrid joined: dsregcmd /status shows AzureAdJoined=YES, DomainJoined=YES
7. GPO deployed: Computer Config > Admin Templates > Windows Components > MDM
8. Device not enrolled via classic PC agent
9. Entra ID device quota not exceeded
10. Intune: Windows enrollment allowed

## MDM Log Analysis
Event Viewer > DeviceManagement-Enterprise-Diagnostic-Provider > Admin
- Event ID 75: Auto MDM Enroll Succeeded
- Event ID 76: Auto MDM Enroll Failed (e.g., 0x8018002b)

## Task Scheduler Diagnosis
Task: Microsoft > Windows > EnterpriseMgmt
- Runs every 5 minutes for 1 day
- Event ID 107: task triggered; Event ID 102: task completed
- If task missing: GPO not deployed or not yet applied
