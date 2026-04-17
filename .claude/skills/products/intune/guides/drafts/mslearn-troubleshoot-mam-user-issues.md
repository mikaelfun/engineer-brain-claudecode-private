# Troubleshooting MAM User Issues — Error Messages Reference

Source: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/app-protection-policies/troubleshoot-mam

## Common Usage Scenarios

| Platform | Scenario | Explanation |
|----------|----------|-------------|
| iOS | Share extension works despite "Managed apps only" | Intune can't control iOS share extension without device management; data is encrypted |
| iOS | Prompted to install Microsoft Authenticator | Required for App-Based Conditional Access |
| Android | Must install Company Portal even without enrollment | APP functionality built into Company Portal app |
| iOS/Android | APP not applied on draft email in Outlook | Outlook doesn't enforce MAM on draft emails |
| iOS/Android | APP not applied on new unsaved documents | WXP doesn't enforce MAM until saved to managed location |
| Android | More restrictions than iOS on native app access | Android native app associations can be changed; use data transfer exemptions |

## iOS Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| App Not Set Up | No APP deployed | Deploy APP to user's security group targeting the app |
| Sign-in Failed | MAM enrollment failure | Deploy APP + verify targeting |
| Account Not Set Up | No Intune license | Assign Intune license in M365 admin center |
| Device Non-Compliant | Jailbroken device | Factory reset the device |
| Accessing Your Org's Data | Second work account sign-in | Only one work account per device for MAM |
| Alert: App can no longer be used | Certificate validation failure | Update/reinstall the app |

## Android Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| App not set up | No APP deployed | Deploy APP to user's group |
| Failed app launch | App crashes during MAM init | Update app + Company Portal |
| No apps found | No managed apps can open data | Deploy APP to at least one other MAM-enabled app |
| Sign-in failed | Auth failure | Sign in with enrolled account; clear app data |
| Device noncompliant | Rooted device | Factory reset |
| Unable to register the app | MAM auto-enrollment failure | Clear app data; send logs |
