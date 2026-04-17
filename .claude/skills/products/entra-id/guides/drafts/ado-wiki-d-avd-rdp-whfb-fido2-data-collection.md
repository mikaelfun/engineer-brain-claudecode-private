---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/AVD or RDP Sign in using WHfB or FIDO2/AVD or RDP Sign in using WHfB or FIDO2 Data collection and analysis"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FAVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%2FAVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%20Data%20collection%20and%20analysis"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Data collection and analysis - WHfB/FIDO2 over AVD/RDP

## WebAuthN Event logs

These events are recorded in the **WebAuthN/Operational** event log of the client computer only when a Web authentication is performed using mstsc.exe or AVD's Remote Desktop client. A Web authentication triggers a FIDO2 assertion which requires the user have a FIDO2 Security key registered as an authentication method on their user account. In this scenario, the user can choose either the WHfB or FIDO2 PIN.

In Event viewer, navigate to **Applications and Services logs\Microsoft\Windows\WebAuthN\Operational**.

## Troubleshooting

### Azure Support Center (ASC)

Verify the user can perform a Windows interactive login to the client computer using either the WHfB PIN or their FIDO2 Security key.

### ASC Graph Explorer

Details about the Windows Hello for Business (WHfB) authentication methods registered on the user's account:

**Query**: `/users/username@contoso.com/authentication/windowsHelloForBusinessMethods`
**Version**: `beta`

Details about the Passkey (FIDO2) authentication methods registered on the user's account:

**Query**: `/users/username@contoso.com/authentication/fido2Methods`
**Version**: `beta`

**NOTE**: Querying `/users/username@contoso.com/authentication/methods` returns a list of all registered authentication methods, but the detail is missing compared to the specific method queries above. Bug 15004525 has been filed to get ASC to return this information.
