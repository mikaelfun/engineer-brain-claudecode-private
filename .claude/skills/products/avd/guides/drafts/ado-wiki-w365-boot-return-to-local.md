---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Boot/Return to Local"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Boot/Return%20to%20Local"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Return to Local

This feature enables end users to return to their physical PC using the CTRL-ALT-DEL screen or from Cloud PC error screens when their device is in Boot mode (Windows 11 only).

Administrators can configure and customize this feature within the Guided Scenario for Boot.
The policy needs to be added to a **user group**, not device group. Customer can determine which users can permanently or temporarily get access to this feature by adding or removing them from the user group assigned to this policy.

For the end user, a button is added in the CTRL-Alt-Del menu: **"Sign in to physical device"**.

If the end user experiences a disconnection or connectivity issue on the BTC device, the error screen will also include the option to "Sign in to the physical device".

## Configure "Return to Local" policies manually

If the customer has Boot to Cloud devices that were created before the "Return to Local" feature was released, customer can manually deploy this feature via an **Intune Configuration Profile** using the following settings:

- Create a Configuration Profile in Intune
- Apply the Return to Local CSP settings
- Assign to the appropriate user group

## Confirm that the policy reached BTC device

You can confirm that the policy was delivered to the BTC device by checking:

1. **Registry location** on the Boot device
2. **Intune diagnostic logs** (MDMDiagnostics.html)
3. Additional registry locations for Return to Local state
