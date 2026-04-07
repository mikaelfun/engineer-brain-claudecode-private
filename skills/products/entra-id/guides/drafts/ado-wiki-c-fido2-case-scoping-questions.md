---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Case scoping questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/FIDO2%20passkeys/FIDO2%3A%20Case%20scoping%20questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# FIDO2 / Passkey Case Scoping Questions

## What

- Is the issue impacting an end user or an admin of the tenant?
- Is the customer issue with a hardware security key (e.g. YubiKey) or a passkey on a phone (e.g. Microsoft Authenticator for iOS)?
- Is the end user struggling to enrol a passkey (e.g. at aka.ms/mysecurityinfo), sign in with a passkey or configure FIDO2/passkeys use within the tenant?
- Is the passkey been used on a desktop (Windows/Linux/macOS) or mobile platform (iOS/Android)?
- Is impacted device a physical machine or virtual machine?
- Was the failing passkey successfully used before or has it never worked?
- What OS/Browser are they unable to use the passkey with? Get version details. (e.g. Chrome 119 on Windows 11 23H2)
- Is the passkey been used within an RDP session or at the console (i.e. is the customer attempting to use webauthn redirection)
- Did the failures start after any recent software updates or configuration changes?

## When

- When did the failures start? Is this a new deployment?
- Is the issue reproducible at will or intermittent?

## Where

- Does the issue occur when the device is offline or online?
- Is corpnet access and internet access both available, or one of the two or neither?

## Extent

- How many users and devices are impacted?
