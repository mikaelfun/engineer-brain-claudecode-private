---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Frontline/Frontline Shared/Cloud Apps Support for Intune Autopilot DPP-FLS/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Frontline/Frontline%20Shared/Cloud%20Apps%20Support%20for%20Intune%20Autopilot%20DPP-FLS/Setup%20Guide"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Cloud Apps Support for Intune Autopilot DPP-FLS Setup Guide

## Instructions

Create a Windows Autopilot device preparation policy (DPP) using this tutorial: [Overview for Windows Autopilot device preparation in automatic mode for Windows 365 (preview) in Intune | Microsoft Learn](https://learn.microsoft.com/en-us/autopilot/device-preparation/tutorial/automatic/automatic-workflow)

In Step 3 - You can include any Windows apps in your device group assignment + DPP. However, note that Cloud Apps can only discover .exes with shortcuts in the Start Menu; Cloud Apps cannot discover UWP apps even if they successfully install.

In Step 5 - for **Experience**, select "Access only apps." In **Configuration**, under **Windows Autopilot (Preview)** select "Prevent users from connection to Cloud PC upon installation failure or timeout" to ensure apps have installed on Cloud PCs before Cloud App discovery happens.

Once the policy is created, in "All Cloud PCs", you should see the Cloud PCs provisioning. In "All Cloud Apps," there will be a row "Preparing" for your policy.

Once there is a Cloud PC provisioned, Cloud Apps discovered on the Cloud PC's Start Menu will populate the "All Cloud Apps" list.

You can take Cloud App actions (i.e. publish, edit) and connect to published Cloud Apps.

## Known limitations

- DPP: [Windows Autopilot device preparation known issues | Microsoft Learn](https://learn.microsoft.com/en-us/autopilot/device-preparation/known-issues)
- Cloud Apps won't discover all apps in the Start Menu. You will not see AppX packages, such as Teams, new Outlook, Paint, Notepad, etc.
- After initial provisioning, if you want to add additional Intune apps as Cloud Apps to an existing policy, then you need to add the Intune app(s) to the device group + DPP and reprovision the collection for the app(s) to appear in "All Cloud Apps" for publishing.
