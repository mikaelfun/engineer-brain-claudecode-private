---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Features Restrictions and Custom/Android/Zebra Support"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FAndroid%2FZebra%20Support"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Zebra Device Support Collaboration Guide

## Support Boundaries

**Zebra owns:**
- Zebra software (StageNow, OS, OEMConfig app schema content)
- Zebra system apps, hardware, firmware
- FOTA: enrollment, deployment settings, firmware delivery, numeric error codes

**Microsoft owns:**
- Importing OEMConfig XML from Zebra MX and creating delivery policy
- Once policy confirmed on device → Zebra owns all settings functionality
- All native Intune functionality not specific to Zebra
- FOTA: Connecting Intune-Zebra tenants, delivery of OEMConfig/app config policies

## Data Collection for Zebra Issues
- Deployment ID (for FOTA deployment issues)
- Device info: Serial Number, Model, FOTA Enrollment status, Update Status
- Email/account on Zebra Portal (when contacting Zebra on customer's behalf)

### How to Get Deployment ID
Intune Admin Center → Devices → Android → Android FOTA deployments → View Report → ID in report link

### How to Get Device Info
Settings → System → Advanced → System Updates

## Microsoft → Zebra Escalation Process
1. Raise ICM escalation for CxE team review (ensure misconfigurations ruled out first)
2. If needed, ask customer to raise Zebra ticket at https://supportcommunity.zebra.com/s/contactsupport
3. Get Zebra Case ID, include Microsoft case info in Zebra ticket using template
4. Microsoft SE must be included in all correspondence until case closed

## Zebra → Microsoft Process
1. Ask customer to open Microsoft SR via Intune Admin Center (free of charge)
2. Get Microsoft case ID/SR# from customer
3. Microsoft responds within 1 business day

## Key Notes
- Reach out to Intune CxE team BEFORE contacting Zebra contacts
- Do NOT share Zebra internal contacts with customers
- FOTA training: CxE Readiness - 2305 Zebra Lifeguard Over-the-Air (LG OTA) integration
