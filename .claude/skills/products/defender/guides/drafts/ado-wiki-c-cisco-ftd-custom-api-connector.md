---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Archive/Data Ingestion - Connectors/Deprecated/Syslog Custom API Connector - Cisco FirePower FTD"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Archive/Data%20Ingestion%20-%20Connectors/Deprecated/Syslog%20Custom%20API%20Connector%20-%20Cisco%20FirePower%20FTD"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

#Custom Log format sent to custom table in Log analytics (No log format filter)
Created a conf file ciscoftd.conf in the following directory
/etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsagent.d

Create the custom listener

`
cd /etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsagent.d
`

`vi ciscoftd.conf
`

##Contents of ciscoftd.conf if you have another custom API Log collector make sure to define each port differently

```
<source>
  type tcp
  format none
  port 22034
  bind 127.0.0.1
  delimiter "\n"
  tag oms.api.ciscoftd
</source>

<match oms.api.ciscoftd>
  type out_oms_api
  log_level info
  num_threads 5
  omsadmin_conf_path /etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsadmin.conf
  cert_path /etc/opt/microsoft/omsagent/<WorkspaceId>/certs/oms.crt
  key_path /etc/opt/microsoft/omsagent/<WorkspaceId>/certs/oms.key
  buffer_chunk_limit 10m
  buffer_type file
  buffer_path /var/opt/microsoft/omsagent/<WorkspaceId>/state/out_oms_api_ciscoftd*.buffer
  buffer_queue_limit 10
  buffer_queue_full_action drop_oldest_chunk
  flush_interval 30s
  retry_limit 10
  retry_wait 30s
  max_retry_wait 9m
</match>
```

Need to change ownership of the file

`
chown omsagent:omiusers ciscoftd
`

**Restart agent**
`
sudo /opt/microsoft/omsagent/bin/service_control restart
`

- It creates the ciscoftd_cl custom log and populates the log data (20 minutes)




#modify /etc/rsyslog.conf file

## Creatre a filter to pull something that is unique for the log source in this case "FTD"
you can have multiple conditions

edit /etc/rsyslog.conf and add the template

```
$template ciscoftd,"%timestamp% %hostname% %msg%\n"
```


You can create a custom conf file in /etc/rsyslog.d for example 10-ciscoftd.conf

If you put the proper filters you can filter out the logs from the syslog ingestion

you can do multiple conditions
if $rawmsg contains "Unique_Value1" or $rawmsg contains "Unique_Value2" or $rawmsg contains "Unique_Value3" then @@127.0.0.1:22034;ciscoftd

- Example
```
if $rawmsg contains "FTD" then @@127.0.0.1:22034;ciscoftd & stop

```


**Restart rsyslog**

`
systemctl restart rsyslog
`


## Test Logs change target IP

```
logger -p local4.warn "%FTD-6-430001: DeviceUUID: xxxxx-cecd-11e7-bb23-939926b3c92f, SrcIP: 10.0.0.1, DstIP: 10.10.10.1, SrcPort: 54059, DstPort: 445, Protocol: tcp, IngressInterface: FTD_Roch_Out_1_5, EgressInterface: FTD_out_test_in, IngressZone: WAN_FTD_Outside, EgressZone: WAN_FTD_Inside, Priority: 2, GID: 133, SID: 29, Revision: 2, Message: DCE2_EVENT__CO_BAD_PDU_TYPE, Classification: Potentially Bad Traffic, User: No Authentication Required, IntrusionPolicy: WAN Policy, ACPolicy: WAN Access Control Policy, NAPPolicy: Balanced Security and Connectivity"
```

#Log analytics Workspace query

##ciscoftd Parser:
Title:           Cisco FTD

Author:          Roger Fleming - Microsoft
 
```
ciscoftd_CL
| extend Parser = extract_all(@"(\w+\s+\d+\s\d+:\d+:\d+)\s(\S+)\s%(FTD)\S(\d+)\S(\d+): (.*)",dynamic([1,2,3,4,5,6]),Message)
| mv-expand Parser
| extend Epoch = tostring(Parser[0]),
        DeviceName = tostring(Parser[1]),
        LogType = tostring(Parser[2]),
        ReasonCode = tostring(Parser[3]),
        ErrorCode = tostring(Parser[4]),
        Substring = tostring(Parser[5])
| extend DeviceUUID = tostring(extract(@"DeviceUUID: (\S+)",1,Substring)),
        SrcIP = tostring(extract(@"SrcIP: (\S+),",1,Substring)),
        DstIP = tostring(extract(@"DstIP: (\S+),",1,Substring)),
        SrcPort = tostring(extract(@"SrcPort: (\S+),",1,Substring)),
        DstPort = tostring(extract(@"DstPort: (\S+),",1,Substring)),
        Protocol = tostring(extract(@"Protocol: (\S+),",1,Substring)),
        IngressInterface = tostring(extract(@"IngressInterface: (\S+),",1,Substring)),
        EgressInterface = tostring(extract(@"EgressInterface: (\S+),",1,Substring)),
        IngressZone = tostring(extract(@"IngressZone: (\S+),",1,Substring)),
        EgressZone = tostring(extract(@"EgressZone: (\S+),",1,Substring)),
        Priority = tostring(extract(@"Priority: (\S+),",1,Substring)),
        GID = tostring(extract(@"GID: (\S+),",1,Substring)),
        SID = tostring(extract(@"SID: (\S+),",1,Substring)),
        Revision = tostring(extract(@"Revision: (\S+),",1,Substring)),
        Message = tostring(extract(@"Message: (\S+),",1,Substring)),
        Classification = tostring(extract(@"Classification: (\S+),",1,Substring)),
        User = tostring(extract(@"User: (\S+),",1,Substring)),
        IntrusionPolicy = tostring(extract(@"IntrusionPolicy: (\S+),",1,Substring)),
        ACPolicy = tostring(extract(@"ACPolicy: (\S+),",1,Substring)),
        NAPPolicy = tostring(extract(@"IntrusionPolicy: (\S+),",1,Substring))
| project-away Parser,Substring

```
##Test Results

![image.png](/.attachments/image-2c86ec79-b0cc-4465-8463-db4d74486510.png)


##
Cisco FirePower Workbook

![image.png](/.attachments/image-0b8fdbb5-bba8-404b-9f21-631345323923.png)












Code
```
{
  "version": "Notebook/1.0",
  "items": [
    {
      "type": 9,
      "content": {
        "version": "KqlParameterItem/1.0",
        "parameters": [
          {
            "id": "",
            "version": "KqlParameterItem/1.0",
            "name": "TimeRange",
            "type": 4,
            "isRequired": true,
            "value": {
              "durationMs": 7776000000
            },
            "typeSettings": {
              "selectableValues": [
                {
                  "durationMs": 1800000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 3600000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 14400000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 43200000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 86400000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 172800000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 259200000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 604800000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 1209600000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 2592000000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 5184000000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                },
                {
                  "durationMs": 7776000000,
                  "createdTime": "2019-03-04T13:46:59.079Z",
                  "isInitialTime": false,
                  "grain": 1,
                  "useDashboardTimeRange": false
                }
              ],
              "allowCustom": true
            }
          }
        ],
        "style": "above",
        "queryType": 1,
        "resourceType": "microsoft.resourcegraph/resources"
      },
      "name": "parameters - 2"
    },
    {
      "type": 11,
      "content": {
        "version": "LinkItem/1.0",
        "style": "tabs",
        "links": [
          {
            "id": "b14a1882-985b-43fe-b254-6f3f4b67f1a4",
            "cellValue": "Tab",
            "linkTarget": "parameter",
            "linkLabel": "Security Events",
            "subTarget": "SecurityEvents",
            "style": "link"
          }
        ]
      },
      "name": "links - 14"
    },
    {
      "type": 3,
      "content": {
        "version": "KqlItem/1.0",
        "query": "CiscoFTD\r\n| summarize count() by bin(TimeGenerated, 1d)",
        "size": 1,
        "aggregation": 4,
        "showAnnotations": true,
        "title": "Security Events Trend",
        "timeContext": {
          "durationMs": 7776000000
        },
        "timeContextFromParameter": "TimeRange",
        "queryType": 0,
        "resourceType": "microsoft.operationalinsights/workspaces",
        "visualization": "barchart"
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "name": "query - 4"
    },
    {
      "type": 3,
      "content": {
        "version": "KqlItem/1.0",
        "query": "CiscoFTD\r\n| summarize count() by SrcIP\r\n| sort by count_ desc",
        "size": 0,
        "title": "Events by Source IP",
        "timeContext": {
          "durationMs": 0
        },
        "timeContextFromParameter": "TimeRange",
        "queryType": 0,
        "resourceType": "microsoft.operationalinsights/workspaces",
        "visualization": "table",
        "gridSettings": {
          "formatters": [
            {
              "columnMatch": "OperationCount",
              "formatter": 3,
              "formatOptions": {
                "showIcon": true
              }
            }
          ]
        }
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "customWidth": "33",
      "name": "query - 7 - Copy - Copy",
      "styleSettings": {
        "showBorder": true
      }
    },
    {
      "type": 3,
      "content": {
        "version": "KqlItem/1.0",
        "query": "CiscoFTD\r\n| summarize count() by DstIP\r\n| sort by count_ desc",
        "size": 0,
        "title": "Events by Destination IP",
        "timeContext": {
          "durationMs": 0
        },
        "timeContextFromParameter": "TimeRange",
        "queryType": 0,
        "resourceType": "microsoft.operationalinsights/workspaces",
        "visualization": "table",
        "gridSettings": {
          "formatters": [
            {
              "columnMatch": "OperationCount",
              "formatter": 3,
              "formatOptions": {
                "showIcon": true
              }
            }
          ]
        }
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "customWidth": "33",
      "name": "query - 7 - Copy - Copy - Copy",
      "styleSettings": {
        "showBorder": true
      }
    },
    {
      "type": 12,
      "content": {
        "version": "NotebookGroup/1.0",
        "groupType": "editable",
        "title": "Events by IP",
        "items": [
          {
            "type": 3,
            "content": {
              "version": "KqlItem/1.0",
              "query": "CiscoFTD\r\n| summarize count() by Protocol\r\n| render piechart",
              "size": 4,
              "title": "Events by Protocol",
              "timeContext": {
                "durationMs": 0
              },
              "timeContextFromParameter": "TimeRange",
              "queryType": 0,
              "resourceType": "microsoft.operationalinsights/workspaces",
              "visualization": "piechart"
            },
            "name": "query - 0"
          },
          {
            "type": 3,
            "content": {
              "version": "KqlItem/1.0",
              "query": "CiscoFTD\r\n| summarize count() by ErrorCode",
              "size": 4,
              "title": "Events by Reason Code",
              "timeContext": {
                "durationMs": 0
              },
              "timeContextFromParameter": "TimeRange",
              "queryType": 0,
              "resourceType": "microsoft.operationalinsights/workspaces",
              "visualization": "piechart",
              "tileSettings": {
                "showBorder": false
              }
            },
            "name": "query - 1"
          }
        ]
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "customWidth": "33",
      "name": "group - 17",
      "styleSettings": {
        "showBorder": true
      }
    },
    {
      "type": 3,
      "content": {
        "version": "KqlItem/1.0",
        "query": "CiscoFTD\r\n| summarize count() by SrcPort\r\n| sort by count_ desc",
        "size": 0,
        "title": "Events by Source Port",
        "timeContext": {
          "durationMs": 0
        },
        "timeContextFromParameter": "TimeRange",
        "queryType": 0,
        "resourceType": "microsoft.operationalinsights/workspaces"
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "customWidth": "33",
      "name": "query - 12",
      "styleSettings": {
        "showBorder": true
      }
    },
    {
      "type": 3,
      "content": {
        "version": "KqlItem/1.0",
        "query": "CiscoFTD\r\n| summarize count() by DstPort\r\n| sort by count_ desc",
        "size": 0,
        "title": "Events by Destination Port",
        "timeContext": {
          "durationMs": 0
        },
        "timeContextFromParameter": "TimeRange",
        "queryType": 0,
        "resourceType": "microsoft.operationalinsights/workspaces"
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "customWidth": "33",
      "name": "query - 13",
      "styleSettings": {
        "showBorder": true
      }
    },
    {
      "type": 12,
      "content": {
        "version": "NotebookGroup/1.0",
        "groupType": "editable",
        "title": "Events by Port",
        "items": [
          {
            "type": 3,
            "content": {
              "version": "KqlItem/1.0",
              "query": "CiscoFTD\r\n| summarize count() by SrcPort",
              "size": 4,
              "title": "Events by Source Port",
              "timeContext": {
                "durationMs": 0
              },
              "timeContextFromParameter": "TimeRange",
              "queryType": 0,
              "resourceType": "microsoft.operationalinsights/workspaces",
              "visualization": "piechart"
            },
            "name": "query - 0"
          },
          {
            "type": 3,
            "content": {
              "version": "KqlItem/1.0",
              "query": "CiscoFTD\r\n| summarize count() by DstPort",
              "size": 4,
              "title": "Events by Destination Port",
              "timeContext": {
                "durationMs": 0
              },
              "timeContextFromParameter": "TimeRange",
              "queryType": 0,
              "resourceType": "microsoft.operationalinsights/workspaces",
              "visualization": "piechart"
            },
            "name": "query - 0 - Copy"
          }
        ]
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "customWidth": "33",
      "name": "group - 17 - Copy",
      "styleSettings": {
        "showBorder": true
      }
    },
    {
      "type": 3,
      "content": {
        "version": "KqlItem/1.0",
        "query": "CiscoFTD\r\n| sort by TimeGenerated desc",
        "size": 0,
        "title": "Raw Security Events",
        "timeContext": {
          "durationMs": 7776000000
        },
        "timeContextFromParameter": "TimeRange",
        "queryType": 0,
        "resourceType": "microsoft.operationalinsights/workspaces",
        "gridSettings": {
          "filter": true
        }
      },
      "conditionalVisibility": {
        "parameterName": "Tab",
        "comparison": "isEqualTo",
        "value": "SecurityEvents"
      },
      "name": "query - 35 - Copy"
    }
  ],
  "fallbackResourceIds": [
    "/subscriptions/0a177a01-8b95-42cd-963a-a363c0e1e52b/resourcegroups/labnsg/providers/microsoft.operationalinsights/workspaces/loganalyticseastus1"
  ],
  "fromTemplateId": "sentinel-UserWorkbook",
  "$schema": "https://github.com/Microsoft/Application-Insights-Workbooks/blob/master/schema/workbook.json"
}
```

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
