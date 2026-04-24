---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Cloud PC Actions/Disaster Recovery Plus/Setup Guide"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Cloud%20PC%20Actions/Disaster%20Recovery%20Plus/Setup%20Guide"
importDate: "2026-04-21"
type: guide-draft
---

[[_TOC_]]

Setup Guides
-----------------

To configure [disaster recovery plus](https://learn.microsoft.com/en-us/windows-365/enterprise/disaster-recovery-plus), use the following steps.

Resource Lookup Note: For more information about user settings, see [User settings](https://learn.microsoft.com/en-us/windows-365/enterprise/assign-users-as-local-admin).

 **Note:** When using disaster recovery plus, it's critical to configure and test the entire cross region flow as part of your repeating [business continuity and disaster recovery planning](https://learn.microsoft.com/en-us/windows-365/business-continuity-disaster-recovery). Before releasing widely across your whole environment, you should activate and deactivate multiple test devices to make sure that it's working as expected. You should also periodically check that your environment is healthy and configured correctly by using the [Cloud PC optional business continuity and disaster recovery status report](https://learn.microsoft.com/en-us/windows-365/enterprise/cross-region-disaster-recovery-report).

-------------------------

1.     Sign in to the [Microsoft Intune admin center](https://go.microsoft.com/fwlink/?linkid=2109431) > **Devices** > **Windows 365(under Device Onboarding)**> **User Settings**.
![Picture2.png](/.attachments/Picture2-f7a3802f-7f28-4a79-ba64-41ad492fcdbc.png)
2.     Select **Create** (alternately, you can make the following changes to an existing user setting).
3.     On the **Settings** page, type a name in the Name box.
4.     Set the values under **Point-in-time** restore service per your requirements. These values also apply to disaster recovery plus.
5.     Select **Optional Business Continuity** and **Disaster Recovery Settings**.
![Picture3.png](/.attachments/Picture3-aa2d5929-6781-46e5-add5-262a15e0f886.png)
6.     For **Enable additional DR for this User Setting**, select **Disaster Recovery Plus**.
7.     For **Network type**, select an option:
-  **Microsoft-hosted network**: Select the **Geography** and **Region** where your Cloud PC backups are created.
- **Azure network connection (ANC)**: Your selected ANC determines where the Cloud PC backups are created for disaster recovery plus. You must configure your ANC for your backup region to support the restored Cloud PCs.

8.     When configuring a backup location, consider things like data sovereignty and geographic distance between the user and the Cloud PC backup location. The greater the distance between your backup Cloud PC and your user’s connect location increases network latency and impacts performance. Full copies of your Cloud PCs are kept in the backup location, including all data stored on the Cloud PC disk.
9.     Indicate if end users are allowed to activate and deactivate DR Plus themselves. Currently, users can only activate/deactivate from the Cloud PC user portal.
10.   Select **Next**.
11.   On the **Assignments** page, add the groups containing users that you want this user setting applied to. All Cloud PCs associated with a user share the same disaster recovery plus settings.
12.   On the **Review + create** page, select **Create**.

After you finish this configuration, the first backup of the Cloud PC may take up to three days. Subsequent incremental copies take only a few minutes. To see the current state of backups, check the [Cloud PC optional business continuity and disaster recovery status report](https://learn.microsoft.com/en-us/windows-365/enterprise/cross-region-disaster-recovery-report).

Activate or deactivate disaster recovery plus in Windows 365
------------------------------------------------------------

During an outage or for testing, you can activate or deactivate Windows 365 disaster recovery plus to move users to their temporary Cloud PCs and back. Disaster recovery plus is designed for use during a large-scale event, with the temporary Cloud PCs activated and deactivated from the Intune admin center.

Using bulk actions, you can activate/deactivate cross region disaster recovery for individual devices or devices for all users in a group.

Activating disaster recovery plus moves users to a new temporary Cloud PC in a temporary region. Users can’t access the new Cloud PCs until the move is complete. 

Until the disaster recovery plus is deactivated, users work with the temporary Cloud PC in alternate region.

1.     Sign in to the [Microsoft Intune admin center](https://go.microsoft.com/fwlink/?linkid=2109431) > Devices > All devices > User settings> **Bulk device actions**.
2.     On the **Basics** page, select the following options:
- **OS: Windows**
- **Device type: Cloud PCs**
- **Device action: Optional disaster recovery**
- **Optional disaster recovery: Activate disaster recovery plus or Deactivate disaster recovery plus**
![Picture5.png](/.attachments/Picture5-4cddeac9-701e-445b-8aa6-691aca4e6de2.png)

3.     Select **Next**.
4.     On the **Devices** page, select at least one device > **Next**.
![Picture6.png](/.attachments/Picture6-146e825d-ad1c-4459-8303-d4942b790764.png)
5.     On the **Review + create** page, select **Create**.