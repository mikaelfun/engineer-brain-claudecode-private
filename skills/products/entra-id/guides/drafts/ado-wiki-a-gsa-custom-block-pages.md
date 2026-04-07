---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Custom Block Pages"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FGSA%20Custom%20Block%20Pages"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# GSA Custom Block Pages

## Summary

This GSA feature allows administrators to configure a customized body via limited markdown language for their tenant's block page when they have configured policies blocking users from accessing risky, NSFW, or unsanctioned sites or apps. Users receive a clear HTML error message with Microsoft Entra Internet Access branding. With this feature they can customize the experience with text aligned to company style guides, callouts to Terms of Use documentation, hyperlinks to IT workflows, and more.

## Prerequisites

1. Follow Internet Access Published Prerequisites:
   - [Configure web content filtering](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-configure-web-content-filtering#prerequisites)
2. [Configure TLS Inspection](https://learn.microsoft.com/en-us/entra/global-secure-access/how-to-transport-layer-security)

### End User Prerequisites

1. Setup a properly secure local machine, VM, or sandboxed environment
   - Ensure this VM or Sandbox is Entra ID-joined to your onboarded tenant.
2. Install the latest Global Secure Access client.
   - Disable Secure DNS & built-in DNS.
   - Block QUIC traffic from your device.
   - Use the client health checker to check status.
3. Ensure Internet Access Traffic Forwarding is enabled for the device

### Admin Prerequisites

1. Login to Entra Portal as a Global Secure Access Admin
   - NOTE: If editing Conditional Access policies, also need Conditional Access Admin role.
2. Create a new (or use existing) web content filtering and/or threat intelligence policy under Global Secure Access > Secure.
3. Link policy to a security profile (and link SP to a CA policy) OR link to the Baseline Profile.
   - NOTE: CA policy changes take up to an hour to propagate via the user's Access Token.

## Configuration

### Admin UX

- Customizations support limited markdown, specifically `[link](https://www.example.com)`.
- Cannot change the default image on the block page (feature request for future release).
- Message cannot be longer than 1024 characters.

### MS Graph APIs

Make a PATCH request to:
```
https://www.graph.microsoft.com/beta/networkAccess/settings/customBlockPage
```

Body:
```json
{
  "state": "enabled",
  "configuration": {
    "@odata.type": "#microsoft.graph.networkaccess.markdownBlockMessageConfiguration",
    "body": "Example Text [click here](https://www.bing.com)"
  }
}
```

## End User Testing

As an end user, browse to the site configured to be blocked. Verify the customizations appear in the browser.

## ICM Escalations

| Area | IcM Path |
|---|---|
| Private Access Data Path | Global Secure Access / GSA Datapath |
| Private Access Control Plane | Global Secure Access / GSA Control Plane |

## Training

- Deep Dive Session Recording: https://aka.ms/AAxyuv7
- PowerPoint: https://aka.ms/AAxypx6
