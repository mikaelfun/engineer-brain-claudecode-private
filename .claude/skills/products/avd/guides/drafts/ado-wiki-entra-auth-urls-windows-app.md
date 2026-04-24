---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Client Applications/Entra Authentication discovered URLs for Windows App"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Client%20Applications/Entra%20Authentication%20discovered%20URLs%20for%20Windows%20App"
importDate: "2026-04-21"
type: guide-draft
---

odc.officeapps.live.com - hosting the first Auth prompt screen - directing to login.microsoftonline.com or login.live.com depending on the type of account.

login.microsoftonline.com (and 302 office.com) - requesting auth: pass or passwordless for Enterprise accounts

aadcdn.msauth.net - referred by login.microsoftonline.com - doing auth
aadcdn.msftauth.net - doing auth

*.cdn.office.net
ecs.office.com - getting tenant features and flights
ctldl.windowsupdate.com 

++ Certificate Checks [Azure Certificate Authority details | Microsoft Learn](https://learn.microsoft.com/en-us/azure/security/fundamentals/azure-CA-details?tabs=root-and-subordinate-cas-list#certificate-downloads-and-revocation-lists)

View Tenant Flights in trace for the GET ecs API call (you will need a wireshark trace to view extended call details and response. The screenshot below comes from my internal proxy server logging):
![image.png](/.attachments/image-f278a6b0-25c5-4848-97fc-8acacbd02e93.png)

Response type is JSON:

![image.png](/.attachments/image-8d49a789-9a0f-4d1b-a79a-0199c709fd61.png)