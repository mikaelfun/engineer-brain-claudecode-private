---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitoring Essentials/Autoscale/Troubleshooting Guides/Troubleshooting email notifications not being received"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitoring%20Essentials/Autoscale/Troubleshooting%20Guides/Troubleshooting%20email%20notifications%20not%20being%20received"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
---

This troubleshooting guide applies to an Autoscale action having been taken but one or more email notifications that were expected were not received.

# Support Boundaries
---
- [Support Boundaries - Autoscale](/Azure-Monitor/Support-Boundaries#autoscale)

# Information you will need
---

- The resource id of the Autoscale setting.  The Azure portal is configured to ask the user to select the resource that is being managed so you'll need to find the details of the Autoscale setting in Azure Support Center.

   [How to get Autoscale configuration details from Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-Autoscale-configuration-details-from-Azure-Support-Center)

- The timestamp in UTC of when the Autoscale action was taken

   - The customer is asked to provide this as part of the scoping questions when opening the support request.

::: template /.templates/TSG-KnownIssues-Autoscale.md
:::

# Troubleshooting
---

1. **Confirm that the Autoscale action was taken.**

   For a notification to have been issued, the action has to have been taken.  This ensures that you are troubleshooting a failed notification rather than an expected action to have occurred that didn't.

   [How to get details of executed Autoscale scaling actions in Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-get-details-of-executed-Autoscale-scaling-actions-in-Azure-Support-Center)

1. **Get the Autoscale job trace logs for the ActivityId of the taken action.**

   [How to analyze Autoscale job trace logging in Azure Support Center](/Monitoring-Essentials/Autoscale/How%2DTo/How-to-analyze-Autoscale-job-trace-logging-in-Azure-Support-Center)

1. **Get the AzNS Notification ID.**

   Sending of the emails is performed by the Azure Notification Service (AzNS).  Once the request to send a notification has been successfully sent to AzNS, a notification identifier (Notification ID) is returned in response.

   Search the **Message** property of the trace logs for the text **AzNS Notification ID** to find the response.

   ![image.png](/.attachments/image-aa92a632-fa5c-4d5b-9062-611d15ed315d.png)

1. **Trace the AzNS Notification ID to identify if it was successfully processed.**

   AzNS will construct the email and then submit a request for the email to be sent.

   [How to trace an Azure Notification in Jarvis](/Alerts/How%2DTo/Action-Groups-and-Notifications/How-to-trace-an-Azure-Notification-in-Jarvis)

   <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#efd9fd">   
   **Note**   
   The **Notification ID** translates to the **ActivityId** property in AzNS notification trace logs.
   </div>
   
1. **Get the AEOBATCH ID.**

   Once AzNS has constructed the email, it will submit the request to actually send it.  The primary provider for this is Azure Email Orchestrator (AEO).  If the request is successfully submitted, there will be a trace message **Sent email to provider [AEOBATCH] and got back Id** that will include the AEOBATCH ID.

   ![image.png](/.attachments/image-d4b34cf0-f63c-40ae-92a2-78be0a87cd31.png)

1. **Analyze the AEO trace logging.**

   The AEO trace logging will show exactly what occurred when attempting to send the email notifications to the customer.

   [How to get trace logs for emails sent via AEO in Kusto](/Alerts/How%2DTo/Action-Groups-and-Notifications/How-to-get-trace-logs-for-emails-sent-via-MEO-\(Formerly-AEO\)-in-Kusto)

1. **Send a test email.**

   If everything appears correct from our side, send the email address a test email to see if you get a bounce message back.  

   Reasons why an email might bounce:

   - Email address or destination SMTP server cannot be resolved.
   - Destination email server is configured not to allow messages from an outside sender (often associated to distribution groups).

   If everything is working, the customer should receive your test email.

      <div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">
      
      **Important**
      
      Get confirmation from your customer before sending a test email and ensure your test email is phrased so that it is very clear that you are from Microsoft and conducting a test of email connectivity on behalf of your customer for a support request as the email address may be a distribution group with members who could be taken by surprise at receiving the email.
      </div>



## Getting Help
:::template /.templates/TSG-GettingHelp-Autoscale.md
:::

# Product Group Escalation

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">      
If the autoscale action was successful, then you should engage the Azure notification service team to investigate notification issue   </div>
      </div>
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
