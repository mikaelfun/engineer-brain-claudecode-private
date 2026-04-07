---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/MDO Protection For Teams"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FMDO%20Protection%20For%20Teams"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDO Protection for Microsoft Teams

## License Requirements

| Feature | All Teams Licenses | MDO P1 | MDO P2 |
|---------|-------------------|--------|--------|
| Built-in virus protection (SPO/ODB/Teams) | Yes | Yes | Yes |
| Near real-time URL warnings (up to 48h) | Yes | Yes | Yes |
| Safe Links (time-of-click URL protection) | | Yes | Yes |
| Safe Attachments (time-of-click file protection) | | Yes | Yes |
| Tenant Allow/Block List | | Yes | Yes |
| ZAP for Teams | | Yes | Yes |
| Teams messages in quarantine | | Yes | Yes |
| User-reported Teams messages | | Yes | Yes |
| Remove users from Teams chats | | | Yes |
| Attack simulation training (Teams) | | | Yes |
| Advanced hunting on Teams messages | | | Yes |

## Quick Configuration Validation

1. **Safe Attachments (SPO/ODB/Teams)**: Defender portal > Safe Attachments > Global settings > Turn on for SharePoint, OneDrive, and Teams
2. **Safe Links for Teams**: Ensure Teams integration is On in custom policies. URLs are NOT rewritten in Teams; protection is time-of-click
3. **ZAP for Teams**: Defender portal > Microsoft Teams protection > Toggle ZAP On; set Quarantine policy; review Exclusions
4. **Quarantine management**: Confirm admins can view/release/delete Teams messages and files
5. **Unsafe link warnings**: Teams admin center > Message settings > Messaging safety > Toggle On
6. **User reported settings**: Defender portal > User reported settings > Microsoft Teams section > Enable monitoring

## Protection Flow

### Safe Links (Time-of-click)
User clicks URL > Is URL known malicious? > Yes: Block > No: Allow + send to Sonar for detonation > If malicious verdict: block subsequent clicks + ZAP quarantines message

### Safe Attachments (Time-of-click)
File uploaded > Sent to Sonar for detonation > Malicious: Block file in OneDrive/SPO > Not malicious: Allow access. Files in 1:1/group/meeting chats stored in OneDrive; channel files in SharePoint.

### Unsafe Link Warnings (Built-in)
Known malicious URLs: warning at delivery. Post-delivery: warning added retroactively within 48 hours. ZAP blocks take precedence over warnings.

## Handling FPs/FNs

- **File FPs/FNs**: Follow Teams file FP/FN Guide (https://aka.ms/spofp)
- **Teams Message (URL) FPs/FNs**: Users report via "Report incorrect security detections" and "Report a security concern". Admins review/submit via Defender portal.

## Key References
- [Quickly configure Teams protection](https://learn.microsoft.com/en-us/defender-office-365/mdo-support-teams-quick-configure)
- [Manage quarantined messages](https://learn.microsoft.com/en-us/defender-office-365/quarantine-admin-manage-messages-files)
