---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/FIDO2/FIDO2: Scoping"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FFIDO2%2FFIDO2%3A%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# FIDO2 Scoping Guide

## Goal
The scoping section has been built in a specific order to give you a complete view of the customer environment and their problem.

## Scoping Questions

### What
- Is it an issue during sign-in on Windows?
- Is it an issue to access an on-premises resource?
- What is the manufacturer / product name / version?
- Is it a physical token?
- USB, NFC, or Bluetooth?

### Where
- Hybrid joined devices?
- Clean install of Hybrid AADJ machine?
- AAD joined devices?
- OS version impacted?
- Is the issue reproduced on the latest build?

### When
- Did the issue start after a UPN change?
- Any connectivity to AD/DC while the problem occurs?
- Did the issue start after an in-place upgrade?
- After installing a specific update?
- Did anything change prior to the problem beginning?
- When is the error received?
- Is it reproducible?

### How
- Settings deployed via Intune or GPO?
- Are DCs running Windows Server 2016 or 2019 with KB4534307 and KB4534321 (at minimum)?

## Quick Wins

- **WebAuthN requires Windows 10 version 1903 or higher.**
- **UPN change**: If a user's UPN changes, the FIDO2 credential must be re-registered at http://aka.ms/mysecurityinfo.
- Internet connectivity is a prerequisite. First-time sign-in requires internet. Subsequent sign-ins use cached login.
- Patch majority of Windows Server 2016/2019 DCs (KB4534307 for 2016, KB4534321 for 2019).
- After clean Hybrid AADJ install, user must sign in with password first and wait for policy sync before FIDO works. Check `dsregcmd /status` for AzureAdJoined=YES and DomainJoined=YES.

## Unsupported Scenarios

### Sign-in to Windows 10/11 devices
- AD DS domain-joined (on-premises only) deployment
- RDP, VDI, and Citrix scenarios using a security key
- S/MIME using a security key
- "Run as" using a security key
- Log in to a server using a security key
- Offline sign-in without prior online sign-in
- Multiple AAD accounts on security key (uses last added account)
- Unlock on Windows 10 version 1809 (use 1903+)

### SSO to on-premises resources
- AD DS-joined (on-premises only) deployment
- RDP, VDI, and Citrix scenarios using a security key
- S/MIME by using a security key
- Run as by using a security key
- Log in to a server by using a security key
