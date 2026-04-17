---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Government/Setup Guide/Set up SAW for GCCH"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Government/Setup%20Guide/Set%20up%20SAW%20for%20GCCH"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Secure Access Workstation (SAW) for GCCH Troubleshooting

**IF YOU HAVE NOT BEEN INFORMED BY YOUR MANAGER THAT YOU ARE JOINING THE GCCH TEAM, DO NOT COMPLETE ANY ACTIONS IN THIS DOCUMENT.**

## General notes

- Complete all of the below actions to get fully setup for your SAW machine and support GCC-High.
- Steps must be performed on your SAW machine will be indicated, otherwise your normal workstation (generally with VPN on) will work.
- If you have questions, reach out to your manager or Technical Advisor(TA) /Technical Lead (TL). 

> **NOTE**: For initial setup of your SAW device, you need to sign in, with your **corp credentials (@MSFT)** using a Smart Card or your YubiKey with your Corp credentials.

---

## Step 1. Order Smart Card

1. Connect to Azure VPN.
2. Go to [Global Security Self Service Portal](https://gsamportalam.corp.microsoft.com/rightcrowd/).
3. New Request → Badge Management Request → Chip only Smart Card → Yes → New Chip Only Smart Card.
4. Select Other (Smart Card Type).
   - GSAM: **GSAM Americas**
   - How to receive: Ship to my location
   - Justification: Need smart card for authentication with a SAW.

> **Alternative**: Use [corporate credential onto the Yubikey](https://microsoft.sharepoint.com/sites/Identity_Authentication/SitePages/CertificateServices/dsryubikeysetup.aspx?web=1#setting-up-your-fido-credential-on-your-security-key) method.

## Step 2. Order YubiKey

Request YubiKey: https://aka.ms/YubiKeyRequest

## Step 3. Join silos

1. Ensure Azure VPN is On.
2. Go to the [SAS Portal](https://sasweb.microsoft.com/Member).
3. Search "**CloudEnterprise**", select the result with ONLY "CloudEnterprise".
4. Click 'Join Silo'.

## Step 4. Request a SAW

1. Onboard as a New [C+AI / SAW User Onboarding](https://microsoft.sharepoint.com/sites/CentralizedSAWProgramTeam/SitePages/SAW-User-Onboarding.aspx).
2. Ensure you joined the CloudEnterprise Silo first.
3. [Fill the form](https://microsoft.sharepoint.com/teams/SCIMCentral/SitePages/Order-A-Saw.aspx).

## Step 5. Unblock your Smart Card

1. On your regular corp machine, open Company portal app.
2. Install "**Microsoft Smart Card Manager**" app.
3. Install "**Smart Card Drivers (SafeNet Minidriver)**".
4. Launch "**Microsoft Smart Card Manager**" and follow prompts.

## Step 6. Configure SAW

1. Plug into power supply and Ethernet.
2. Follow [SAW Onboarding steps](https://microsoft.sharepoint.com/sites/Security_Tools_Services/SitePages/SAS/SAW%20Onboarding%20for%20New%20Users.aspx#set-up-your-saw-device).
3. Select **re-image option** during setup.

## Step 7. Start VM

1. Open the VM, ensure network adapter with Default Switch is present.
2. Power up VM and enroll with Microsoft Corp account (Autopilot ESP).
3. Update with latest Windows updates.

## Step 8. Set up PME account

Follow: [Set up PME account](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1485020/Set-up-PME-account)

## Step 9. Grant rights to PME account

1. On SAW, browse [OneIdentity Site](https://oneidentity.core.windows.net/Group) in incognito.
2. Sign in with **@pme.gbl** account using certificate.
3. Search group "**W365-KustoAccess-PME**".
4. Add your alias as member → Submit Changes.

## Step 10. Access ASC Fairfax

- Open Edge InPrivate → https://azuresupportcenter.usgovcloudapi.net
- Sign in using PME Security Key.

## Step 11. Configure Kusto for GCCH

- Install [Kusto for SAW](https://aka.ms/kesaw).
- Add connection with Advanced connection string:

```
Data Source=https://cloudpc.usgovvirginia.kusto.usgovcloudapi.net;Initial Catalog=NetDefaultDB;dSTS Federated Security=True;Authority Id=pme.gbl.msidentity.com;Dsts Token Type=JWT
```

- Enter PME account: `alias@pme.gbl.msidentity.com`
- Select "Use certificate" and pick PME cert.

## Authentication Issues

Ensure PME certificate is present in SAW User Personal Certificates. If not, restart SAW.
Review: https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/191010/Authentication-Troubleshooting
