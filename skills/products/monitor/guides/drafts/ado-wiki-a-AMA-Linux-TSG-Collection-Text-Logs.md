---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/Troubleshooting Guides/AMA Linux: TSG:  Collection - Text Logs"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/Troubleshooting%20Guides/AMA%20Linux%3A%20TSG%3A%20%20Collection%20-%20Text%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Scenario
**ALL** of the following are TRUE:
- The [heartbeat](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-heartbeat) is present in the destination Log Analytics Workspace (LAW). 
    - If not, follow the [Heartbeat TSG](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1343718/AMA-Linux-TSG-Collection-Heartbeat) instead.
- The [Text Log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-text-logs) is missing, duplicated, or appears to be malformed in the destination Log Analytics Workspace (LAW).

##Support Area Path
```Azure/Azure Monitor Agent (AMA) on Linux machine/I created a DCR but the data is not in the Log Analytics Workspace/No Text custom logs in Log Analytics Workspace```

# Documentation
[Collect text file from virtual machine with Azure Monitor - Azure Monitor | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text)
[Collect logs from text files with the Azure Monitor Agent and ingest to Microsoft Sentinel - AMA | Microsoft Learn](https://learn.microsoft.com/en-us/azure/sentinel/connect-custom-logs-ama?tabs=portal)

# What you will need
- **ResourceID** of the machine where AMA is installed
- root access to the agent machine operating system

# Known Issues
- [AMA for Linux Known Issues](https://supportability.visualstudio.com/AzureMonitor/_search?text=Tags%3A%22AMAforLinux%22%20AND%20Tags%3A%22CustomLogs%22&type=workitem&pageSize=100&filters=Projects%7BAzureMonitor%7DWork%20Item%20Types%7BKnown%20Issue%7DStates%7BPublished%7D)
- [Agents PG Active Incidents](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?sl=x4rel0tgnqd)

# Logs to Collect
- [AMA Troubleshooter for Linux](https://learn.microsoft.com/azure/azure-monitor/agents/troubleshooter-ama-linux?tabs=redhat%2CGenerateLogs#run-the-troubleshooter)
    - Enable [fluentbit debug log level](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1167658/AMA-Linux-HT-Fluentbit-Set-log-level-(debug-error-warn-info-off)) and [mdsd tracing - text log scenario](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779088/AMA-Linux-HT-Set-mdsd-tracing-options?anchor=scenario%3A-text-logs) **BEFORE** collecting logs
- [AMA Network Trace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590073/AMA-Linux-HT-Network-Trace?anchor=scenario%3A-text-logs)
- A copy of the text file
- A copy of [fluentbit-out-file.log](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2062700/AMA-Linux-HT-Fluentbit-Set-output-to-file)

# Troubleshooting
:::template /.templates/AMA-LatestVersion.md
:::

## Step 1: Scoping
### Step 1a: What issue is being experienced?
The customer will need to answer this question. The answer should be one of the following:
- All records are missing from multiple files
- All records are missing from a specific file
- Some records are missing from a specific file
    - Get an example missing record
- Records are being duplicated in the Log Analytics Workspace
    - Get an example duplicated record
    - Get a log query that will return the duplicate results - use absolute times
        - ```| where TimeGenerated between (datetime(2025-01-01 09:30:30) .. datetime(2025-01-01 10:30:30))```
- Records appear to be malformed in the Log Analytics Workspace
    - Get an example record: what was expected
    - Get a log query that will return the malformed record - use absolute times
        - ```| where TimeGenerated between (datetime(2025-01-01 09:30:30) .. datetime(2025-01-01 10:30:30))```

### Step 1b: What file is experiencing issues?
The customer will need to answer this question. The answer should be the **path** to a file and an issue type - for example:

```/var/log/myText.log```

Even if multiple files are not being collected, we should narrow the scope of the investigation to a single file.

### Step 1c: What is the file encoding for this file?
You can use the following command to show the file encoding:

```file -i /tmp/test1.log```

![image.png](/.attachments/image-79694e5d-e426-4660-8a0e-3d3d4d4e7705.png)
![image.png](/.attachments/image-ff78abc0-7368-4308-be0b-2d6523be409a.png)

This should be one of the supported encoding types (ascii or utf-8) see [this](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text#text-file-requirements-and-best-practices) for more info.

### Step 1d: How are records delimited?
The customer will need to answer this question or provide a copy of the file. The answer should match one of the supported [time formats](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text#time-formats) or newline - for example: 

```newline```
```ISO 8601: 2024-10-29T18:28:34Z```
```M/D/YYYY HH:MM:SS AM/PM: 10/29/2024 06:28:34 PM```

The purpose of the time format is for record delimitation (i.e. how can we tell when one record ends and another begins) NOT for the purpose of populating the TimeGenerated value. The TimeGenerated value is set by the mdsd process as the time when mdsd received the record from fluentbit.

### Step 1e: How are log files created, content added, and log files rotated?
The customer may or may not know the answer to these questions, but knowing the answer to these questions can help progress the investigation more quickly. Fluentbit has limitations (for instance, our implementation of fluentbit does not support truncating monitored files). If the customer does not know the answer to these questions, we can indirectly ascertain these through logs, later in the investigation.

This topic is discussed in more detail in the [Fluentbit Concepts](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2051258/AMA-Linux-Concept-Fluent-Bit) doc.

### Step 1f: How many log files are being tracked by fluentbit?

```
bash -c 'DB_DIR=/etc/opt/microsoft/azuremonitoragent/config-cache/fluentbit/db; echo "Scanning $DB_DIR for .db files..."; TOTAL=0; for DB_FILE in "$DB_DIR"/*.db; do [ -f "$DB_FILE" ] || { echo "No .db files found"; exit 1; }; echo "Database: $DB_FILE"; sqlite3 "$DB_FILE" "SELECT name FROM in_tail_files;" 2>/dev/null; COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM in_tail_files;" 2>/dev/null); if [ $? -eq 0 ] && [ -n "$COUNT" ]; then echo "Files tracked: $COUNT"; TOTAL=$((TOTAL + COUNT)); else echo "Error querying $DB_FILE"; fi; echo "---"; done; echo "Total files tracked: $TOTAL"'
```

Example output:
![image.png](/.attachments/image-5a0dd0b2-5bca-4fd9-bf8e-aaedb2b949cd.png)

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note**: This will not work if the system does not have sqlite3 installed. If sqlite3 is missing and the owner of the system agrees to install it, that is fine, otherwise, we can continue without this information.
</div>

## Step 2: Is the DCR properly configured?
### Step 2a: Is there an associated DCR to collect the file?
[AMA: HT: List Associated DCRs and DCEs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1585645/AMA-HT-List-Associated-DCRs-and-DCEs)
- If an associated Data Collection Rule (DCR) instructs the agent to monitor the file, proceed to the next step.
- If an associated Data Collection Rule (DCR) does not instruct the agent to monitor the file, [update the DCR](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text) and test again.
 
### Step 2b: Is the DCR configuration properly defined?
[AMA: HT: Review Data Collection Rule (DCR) Config - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1732149/AMA-HT-Review-Data-Collection-Rule-(DCR)-Config?anchor=scenario%3A-text-logs-(custom-text-%3Ctablename%3E_cl))
- If the DCR meets the conditions defined in the text logs scenario, proceed to the next step.
- If the DCR does not meet the conditions defined in the text logs scenario, [update the DCR](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text) and test again.

## Step 3: Is mdsd properly configured?
### Step 3a: Has mdsd downloaded and parsed the DCR?
[AMA Linux: HT: Review agent instruction set - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710334/AMA-Linux-HT-Review-agent-instruction-set?anchor=scenario%3A-text-logs)
- If mdsd has downloaded and parsed the DCR, proceed to the next step.
- If mdsd has not downloaded and parsed the DCR, verify that the DCR is present in ```/etc/opt/microsoft/azuremonitoragent/config-cache/configchunks/*.json```.
    - If the DCR is present in configchunks and meets the conditions from the previous step, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.
    - If the DCR is not present in configchunks, then the agent cannot acquire a current configuration. Follow the Configuration TSG ([VM](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1703539/AMA-Linux-TSG-Configuration-(Azure-Virtual-Machine)) | [ARC](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1705012/AMA-Linux-TSG-Configuration-(Azure-Arc-Machine))) instead.

### Step 3b: Is mdsd listening for fluentbit?
[AMA Linux: HT: Check the listening ports of a process - Scenario: Mdsd Fluentbit](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779079/AMA-Linux-HT-Check-the-listening-ports-of-a-process?anchor=scenario%3A-mdsd-fluentbit)
- If mdsd is listening for fluentbit, proceed to the next step.
- If mdsd is not listening for fluentbit, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

## Step 4: Is fluentbit properly configured?
[AMA Linux: HT: Fluentbit - Review config (td-agent.conf)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009980/AMA-Linux-HT-Fluentbit-Review-config-(td-agent.conf))
### Step 4a: Is fluentbit configured to tail the file?
[AMA Linux: HT: Fluentbit - Review config (td-agent.conf) - Is fluentbit configured to tail the file?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009980/AMA-Linux-HT-Fluentbit-Review-config-(td-agent.conf)?anchor=is-fluentbit-configured-to-tail-the-file%3F)
- If fluentbit is configured to tail the in-scope file, proceed to the next step.
- If fluentbit is not configured to tail the in-scope file, verify that the defined file pattern in the DCR matches a pattern that will include this file and review [Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009980/AMA-Linux-HT-Fluentbit-Review-config-(td-agent.conf)?anchor=known-issues).
- If the DCR includes a filePattern value that will include the in-scope file and none of the known issues explains why the td-agent.conf doesn't accurately reflect the pattern from the DCR, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below. 

### Step 4b: Is fluentbit configured to forward to mdsd?
[AMA Linux: HT: Fluentbit - Review config (td-agent.conf) - Is fluentbit configured to forward to mdsd?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009980/AMA-Linux-HT-Fluentbit-Review-config-(td-agent.conf)?anchor=is-fluentbit-configured-to-forward-to-mdsd%3F)
- If fluentbit is configured to forward to mdsd, take note of the port number and proceed to the next step.
- If fluentbit is not configured to forward to mdsd, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below. 

## Step 5: Is fluentbit operating as expected?
[AMA Linux: HT: Fluentbit - Review logs (fluentbit.log)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009982/AMA-Linux-HT-Fluentbit-Review-logs-(fluentbit.log))
### Step 5a: Is fluentbit watching the file?
[AMA Linux: HT: Fluentbit - Review logs (fluentbit.log) - Is fluentbit watching the file?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009982/AMA-Linux-HT-Fluentbit-Review-logs-(fluentbit.log)?anchor=is-fluentbit-watching-the-file%3F)
- If fluentbit is watching the file, proceed to the next step.
- If fluentbit is not watching the file, verify that the file is included in the defined file pattern and review the fluentbit.log for [Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009982/AMA-Linux-HT-Fluentbit-Review-logs-(fluentbit.log)?anchor=known-issues).
- If none of the known issues explains why fluentbit is not operating as expected, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

### Step 5b: Does fluentbit observe changes to the file?
[AMA Linux: HT: Fluentbit - Review logs (fluentbit.log) - Does fluentbit observe changes to the file?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009982/AMA-Linux-HT-Fluentbit-Review-logs-(fluentbit.log)?anchor=does-fluentbit-observe-changes-to-the-file%3F)
- If fluentbit observes changes to the file, proceed to the next step.
- If fluentbit does not observe changes to the file, use the [tail -f](https://man7.org/linux/man-pages/man1/tail.1.html) command to verify that changes to the file are occurring.
- If changes are occurring, but fluentbit does not observe changes to the file, review the fluentbit.log for [Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009982/AMA-Linux-HT-Fluentbit-Review-logs-(fluentbit.log)?anchor=known-issues).
- If none of the known issues explains why fluentbit is not operating as expected, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

### Step 5c: Does fluentbit flush changes to mdsd?
[AMA Linux: HT: Fluentbit - Review logs (fluentbit.log) - Does fluentbit flush changes to mdsd?](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009982/AMA-Linux-HT-Fluentbit-Review-logs-(fluentbit.log)?anchor=does-fluentbit-flush-changes-to-mdsd%3F)
[AMA Linux: HT: Fluentbit - Set output to file](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2062700/AMA-Linux-HT-Fluentbit-Set-output-to-file)
[AMA Linux: HT: Network Trace - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590073/AMA-Linux-HT-Network-Trace?anchor=scenario%3A-text-logs)

- If fluentbit flushes changes to mdsd and the network trace and/or fluentbit-out-file.log shows records in transit to mdsd, proceed to the next step.
- If fluentbit does not flush changes to mdsd, verify that [mdsd is listening](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779079/AMA-Linux-HT-Check-the-listening-ports-of-a-process?anchor=scenario%3A-mdsd-syslog) and review the fluentbit.log for [Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009982/AMA-Linux-HT-Fluentbit-Review-logs-(fluentbit.log)?anchor=known-issues).
- If none of the known issues explains why fluentbit is not operating as expected, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

## Step 6: Is mdsd operating as expected?
### Step 6a: Does mdsd log issues monitoring the file?
[AMA Linux: HT: Review mdsd.info - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710889/AMA-Linux-HT-Review-mdsd.info?anchor=scenario%3A-text-logs)
[AMA Linux: HT: Review mdsd.warn - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1779086/AMA-Linux-HT-Review-mdsd.warn?anchor=scenario%3A-text-logs)
[AMA Linux: HT: Review mdsd.err - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710890/AMA-Linux-HT-Review-mdsd.err?anchor=scenario%3A-text-logs)
- If mdsd is receiving and processing lines from fluentbit and you have reviewed the mdsd.warn and mdsd.err logs for known issues, but found none, proceed to the next step.
- If mdsd is not receiving and processing lines from fluentbit and none of the known issues explains why mdsd is not operating as expected, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

### Step 6b: Does mdsd successfully transmit records?
[AMA Linux: HT: Review mdsd.qos - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1710354/AMA-Linux-HT-Review-mdsd.qos?anchor=scenario%3A-text-logs)
- If mdsd.qos shows integers greater than 0 for TotalRowsRead and TotalRowsSent for the in-scope DCR, proceed to the next step.
- If mdsd.qos shows 0 TotalRowsRead and/or 0 TotalRowsSent count for the in-scope DCR during an interval in which records should have been sent, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

**<span style="color: red;">TO DO:</span>** We're missing a step here - still pending PG on this [IcM](https://portal.microsofticm.com/imp/v5/incidents/details/637870649/summary). Mdsd talks to Ama coreagent and Ama coreagent talks to ingest endpoint.

## Step 7: Is the ingestion pipeline operating as expected?
### Step 7a: Is the dataType in the ingestion pipeline?
[AMA: HT: Review agent data in ingestion pipeline - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590104/AMA-HT-Review-agent-data-in-ingestion-pipeline?anchor=scenario%3A-text-logs)
- If the dataType is in the ingestion pipeline, proceed to the next step.
- If the dataType is not in the ingestion pipeline, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

### Step 7b: Does the destination table exist?
[AMA: HT: Check if a table exists in a Log Analytics workspace](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2025961/AMA-HT-Check-if-a-table-exists-in-a-Log-Analytics-workspace)
- If the table exists, proceed to the next step.
- If the table does not exist, advise the customer to [create the table](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text#log-analytics-workspace-table) and test again.

### Step 7c: Is the data being transformed?
[AMA: HT: Check if a KQL transform exists in a DCR](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2025972/AMA-HT-Check-if-a-KQL-transform-exists-in-a-DCR?anchor=scenario%3A-text-log)
- If the data is not being transformed, proceed to the next step.
- If the data is being transformed, take note of the transformKql and proceed to the next step.

### Step 7d: Is the table schema correctly defined?
[AMA: HT: Check if Table schema is correctly defined](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2031813/AMA-HT-Check-if-Table-schema-is-correctly-defined)
- If the required columns (TimeGenerated, RawData) and optional columns (FilePath, Computer) are the only columns and have the correct data type, proceed to the next step.
- If the required columns (TimeGenerated, RawData) or optional columns (FilePath, Computer) have the incorrect data type, the customer should [recreate the custom table](https://learn.microsoft.com/en-us/azure/azure-monitor/vm/data-collection-log-text#log-analytics-workspace-table) or [update the table schema](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/manage-logs-tables?tabs=azure-portal) and test again.
- If the customer is using transformKql, verify whether or not the columns and data types exist in the table schema for any [extended](https://learn.microsoft.com/en-us/kusto/query/extend-operator) columns.

### Step 7e: Are there errors in the DCRErrorLogs?
[AMA: HT: Review DCR Diagnostic Settings Logs (DCRErrorLogs, DCR Metrics)](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2056258/AMA-HT-Review-DCR-Diagnostic-Settings-Logs-(DCRErrorLogs-DCR-Metrics))
- If there are no related errors in the DCRErrorLogs, proceed to the next step.
- If there are related errors in the DCRErrorLog, review [Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2056258/AMA-HT-Review-DCR-Diagnostic-Settings-Logs-(DCRErrorLogs-DCR-Metrics)?anchor=known-issues)
- If none of the known issues explains the errors in DCRErrorLogs, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

### Step 7f: Are there errors in the LAW Operations table?
[AMA: HT: Review LAW Operation Table Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2062714/AMA-HT-Review-LAW-Operation-Table-Logs)
- If there are no related errors in the Operation table, proceed to the next step.
- If there are related errors in the Operation table, review [Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2062714/AMA-HT-Review-LAW-Operation-Table-Logs?anchor=known-issuess)
- If none of the known issues explains the errors in Operation table, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

## Step 8: Does data appear as expected in the destination?
[AMA: HT: Query Data - Log Analytics Workspace - Scenario: Text Logs](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=scenario%3A-text-logs)
- If the record is present as expected, the issue may have previously been mitigated. Review with the customer.
- If the record is present, but does not appear as expected, Review the [Known Issues](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/1590094/AMA-HT-Query-Data-Log-Analytics-Workspace?anchor=known-issues-text-logs).
- If none of the known issues explains why the record does not appear as expected, follow instructions in the [Getting Help](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/2009957/AMA-Linux-TSG-Collection-Text-Logs?anchor=getting-help) section below.

## Getting Help

:::template /.templates/TSG-GettingHelp-AgentsLinux.md
:::

# Product Group Escalation
---
:::template /.templates/TSG-ProductTeamEscalation.md
:::
