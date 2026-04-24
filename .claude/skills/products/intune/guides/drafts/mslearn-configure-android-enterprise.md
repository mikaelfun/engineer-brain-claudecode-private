---
source: mslearn
sourceRef: null
sourceUrl: "https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/configure-android-enterprise-devices-intune"
importDate: "2026-04-21"
type: guide-draft
---

# Configuring Android Enterprise Devices in Intune

## Enrollment Types
- Work Profile (BYOD): Containerized work apps, user retains personal control
- Dedicated (COSU): Kiosk/single-use, locked to specific apps
- Fully Managed (COBO): Corporate devices, single user, full admin control

## Setup Steps
1. Create Google service account (@gmail.com)
2. Intune admin center: Devices > Android > Android Enrollment > Managed Google Play
3. Select I agree > Launch Google to connect
4. Sign in with Google account, enter business name
5. Deploy apps via Managed Google Play

## Key Notes
- Google account is shared among IT admins for the tenant
- Account must NOT be associated with G-Suite domain
- Android Enterprise requires Google Mobile Services (unavailable in China/21Vianet)
