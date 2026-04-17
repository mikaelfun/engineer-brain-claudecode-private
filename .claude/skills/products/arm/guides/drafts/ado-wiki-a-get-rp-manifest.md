---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Get RP Manifest"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FGet%20RP%20Manifest"
importDate: "2026-04-06"
type: troubleshooting-guide
---

The RP manifests includes information about the RP supported types, actions and internal endpoints.

One useful thing we can also get from the RP manifest is the routing where the IcMs for the RP should go.

[[_TOC_]]

## From Jarvis
You can use the [[JARVIS] Get Manifest (self service)](https://jarvis-west.dc.ad.msft.net/5AE612FE?genevatraceguid=3c840823-860f-4b30-a9a3-8b4c655e5d27) action to get the RP manifest from Jarvis.

![image.png](/.attachments/image-8f1ac79b-1355-4582-a8b6-395728aba9be.png)

### IcM routing
Search for `incidentRoutingService` to get the IcM routing information.

![image.png](/.attachments/image-8acefba7-435c-4740-86b6-1780c66b61dc.png)


## From Azure DevOps
RP manifests are also available in [[ADO] Manifests - Repo](https://armmanifest.visualstudio.com/One/_git/Manifest).
> Note that this may not be what is actually deployed into Azure, so should only be used as a general reference.

### IcM routing
Search for `incidentRoutingService` to get the IcM routing information.

![image.png](/.attachments/image-26e59e6c-c237-46f3-b767-3b9cad1efbdb.png)
