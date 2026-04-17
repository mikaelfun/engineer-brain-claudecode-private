---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ESR/Workflow: ESR: Group Policy Settings"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FESR%2FWorkflow%3A%20ESR%3A%20Group%20Policy%20Settings"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## Enterprise State Roaming (ESR): Group Policy settings

**Summary:** This article provides an overview of Group Policy settings for Enterprise State Roaming (ESR) in Windows 11 and recent versions of Windows 10. It explains how to enable ESR and control data synchronization using specific Group Policies.

**Important:** In Windows 11 and the most recent versions of Windows 10, ESR provides synchronization for significantly fewer settings than in older Windows 10 versions.

Before getting in touch with the customer, check the list of settings that can be configured to sync in recent Windows versions.

The list is available here: [Windows roaming settings reference](https://docs.microsoft.com/en-us/azure/active-directory/devices/enterprise-state-roaming-windows-settings-reference)

---

There is no configuration needed to enable ESR on Windows client by default. You only need to enable it on the Azure tenant, and the devices should start syncing the data. However, there are ways you can control what data to sync using the following Group Policies.

You can manage sync categories through the **Sync your settings** policies. By disabling the category under **Computer Configuration > Administrative Templates > Windows Components > Sync your settings**

**Intune Policy:**
Intune supports custom configuration profiles using the CSP `./Vendor/MSFT/Policy/Config/Experience/AllowSyncMySettings`. Setting this to `0` disables syncing entirely or for specific categories. You can scope this to exclude any settings while keeping others enabled.

| Name | Description |
|------|-------------|
| Accounts: Block Microsoft Accounts | This policy setting prevents users from adding new Microsoft accounts on this computer. |
| Do not sync | Prevents users from roaming Windows settings and app data. |
| Do not sync personalize | Disables syncing of the Themes group. |
| Do not sync browser settings | Disables syncing of the Internet Explorer group. |
| Do not sync passwords | Disables syncing of the Passwords group. |
| Do not sync other Windows settings | Disables syncing of the Other Windows settings group. |
| Do not sync desktop personalization | Do not use; has no effect. |
| Do not sync on metered connections | Disables roaming on metered connections, such as cellular 3G. |
| Do not sync apps | Do not use; has no effect. |
| Do not sync app settings | Disables roaming of app data. |
| Do not sync start settings | Do not use; has no effect. |

For example, an organization may not want to allow desktop personalization to begin with, so there is no point in syncing desktop settings. Depending on how your group policy is configured, the following screen will be changed for the users.

In Windows 11 and recent Windows 10 versions, there are fewer settings available for synchronization.
