---
title: End-to-end guide for configuring Android enterprise devices in Microsoft Intune
source: mslearn
sourceUrl: https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/configure-android-enterprise-devices-intune
product: intune
date: 2026-04-18
---

# End-to-end Guide: Configuring Android Enterprise Devices in Intune

## Overview

Comprehensive guide covering Android enterprise device configuration and troubleshooting in Microsoft Intune.

## Enrollment Types

| Type | Use Case | Key Features |
|------|----------|--------------|
| Work Profile (BYOD) | Personal devices | Containerized profile, personal data separate |
| Dedicated (Kiosk/COSU) | Single-use corporate | Locked to apps, NFC/QR/Token enrollment |
| Fully Managed (COBO) | Corporate user devices | Full admin control, user-centric |

## Key Feature Differences

- **Work Profile**: Email/VPN/Wi-Fi/SCEP/PKCS profiles, custom profiles, compliance/CA
- **Dedicated**: Wi-Fi/SCEP/Trusted certs, kiosk management, NFC/QR/Zero Touch enrollment
- **Fully Managed**: Email/VPN/Wi-Fi/all cert types, NFC/QR/Zero Touch, full device control

## Setup Flow

1. **Connect Intune to Managed Google Play**: Devices > Android > Android Enrollment > Managed Google Play
2. **Deploy Apps**: Apps > All apps > Add > Managed Google Play app > Approve > Sync
3. **Enable Work Profile Enrollment**: Enrollment Restrictions > Block Android, Allow Android work profile
4. **Configure Conditional Access**: Deploy email app as Required + create email profile + device-based CA
5. **Enroll Device**: Company Portal > sign in > Accept work profile > Activate

## Work Profile Passcode Reset

1. Create device profile requiring work profile passcode (Device Restrictions > Work Profile Only)
2. User must authorize remote reset when prompted: "Secure your Work Profile"
3. If user skips authorization → "Initiating Reset passcode failed"
4. Admin uses Reset passcode action → temporary passcode displayed
5. User enters temp passcode then sets new PIN

## Common FAQ

- Unapproved Google Play apps NOT automatically removed from Intune portal (expected)
- Managed Google Play apps NOT shown under Discovered Apps (expected)
- System apps in work profile enabled by device OEM, not MDM (use Test DPC to verify)
- Wipe (Factory Reset) NOT available for work profile — only Retire (Remove Company Data)
- Company Portal logs: use in-app Menu > Help > Email Support (not file path method)
- Managed Google Play sync is manual — must click Sync button
- Device encryption required by Google for work profile — cannot be disabled
- Samsung Android 8.0+ may block third-party keyboards (Samsung restriction)
