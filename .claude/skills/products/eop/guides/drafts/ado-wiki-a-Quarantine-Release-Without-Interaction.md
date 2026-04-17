---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/TSG: Messages released from Quarantine or Requested Release without User Interaction"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTSG%3A%20Messages%20released%20from%20Quarantine%20or%20Requested%20Release%20without%20User%20Interaction"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]
#Scenario

A customer states that they have been seeing either many messages being released or many messages requesting release even though the users claim to not be performing the operation.

#Troubleshooting

1) Gather audit logs for some of the release events, pick out a user or two
```
$audit = search-unifiedauditlog -startdate _date_ -enddate _date_ -operations "*quarantine*" -UserIDs User1,User2
$audit.auditdata |ConvertFrom-Json |select CreationTime,Operation,NetworkMessageId,UserId |sort UserID,CreationTime
```

2) Now that you have some users to focus on, find the related quarantine notification sent to the users.  Note that if the customer has customized their quarantine notifications you may need to adjust the sender address.

```
Get-MessageTraceV2 -StartDate 1/23/2026 -EndDate 1/27/2026 -RecipientAddress User1,User2 -SenderAddress quarantine@messaging.microsoft.com  |Sort Recipientaddress,received |select Received,Recipientaddress,Subject
```

3) Review the message trace details and verify whether the quarantine notification was either journaled, or whether it was routed out of the service and back into the service.  Potentially

```
Get-MessageTraceV2 -StartDate 1/23/2026 -EndDate 1/27/2026 -MessageID 'MID1','MID2' |get-messagetracedetailv2 -event sendexternal,journal
```

Potentially any of the intermediary or recipient servers could have activated the link within the email.  Should there be nothing concrete in the audit logs the customer may want to validate with any of the intermediaries found here.

4) Gather audit logs for mail items accessed centered around the quarantine notifications with the times that correlate to the events above.  You want to pick the last quarantine notification that was sent prior to the release request.  For example, if the release request was made at 1/1 13:00, you want to find the quarantine notification before that, 1/1 12:00.

Your query start/end time should start a minute or two before the notification was delivered and end a minute or two after the release event.

```
$MIA = Search-UnifiedAuditLog -StartDate "1/24/2026 1:50Z" -EndDate "1/24/2026 17:50Z" -Operations mailitemsaccessed -FreeText 'MessageID1' 
$MIA.auditdata |ConvertFrom-Json |fl CreationTime,UserType,UserKey,ClientAppId,ActorInfoString,ClientIPAddress

$MIA2 = Search-UnifiedAuditLog -StartDate "1/24/2026 1:50Z" -EndDate "1/24/2026 17:50Z" -Operations mailitemsaccessed -FreeText 'MessageID2' 
$MIA2.auditdata |ConvertFrom-Json |fl CreationTime,UserType,UserKey,ClientAppId,ActorInfoString,ClientIPAddress
```

If you wanted to review the full audit details information on the schema used is described [here](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-schema#quarantine-schema)

5) Review the audit log entries to see what accessed the quarantine notification shortly before the release audit log

```
$MIA.auditdata |ConvertFrom-Json |fl CreationTime,ClientAppId,ActorInfoString,ClientIPAddress
CreationTime    : 2026-01-24T17:46:54
UserType        : 0
UserKey         : GUI
ClientAppId     : f8d98a96-0999-43f5-8af3-69971c7bb423
ActorInfoString : Client=ActiveSync
ClientIPAddress : 192.168.0.1

CreationTime    : 2026-01-24T17:46:54
UserType        : 0
UserKey         : GUI
ClientAppId     : f8d98a96-0999-43f5-8af3-69971c7bb423
ActorInfoString : Client=ActiveSync
ClientIPAddress : 192.168.0.1

CreationTime    : 2026-01-24T17:46:53
UserType        : 5
UserKey         : APP ID
ClientAppId     : 8f0bb7d0-51ef-4c03-8837-ab91cbc1c509
ActorInfoString : Client=REST;Client=RESTSystem
ClientIPAddress : 40.126.23.99

$MIA2.auditdata |ConvertFrom-Json |fl CreationTime,ClientAppId,ActorInfoString,ClientIPAddress


CreationTime    : 2026-01-24T01:55:23
UserType        : 0
UserKey         : GUI
ClientAppId     : 27922004-5251-4030-b22d-91ecd9a37ea4
ActorInfoString : Outlook-iOS/2.0
ClientIPAddress : 192.168.0.1

CreationTime    : 2026-01-24T01:55:18
UserType        : 5
UserKey         : App ID
ClientAppId     : 8f0bb7d0-51ef-4c03-8837-ab91cbc1c509
ActorInfoString : Client=REST;Client=RESTSystem
ClientIPAddress : 40.126.23.99
```

The UserKey and UserType are described [here](https://learn.microsoft.com/en-us/purview/audit-log-detailed-properties#usertype-and-userkey-scenarios)  in the above example you can see the same Application has accessed the email for each mailbox about the time that the release was requested.  

6) If the item was accessed via RESTSystem gather the application ID from the audit log and validate the application being utilized by checking the APP ID in ASC.

![image.png](/.attachments/image-b71262b7-132c-470b-912b-95aab32d53b8.png)
