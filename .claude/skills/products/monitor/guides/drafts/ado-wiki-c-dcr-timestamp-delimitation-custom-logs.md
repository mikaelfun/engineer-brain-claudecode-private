---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Data Collection Rules (DCR)/How-To/AMA: HT: Configure Time Stamp Delimitation in Custom Log Data Collection Rules"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/Data%20Collection%20Rules%20%28DCR%29/How-To/AMA%3A%20HT%3A%20Configure%20Time%20Stamp%20Delimitation%20in%20Custom%20Log%20Data%20Collection%20Rules"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]


# Introduction
---
At the current time there is no way to enable the agent Timestamp delimitation by use of the portal in either the walkthrough guide in our public documents or using the portal Data Collection Rule Creation process.

Starting with the Agent versions listed below, the agent has the ability to collect records data based on a date/time stamp as well as new line. 

AMA Windows **1.30**
AMA Linux **1.33**

on this How-To wiki we are going to describe how to add this functionality to the agent by modifying an existing Data Collection Rule.

# Instructions
---
This process will consist of the following to be done

1-Locate the date value at the beginning of the record
2-Exporting the DCR itself which used to collect that custom log and redeploy it while adding the required fields.

below are the detailed steps:

**Part one**

1. Open the customers sample log file and compare the date format to the following format list:

"YYYY-MM-DD HH:MM:SS"
"M/D/YYYY HH:MM:SS AM/PM"
"Mon DD, YYYY HH:MM:SS"
"yyMMdd HH:mm:ss"
"ddMMyy HH:mm:ss"
"MMM d hh:mm:ss"
"dd/MMM/yyyy:HH:mm:ss zzz"
"yyyy-MM-ddTHH:mm:ssK"

**Example**: (copiable text)


    2024-06-21 19:17:34,1423,Error,Sales,Unable to connect to pricing service.
    2024-06-21 19:18:23,1420,Information,Sales,Pricing service connection established.
    2024-06-21 21:45:13,2011,Warning,Procurement,Module failed and was restarted.
    2024-06-21 23:53:31,4100,Information,Data,Nightly backup complete.

using the date value from my Example the proper format is:

"2024-06-21 23:53:31"
"YYYY-MM-DD HH:MM:SS"


**Part two** 
 
1. Go to **Data collection rules** and export the needed DCR (Custom Log DCR) by choosing **Export Template** option under Automation. 
2. Click **deploy** to deploy the template.
3. Click **Edit Template** and locate the **dataSources** node and the **recordStartTimestampFormat** setting within the template as the below example shows: 


**Example**: (copiable text)


                "dataSources": {
                    "logFiles": [
                        {
                            "streams": [
                                "Custom-Text-TestCustomLog_CL"
                            ],
                            "filePatterns": [
                                "/var/opt/log/test.log"
                            ],
                            "format": "text",
                            "settings": {
                                "text": {
                                    "recordStartTimestampFormat": "ISO 8601"
                                }
                            },
                            "name": "Custom-Text-TestCustomLog_CL"
                        }
                    ]
                },


4. Modify the **recordStartTimestampFormat** value to match your log timestamp format:

                "dataSources": {
                    "logFiles": [
                        {
                            "streams": [
                                "Custom-Text-TestCustomLog_CL"
                            ],
                            "filePatterns": [
                                "/var/opt/log/test.log"
                            ],
                            "format": "text",
                            "settings": {
                                "text": {
                                    "recordStartTimestampFormat": "YYYY-MM-DD HH:MM:SS"
                                }
                            },
                            "name": "Custom-Text-TestCustomLog_CL"
                        }
                    ]
                },

5. then click **Save**, **Review and Create** and **Create**.

(you may also check the resource changes after its deployment, while reviewing the JSON view of the rule)

![{3115F821-F336-4D36-8702-B5B290F9F62C}.png](/.attachments/{3115F821-F336-4D36-8702-B5B290F9F62C}-ffbb8505-0306-4601-a207-39e6fecb70c4.png)

**Note:** There is no need for any further modifications or action on the agent itself, the agent will detect the Data Collection Rule change and reconfigure accordingly.

# Reviewing the results
---
In order to review the results, we need to make sure either the file is actively being written to, or we can inject some data using the echo command. 

![{4F0B17EF-8799-4E5D-947C-60E089B577FE}.png](/.attachments/{4F0B17EF-8799-4E5D-947C-60E089B577FE}-0554fbe6-a974-4b75-989b-d6bad125ddc4.png)

While reviewing the results we can see the raw data highlighted in the above screenshot to show the multiple lines collected.









