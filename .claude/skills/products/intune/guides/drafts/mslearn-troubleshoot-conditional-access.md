---
title: Troubleshoot Conditional Access in Intune
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-protection/troubleshoot-conditional-access
product: intune
date: 2026-04-18
type: troubleshooting-guide
---

# Troubleshoot Conditional Access in Intune

## Requirements for Conditional Access
- Device must be enrolled in MDM and managed by Intune
- User and device must be compliant with assigned Intune compliance policies
- User must be assigned a device compliance policy
- Exchange ActiveSync must be activated for native mail clients (auto for iOS/iPadOS and Android Knox)
- On-premises Exchange requires properly configured Intune Exchange Connector
- On-premises Skype requires Hybrid Modern Authentication

## Compliant Device But User Still Blocked
- Ensure user has Intune license assigned
- Non-Knox Android: user must click Get Started Now in quarantine email
- New enrollment: wait a few minutes for compliance info to register
- iOS: existing manually configured email profile blocks Intune email profile deployment - remove existing profile
- Device stuck in checking-compliance: update Company Portal, restart device, try different network
- Android encryption with default PIN: Intune marks noncompliant - user must set non-default PIN via Secure start-up
- Android first access: Company Portal must not be running, click Get Started Now in quarantine email
- Android No certificates found: enable Browser Access in Company Portal Settings

## Devices Blocked Without Quarantine Email
- Verify device present as Exchange ActiveSync device in admin console
- Device offline may not receive activation email
- Check email client uses Poll not Push

## Noncompliant Device Not Blocked
- Review Target and Exclusion groups
- Check Exchange Connector points to correct Exchange server
- Get-MobileDeviceStatistics -mailbox mbx to verify device existence
- Get-CASmailbox -identity:upn | fl for access state details

## Devices Noncompliant But Users Not Blocked
- Windows PCs: CA only blocks native email app, Office 2013 with Modern Auth, Office 2016
- After selective wipe/retire: Exchange caches access rights for 6 hours
- Surface Hub/Bulk-Enrolled/DEM devices: deploy compliance to device groups not user groups
- Check policy assignments and exclusion groups

## App-Based CA Sign-In Errors
- Check app protection policies configuration
- See Azure AD Conditional Access troubleshooting guide
