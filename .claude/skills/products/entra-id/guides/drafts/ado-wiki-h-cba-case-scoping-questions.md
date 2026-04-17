---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA: Case scoping questions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Cert%20Based%20Auth/CBA:%20Case%20scoping%20questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# CBA: Case Scoping Questions

## What
- Is the customer struggling to sign in with a cert (end user impact) or configure CBA use within the tenant (admin impact)?
- If this is a sign in issue is the user federated or not?
- If cert logon is working are they getting undesired/unexplained behavior? (i.e. no MFA despite CBA/CA policy config)
- Is the cert for CBA been used on a desktop (Windows/Linux/macOS) or mobile platform (iOS/Android)?
- Is the cert used for interactive logon to the desktop or within a web browser/app?
- Is the cert used within a web browser or an app?
- Is it a smart card or is the cert already deployed and stored on the device itself?
- Is impacted device a physical machine or virtual machine?
- Was the failing cert successfully used before or has it never worked?
- What OS/Browser are they unable to use the cert with? Get version details. (e.g. Chrome 119 on Windows 11 23H2)
- Is the cert been used within an RDP session or at the console (i.e. is the customer attempting to use smartcard redirection over RDP)
- Did the failures start after any recent software updates or configuration changes?

## When
- When did the failures start? If this is a new deployment that it has never worked?
- Is the issue reproducible at will or intermittent?

## Where
- Does the issue occur when the device is offline or online?
- Is corpnet access and internet access both available, or one of the two or neither?

## Extent
- How many users and devices are impacted?
