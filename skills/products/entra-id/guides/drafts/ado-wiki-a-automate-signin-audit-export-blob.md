---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/How to Automate SignIn-Audit Logs query and export to Blob Storage?"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/How%20to%20Automate%20SignIn-Audit%20Logs%20query%20and%20export%20to%20Blob%20Storage%3F"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.Entra ID Logs and Reporting
- Workflow
- Sign-Ins
- cw.comm-orgmgt-tsg
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
# Premise
The following instructions are provided as a best effort for customers to download log data, if used please disclose that CSS doesn't support scripting and that this is to be taken as an example and not as an official Microsoft solution, Azure offers other alternatives to keep log data in the forms of [Azure Monitor](https://docs.microsoft.com/en-us/azure/azure-monitor/platform/platform-logs-overview).

# How to
## 1. [First you need to create an Automation Account](https://docs.microsoft.com/en-us/azure/automation/automation-create-standalone-account). 
1. Sign in to the Azure portal with an account that's a member of the subscription Administrators role and a co-administrator of the subscription.
1. Select + Create a Resource.
1. Search for Automation. In the search results, select Automation.
1. On the next screen, select Create new.
1. In the Add Automation Account pane, enter a name for your new Automation account in the Name field. You can't change this name after it's chosen.
1. If you have more than one subscription, use the Subscription field to specify the subscription to use for the new account.
1. For Resource group, enter or select a new or existing resource group.
1. For Location, select an Azure datacenter location.
1. For the Create Azure Run As account option, ensure that Yes is selected, and then click Create.
1. To track the progress of the Automation account creation, select Notifications in the menu.

![azure automation.png](/.attachments/azure%20automation-0bca9713-0252-4d2b-b2a5-131981174cd5.png)

## 2. After you create an Automation Account, you need to [create a runbook](https://docs.microsoft.com/en-us/azure/automation/manage-runbooks#create-a-runbook-in-the-azure-portal). Here you give your runbook a name and choose the type. In our case, it will be PowerShell.
In the Azure portal, open your Automation account.
1. From the hub, select Runbooks under Process Automation to open the list of runbooks.
1. Click Create a runbook.
1. Enter a name for the runbook and select its type. The runbook name must start with a letter and can contain letters, numbers, underscores, and dashes.
1. Click Create to create the runbook and open the editor.

![runbook.png](/.attachments/runbook-61ca15d5-364f-43e5-b57b-f5a6cf012571.png)
## 3. [Create an App registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
1. Sign in to the Azure portal using either a work or school account or a personal Microsoft account.
1. If your account gives you access to more than one tenant, select your account in the upper right corner. Set your portal session to the Azure AD tenant that you want.
1. Search for and select Azure Active Directory. Under Manage, select App registrations.
1. Select New registration.
1. In Register an application, enter a meaningful application name to display to users.
1. Specify who can use the application as "Accounts in this organizational directory only"
1. When finished, select Register.
1. Copy the ApplicationID and a client secret.
![app registration.png](/.attachments/app%20registration-7353e2a5-38aa-4f63-8b28-da9da916833e.png)

## 4. [Create a Storage Container](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-portal).
### Create an Azure Storage account
1. On the Azure portal menu, select All services. In the list of resources, type Storage Accounts. As you begin typing, the list filters based on your input. Select Storage Accounts.
1. On the Storage Accounts window that appears, choose Add.
1. Select the subscription in which to create the storage account.
1. Under the Resource group field, select Create new. Enter a name for your new resource group, as shown in the following image.
1. Next, enter a name for your storage account. The name you choose must be unique across Azure. The name also must be between 3 and 24 characters in length and can include numbers and lowercase letters only.
1. Select a location for your storage account, or use the default location.
1. Leave these fields set to their default values: Deployment model, Performance, Account kind, Replication, Access tier.
1. Select Review + Create to review your storage account settings and create the account.
1. Select Create.
1. Navigate to Access Keys, and write down your Storage Account Name and Key
![storage key.png](/.attachments/storage%20key-406d2497-c4a7-4ba2-b21d-491e2a896968.png)

### Create a container
1. Navigate to your new storage account in the Azure portal.
1. In the left menu for the storage account, scroll to the Blob service section, then select Containers.
1. Select the + Container button.
1. Type a name for your new container. The container name must be lowercase, must start with a letter or number, and can include only letters, numbers, and the dash (-) character
1. Set the level of public access to the container. The default level is Private (no anonymous access).
1. Select OK to create the container.
1. copy the container name.


## 5. Copy the scripts into the RunBook and adjust to your like
1.  Click the “Edit” button on your Runbook and add the contents of the script files provided, [AuditLogsAutomation.ps1.txt](/.attachments/AuditLogsAutomation.ps1-8aedb2bc-d37e-4df6-8726-4ee25d44c3c3.txt)[SignInLogsAutomation.ps1.txt](/.attachments/SignInLogsAutomation.ps1-b611ae81-638c-468d-ac6c-fb41d5cb55ee.txt)
![runbook edit.png](/.attachments/runbook%20edit-df68e270-8b6f-4c17-a74b-d6cfd1577478.png)
1. Fill in the Tenant ID and change how many days of logs you need, it is set for 7 days but this can be modified.
1. Add your ApplicationID, App secret, storage account name, storage account key, and blob container name
![runbook get script content.png](/.attachments/runbook%20get%20script%20content-26f93dd3-aa51-4d68-a8d2-d5c2f4f18791.png)1. Check all the variables in the script are filled, save and publish the script.
1. At this point, you should see a CSV for the logs you chose to export.
![csv.png](/.attachments/csv-17868e70-b85d-43ca-a11a-2bb616762316.png)
## Automate the script excution.
Now we can schedule these runbooks to run automatically in the background on the date and time which you choose and you will have all your audit and sign-in logs saved in your blob storage. At the linked Runbooks you can ad which runbook you want to have scheduled to run. 
![schedule.png](/.attachments/schedule-8bef2646-23d8-4569-9acd-04db344a7d50.png)
