# iOS Sysdiagnose via AssistiveTouch

## When to Use
When Apple sysdiagnose is needed for VPN/network/system-level troubleshooting (e.g., JAMF Trust VPN installation failure).

## Steps

1. Settings > Accessibility > Touch (under PHYSICAL AND MOTOR)
2. Enable AssistiveTouch
3. Select "Customize Top Level Menu"
4. Tap "+" to add a new function slot
5. Tap the new "+" placeholder > select "Analytics" > Done
6. **Reproduce the issue**
7. Tap the AssistiveTouch floating button > select "Analytics"
8. Wait up to 10 minutes for sysdiagnose generation (progress shown at top of screen)

## Locate the File
Settings > Privacy & Security > Analytics & Improvements > Analytics Data > search for "sysdiagnose" (check date/timestamp for latest).

## Notes
- File can be large; recommend uploading to OneDrive for sharing

## Source
- OneNote: IOS logs/IOS Generating the sysdiagnose via AssistiveTouch
