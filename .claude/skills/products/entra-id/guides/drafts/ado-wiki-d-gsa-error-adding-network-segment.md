---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/Internal Docs/Global Secure Access - Portal issues/Error When Adding a Network Segment"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20(ZTNA)%2FInternal%20Docs%2FGlobal%20Secure%20Access%20-%20Portal%20issues%2FError%20When%20Adding%20a%20Network%20Segment"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Error When Adding a Network Segment - GSA Private Access

This troubleshooting guide outlines all the necessary steps to help you handle support cases where the customer encounters error messages when they try to add App Segment for GSA Private Access.

## Symptoms
When attempting to add a new segment, either for a new or existing Global Secure Access (GSA) Private Access application, the customer encounters the following error message:

    ErrorFully qualified domain name and port overlaps with an application: View Application

    ErrorIP address and port overlaps with an application: View Application

## Step-by-Step Troubleshooting

Multiple root causes can produce the error above. Follow the steps below to identify the root cause and resolve the issue. Proceed step-by-step and stop as soon as the cause is confirmed.

### 1. Confirm the Overlap

1. Ask the customer to reproduce the issue during a live call for real-time observation
2. Ask the customer to click the link provided in the error message to view details about the overlapping application
3. Once the link is clicked, a new tab will open showing details of the existing application that overlaps with the new segment
4. Customer can delete the overlapping segment from the current configuration to allow adding it to the intended application

### 2. Empty GSA App Configuration Page (Incorrect Registration)

If the customer clicks the overlapping application link and is redirected to an **empty GSA Private Access application configuration page**:

1. Capture the **Application ID** and **Object ID** from the URL
2. Search for the application in the **Main Enterprise Apps** blade
3. If the application is found there but **does not exist** in the **GSA Enterprise Apps** blade, this is the incorrect registration issue. See: [Incorrect Registration of Entra Private Access Apps](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1691847/Incorrect-Registration-of-Entra-Private-Access-Apps)
4. Follow the documented steps to **restore the tags**, after which the customer will be able to modify or delete the application

### 3. Application Not Found in Enterprise Apps (Orphaned Object)

If the application does not exist in the main **Enterprise Apps** blade:

1. Search for the **Application ID** under **App Registrations > Deleted Applications**
2. If found: Confirm with the customer whether they deleted it via App Registrations. Deleting an application this way creates an **orphaned object**. This behavior is documented in the public FAQ for App Proxy and applies similarly to GSA Private Access apps
3. **Solution**: Click **Restore App Registration**. Once restored, the customer can either delete the app from GSA Enterprise Application blade or continue using it

### 4. Permanently Deleted Application

If the application has been **permanently deleted** from Deleted Applications:

1. Confirm with the customer whether they waited **at least 1 day** before attempting to add the segment again
2. If they did wait, collect a **Browser Trace**, **Fiddler trace**, or **HAR file**
3. In the trace, locate the Microsoft Graph POST request and capture the Application ID and Object ID

**Kusto query** to validate (alternative to customer data collection):

```
MsgraphApplicationOperationEvent
| where subscriptionId == "Replace_With_TenantID"
| where env_time > ago(1d)
| where resultType == "ClientError"
| where resultDescription contains "Application segment host and port already exists on application. conflictingApplication=" or resultDescription contains "IP address and port overlaps with existing segment on application. conflictingApplication="
| project env_time, operationType, resultType, resultSignature, resultDescription
```

**Note:** Access to the above Kusto table may not be available at this time.

### 5. Escalation

If the problem remains unresolved, raise an ICM including the Tenant ID and APP ID or the attributes of the failing Network Segment.

Reference: [Microsoft Entra Global Secure Access (ZTNA) - ICM Escalations](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/979096/Microsoft-Entra-Global-Secure-Access-(ZTNA)?anchor=icm-escalations-and-ava-tags)
