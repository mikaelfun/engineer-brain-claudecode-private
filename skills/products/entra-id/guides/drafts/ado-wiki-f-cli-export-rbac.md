---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure RBAC for Resources/CLI Export RBAC Assigned Roles"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20RBAC%20for%20Resources%2FCLI%20Export%20RBAC%20Assigned%20Roles"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
- cw.AAD-Workflow
- cw.AAD-RBAC
- CLI Export RBAC Assigned roles
- cw.comm-secaccmgt
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
# .\CLI_Export_RBAC V2.ps1 
Updated 3/2/22 (using objects over arrays) to export to csv

## Options

-mainmenu **_(manditory)_** 'All RBAC, All Groups, All Users, All Service Principals or Identity Unknown"

-tenandID **_(manditory)_** "your tenant id" 

(must selected either AllSubs or -subscriptionID)

not manditory -AllSubs All (will get all subs in the tenants entered)

not manditory - -subscriptionID "subscriptionid" 

-scopetype **_(manditory)_** DisplayName, scope, roledefinition name sorting

-Outputdirectory **_(manditory)_** "your destination directory

**Filename** will be created for you by the selections + time and date (should be impossible to overwrite) 

File will be named 

```
$Outputdirectory+"_" +$tenandID+"_" +$subscriptionselected.id+"_" +$mainmenu+"_" +$scope+"_" +$tdy+".csv"
```

 PII can and most likely will be included, make sure your local laws are enforced

## From a powershell prompt: 

For all subscriptions withing a single tenant

```
.\CLI_Export_RBAC.ps1 -mainmenu 'All Service Principals'  -tenandID "tenant id" -AllSubs All -scopetype DisplayName -Outputdirectory c:\temp\
```


For a single subscription

```
PS C:\users\Administrator\Documents> .\CLI_Export_RBAC.ps1 -mainmenu 'All Service Principals'  -tenandID "tenant id" -subscriptionID "subscriptionid" -scopetype DisplayName -Outputdirectory c:\temp\
```


You will be asked to signin if you haven't already with Az PowerShell module.
(you can login first connect-azaccount but you will still need to add the tenant id)
![image.png](/.attachments/image-20816ad3-4f34-4d7b-9f70-daa0db67db62.png)

It will look something like this:

![image.png](/.attachments/image-41918b5c-db49-4bc1-ad26-948baf6315f2.png)

Files will be created in CSV format and can be viewed in any Excel type spreadsheet software.

Save the attached file and remove the .txt extension to run from PowerShell.
[CLI_Export_RBAC_V2.ps1.txt](/.attachments/CLI_Export_RBAC_V2.ps1-996a5bda-3c49-4c93-8f61-862607bcfdf1.txt)
