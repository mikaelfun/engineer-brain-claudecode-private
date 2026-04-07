---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Provisioning/Provisioned with warnings - Policy caused, Firewall caused"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FFeatures%2FCloud%20PC%20Actions%2FProvisioning%2FProvisioned%20with%20warnings%20-%20Policy%20caused%2C%20Firewall%20caused"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Provisioned with warnings - Policy caused, Firewall caused

1. Check if the Customer is allowing the required endpoints in their firewall.
   For LP installation you need `*.download.microsoft.com` and `*.software-download.microsoft.com`.

2. If the customer is using Palo Alto, this Firewall solution also has the possibility to block the traffic with App Categories. So even though the endpoints based on FQDN and ports are opened, the firewall might block the traffic message as app detected.

   In this case, they need to check if the firewall policy in Palo Alto also has App Category configured. This may cause issues with the provisioning itself as well — not only Language and Region, but also: activation, WNS — so it's worth checking if Firewall is OK but the customer is still getting errors.

3. Check for the ASR policy blocking process creation from psexec and WMI.

4. Check for Application Control Policy/WDAC.

5. **Keyboard language list is not applied and keyboard language bar is not visible:**
   Customer is reporting that even though the custom LP is installed and Windows Display language is correctly applied, the language list and thus the keyboard language bar is not available.

   This is because this setting must be configured in user context.
   The customer can use the following script in user context to configure this, and do a logoff/logon or reboot:

   ```powershell
   $languageCode = "en-GB"  # language code set based on the prov policy configuration
   $LanguageList = New-WinUserLanguageList -Language $languageCode  # setting the language list based on the prov policy code
   $LanguageList.Add("en-US")  # adding the default US as well
   Set-WinUserLanguageList $LanguageList -force
   ```

6. **Provisioned with warnings — WinRM Policy conflict:**
   Another policy (GPO/SettingsCatalog or Custom OMA) that can break the LP installation is:
   **Allow remote server management through WinRM**

   If this policy is set to **Disabled**, it will cause a conflict in DSC installation and the LP installation to fail.

   Kusto and ASC will show the following message:
   ```
   Cannot complete the request due to a conflicting Group Policy setting. Modify
   the GP setting "Allow remote server management through WinRM" to either "Not Configured" or "Enabled"
   ```

   Make sure you **DO NOT** configure this policy at all (set to Not Configured or Enabled).
