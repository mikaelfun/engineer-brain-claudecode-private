---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Microsoft Teams: Determining Scope"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Troubleshooting%20Guides/Case%20Misroutes/Microsoft%20Teams%3A%20Determining%20Scope"
importDate: "2026-04-05"
type: routing-guide
---

# Case Misroutes: Microsoft Teams vs MDO Scope

SAP: Teams/Teams

## Microsoft Teams Scope

### Voicemail Spam / Voicemail Bombing
Verify that Microsoft Teams voicemail messages being spammed are real voicemail:
- Real voicemail: audio.mp3 attachment, legitimate sender
- Fake voicemail (phishing): .html attachment, Microsoft 365/Office 365 branding
- If unsure, collab with Teams to verify

### Spam Calls in Microsoft Teams
Spam calling is in Microsoft Teams scope.

### Teams Admin Center Settings
- Enabling/disabling "Report a security concern" and "Report inappropriate content" in Messaging Policies
- Managing global vs. custom messaging policies

### Teams Client Behavior
- How users report messages (via ellipsis > "Report this message")
- Visibility of reported messages to sender/recipient
- Reporting not available on mobile clients

### "Report inappropriate content" (Compliance feature, not MDO)

### Notification Behavior
- Email confirmation to users from submissions@messaging.microsoft.com
- Teams message sender is not notified when a message is reported

### Shared Channels Limitation
Reporting not supported in shared channels.

### Teams Admin Troubleshooting
- Issues with Teams client UI, message visibility, or notification behavior
- Problems with Teams admin center settings not applying

## MDO Scope

### False Negative: Undetected Phishing Voicemail Messages
The phishing email is in MDO's scope; a real MS Teams voicemail is in MS Teams' scope.

### Safe Links in Microsoft Teams Chats
- URL scanning at time-of-click, URL detonation and reputation checks

### Advanced Hunting Tables
- MessageEvents, MessagePostDeliveryEvents, MessageURLInfo
- Hunting across Teams messages with URLs
- ZAP visibility in MessagePostDeliveryEvents

### Attack Simulation in Teams
- Simulated phishing attacks via Teams
- Admin configuration, issues and limitations

### User Reported Submissions in Defender Portal

### ZAP in Microsoft Teams Messages (released to public 2026)
