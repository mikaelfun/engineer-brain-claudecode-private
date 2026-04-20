---
title: Troubleshooting Jamf Pro Integration with Intune
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-jamf
product: intune
type: troubleshooting-guide
---

# Troubleshooting Jamf Pro Integration with Intune

> Note: Jamf macOS Conditional Access deprecated since Sep 2024. Migrate to Device Compliance.

## Prerequisites
- Intune and Entra ID P1 licenses for all users
- Microsoft Intune Integration permissions in Jamf Pro
- Global Admin permissions in Azure

## Registration Failure Causes
1. Wrong app permissions in Entra ID (need only update_device_attributes)
2. Wrong tenant or non-global-admin consent
3. Expired Intune or Jamf license
4. User did not use Jamf Self Service
5. Integration turned off in Jamf Pro
6. Device previously enrolled - stale data
7. User denied JamfAAD keychain access

## Cleanup Procedure (stale enrollment)
1. Terminal: sudo JAMF removemdmprofile && sudo JAMF removeFramework
2. Delete inventory record in Jamf Pro
3. Delete device from AzureAD
4. Remove files under /Library/Application Support/ and /Library/Preferences/
5. Remove keychain entries for Microsoft, Intune, Company Portal, JAMF
6. Restart Mac, uninstall Company Portal
7. Delete instances from portal.manage.microsoft.com (wait 30 min)
8. Re-enroll via Jamf Pro Self Service

## Compliance Issues
- Compliant in Intune but noncompliant in Azure: follow cleanup procedure
- Compliance policy fails: use user groups, not device groups
