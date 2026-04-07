---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Get Configuration/Get principal permissions"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FGet%20Configuration%2FGet%20principal%20permissions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## From ASC
To navigate there go to **Azure Support Center** > **Tenant Explorer** > {The scope to check the permissions at} > **Access Control** tab.

In the **Access Control** tab, use the **Check access** control. This will take a principal id and return the permissions that principal has, regardless if they have been granted through a group.

![image.png](/.attachments/image-e25413ed-bbc2-4b1a-b137-0273b6e94359.png)

You may also use the **Role Assignments** control under the **Access Control** tab. However, this uses the role assignments raw information, which means the principal id in the role assignment data may be a group, and not necessarily the principal id you are looking for. Using the **Check access** control is a preferred option.

## From Jarvis
Use [[JARVIS] Get scope role assignments](https://portal.microsoftgeneva.com/AD61011?genevatraceguid=31e6b03a-da91-4cc8-8d62-12b2b624c0e7)
![image.png](/.attachments/image-6960f905-62e9-45f0-93e8-ae965b163e43.png)
> Because this Jarvis action allows to specify the **tenantId**, it can be used to retrieve role assignments in cross tenant scenarios (like Lighthouse or Managed Applications)

> This Jarvis action will also return role assignments granted through a security group the principal being looked up is a member of.
