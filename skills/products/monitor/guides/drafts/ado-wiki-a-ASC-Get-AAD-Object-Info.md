---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Azure Support Center/How to get object information for Azure Active Directory (AAD) object in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Azure%20Support%20Center/How%20to%20get%20object%20information%20for%20Azure%20Active%20Directory%20%28AAD%29%20object%20in%20Azure%20Support%20Center"
importDate: "2026-04-06"
type: troubleshooting-guide
---

How to get object information for Azure Active Directory (AAD) object in Azure Support Center

Instructions:
1. Open Azure Support Center from support request
2. Click on Tenant Explorer in the top navigation menu
3. Click on Directory object in the left navigation menu
4. In the Search for directory object tab, populate the Azure AD ObjectId, then click Run

Reviewing the results:
If the directory object is found successfully, details about the object will be returned:
- objectType: The type of Azure AD object (User, Group, Application)
- displayName: The friendly name of the object
- userPrincipalName: The user principal name used to sign into Azure AD
- appId: The Azure AD application identifier
