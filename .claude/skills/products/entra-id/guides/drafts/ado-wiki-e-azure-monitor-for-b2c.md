---
source: ado-wiki
sourceRef: Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD B2C/Azure Monitor for Azure AD B2C
importDate: 2026-04-06
type: troubleshooting-guide
---

---  
Tags:  
- cw.Entra  
- cw.EntraID  
- cw.comm-extidmgt  
- Azure AD B2C  
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   


[[_TOC_]]



# Feature overview

We allow the use of Azure Monitor for Azure AD B2C.  This is enabled through resource projection (Azure Lighthouse) into the B2C directory.

This feature enables data retention and seamless Security information and event management (SIEM) tool integration of Azure AD B2C Activity Logs through Azure Monitor Diagnostic Settings. Traditional Azure AD B2C  Activity logs roll after 30 days, this feature allows the customer the ability to ship these logs off to Azure Storage and configure data retention.

These features become available:

- **Archive data to a storage account:** For long-term retention of data and archival, customers can route logs to an Azure storage account. This offers an extremely inexpensive way to keep data around for years. You can optionally specify a retention period on the data in the storage account and Azure Monitor will delete any events older than that period of time automatically.

- **Send to Log Analytics for search and analysis:** Log Analytics is Azures premium indexed log search and analytics platform. Soon to be powered by Kusto, customers can write advanced queries over their data to pivot and filter, then save their most important views. They can also benefit from Log Analytics out-of-box solution packs, which offer pre-built views and analytics suggested by the engineering teams emitting the data. Customers can even create alerts off of the data.

- **Sent to Event Hub for integration with custom or 3rd party tools:** Event Hub is an IOT-scale event streaming service that enables logs from Azure to get to external sources in near real time. Several SIEM and log analytic tools have integrated with this as their source of data from Azure, and customers can also consume this data directly from the event hub into. 




# Case handling

- Configuration of Azure AD audit logs is handled by [Queue - AAD - Account Management Premier](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Premier&QueueNameFilter=azure%20audit&SearchFlag=True) and [Queue - AAD - Account Management Professional](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management%20Professional&QueueNameFilter=azure%20audit&SearchFlag=True)

  
- Issues with the Azure Lighthouse deployment (step 3 - [Monitor Azure AD B2C with Azure Monitor - Azure AD B2C | Microsoft Learn](https://learn.microsoft.com/azure/active-directory-b2c/azure-monitor#3-delegate-resource-management)) needs collaboration to the ARM developer support team. 
<br><br>SAP:Azure\Lighthouse\Unable to delegate resources

- Issues with creating or accessing storage for the log archives is handled by [Azure Monitor Team](https://msaas.support.microsoft.com/queue/75328652-3c65-e911-8142-00155d895b13) 

- Configuration of third party SIEM tools are the responsibility of the third party vendor.

# How it works

The reporting architecture in Azure AD B2C consists of the following components and remain unchanged.

**Activity**

- Sign-in activities  Information about the usage of managed applications and user sign-in activities

- Audit logs - Provides traceability through logs for all changes done by various features within Azure AD B2C.

- Examples of audit logs include changes made to any resources within Azure AD B2C like users, apps, groups, roles, policies, authentications, etc.


## Frequently asked questions (FAQ)

**Q:  Which logs are currently included with this feature?**

**A:**  Both sign-in logs and Audit logs are included in this feature. You can find information about these logs [here](https://aka.ms/aadreports).  

**Q:  Whats the latency involved in seeing these logs in Event Hubs?**

**A:**  Average time for logs to show up is anywhere between 5 to 15 mins from the time the action is performed. [Learn more](https://learn.microsoft.com/azure/event-hubs/event-hubs-about) about Event Hubs and how it works.


**Q:  How much is the storage going to cost for my data?**

**A:**  The storage cost depends on the size of your logs as well as the retention period you choose. We have put together a planning guide that helps you make this determination. See [Estimated Storage Usage](https://www.csssupportwiki.com/index.php/sandbox%3AAzure_AD_Activity_Logs_in_Azure_Monitor#Estimated_storage_usage) which explains the storage cost based on average # of users and the amount of logs generated per day.

**Q:  What SIEM tools currently have Event Hub integration with Azure Monitor Diagnostics?**

**A:**  Currently, Azure Monitor Diagnostics is supported by Splunk, Qradar and Sumologic. You can check out the [integration doc](https://learn.microsoft.com/azure/azure-monitor/essentials/stream-monitoring-data-event-hubs#what-can-i-do-with-the-monitoring-data-being-sent-to-my-event-hub) for these connectors to understand how the connectors work.

**Q:  Can I access the data from Event Hub through other means (if SIEM integration is not there)?**

**A:**  You can use the Event Hub API  to access the logs into your custom solution.



# Configuring Azure Monitor for Azure AD B2C

Your subscription must be associated with B2C for this to be configured. Here is how to get subscription into B2C: [Azure Lighthouse architecture - Azure Lighthouse | Microsoft Learn](https://learn.microsoft.com/azure/lighthouse/concepts/architecture)

1.	Install Azure Powershell version 6.13.1 (or higher) 

2.	Gather the following information: 
- Tenant ID of your B2C directory 
- Object ID of user or group that you want to give contributor permission to the subscription 
3.	Download the ARM template and parameter file that correspond (you can just project a RG if you want to scope down access, but I've just projected the subscription)(doc) 

4.	Modify the parameter file with the info above. 
- Replace managedByTenantId with B2C tenantId 
- Replace principalId with the group or user objectid 
- Replace roleDefinitionId (below is an example for Contributor role) 
"roleDefinitionId": "b24988ac-6180-42a0-ab88-20f7382dd24c"
 
5.	Authorize the subscription for ManagedServices, this can take a few minutes. (Azure Portal -> Go to your subscription -> Resource Providers -> Microsoft.ManagedServices -> Register) 

6.	Open Powershell and login to your Entra ID tenant which has an Azure Subscription available 

7.	Set the context to the subscription you want to project (Select-AzSubscription <subscriptionId>) 

8.	Deploy your template (New-AzDeployment -Name <deploymentName> ` -Location <AzureRegion> ` -TemplateFile <pathToTemplateFile> ` -TemplateParameterFile <pathToParameterFile> ` -Verbose) 

9.	Go to your B2C tenant in the Azure Portal. Under the directory picker, make sure to select the new projected subscriptions: 
  
10.	Now you will be able to see your subscription in your B2C directory in the Subscriptions blade 

11.	Go to the Azure Active Directory extension (make sure that you've configured your subscription filter before you load the extension) 

12.	Go to Diagnostic settings and you should be able to configure Azure Monitor

## Alternate Method via Az PowerShell Module

You can also deploy necessary Azure Lighthouse Delegation via Az PowerShell module only using below example script.  Modify parameters to match your enviornment:

   ```
   #####################################################
   # Modify below variables to match your enviornment  #
   #####################################################
   
   # set your B2C subscription ID
   $subscriptionID = "eb3b1001-b064-40c1-ae8c-399c102ab254"
   
   # set your AAD B2C tenant ID
   $tenantID = "91ceb514-5ead-468c-a6ae-048e103d57f0"
   
   # set your B2C tenant object ID for group "B2C Monitor Contributors"
   $groupid = "1d2a07d6-3022-45cd-8b23-261f813af818"
   
   # Login with Owner permissions to your B2C subscription
   Connect-AzAccount -Subscription $subscriptionID
   Set-AzContext -Subscription $subscriptionID
   
   # Register needed resource providers
   Register-AzResourceProvider -ProviderNamespace "Microsoft.ManagedServices"
   
   # Deploy Azure Lighthouse Permissions, do not modify below
   $def = New-AzManagedServicesDefinition -Name "Azure Lighthouse for AAD B2C Log Analytics" -ManagedByTenantId $tenantID -PrincipalId $groupid -RoleDefinitionId "b24988ac-6180-42a0-ab88-20f7382dd24c" -Description "Grant Azure Lighthouse contributor role on subscription"
   New-AzManagedServicesAssignment -RegistrationDefinition $def
   ```

After Azure Lighthouse Delegation has been deployed, you will still need to configure Azure AD B2C Diagnostic Settings via [Create Diagnostic Settings](https://learn.microsoft.com/azure/active-directory-b2c/azure-monitor#51-create-diagnostic-settings) step.

  
# Azure Lighthouse supported features with Azure AD B2C

Azure Lighthouse enables multitenant management with scalability, higher automation, and enhanced governance across resources.

Furthermore, Azure Lighthouse includes multiple ways to help streamline engagement and management:
*   **Azure delegated resource management:**[Manage your customers' Azure resources securely from within your own tenant](https://learn.microsoft.com/azure/lighthouse/concepts/architecture), without having to switch context and control planes. Customer subscriptions and resource groups can be delegated to specified users and roles in the managing tenant, with the ability to remove access as needed.
*   **Azure Resource Manager templates:** Use ARM templates to[onboard delegated customer resources](https://learn.microsoft.com/azure/lighthouse/how-to/onboard-customer)and[perform cross-tenant management tasks](https://learn.microsoft.com/azure/lighthouse/samples/).

Azure AD B2C makes use of the above capabilities to enable customers to to delegate a resource, which allows Azure AD B2C (the Service Provider) to manage a Microsoft Entra ID (the Customer) resource.

Azure Lighthouse is typically used to manage resources for multiple customers. However, it can also be used to manage resources within an enterprise that has multiple Microsoft Entra tenants of its own, which is what we are doing here, except that we are **only delegating the management of single resource group**.

**Using Azure Lighthouse with Azure AD B2C is only supported when the customer uses the template available in the documentation:**

[Monitor Azure AD B2C with Azure Monitor - Azure AD B2C | Microsoft Learn](https://learn.microsoft.com/azure/active-directory-b2c/azure-monitor#33-create-an-azure-resource-manager-template)

You might see customers using Azure Lighthouse to delegate access to entire subscriptions, then creating resources within the Azure AD B2C tenant including Azure Function Apps, Azure Web Apps, Virtual Machines, and even other Azure AD B2C tenants. **Any of these operations are not supported and will put the Azure AD B2C tenant in a bad state**.


# Troubleshooting
Here are actions that can be followed for troubleshooting.

## Known Issues
1. Azure AD B2C and Azure AD audit\signinlog schema are not the same.  Make sure that any documentation you are following for designing log analytic queries is written for Azure AD B2C and not Azure AD otherwise your queries will not work as expected.  Note some examples at [Azure AD B2C Azure Monitor Create a Query](https://learn.microsoft.com/azure/active-directory-b2c/azure-monitor#61-create-a-query) .  There are also some Azure Monitor Workbook templates for Azure AD B2C logs on Github at [Azure AD B2C Reports & Alerts](https://github.com/azure-ad-b2c/siem)

## Common Issue with the Azure Lighthouse configuration

Log analytics workspace is not showing:
[Monitor delegated resources at scale - Azure Lighthouse | Microsoft Learn](https://learn.microsoft.com/azure/lighthouse/how-to/monitor-at-scale#create-log-analytics-workspaces)

Run this with an internal admin of the Azure AD B2C tenant:


```
$ManagingTenantId = "your-managing-AAD-B2C-tenant-id"

# Authenticate as a user with admin rights on the managing tenant
Connect-AzAccount -Tenant $ManagingTenantId

# Register the Microsoft.Insights resource providers Application Ids
New-AzADServicePrincipal -ApplicationId 1215fb39-1d15-4c05-b2e3-d519ac3feab4 -Role Contributor
New-AzADServicePrincipal -ApplicationId 6da94f3c-0d67-4092-a408-bb5d1cb08d2d -Role Contributor
New-AzADServicePrincipal -ApplicationId ca7f3f0b-7d91-482c-8e09-c5d840d0eac5 -Role Contributor
```


## ICM

The incidents have to routed to different teams based on the scenario.

If the Customer is not able to see SignIn Logs or Audit log in Azure Monitor configured sync locations ( Event Hub, Storage account or Log Analytics), you could log an incident with the following template

<https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=z1l1V3>

For Azure Monitor area we have 3 and we will continue to re-use the one we use for Diagnostic Logs. Below is the aka link that you can use and it will shield you if we change the template at some point.

<https://aka.ms/MonitorLogs_ICM>

# Supportability documentation

[Monitor Azure AD B2C with Azure Monitor - Azure AD B2C | Microsoft Learn](https://learn.microsoft.com/azure/active-directory-b2c/azure-monitor)
