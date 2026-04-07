---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Device Registration/Window Devices/Microsoft Entra Join/Mapping Entra ID Joined Device SIDs to Entra ID Objects"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Join%2FMapping%20Entra%20ID%20Joined%20Device%20SIDs%20to%20Entra%20ID%20Objects"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Overview

When a Windows device is joined to Entra ID, specific roles may be added to the local administrators group in the form of SIDs (security identifiers) that serve as a reference to their directory object in Entra ID. Customers will often ask support engineers for assistance as they attempt to find the directory objects that correlate with the SIDs.

These SIDs can be found under **Local Users and Groups > Groups > Administrators**. Based on the SIDs alone, we are not able to easily tell which roles are being referenced.

## Entra ID SIDs

Entra ID mapped SIDs appear with the prefix `S-1-12-1-`, followed by four dash-separated groups of integers.

Example: `S-1-12-1-1234567890-1234567890-1234567890-1234567890`

## SID2GUID PowerShell Script

The SID2GUID script converts SIDs found in Entra ID Joined Windows devices to GUIDs from directory objects in Entra ID. The script can also convert GUIDs back to SIDs.

**Script location**: https://github.com/ms-robgarcia/SID2GUID

## Instructions

1. Open the script `*.ps1` file in PowerShell
2. Provide a SID with the prefix `S-1-12-1-` (Entra ID object SID) or an Entra ID object GUID
3. The script will parse through the value, determine if it's a valid SID or GUID, and convert it accordingly

## Searching in ASC

Once engineers obtain the GUID value using the SID, they can search the directory for the object in Azure Support Center (ASC):

1. Navigate to **Tenant Explorer** > **Directory object**
2. Search using the GUID value

## Additional References

- [How to manage local administrators on Microsoft Entra joined devices](https://learn.microsoft.com/en-us/entra/identity/devices/assign-local-admin)
