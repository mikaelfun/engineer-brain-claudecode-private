---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Azure Support Center/How to get user role, permissions and role assignment scope in Azure Support Center"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Azure%20Support%20Center/How%20to%20get%20user%20role%2C%20permissions%20and%20role%20assignment%20scope%20in%20Azure%20Support%20Center"
importDate: "2026-04-06"
type: troubleshooting-guide
---

How to get user role, permissions and role assignment scope in Azure Support Center

Note: This process only works for users who have roles assigned. Users who have inherited role membership such as the Service Administrator will not produce any results because there is no specific role assigned yet the user has Owner permissions.

Get user details:
1. Collect the Principal Id (AAD Object Id) of the user

Find the resource:
1. Open Azure Support Center from support request
2. Navigate to Resource Explorer
3. Navigate the resource tree using Resource Provider or Resource Group view
4. Search for the desired resource

Check user permissions:
1. With the desired resource selected, click the Access Control tab
2. Under the Check access section, paste in the Principal Id and click Check Access
3. The result will be a list of role assignments applicable to that user
