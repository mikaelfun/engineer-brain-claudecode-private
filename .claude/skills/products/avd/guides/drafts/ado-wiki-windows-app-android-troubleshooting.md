---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Client Applications/Windows App/Unified Mobius Clients/Android"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Client%20Applications/Windows%20App/Unified%20Mobius%20Clients/Android"
importDate: "2026-04-21"
type: guide-draft
---

**Connection Flow for Android Client**
<div style="text-align: center;">

![iShot_2024-12-24_19.07.37.png](/.attachments/iShot_2024-12-24_19.07.37-35fe3d76-851c-4926-9da8-2886639e568a.png)
(src: [WindowsAppAndroid_threat_model.tm7](https://microsoft.sharepoint-df.com/:u:/t/CloudPCEngineeringTeam/ER-RRo-eqK9EqQl5Sho7tx8BqkYBQXqwVgqcMfmOqMH7Ag?e=lEGPQs))
</div>

<div style="text-align: center;">

![image.png](/.attachments/image-a21dc938-375d-4ee3-a65f-57167e730206.png)
(src: [WindowsAppAndroid Design Spec](https://microsoft.sharepoint-df.com/:w:/t/CloudPCEngineeringTeam/EX8lacIsjiVLtHGgiNzuqRQBUBGaHXuhDAMt6Pg5kMV2_g?e=Vcbxs6))
</div>

# **Troubleshooting**

**Verbose UI Logging.**

- Enable verbose logging by navigating to Help \ Troubleshooting \ Logging.. from the menu bar
- Select "Verbose" under "UI log level"
- Click "Start logging"
- Reproduce the issue
- Collect the log file from the location that was defined in the logging window.

![iShot_2024-12-24_20.37.05.png](/.attachments/iShot_2024-12-24_20.37.05-049c51a4-6457-4c46-be92-65220695a8db.png =x600)

***Logging Flow***

<div style="text-align: center;">

![Picture1.png](/.attachments/Picture1-cf809a9b-e4dd-4ae7-92e2-16a23d663a2d.png)
(src: [WindowsAppAndroid Design Spec](https://microsoft.sharepoint-df.com/:w:/t/CloudPCEngineeringTeam/EX8lacIsjiVLtHGgiNzuqRQBUBGaHXuhDAMt6Pg5kMV2_g?e=Vcbxs6))
</div>
** Logging uploading with powerlift (debug build supported first) **
TBD
