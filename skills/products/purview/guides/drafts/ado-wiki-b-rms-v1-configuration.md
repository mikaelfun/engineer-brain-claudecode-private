---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AD RMS/Learn: AD RMS/RMS v1/RMS v1 - Configuration"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FLearn%3A%20AD%20RMS%2FRMS%20v1%2FRMS%20v1%20-%20Configuration"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# RMS v1 - Configuration

Again, many moons ago, one must enroll for a server licensor certificate (SLC), among other things.

# SLC

## Enroll

Starting in 2012 Microsoft discontinued the UDDI service that managed the SLC enrollment and renewal. You renewed the SLC one last time and it effectively never expired.

Reference: [Renewing the SLC for RMS v1 after May 2012](https://social.technet.microsoft.com/wiki/contents/articles/15042.renewing-the-slc-for-rms-v1-after-may-2012.aspx)

## Offline Request

Use the offline request process when internet-based enrollment is unavailable. (Screenshots in original wiki.)

## Import SLC

Import the SLC through the AD RMS administration console. (Screenshots in original wiki.)

# Default Admin Site

Access via the AD RMS Administration console. (Screenshot in original wiki.)

# Manage SCP

Register/Unregister the SCP (service connection point).

## Register SCP

Register SCP via the AD RMS MMC → server properties → SCP tab → Change SCP.

## Unregister SCP

Unregister SCP via the same AD RMS MMC path.

> **Note**: Most content in the original wiki page is screenshot-based. Refer to the source URL for visual guidance.
