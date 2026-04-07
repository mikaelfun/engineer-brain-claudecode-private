---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Logs and Reporting/Azure AD Reporting Workflow/Past Outages and RCAs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Azure%20AD%20Logs%20and%20Reporting/Azure%20AD%20Reporting%20Workflow/Past%20Outages%20and%20RCAs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.Entra ID Logs and Reporting
- Reporting
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

##[Teams Engineering Policy for RCA Requests](https://dev.azure.com/Supportability/UC/_wiki/wikis/UC.wiki/487183/RCA-Procedure-How-to-handle-RCA-requests)


*   If reported incident was part of a�**Sev2 or Sev1 Service Incident**, customer can expect RCA to be published to their�[Service Health Dashboard / Message Center](https://learn.microsoft.com/en-us/microsoft-365/enterprise/view-service-health?view=o365-worldwide)�
    
*   **Teams Engineering is only obligated to perform RCAs on�[Outages](https://aka.ms/postmortems-at-teams)**��or if requested by an�[OED Customer](https://aka.ms/teamsoed-wiki)�.
    *   Teams Engineering has no obligation to perform RCAs on Single Customer issues
    *   Support should not open IcM's requesting RCA.
    *   Support should be guided to the�[https://aka.ms/gethelp](https://aka.ms/gethelp)��process.

-----------------------------
## January 2026

###Risky Sign-ins Latency

**Incident:** Between January 22nd and January 30th, 2026, some customers experienced increased latency when querying risky sign-in logs. This resulted in increased request durations and throttling when attempting to view risky sign-in activity during the affected period.

**Root Cause:** A misconfiguration in our query for risky sign in records caused the query to take longer, leading to increased pressure on our databases and slower response times.�

**Mitigation:** Entra Engineering deployed a fix that updated the query to be more performant on January 30th, 2026. Following this change, risky sign-in data began returning as expected, and normal query performance resumed.

**Next Steps:** We are improving validation and monitoring around the processing of risky sign-ins to better detect irregularities and to reduce the likelihood of similar issues occurring in the future.


### Delay in Sending Sign-in Logs to Log Analytics

**Official statement** <br>
Between January 7, 2026 and January 17, 2026, a subset of sign-in events experienced delays or were not forwarded to Azure Monitor customer configured storage . The underlying events were generated �and we performed a backfill to retroactively forward records that were missed into Azure Monitor; however, internal diagnostic limitations prevent our ability to definitively find specific entries. To validate completeness during the impacted window, customers are advised retrieve the records directly from Microsoft Graph, which carries a thirty-day retention period. �Going forward, we have already made improvements to internal diagnostics so we're able to better verify event delivery going forward.


###  Duplicate Audit Log entries observed in Log Analytics

**Incident**: Between January 6th and January 16th, 2026, some customers may have observed a small number of duplicate log entries in their Azure Log Analytics workspace for Microsoft Entra ID Audit logs.

**Root Cause**: During a data recovery operation, our systems prioritized ensuring complete log delivery to prevent any data loss. This approach resulted in a limited number of log entries being delivered more than once to affected workspaces.

**Mitigation**: Entra Engineering completed the recovery operation and restored normal log ingestion on January 16th, 2026. The volume of duplicate entries is minimal and limited to the recovery window.

**Next Steps**: We are enhancing our recovery processes to optimize deduplication while maintaining our commitment to complete log delivery.



### Missing authenticationDetails column in Log Analytics

**Incident:** Between November 25 and January 8, 2025, the authenticationDetails column was calculated incorrectly for a subset of signIns in the Log Analytics stream that included multiple authentication steps. While the data remained available through the Portal UX and MSGraph, these columns were not shown in Log Analytics.

**Root Cause:** This issue stemmed from a bug in Entra's log processor which miscalculated the authenticationDetails column when multiple values were used.�

**Mitigation:** Entra Engineering implemented a fix to correct the calculation restoring normal functionality. This fix was fully deployed on January 8th, 2025.�

**Next Steps:** Customers are advised to download sign-in logs that are still accessible to them for the affected period (11/25/25�01/08/25) from the Entra Portal UX, before the standard 30-day retention window expires. We have added additional testing in our code to make sure that this corner-case will not have any future regressions.


## December 2025

###  Delay in Sending MFA-Related Sign-In Logs to Log Analytics

**Incident:** From December 5th to December 12th, 2025, in the AS region, a small portion of MFA-related sign-in logs experienced a delay in being sent to Log Analytics. These logs were backfilled on December 12th. All data in the pipelines to Entra Portal, MSGraph, and Powershell was delivered on time without any delays.

**Root Cause:** This bug was caused by a misconfiguration during a recent migration in the AS region, which resulted in the system reading from the incorrect internal storage for completed MFA aggregation records. Once the configuration was corrected, the publisher was able to access the aggregated data and distribute it to customers as intended. No other regions were affected.

**Mitigation:** Entra Engineering corrected the configuration, and the seven days of stored data was backfilled to customers.

**Next Steps:** We have added more monitoring and anomaly detection to identify these types of issues sooner and help prevent similar problems from happening again.

### Dismissing a risky sign-in event does not work

**RCA 1:**

**Incident:**�Between December 4, 2025 and December 16 2025, a subset of audit log events used to mitigate or dismiss risk were not sent to the Identity Protection service within Entra ID and the risk mitigation actions were not completed.��

**Root Cause:**�The issue stemmed from a configuration bug in Entra's log processor, which caused a subset of these audit logs to not reach the intended destination.

**Mitigation:**�Entra Engineering implemented a fix to correct the configuration, ensuring proper publication of these events to the Identity Protection team. This fix was fully deployed on December 16, 2025, restoring normal functionality.

**Next Steps:**�Customers who were unable to dismiss or mitigate risk during this time window can try again with the issue now fixed. We are also identifying if there possible ways we can recover these logs to do this on your behalf without redoing any mitigation actions. We are implementing multiple repair items as part of this incident like improved monitoring and configuration testing that will prevent this from occurring again.�  

<br>

**RCA 2:**

**Incident:**�Between November 21st, 2025 and December 16th 2025, querying risky signIns in the Risky SignIns blade or via MSGraph signIns API with a partial set of risk state filters may have resulted in the return of old states of signIn risk. IE, if a signIns risk was mitigated after being at risk, and the query included�**only**�at risk, it may return that old signin risk.��

**Root Cause:**�The issue stemmed from a query optimization in the API query to make this API faster. However, this query optimization had a bug that resulted in it returning old states if not all states were included in the filter.

**Mitigation:**�Entra Engineering implemented a fix to revert the code optimization, ensuring the query would only return the most recent state per signIn.

**Next Steps:**�Customers can now see the most accurate risk via the Risky SignIns UX or MSGraph API without having to query on all risk states.


## November 2025
### Missing some MFA-related sign-in logs in Log Analytics
**Incident:** Between November 13 and December 5, 2025, a subset of MFA-related sign-in logs were missing from the Log Analytics stream for customers in the AS region. The data was intact and accessible via Portal UX and MSGraph, but Log Analytics did not display these events.

**Root Cause:** The issue stemmed from a bug in Entra's MFA aggregation processor, which aggregates MFA categories for sign-in logs. The processor attempted to convert an aggregated MFA category (stored as a numeric value) into a category name. The conversion failed, causing the system to drop the logs before publishing to Log Analytics. Although the data was available in Entra Admin Center UX and MSGraph, it was not published to Log Analytics due to this mapping failure.

**Mitigation:** Entra Engineering implemented a code fix to correctly map the numeric MFA category to its name, ensuring proper publication of MFA-related logs. This fix was fully deployed on December 5, 2025, restoring normal functionality.

**Next Steps:** Customers are advised to download sign-in logs for the affected period (11/13/25�12/5/25) from the Entra Portal UX, before the standard 30-day retention window expires. We recommend doing this as soon as possible to avoid data loss.

### Log Analytics Columns Not Populating Values (e.g., servicePrincipalName, servicePrincipalCredentialKeyId)
**Incident:** Between November 13 and December 5, 2025, a subset of sign-in log columns were missing from the Log Analytics stream. The data was intact and accessible via Portal UX and MSGraph, but Log Analytics did not display these columns.

**Root Cause:** The issue stemmed from a bug in Entra's log processor, which attempted to map the data collected to the proper column in Log Analytics. The mapping failed, causing an inability to publish the data to Log Analytics.�

**Mitigation:** Entra Engineering implemented a code fix to correct the data mapping, ensuring proper publication of these columns. This fix was fully deployed on December 5, 2025, restoring normal functionality.

**Next Steps:** Customers are advised to download sign-in logs for the affected period (11/13/25�12/5/25) from the Entra Portal UX, before the standard 30-day retention window expires. We recommend doing this as soon as possible to avoid data loss.

## October 2025
### Last sign-in activity has not been updated for certain regions
**Incident**: Between October 15 and 31, Entra engineering identified a delay in telemetry related to our signInActivity API, specifically impacting tenants in the Asia and Australia regions.  

**Root Cause**: The delay was caused by a regression introduced during a service rollout, which affected a subset of customers in the Asia region.  

**Mitigation**: To address the issue, Entra engineering is rerunning workloads to recalculate the data serving the signInActivity API for all tenants in the Asia region for the impacted period.�  

**Next Steps**: No action is required from customers.

## September 2025

### Passkeys were incorrectly classified as passKeyDeviceBound instead of passKeyDeviceBoundAuthenticator

**Incident**: From August 27, 2025 to September 4, 2025, users registered with Passkeys using Microsoft Authenticator may have been incorrectly classified as "passKeyDeviceBound" instead of "passKeyDeviceBoundAuthenticator" in authentication method reports. This classification issue did not affect the calculations for passwordless capabilities.

**Root Cause**: The team responsible for generating authentication method reports added new capability support for "passKeySynced" authentication methods. This enhancement introduced new classification logic that inadvertently altered the existing behavior for distinguishing between default and authenticator device-bound passkey flavors.

**Mitigation**: Entra engineering updated logic to correctly distinguish different device-bound passkey flavors and rolled out fix to all tenants the same week.

**Next Steps**: Entra is performing an internal post incident review to further understand how the classification mapping issue occurred and will implement more robust monitoring and validation testing for authentication method type distinctions to prevent similar classification errors in the future.

## August 2025

### Users registered with Passkeys or Windows Hello for Business didn't show as MFA or Passwordless capable in the User registration details report

**Incident**: From July 31, 2025 to August 6, 2025, users registered with Passkeys or Windows Hello for Business may not have shown as MFA or Passwordless capable in the user registration details report.

**Root Cause**: The team responsible for generating this report is in the process of migrating to a more efficient API for fetching user details. It was discovered that the property containing information for calculating passkeys and whfb methods was missing certain details that we require to determine if a user has these methods registered. This caused some users to incorrectly display as not being MFA and passwordless capable despite being registered for a passkey or WHFB.

**Mitigation**: Entra engineering rolled back the migration for this property and is working with the endpoint owners to ensure 100% parity.

**Next Steps:**�Entra is performing an internal post incident review to further understand how the issue happened and will implement more robust monitoring to prevent this issue from happening in the future.

## June 2025
### Unable to load Log Analytics in the portal for US Gov cloud portal

**Incident**:�Between 16:20 UTC on 3 June 2025 and 20:05 UTC on 6 June 2025,�a subset of customers�could not�access�their Log Analytics�workspaces�through�DiagnosticSettings�in�the Entra or Azure Portal and�would see�an unauthorized error message.�There was no loss of logs.���

**Root Cause**:�As part of SFI mitigation,�an ARM RP Manifest configuration was rolled out using SDP to disable backup�cert auth�method�and update the scope�from��Endpoint� to��ResourceUri��on the RP, per�instructions.�However, the DiagnosticSettings endpoint�code�did�support the�required�scope�in�their�ARM�package�and�started returning�403s�after being unable to validate the token.�  

**Mitigation**: ARM team did expediated rollout of PR that reverted the changes and we achieved mitigation in around 2 hours from incident being routed to correct team.

## March 2025

### Increased Throttling in North America
**Incident**: From March 25, 2025, 2:30 PM UTC - March 28, 2025, 10:00 AM UTC, a small subset of customers in North America experienced higher than average latency and increased throttling when querying their signin logs via MSGraph, Entra Portal, or Powershell.�

**Root Cause**: For the backend storage capacity for this subset of customers, there was a delay in data partitioning due to capacity constraints. Non-partitioned data is slower to query which caused the latency to increase and throttling to occur for larger queries.�

**Mitigation**: Entra engineering scaled up partitioning capacity in those regions, but since partitioning can take several days to recover, the incident took days to mitigate.�

**Next Steps**: Entra is performing an internal post incident review to further understand how the issue happened and will implement processes to better estimate required capacity during peak usage.

### Delay in sending Audit logs to Azure Monitor
**Incident**: Between 22:00 UTC on March 7, 2025 and 05:45 UTC on March 9, 2025, some customers in Europe and North America experienced delays when querying their audit logs.

**Root Cause**: The B2C Audit Logs from the previous week had to be re-processed, as the data was missing from the audit logs. This backfill required a large amount of events to be reprocessed which overwhelmed our processing infrastructure. This caused temporary delays as we scaled our systems to handle the increased load and publish all events to customers from the B2C outage timeframe. Importantly, no logs were lost during this incident.

**Mitigation**: Our team immediately scaled up processing capacity in the regions impacted. We also rerouted some traffic to other data centers to help manage the load.

**Next Steps**: Entra is performing an internal post incident review to further understand how the issue happened and will implement processes to better estimate required capacity, especially when backfilling logs.

## November 2024
### Delay in sending logs to Azure Monitor
**Customer Impact:**
Between 16:00 UTC 15 Nov 2024 and 17:30 UTC on 16 Nov 2024, customers using Azure Monitor in North America received delayed sign-in logs. There was no loss of logs. The issue was detected shortly after a service configuration change.

**Root Cause:**
Microsoft maintains an internal logging platform which includes a monitoring agent that runs on Azure VM�s and multiple channels through which it can upload logs for storage. In an effort to optimize the collection of data for one tenant, the team deployed a configuration change to send all collected logs to a specific ingestion service.�A bug in that ingestion service interacted with a bug in the monitoring agent. This caused a drop of about 10% of the logs in the Azure Monitor part of the pipeline.

**Mitigation**
On discovery of the issue, the engineering teams rolled back the configuration change and normal data flow resumed. In cases where logs were not properly transmitted, the teams were able to re-send the logs to ensure completeness.
While the configuration change that triggered the issue followed our safe deployment practices including testing and validation before deployment, these testing efforts were insufficient to identify the underlying bugs in the monitoring agent and ingestion service. We have identified gaps to improve these validation practices, with repair items.

**Next Steps:**�No further action is required.

## September 2024
###User Registration Details report returning "not found" error

**Incident**. On September 17, 2024, we identified an issue where calls to the Microsoft Graph API's `userRegistrationDetails` endpoint were failing with a "not found" error, even though the user existed in the directory. 
 
**Root Cause**. The `userRegistrationDetails` report is generated based on audit logs. A bug in one of these audit logs caused the report generation process to fail, resulting in the API returning a "not found" error for some users. Importantly, the audit logs themselves were not affected, only the report aggregation process was impacted. 
 
**Mitigation**. We deployed a hotfix to resolve the issue, allowing the report generation process to complete successfully. No data was lost, and all reports were successfully reprocessed. 
 
**Next Steps**. No further action is required.
 

##July 2024
###Microsoft Graph Activity logs not flowing to Azure Monitor
 
**Incident impact**. On 7/11/2024, it was discovered that a subset of customers stopped receiving MSGraph Activity logs into their Azure Monitor environments.
 
**Root cause**. Entra relies on a registration telemetry cache to track which diagnostic settings tenants have enabled. There was an update pushed to the registration telemetry to improve the data quality. As a result of this update, there was an unexpected bug that caused some registration records to disappear. Because of this, Entra couldn't send the logs to certain tenants because their IDs were missing from the cache.
 
**Mitigation**. After noticing that certain customers were not receiving logs, we pinpointed this update as the issue and mitigated it on 7/18/2024. Unfortunately, the missing data is irretrievable.
 
**Next steps**. With the fix now implemented, no action is required from customers. Entra will closely monitor this telemetry moving forward to ensure the cache's integrity remains uncompromised.
 
##May 2024
###Last sign-in not up to date

**Incident impact**. On May 31st, we discovered that lastSignIn data, in random cases, was not getting updated in the Entra portal and API even though the user had signed in within the proper parameters to warrant an update to the property. 

**Root cause**. This issue was discovered to be due to throttling limits. The reason this only affected a random subset of users is because the data is partitioned into small batches and the throttling limits prevented random batches from publishing to the proper location. 

**Mitigation**. Entra has substantially increased the throttling limits and tested the outputs. We have not seen any data missing. We will continue monitoring the traffic and proactively increase the limits as needed to ensure that data for all customers is published. 

**Next steps**. There is no recommended action for the customer to take.
