---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Reserve - User Provisioning/Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSandbox%2FIn-Development%20Content%2FReserve%20-%20User%20Provisioning%2FTroubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Reserve - User Provisioning Troubleshooting

## Provisioning option not visible in Windows App

**Common causes:**
- User not in scoped Entra ID group for self-provisioning setting
- Conflicting settings across multiple Entra Groups
- Windows App settings not yet delivered to client
- Missing active Reserve license or provisioning policy

**Troubleshoot:**
1. Try web client and app versions - check if showing in one but not other
2. Wait a few minutes, refresh/restart client
3. Verify user has setting enabled; check multiple groups/settings priority order
4. Check CPCD > Settings > User Settings Policy Overview blade
5. Verify license + provisioning policy + remaining time (Reserve License Report)
6. If unresolved, file ICM. Customers can still provision from Intune.

## Provisioning fails or does not start

Follow standard provisioning failure troubleshooting steps - not specific to user provisioning setting.

## Unexpected removal of Cloud PC entry

**Common causes:**
- Self-provisioning setting disabled or group scope changed
- Usage period expired, access automatically revoked
- Users should receive Windows App notification

**Troubleshoot:**
1. Check if user received notification
2. Verify setting enabled and group/settings priority order
3. Verify license + provisioning policy + remaining time
4. If unexplained, file ICM for setting <> Windows App communication issue

## Diagnostics and support

- Provisioning events captured in Windows App and Windows 365 telemetry
- Validate license assignment, policy scope, setting delivery before escalating
- No separate troubleshooting path for admin-initiated vs user-initiated provisioning - same backend logic
