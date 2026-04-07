---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Account Management\SSPR - Self Service Password Reset\SSPR - Service Side Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/SSPR%20-%20Self%20Service%20Password%20Reset/SSPR%20-%20Service%20Side%20Logs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AzureAD
- cw.Azure-AD
- cw.AAD-Account-Management
- cw.Azure-AD-SSPR
- cw.AAD-Password
- Password Reset
- SSPR
- Internal Logs
- Service-side Logging
- SSPR Troubleshooting.

---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AzureAD](/Tags/AzureAD) [Azure-AD](/Tags/Azure%2DAD) [Azure-AD-SSPR](/Tags/Azure%2DAD%2DSSPR) [AAD-Password](/Tags/AAD%2DPassword)      


<table style="margin-left">
    <tr style="background:#efffff;color:black">
    <td>
      <small>&#128210; <b>Compliance Note</b>: All data in this wiki including videos, screenshots, logs, GUIDs, email addresses, usernames and troubleshooting steps have been obtained from lab test environments and should not be considered confidential or personal data during compliance reviews.</small>
    </td>    
    </tr>
  </table>

The following log queries can be used to check SSPR service side logs for customer SSPR operations.

[[_TOC_]]


You can use the following queries to check for  any common failure reasons for a particular user\tenant\timeframe.  Replace the Timestamp, UserTenant, and UserId to match your customer's environment.  

You can then utilize [Troubleshooting Password Writeback](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/890373/Troubleshooting-Password-Writeback?anchor=i---password-reset-fails-with-generic-error-code-sspr_0029) wiki to troubleshoot possible causes of SSPR service log exceptions\errors found in these logs.

### ASC Tenant Explorer Audit Logs

#### Performing SSPR
1. Using ASC you can find SSPR failures using ASC Tenant Explorer's Audit Logs query and a filter such as:

   ASC Audit Log Filter:
   ```
   Date Time Range = Last 30 Days
   Service = Self-service Password Management
   Result = Failure
   Actor = <UPN of user experiencing issue> or Blank
   ```

   Example:
   ![image.png](/.attachments/image-852f6e6c-66d5-47ee-ac50-b4cfced013ea.png)

2. Once the failure is find, expand details and locate the correlation ID and Timestamp

   ![image.png](/.attachments/image-e1e9d599-8920-4124-903f-d20d542fd657.png)

3. If the failure reason isn't obvious from ASC Audit Logs, you can query SSPR service logs using ASC Kusto Web UX log steps below. Change the Tracking ID to be the ASC correlation ID and the Timestamp to be the ASC timestamp.

4. To obtain the Tracking ID from customer you can either

   1. Request customer provide https://aka.ms/hartrace and reference the headers of the https://passwordreset.microsoftonline.com portal frames.

   2. Ask cutomer to click the "Support Code" dialog in bottom right of password reset portal prior to reproducing the error, and copy this code and provide to you.  It is equivalent to the SSPR Tracking ID \ Correlation ID.

      Example:

      ![2023-11-09_11-13-13.gif](/.attachments/2023-11-09_11-13-13-af4b95f1-b8d3-47de-b853-f6392cd41611.gif =409x)

#### Application  Event log for SSPR

1. Use ASC -> AADConnect Synchronization -> Sync Application Events
2. Set Time Range and Severity Level to Warning or Error, then click Load
3. In the result, filter and check any Password Writeback errors. 

You can refer to [this troubleshoot link](https://learn.microsoft.com/en-us/entra/identity/authentication/troubleshoot-sspr-writeback#if-the-source-of-the-event-is-adsync) to learn event ID for each error. 


#### Registering for SSPR
1. Use ASC -> Tenant Explorer -> Password Management-Self-service password reset -> Combined Registration to check the tenant Self-service password reset Combined Registration policy scope.
2. Use ASC -> Tenant Explorer -> Password Management-Self-service password reset -> SSPR-User Policy to verify registration methods enabled.  Enforcement policy etc.
3. Use ASC -> Tenant Explorer -> Audit Logs and the following filters to find registration logs

   ASC Audit Log Filter:
   ```
   Date Time Range = Last 30 Days
   Service = Self-service Password Management
   Activity =
               User started security info registration for self-service password reset
               User completed security info registration for self-service password reset
               Security info saved for self-service password reset

### ASC Kusto Web UX
1. Open ASC Kusto Web UX for tenant via ASC Tenant Explorer -> Kusto Web UX 
2. Add the `idsharedwus` cluster and then select the `aadssprprod` database
3. Copy\Paste one of the below KQL queries depending on the information you have to Kusto and run query
4. Review results for common SSPR errors, Msg or Exception column will give cause of error
  
   `Tips: Most of the traffic go to idsharewus. While, for EU customers,  it is idsharedneu. Traffice may also be  in idsharedjpn and idsharedjpw. Right now, to check logs in clusters other than idsharedwus, we may need to run Jarvis query(https://jarvis-west.dc.ad.msft.net/5DEE7DDF) in SAW machine WITH AME Account joining group AME\TM-IAMSSCREDENTIALSMGMTSVC.`

##### Query for SSPR failures with Tracking ID or Correlation ID
The SSPR tracking ID or Correlaiton ID can be obtained in a few ways

1. Request customer repro issue and from SSPR portal https://aka.ms/sspr and click the very bottom right link labelled `Support code` , this will return the current session's Tracking ID.  You can then ask customer to reproduce the issue and use this Tracking ID to locate service logs.
2. Review the ASC Audit Logs for the tenant and locate a SSPR failure's listed Correlation ID.  This value will be the same as SSPR service log's Tracking ID
3. Request a https://aka.ms/hartrace and find the Tracking ID or Correlation ID in passwordreset.microsoftonline.com headers

   **Example**:

   ![image.png](/.attachments/image-995180d5-f977-4a6e-90a8-22ca7136bf31.png)

4. With the SSPR Tracking ID or Correlation ID use ASC Kusto Web UX query Add the `idsharedwus` cluster and then select the `aadssprprod` database and run the following query:

   ```
   let timestamp = datetime(2023-12-19 22:29); // Replace with timestamp in UTC of failure
   let delta = 15m;
   let cid = "af1ad20c-65ca-44e9-813c-523b7c7665cc"; // Replace with Tracking ID \ Correlation ID of the failure
   TraceEvent
   | where TIMESTAMP >= timestamp - delta and TIMESTAMP <= TIMESTAMP + delta
   | where TrackingID == cid or * contains cid
   | where  TraceLevel in ("Fail", "Warning", "Error") or ExceptionText != ""
   | project TIMESTAMP, TraceEnumCode, TraceCode, TraceLevel, Msg, ExceptionText, Message, UserId, UserTenant, UserType, PasswordType, InitiatedBy, SourceCall, TrackingID, Endpoint
   ```


   **Example:**
   
   ![image.png](/.attachments/image-25bee213-4fc2-4985-8f68-c48c948d44d3.png =900x)


##### Query by SSPR User Object ID
1. Find the impacted user's AAD Object ID
2. Ask for the timestamp of the failure in UTC
3. Copy\Paste below query to find SSPR service log errors:

   ```
   let userObjectID = "9bd627a9-b96a-4106-8f1d-fb1ff3c556d2"; //Replace with impacted user's AAD Object ID
   let ts = datetime(2022-12-09 15:54); //Replace with timestamp of error in userObjectID
   let delta = 1h; //Replace with timeframe to search around timestamp
   TraceEvent
   | where TIMESTAMP >= ts-delta and TIMESTAMP <= ts+delta
   | where UserId == userObjectID
   | where  TraceLevel in ("Fail", "Warning", "Error") or ExceptionText != ""
   | project TIMESTAMP, UserId, UserTenant, UserType, PasswordType, InitiatedBy, SourceComponent, SourceCall, TraceEnumCode, TraceCode, TraceLevel, Msg, ExceptionText, Message, TrackingID, Endpoint
   ```


4. Update the variables for userObjectID, ts, and delta, and run query to find errors for user in timeframe.  Reference the Msg column for details


##### Query for ANY failures by timestamp
1. Determine general timeframe in UTC of SSPR failure
2. Copy\Paste below query to find SSPR service log errors:

   ```
   let timestamp = datetime(2023-08-08 23:53); // Replace with timestamp in UTC of failure
   let delta = 1h; // replace with delta timeframe to search
   TraceEvent
   | where TIMESTAMP >= timestamp - delta and TIMESTAMP <= TIMESTAMP + delta
   | where  TraceLevel in ("Fail","Warning", "Error") or ExceptionText != ""
   | project-reorder TIMESTAMP, TraceEnumCode, TraceCode, TraceLevel, Msg, ExceptionText, Message, UserId, UserTenant, UserType, PasswordType, InitiatedBy, SourceCall, TrackingID, Endpoint
   ```

##### Query for ANY Password Writeback Onboarding Errors

1. Open ASC Kusto Web UX , add the `idsharedwus` cluster and then select the `aadssprprod` database
2. Copy the following query to search for any password writeback onboarding errors or warnings:

   ```
   TraceEvent
   | where TIMESTAMP >= ago(40d)
   | where SourceComponent == "OnPremisesPasswordResetOnboardingService"
   | where TraceLevel in ("Error", "Warning")
   | project TIMESTAMP, UserId, UserTenant, UserType, InitiatedBy, SourceComponent, SourceCall, TraceEnumCode, TraceLevel, Msg, ExceptionText, Message, PasswordType, TrackingID, Endpoint
   ```

3. Inspect the `Msg` column for any warnings or errors.


# Troubleshooting

Please follow [TSG: SSPR Password Writeback](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/348116/TSG-SSPR-Password-Writeback) wiki to troubleshoot possible causes of SSPR service log exceptions\errors found.
