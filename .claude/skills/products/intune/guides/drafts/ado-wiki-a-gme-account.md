---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/GME account"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FGME%20account"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# GME Account Setup Guide

## 1. Create/Enable GME Account

> This step **needs to be done from a SAW machine**. If you do not have access to one, please ask any of your co-workers to do this.

1. Go to [aka.ms/OneIdentity](https://aka.ms/OneIdentity)
   - Sign in with your **PME** account or your **GME** account if you already have it.
2. Select "Create / Manage User account".
3. On domain, please select **gme** and place the alias for the account you want to create.
4. You will receive an email stating that your account is being created and is pending management approval.
   - FTE managers can approve without a SAW: https://aka.ms/OneIdentityApprovals
5. Once your account is created/enabled, you will receive another email stating: "Notice: Password for ***XXX*** has been changed"
   - **NOTE:** This email can be misleading. In the following steps you will need to reset your password or set your account as passwordless.

## 2. Request SAVM

1. Go to [aka.ms/savmrequest](https://aka.ms/savmrequest) — Sign in with your Microsoft account.
2. Fill out the form and wait for your Virtual SAW (SAVM) to be created (normally quick, can take 1-2 days).
3. After SAVM is created, go to [Trusted Development Cloud](https://tdc.azure.net/Welcome) and connect (sign in with your **Microsoft** account).
   - Expand the **CSS SAVM** section → choose geographic location → click **Request** button.
   - Once provisioned, click your SAWVM → **Connect** button → connect with CORP credentials using the provided RDP file.
   - **NOTE:** The RDP file is only valid for **15 minutes**. After that time you need to click "Connect" again to download a new valid RDP file.
4. Once SAW VM is opened, open a browser → go to [OneIdentity](https://oneidentity.core.windows.net/User) → sign in with your **Microsoft** account.
   - Select **gme** domain → enter your alias → click **Reset password**.
   - Store the password safely before the timer expires.

## 3. Setup GME Account and YubiKey

> You can use the same YubiKey you have setup for your MID account.
> If you haven't requested one: https://aka.ms/YubiKeyRequest

1. On your computer (not in the SAW machine), go to [aka.ms/SecurityKeySetup](https://aka.ms/OneYubi) → download/install **OneYubi** program (AKA Atlas Windows Client).
2. Sign in using your CORP **Microsoft** account.
3. Select "Reset Security Key" and create your PIN.
4. Select "Create Certificate" → enter your PIN → click **Get certificates**.
   - Make sure to select the **gme.gbl** account.
5. Once certificates are installed in the YubiKey, you are done! Wait at least 10 min to use your GME certificates/credentials (propagation can take some time).

## 4. Access ASC Fairfax using SAVM + GME

1. Sign in to SAVM using CORP credentials (@microsoft.com).
2. Open a browsing session → go to ASC Fairfax URL: **https://azuresupportcenter.usgovcloudapi.net**
3. Sign in using your **GME** Security Key.
4. Select "**Sign in using a certificate**".
5. Select the "**Microsoft Online Services GFS Internal CA2**" certificate.
   - Make sure you have your YubiKey plugged into your device.

## Additional References

- [SAWVM Request](https://dev.azure.com/Supportability/AzureSQLDB/_wiki/wikis/AzureSQLDB.wiki/1433769/SAWVM-Request)
- [How to setup GME, YubiKey and SAVM to access ASC for GCCH](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/1485020/How-to-setup-GME-YubiKey-and-SAVM-to-access-ASC-for-GCCH)
- [Azure Security Key Setup Guide](https://microsoft.sharepoint.com/teams/CDOCIDM/SitePages/SecurityKeySetupGuide.aspx)

## Troubleshooting

If you are having issues with your YubiKey and certificates, submit a request at:
**https://cloudmfa-support.azurewebsites.net/SecurityKeyServices/AssignSecurityKey**
