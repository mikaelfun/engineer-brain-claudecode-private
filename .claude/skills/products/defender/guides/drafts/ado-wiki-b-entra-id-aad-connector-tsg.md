---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Microsoft First Party Connectors/Microsoft Entra ID - AAD Connector"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/Data%20Ingestion%20-%20Connectors/Microsoft%20First%20Party%20Connectors/Microsoft%20Entra%20ID%20-%20AAD%20Connector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

#Microsoft Entra ID Connector

[[_TOC_]]
___
##:white_check_mark:Free AAD License Connection [RESOLVED]
Note: This connector as with all Diagnostic Settings Connectors is supported by the Azure Monitoring Team 
###Description:
Unable to enable the AAD connector with a free AAD license. This is reproduceable and a known issue.

###Workaround:
1. Go to Entra ID
2. Select "Diagnostics setting" and "+add new".
3. Select "Send to Log Analytics" (and select the relevant subscription and workspace)
4. select: Entra ID Sign-in logs & Entra ID Audit logs
5. click "Save"
 
This should enable the connector as well, and you can check the connector blade to see the checkbox enable and data flowing in. (it might take some time for data to start flowing in after first init).

###IcM/Bug ID
https://portal.microsofticm.com/imp/v3/incidents/details/207040556/home

**Steps provided by PG to troubleshoot:**


1. Ask him to log in and out of the Portal.
2. Try activating the AAD connector again.
3. If the issue persists, go to Entra ID Extension from the portal search bar.
4. In Entra ID, go to the "Diagnostic settings" page under "Monitoring."<br>
![image.png](/.attachments/image-8aa5baf6-57c0-419e-a1c9-00cda2c2291d.png)
5. In the Diagnostic settings page, you should see a list of connected workspaces, if there are more than 5, that is the limit, and to add a different workspace, the customer must remove one of the connected workspaces before he can add a new one. ( please let us know if there was 5 )
6. On the Diagnostic settings page, we will click on "+ Add diagnostic setting."
7. In the Add diagnostic setting page, first give a name to the new setting, select Audit logs and Signup Logs from the right, and "Send to log analytics workspace" on the left.
8. After selecting Send to log analytics workspace, select the Subscription and Sentinel workspace that the customer would like to use.<br>
![image.png](/.attachments/image-836d525e-e795-4d14-a5b4-0f4a55c6e3e0.png)
9. After all, it is selected hit save of the top right. If all went okay, the logs should now be connected to Sentinel and checked in Sentinel to see.
10. If the customer still can't activate it, it is most likely an issue with diagnostic settings.

# Common Issues  

## 1. Error While Connecting/Creating Connector  
   - **Check if the prerequisites are met** (Green tick on all three).  
   - If the customer (**cx**) wants to publish **Sign-in logs**, verify if **P1 or P2 license** is provisioned.  
   - **Check error details**, if available.  
   - If no error details are present, check the following:  
     1. **Collect HAR trace**  
        - The HAR trace should be collected **from opening the connector till the error**.  
     2. **Check Diagnostic Settings in Entra ID**  
        - Ensure the number of **Diagnostic Settings in Entra ID is less than 5**.  
        - A maximum of **5 Diagnostic Settings** are allowed.  
        - If 5 settings are already present, ask the customer to **delete one** before retrying.  

## 2. [Known Issue] ERR: Failed to Load  
   - When opening the **Connector page**, an unexpected error occurs while loading data.  
   - **IcM Tracking:** [Incident 592639270](https://portal.microsofticm.com/imp/v5/incidents/details/592639270/summary)  

   #### **Temporary Mitigation via Feature Flag**  
   - Use the following feature flag:  
     [Azure Portal with Legacy Entra ID Component](https://portal.azure.com/?LegacyEntraIdComponent=true#home)  


#How to disconnect Microsoft Entra ID connector
To disconnect the connector customer can untick all the log types as seen below and click the "Apply Changes" button.
![SNTL - AAD Connector - Disconnect - 1.png](/.attachments/SNTL%20-%20AAD%20Connector%20-%20Disconnect%20-%201-0320c8e9-86b3-4434-bcb8-29fdefb3f074.png)

Once this had been done the "AzureSentinel_sentinel" configuration will be deleted in Entra ID | Diagnostic settings will be deleted.
![SNTL - AAD Connector - Disconnect - 2.png](/.attachments/SNTL%20-%20AAD%20Connector%20-%20Disconnect%20-%202-30a5d2d1-5643-403e-8cc6-1a697f9d7254.png)

After this data will stop being sent to the Sentinel Workspace. 

#Useful KQL
query to find when AAD diagnostics setting was updated.
```
let _startTime = datetime(2024-01-31T18:40:00Z);
let _endTime = datetime(2024-02-02T18:40:00Z);
let _operationName = 'microsoft.aadiam/diagnosticSettings/write';
let _tenant = '<TID>';
cluster("Armprod").database("ARMProd").EventServiceEntries
| where TIMESTAMP between (_startTime .. _endTime)
| where tenantId contains _tenant
| where operationName contains _operationName
| sort by TIMESTAMP
| project-reorder TIMESTAMP, status, operationName, operationId, resourceProvider, resourceUri, eventName
```

## Service Principal not found in Entra ID
If the Service Principal in the logs or Incident is not found in the Entra ID and the Sign-in logs are with servicePrincipalId = 00000000-0000-0000-0000-000000000000.
This means there is no service principal object for this app in the tenant � this is called service-principal-less authentication. The app is a multi-tenant SaaS app, and Entra is issuing tokens based on its home tenant registration, not a local Enterprise App in your directory.

Eg - sign-ins for �Crossware Email Signature for M365� are happening via client credentials (app-only) using appId 0f1b4d30-b53f-4cf3-8e96-75cb008ce84b against Microsoft Graph in the tenant. case - 2512160030003552

Documentation - [Service Principal Sign-in Logs FAQ](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/reports-faq#in-the-service-principal-sign-in-logs--what-does-it-mean-if-i-see--00000000-0000-0000-0000-000000000000--or-----for-service-principal-id-or-resource-service-principal-id-in-my-sign-in-logs-)


| Contributor Name | Details | Date (DD/MM/YYYY)|
|--|--|--|
| John Doe | Migrated | XX/XX/XXXX |
| Eddie Lourinho | Updated | 06/07/2023 |
| Parth Khemka  | Updated | 07/03/2025 |
| Parth Khemka  | Updated | 12/01/2026 |
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
