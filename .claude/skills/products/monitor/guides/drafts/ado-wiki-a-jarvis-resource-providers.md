---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Jarvis/How to get all registered and unregistered resource providers for a subscription from JARVIS"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Azure%20Monitor/How-To/Jarvis/How%20to%20get%20all%20registered%20and%20unregistered%20resource%20providers%20for%20a%20subscription%20from%20JARVIS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

# Quick Link
---
For convenience, if you are already familiar with this process, the following link can be used to take you directly to the Jarvis action:

* https://portal.microsoftgeneva.com/B99C548?genevatraceguid=a83d20c3-62a6-4ce3-af9e-1521c35dc79e

# Instructions
---
<table style="border:0px;" width="100%">
    <tr>
        <td style="border=0px;background-color:#efd9fd">
            <b>Note:</b> This process returns the current state of provider registrations. If the customer performed an action where the outcome may have been determined due to provider registration/unregistration, it is recommended to query the ARM logs to check if the status has changed since the time of their action. More information in Additional Notes at the bottom of the page.
        </td>
    </tr>
</table>

1. Collect the following information to retrieve the registration statuses.

   | Property | Description |
   |----------|-------------|
   | Subscription Id | The Azure Subscription Id. |

1. Open a browser and navigate to [Jarvis Actions](https://jarvis-west.dc.ad.msft.net/actions).
1. Set **Environment** to match the Azure environment you want to work against (usually Public).

 ![image.png](/.attachments/image-5617a203-44a0-4fe2-8499-c3651b1c1876.png)

1. In **Filter**, type **Get resource providers for** to filter down the action results then click on **Get resource providers for a subscription**.

 ![image.png](/.attachments/image-08634012-4cc9-4a85-86c8-faea61315a26.png)

1. Populate the form values as per the table below:

   | Property | Value |
   |----------|-------|
   | Subscription| <the subscription Id> |

1. Click **Run**.


# Results
---
If everything works as expected, you should see a JSON block of all the resource providers.

Each provider will appear first with the "namespace" key, and the provider name as the value.

![image.png](/.attachments/image-2b043794-db14-46cc-9ca5-54a75a7bf258.png)

At the end of each provider's section of the array, will be the "registrationState", that clarifies whether that provider is currently registered or not.

![image.png](/.attachments/image-9f02beb5-b540-48dc-b823-002c338353f9.png)


# Additional notes
---

Querying the API for the registration statuses will give the current registration status at time of query. 

This can be misleading if the customer encountered an error in the past (for example, several days ago), then reported the error, and we only query for the registration status several days after the fact once we receive the case. 

If the registration status returned by the API is unexpected or out of alignment with the customer's claim, we can query the ARM logs of HttpIncomingRequests to check if there have been any changes made.

An example would be such as the following

```
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests") 
| where PreciseTimeStamp between (datetime(2023-04-01 00:00:00) .. datetime(2023-04-07 00:00:00))
| where subscriptionId == "<the subscription Id>" 
| where httpStatusCode > 0
| where targetResourceProvider == "MICROSOFT.INSIGHTS" // use the specific Resource Provider(s) you are concerned with
| where operationName contains "register" // there will be both Register and Unregister actions possible
```
&nbsp;


# Resource Provider Specific Notes

<div style="margin:25px">

<details closed>
<summary><b>Microsoft.Insights/DiagnosticSettings</b></summary>
<div style="margin:25px">


If 400 from ARM on GET calls, check the Correlation Id in SvcIncomingRequests, then take the ActivityId to SvcOutgoingRequests, and look for an error along the lines of:

   | Property | Value |
   |----------|-------|
   | responseBody| "The access token is from the wrong issuer 'https://sts.windows.net/<tenant 1>/'. It must match the tenant 'https://sts.windows.net/<tenant 2>/' associated with this subscription. Please use the authority (URL) 'https://login.windows.net/<tenant 2>' to get the token. Note, if the subscription is transferred to another tenant there is no impact to the services, but information about new tenant could take time to propagate (up to an hour). If you just transferred your subscription and see this error message, please try back later." |


```
cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests") 
| where PreciseTimeStamp between (datetime(2023-05-01 00:00:00) .. datetime(2023-05-02 00:00:00))
| where subscriptionId == "<the subscription Id>" and httpStatusCode > 0
| where targetResourceProvider == "MICROSOFT.INSIGHTS" and targetResourceType == "DIAGNOSTICSETTINGS" and httpMethod == "GET"

cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests") 
| where PreciseTimeStamp between (datetime(2023-05-02 00:00:00) .. datetime(2023-05-03 00:00:00))
| where correlationId == "<Correlation Id from the ARM HttpIncomingRequests for the GET Diagnostic Settings call"

cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').Unionizer("Requests","HttpIncomingRequests") 
| where PreciseTimeStamp between (datetime(2023-05-02 00:00:00) .. datetime(2023-05-03 00:00:00))
| where ActivityId == "<Activity Id from the SvcIncomingRequests call"
```
</div>
</details>
