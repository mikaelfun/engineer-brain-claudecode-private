---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/M365 Identity/M365 Admin Portal/Idle Session Timeout"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FM365%20Identity%2FM365%20Admin%20Portal%2FIdle%20Session%20Timeout"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Idle Session Timeout - M365 Web Apps

## Introduction
Idle session timeout allows configuring a policy for how long users are inactive before being signed out of Microsoft 365 web apps.

## Prerequisites
Must be a member of: Global admin, Security admin, Application admin, or Cloud Application admin roles.

## Important Notes
- Does **NOT** affect Microsoft 365 desktop and mobile apps
- If OWA and SPO idle timeout policies exist, enabling in M365 admin center **overrides** those
- Applies only to **unmanaged devices** where user does not check Keep Me Signed In (KMSI)
- **Not supported** when third-party cookies are disabled in the browser

## Supported Web Apps
- Outlook Web App
- OneDrive for Business
- SharePoint Online (SPO)
- Microsoft Fabric
- Microsoft365.com and other start pages
- Microsoft 365 apps (Word, Excel, PowerPoint) on the web
- Microsoft 365 Admin Center
- M365 Defender Portal
- Microsoft Purview Compliance Portal

## How to Enable
1. In M365 admin center > **Org Settings** > **Security & privacy** > **Idle session timeout**
2. Toggle on, choose default or custom time
3. Global admin role required for initial activation; other noted roles can deactivate/modify

## Workflow
1. **Session Initialization**: User logs in, authentication token established, activity tracking begins
2. **Idle Time Detection**: System monitors for mouse/keyboard activity; if activity detected, timer resets
3. **Inactivity Timer**: No activity for specified period -> inactivity timer starts
4. **Warning Prompt**: Countdown shown (e.g., "Your session will expire in 2 minutes")
5. **Session Termination**: No response -> token invalidated, user logged out
6. **Re-authentication**: User redirected to login page

## Common Issues

### Q: Idle session timeout not working?
**A:** Check if third-party cookies are disabled. Recommend:
- Microsoft Edge: tracking prevention set to **Balanced (Default)**
- Other browsers: third-party cookies enabled
- IE 11 no longer supported (since Aug 17, 2021)

### Q: Activity in non-supported app prevents timeout?
**A:** Activity in a web app not supporting Idle Session Timeout will NOT reset the idle timer for supported apps. Only supported web apps count.

## Troubleshooting

### Step 1: Confirm AbtActivity Cookie
1. Navigate to supported web app
2. Open DevTools > Application > Local Storage > select the web page
3. Look for **AbtActivity** cookie

**Sample AbtActivity Cookie:**
```json
{
  "records": [{
    "userId": "1003200239B9EA80",
    "timeout": 360,
    "activityDateTime": "Fri, 27 Oct 2023 18:32:56 GMT",
    "broadcastedActivityDateTime": "Fri, 27 Oct 2023 18:32:56 GMT"
  }]
}
```
- **userId**: PUID of logged-in user
- **timeout**: Session timeout in minutes
- **activityDateTime**: Most recent user activity
- **broadcastedActivityDateTime**: Most recent activity shared with service

If cookie missing: verify cookies enabled and Idle Session Timeout feature is enabled (allow a few minutes after enabling).

### Step 2: Browser-Specific Issues
If AbtActivity missing in only one browser:

1. Collect Fiddler trace or F12 logs
2. Look for **SendChannelRoundTripNotification** request — this is the client keep-alive/health check
   - If this request stops, session may be marked as idle
   - If not found, involve client team (pure client behavior)
3. After idle timeout triggers, look for request to **identity.osi.office.net** with `action=SHOULD_PROMPT`
   - This checks if user should be prompted for re-authentication
   - If not found, ESTS didn't process the action -> escalate to idle session PG with Fiddler from Assist 365

## Escalation
ICM template: **[ID] [M365] [MAC] - Organization Settings**
