---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/AWS Connector/[TSG] - AWS S3 connector"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FThird%20Party%20Connectors%2FAWS%20Connector%2F%5BTSG%5D%20-%20AWS%20S3%20connector"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

---

## Training sessions
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
|13/09/2022|[AWS Connector TS and Config (Part 1)](https://platform.qa.com/resource/sentinel-atc-2022-aws-connector-ts-and-config-part-1-1854/)|Yael Bergman and Danielle Ohfeld Zats|
|13/09/2022|[AWS Connector TS and Config (Part 2)](https://platform.qa.com/resource/sentinel-atc-2022-aws-connector-ts-and-config-part-2-1854/)|Yael Bergman and Danielle Ohfeld Zats|

---

# Docs
[Connect Microsoft Sentinel to Amazon Web Services to ingest AWS service log data](https://docs.microsoft.com/en-us/azure/sentinel/connect-aws?tabs=s3)

[AWS S3 connector permissions policies](https://github.com/Azure/Azure-Sentinel/blob/master/DataConnectors/AWS-S3/AwsRequiredPolicies.md)

[AWS Reference - Q&A Issues Fix](https://microsofteur-my.sharepoint.com/:w:/r/personal/hzahav_microsoft_com/_layouts/15/guestaccess.aspx?e=uefugS&share=Ebzp6wXR4ihFiVKuKH5HG9cBI1VW5Mv5f1qkVnwS6vnmQQ)

[Troubleshoot AWS S3 connector issues - Microsoft Sentinel | Microsoft Learn](https://learn.microsoft.com/en-us/azure/sentinel/aws-s3-troubleshoot)

# Investigation steps

Follow these steps to find potential issues:

## 1. Check with the customer the data exist in the S3 bucket

Open S3 bucket in Amazon Web Services (AWS), search for the relevant folder according to the required logs, and check if there is any logs inside this folder.

![Objects view inside an S3 bucket in the AWS console](/.attachments/image-fdce508b-be51-4895-9164-864dff8f71f9.png)

If the data not exist probably there is an issue in AWS configuration.

For example: to send guardDuty logs to S3, guardDuty needs to be enabled in S3 policies.

Make sure the [prerequisites](https://learn.microsoft.com/en-us/azure/sentinel/connect-aws?tabs=s3#prerequisites) are meet.

## 2. Verify that the data arrive to the SQS

Verify with the customer the data arrived in the SQS queue. To do this open the AWS SQS from the AWS console, go under monitoring tab and you should see the traffic in Number Of Messages Sent widget.

In case there is no traffic there is a problem in AWS configuration.
Check if there is an Event notifications definition for the SQS, with the correct data Filters (prefix&suffix). 
To see the event notifications select the Properties tab in S3 bucket and then go to "Event notifications" section.

![SQS event notifcations from the AWS console](/.attachments/image-2eb7d9e8-a581-4175-a6ec-6965e51b9492.png)

## 3. Check if the data was read from SQS

Verify with the customer that the data was read from the SQS.

AWS SQS under monitoring tab, you should see traffic in Message receive&delete widgets.

In case there is a problem in reading the data:

- Missing notification under "delete messages"
  - Check health messages. Probably some permissions are missing. For example, if KMS is used, maybe there are missing permission in the KMS for the relevant ARN rule. 
- Missing notification under "receive messages"
  - Problem in Scuba rule definitions, Please check the health message logs.

The image below is an example of what the customer should have. We should focus on:
###Number Of Messages Deleted
- When Microsoft Sentinel polls the SQS queue, it performs a ReceiveMessage operation. The Message is not deleted immediately. Instead, it becomes not visible for a period called the visibility timeout (default is 30 seconds). During this time, Sentinel is expected to process the message. If Sentinel successfully processes the message, it sends a DeleteMessage request to remove it permanently. If Sentinel fails or crashes, the message becomes visible again after the timeout and can be retried. If messages are deleted, this means Sentinel is processing the messages 
- There is one exception to this: Message Expiration (Retention Period)
Each message in an SQS queue has a retention period (default is 4 days, max is 14 days). If a message is not processed and deleted within that time, SQS automatically deletes it.
###Number Of Messages Received
- This tracks messages pulled from the queue (by Sentinel)
###Number Of Messages Sent
- This tracks messages added to the queue by the event notification from the S3 bucket. The SQS queue

![AWS SQS - number of messages sent, deleted and received](/.attachments/1_JuumOzlhOOFA32HMkMBY6A-878ef74f-fe28-4635-a079-4feb408b56e2.png)

Please note that a rule will take some time to start (usually 30 minutes in Scuba).

## 4. Check for any exception logs in the health messages

Sample query:

```q
SentinelHealth
| where SentinelResourceName contains 'Amazon'
```

Check if there's data ingested for each data type

```q
AWSCloudTrail
| summarize count()
```

```q
AWSGuardDuty
| summarize count()
```

```q
AWSVPCFlow
| summarize count()
```

Check SentinelHealth from Kusto

```q
ConnectorsHealthFullMessagesForWorkspaces(ago(7d), now(), ("workspaceID"))
| where Kind == "AmazonWebServicesS3"
| where HealthResultType != "Success"
| where Product == "productName"
| distinct StatusMessage, HealthResultType, StatusCode, env_time
```

Cross check the Status Code (e.g. S3B40022) with the following wiki [Connector Health Errors](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel/3246/Connector-Health-Errors).

## 5. Data is not arriving to the Log Analytics (LA) table

Please be sure that you verified SQS monitoring (receive&delete messages are ok).

Check the health logs for any message. 

Could be: 

- Missing permissions in AWS:
    - Check the [AWS S3 connector permissions policies](https://github.com/Azure/Azure-Sentinel/blob/master/DataConnectors/AWS-S3/AwsRequiredPolicies.md) page and ensure the necessary policies are in place

- The files in S3 are in incorrect format. Make sure to check the prerequisites.

## 6. Advance troubleshooting

We can use the TSG under [Investigate Scuba Telemetry](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/siem/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/gt/workspaceinvestigation).

To get the Scuba ID we can use the following query:

```q
cluster('securityinsights.kusto.windows.net').database('SecurityInsightsProd').Operations
| where around(env_time, datetime(2024-01-22 12:24:50.4593990),2d)
| where customData has "{workspaceID}"
| where customData contains "scubaRoutingRules"
| mv-expand customData.scubaRoutingRules to typeof(dynamic)
| extend
    env_time,
    workspaceId=tostring(customData_scubaRoutingRules.extra.workspaceId),
    scubaId=tostring(customData_scubaRoutingRules.id),
    source=tostring(customData_scubaRoutingRules.source),
    workflowName=tostring(customData_scubaRoutingRules.extra.workflowName),
    DestinationTable=tostring(customData_scubaRoutingRules.extra.metadata.DestinationTable),
    routing=tostring(customData_scubaRoutingRules.routing.Workload),
    connectorName=tostring(customData_scubaRoutingRules.extra.connectorName),
    EffectiveSubscriptionId=tostring(customData_scubaRoutingRules.routing["ASI.EffectiveSubscriptionId"]),
    Metadata=tostring(customData_scubaRoutingRules.extra["metadata"]),
    DataProvider=tostring(customData_scubaRoutingRules.extra["dataProvider"]),
    Type=tostring(customData_scubaRoutingRules.extra["type"])
| summarize arg_max(env_time,*) by scubaId
| project env_time,workspaceId,scubaId,source,workflowName,DestinationTable,routing,connectorName,EffectiveSubscriptionId,Metadata,DataProvider,Type
```

Or this:

```q
let TenantID_parameter = '';
let WorkspaceID_parameter = '';
let _endTime = datetime(2024-12-XXT09:19:06Z);
let _startTime = datetime(2024-12-YYT08:19:06Z);
union cluster('scubaops.westus2').database('Sentinel_Rules').*
| where SnapshotTimeUTC between (['_startTime'] .. ['_endTime'])
| where (isempty(['WorkspaceID_parameter']) and * has ['TenantID_parameter'])
 or (isempty(['TenantID_parameter']) and * has ['WorkspaceID_parameter'])
 or (isnotempty(['WorkspaceID_parameter']) and isnotempty(['TenantID_parameter']) and (* has ['WorkspaceID_parameter'] or * has ['TenantID_parameter']))
| summarize arg_max(SnapshotTimeUTC,*) by id
| take 1000
| project-away version,timestamp,rulePartitionKey,Location,CosmosDBAccount,RuleDatabase
| sort by id asc
```

### AWS Guard Duty example

For AWS Guard Duty the query will show something like this:

|               workspaceId             |                scubaId               |   source  |      workflowName     | DestinationTable | routing | 
|---------------------------------------|--------------------------------------|-----------|-----------------------|------------------|---------|
| xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx | GuardDuty | SENTINEL_AWSGUARDDUTY |   AWSGuardDuty   |         |

Take note of the scubaId value and open the [Investigate Scuba Telemetry](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/siem/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/gt/workspaceinvestigation) TSG. Specifically we can use the link to _AmazonWebServicesS3-GuardDuty_.

In the Geneva dashboard we need to:

1. Select a timeframe
2. Copy the scubaId
3. Launch the query
4. Once the query has finish reload the table to show all the data

![Geneve/Jarvis dashboard example](/.attachments/image-5b1e9a46-4592-4753-ac47-e46554a5bd7c.png =1000x)

Now we will need to look at the data to spot any issue, error or exception.

We can also change the filtering conditions in the query on the left panel if needed.

## 7. If everything else fail

CRI to Data Connectors / Multi Cloud (with HAR and screenshots).

# Amazon Web Services S3 Private Preview

There is a long running Private Preview for Amazon Web Services S3 that can be activated by using the feature flag [AwsS3CustomLogs=true](https://portal.azure.com/?feature.AwsS3CustomLogs=true).

Do not share this Private Preview with the customer.

Once activated the Amazon Web Services S3 connector in Sentinel will allow to ingest custom logs in custom tables.

![Amazon Web Services S3 connector UI in the Azure Portal](/.attachments/AmazonWebServicesS3PrivatePreview.png =600x)

As per all Private Previews we do not offer support.

The information is reported in here as a nice to know information and to avoid confusion.

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
