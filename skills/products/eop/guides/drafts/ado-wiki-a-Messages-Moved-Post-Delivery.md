---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/TSG: Messages moved post delivery"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTSG%3A%20Messages%20moved%20post%20delivery"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

#Scenario

Message trace and the X-Microsoft-Antispam-Mailbox-Delivery header indicate that the message was delivered into the Inbox, however the message has moved to the JMF or Deleted Items and the user has stated they did not perform the move.  

#Troubleshooting

1) Determine if the message was impacted by ZAP.  The customer can validate whether ZAP interacted with the message using the steps [here](https://learn.microsoft.com/en-us/defender-office-365/zero-hour-auto-purge#how-to-see-if-zap-moved-your-message).  Alternatively, the diagnostic "Defender for Office 365 Message Explorer" will expose whether the message was moved by ZAP.

      - ZAP will only move to the folders that are configured in the threat policies (malware/phish/spam).  This means that if the message has moved to deleted items or if the message is moved to junk and all policies are to quarantine, ZAP can be immediately ruled out.

You can also utilize the mailbox store events to validate whether ZAP has impacted a message or not.  To do so you will need to follow Steps 2 and 3 below.  In the Store events you need to ensure that you enable "Include internal access events" when querying store events.

2) If the message was not moved by ZAP, the next step is to utilize the diagnostic "Get message details from an M365 mailbox", you will need the impacted user and the internet message ID.  This diagnostic will provide you with a Document ID you can use to track movement on the item.  Note the Document ID and Received time in the diagnostic output.

Example screenshot of the diagnostics "Get message details from an M365 mailbox"

![image.png](/.attachments/image-eba3b81b-3e58-434a-a07b-8eb8601b8aab.png)

The first move in the above is a mail moved by ZAP into the Quarantine, note the Client and Folder the item was moved into.  The second move was a move done by the Outlook client, not how the destination folder is displayed.

3) Next you will need to run the diagnostic "Get Store Mailbox Events".  For this diagnostic you will need the impacted user, document ID and the time.  Generally you will be using the scenario "Items Moved Or Deleted Unexpectedly" and search for specifically that document ID in the diagnostic.  The column values are explained [here](https://dev.azure.com/Supportability/Modern%20Workplace/_wiki/wikis/Modern%20Workplace/278644/Store-Event-Logs) and it will tell you the protocol utilized along with the user account.  If no user account is displayed than it is the mailbox owner.  This should give the customer a good starting point on where to look.  For example, if MoMT is the protocol used this will generally indicate Outlook desktop client so they would want to investigate add-ins.  If AirSync is the protocol they may want to investigate the email client on the users' mobile device.

Example screenshot of the store events , Scenario : "Items Moved Or deleted "

![DiagStoreLogsForZap](/.attachments/DiagStoreLogsForZap.png)

4) If the above is not enough information for the customer to go on they can get more verbose details from the mailbox audit log.  The "Move" operation is not enabled for auditing by default so in order to gather mailbox audit logs first the customer needs to enable the operation via the command:

```
set-mailbox **user** -AuditOwner @{add="Move"}
```
   If you saw a different account other than owner from the store logs ensure you enable for Delegate/Admin as needed.

5) After auditing is enabled the customer needs to get a fresh reproduction of the issue.  Once the issue has been reproduced the customer can then pull the mailbox audit logs to gather more info.  Below example is only looking for Move specifically, you can add/remove other operations as needed.  Most common usage would be:
Move, MoveToDeletedItems ,SoftDelete ,HardDelete ,Create

 ```  
$audit = Search-UnifiedAuditLog -StartDate **date** -EndDate **date** -Operations Move -FreeText "**MESSAGE ID**"
$audit.AuditData |ConvertFrom-Json |Export-Csv audit.csv -NTI
```
The CSV will contain more information about the action performed the most important fields are:
ClientInfoString, ClientIPAddress, ClientProcessName, AppId.  First party App IDs can be found [here](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/governance/verify-first-party-apps-sign-in), while 3rd party application ID's can be found in the [Microsoft Entra Portal](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/view-applications-portal)

This gets all operations for all mailboxes within the tenant for the specific message ID provided.  Depending on the amount of contacts that received the message you may need to filter down the CSV to the specific user(s) being investigated.

**Note:** The **'move'** action applies to messages that moved from the Inbox to another folder.
If the message is sent to deleted items, the required audit action will be **'MovedToDeletedItems'**.
If the message is soft deleted (Sent to recoverable items), the audit action will be **'SoftDelete'**.
Finally, the Hard Delete action (Sent to purges) will use the **'HardDelete'** audit action.
You can check the Store event logs to validate the folder the message was moved to.
