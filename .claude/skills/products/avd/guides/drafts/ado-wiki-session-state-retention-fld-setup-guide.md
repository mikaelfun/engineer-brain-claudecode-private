---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Session State Retention FLD/Setup Guides"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Session%20State%20Retention%20FLD/Setup%20Guides"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Setup Guide - Windows 365 Session State Retention (Frontline Dedicated Mode)

## Step by Step

1. Confirm Cloud PC is Windows 365 Frontline in Dedicated Mode
2. Verify OS is Windows 11 24H2 or newer using Gallery Image
3. Verify compute size meets minimum (4vCPU/16GB/128GB)
4. Ensure Cloud PC is in a supported region
5. Ensure user connects using a supported Windows App client
6. This feature does not require an IT admin configuration as will be applied in wide tenants
7. Confirm provisioning policy is targeted for state retention

## What CSS should verify

- User disconnects (does not sign out completely)
- Apps remain open after disconnecting
- After some time, reconnect restores session state
- System clock updates to current local time

## What "good" looks like

- Apps remain open
- Session resumes without full reboot
- User productivity is uninterrupted
