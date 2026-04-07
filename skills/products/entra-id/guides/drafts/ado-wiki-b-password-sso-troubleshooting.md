---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Password_and_Linked_SSO/Troubleshooting/Password SSO Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Entra%20ID%20App%20Management/Password_and_Linked_SSO/Troubleshooting/Password%20SSO%20Troubleshooting"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Password-based SSO Troubleshooting

## Overview

Password-based Single Sign-On enables secure application password storage and replay using a web browser extension or mobile app. This leverages the existing sign-in process provided by the application but enables an administrator to manage the passwords.

Two credential management modes:
1. **Administrator manages credentials** - Admin creates and assigns credentials to users/groups. Credentials are obfuscated but technically discoverable via web-debugging tools.
2. **User manages credentials** - End users enter their own credentials upon first access.

Supported browsers: Edge (Windows 10+), Chrome (Windows 7+, MacOS X+).

## App Configuration

1. Azure Portal > Azure Active Directory > Enterprise Applications > All Applications
2. Select the application > Single sign-on > Password-based Sign-on
3. Assign users and optionally provide credentials on their behalf

## Capturing Metadata for Custom Apps

**IMPORTANT: Automatic sign-in field capture is being phased out starting July 1, 2025 (UI change August 31, 2025).** Use Manual sign-in field capture instead.

### Manual Sign-in Capture
Requires Access Panel Browser extension installed, not in InPrivate/incognito mode.
1. Configure app for Password-based Sign-on in Azure Portal
2. Select "Manually detect sign-in fields"
3. Use Access Panel extension to capture form fields

### My Apps Secure Sign-in Extension
Download links:
- [Chrome Access Panel Extension](https://chrome.google.com/webstore/detail/access-panel-extension/ggjhpefgjjfobnfoldnjipclpcfbgbhl)
- [Edge Access Panel Extension](https://microsoftedge.microsoft.com/addons/detail/my-apps-secure-signin-ex/gaaceiggkkiffbfdpmfapegoiohkiipl)

#### National Clouds Configuration
If using a different My Apps URL from `https://myapps.microsoft.com`:
1. Right-click the extension icon > Select My Apps URL
2. Select your default URL
3. Sign in to the extension

## Password Rollover (Limited Support)
- Facebook: currently supported
- Twitter: partially supported (may fail if secondary auth required)
- LinkedIn: not supported (captcha requirement)

## Troubleshooting Common Issues

### Error: Unable to Save Credentials
**Root cause:** Hard limit of 48 keys per user per password-based SSO app.
**Solution:** Remove credentials for an app the user is no longer using.

### SSO Hangs on Loading Spinner
**Root cause:** SSO mode set to "Microsoft Entra ID single sign-on disabled".
**Solution:** Change mode to "Password-based Sign-on" in Enterprise Applications > Single sign-on.

### SSO Submits but App Doesn't Sign In
**Root cause:** Application's login form metadata has changed.
**Solution:**
- **Gallery apps:** Open ICM with App Name, App ID, Sign-on URL for metadata update.
- **Non-gallery apps:** Use Jarvis (SAW required) AppManagement/Password SSO action to retrieve/update metadata.

### Troubleshooting Gallery App Metadata
Gallery app metadata is managed by the feature engineering team. If the app's sign-in form changed, metadata needs updating. Open ICM with App Name/ID/Sign-on URL.

### Troubleshooting Non-Gallery App Metadata
1. Get Application ID from customer
2. Retrieve metadata from Jarvis using AppManagement/Password SSO action (requires SAW)
3. Verify: Redirection URL, username/password/login button elements, script section
4. If URL changed, get updated URL from customer
5. Create a new non-gallery app to test and capture correct metadata
6. Update customer's app metadata in Jarvis (Justification ID: 000)

### Access Panel Extension Issues
Troubleshooting steps:
1. Check extension is enabled in browser settings
2. Add site to trusted sites if blocked by security
3. Clear browser cache
4. Reset extension (sign out, close browser, reopen, sign in)
5. Reinstall extension

## ICM Escalation
For gallery app metadata issues, open ICM with the feature engineering team.
