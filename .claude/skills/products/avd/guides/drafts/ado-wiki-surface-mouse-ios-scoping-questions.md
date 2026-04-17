---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Sandbox/In-Development Content/Surface Mouse Support on iOS/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Sandbox/In-Development%20Content/Surface%20Mouse%20Support%20on%20iOS/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Scoping Questions - Surface Mouse Support on iOS (Windows App)

## 1. Environment and Configuration

- What iOS version is installed on the device?
- Which Windows App version is currently installed on iOS?
- Is the Surface Mouse paired directly with iOS at the system Bluetooth level?
- Are there any other external input devices connected to the iOS device?
- Is the user connecting to a Cloud PC, Azure Virtual Desktop, or Remote PC?
- Is the issue occurring before or after connecting to the remote session?

## 2. User Scenario / UX Flow

- What is the user trying to accomplish with the Surface Mouse?
- Does the Surface Mouse appear under **Windows App > Settings > Input Devices**?
- Is the mouse detected consistently or intermittently in the Windows App?
- Does the issue happen immediately when launching the app or after some time?
- Is the issue specific to a single Cloud PC or all remote resources?

## 3. Scope and Impact

- How many users are affected?
- Is this blocking the user from working or just impacting usability?
- Does the user have an alternative input method available?
- Is this affecting production workloads or business-critical tasks?

## 4. Reproducibility

- Can the issue be reproduced every time?
- Does the issue occur on other iOS devices with the same mouse?
- Does reconnecting the mouse or restarting the app change the behavior?
- Does the issue persist after reinstalling the Windows App?

## 5. Recent Changes

- Did this start after an iOS update?
- Did this start after a Windows App update?
- Were any Bluetooth, device, or accessibility settings recently changed?
- Was the Surface Mouse paired to another device recently?

## 6. Logs, Evidence, and Technical Data

- Confirm the exact Windows App version from the About section
- Screenshots of **Settings > Input Devices** showing the mouse
- Any error messages or unexpected prompts?
- Has in-app feedback been submitted?

## 7. Workarounds and Mitigation

- Does turning Bluetooth off and on restore mouse functionality?
- Does force-closing and reopening the Windows App help?
- Does unpairing and re-pairing the Surface Mouse resolve the issue?
- Can the user temporarily use touch or another input device?

## 8. Product vs Configuration Validation

- Is the mouse recognized by iOS outside of the Windows App?
- Does the mouse work correctly in other iOS apps?
- Is the behavior consistent with supported input device scenarios for iOS?
- Does the issue align with any known limitations of input devices on iOS?
