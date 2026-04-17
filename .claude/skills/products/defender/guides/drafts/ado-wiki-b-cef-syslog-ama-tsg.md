---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Data Ingestion - Connectors/Third Party Connectors/Azure Monitoring Agent/[TSG] - CEF and Syslog AMA Installations and Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FData%20Ingestion%20-%20Connectors%2FThird%20Party%20Connectors%2FAzure%20Monitoring%20Agent%2F%5BTSG%5D%20-%20CEF%20and%20Syslog%20AMA%20Installations%20and%20Troubleshooting%20Guide"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]
#Public documentation

You **NEED** to be familiar with the following documentation:

 - [Syslog and Common Event Format (CEF) via AMA connectors for Microsoft Sentinel](https://learn.microsoft.com/en-us/azure/sentinel/cef-syslog-ama-overview)
 - [Ingest syslog and CEF messages to Microsoft Sentinel with the Azure Monitor Agent](https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-syslog-ama)
 - [CEF via AMA data connector - Configure specific appliance or device for Microsoft Sentinel data ingestion](https://learn.microsoft.com/en-us/azure/sentinel/unified-connector-cef-device)
 - [Syslog via AMA data connector - Configure specific appliance or device for Microsoft Sentinel data ingestion](https://learn.microsoft.com/en-us/azure/sentinel/unified-connector-syslog-device)
 - [Azure Monitor Agent overview](https://docs.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-overview?tabs=PowerShellWindows#data-sources-and-destinations)

#Internal documentation

[eng.ms TSG](https://eng.ms/docs/microsoft-security/microsoft-threat-protection-mtp/onesoc-1soc/siem/microsoft-azure-sentinel/azure-sentinel-operational-guides/helpguides/connectors/amaconnectors/linuxama)

# Table schema notes

There was a thought to populate `StartTime` and `EndTime` as part of the CML workflow since the origin fields of�_start_�and�_end_�are included in the ArcSight CEF standard.
After some further investigation it was decided not to proceed with them since the datetime format used in those fields can vary between vendors and we cannot accommodate all the different formats during our KQL ingestion flow.

So, we are left with fields that are included in the schema but are not populated.
Customers can extract the start/end values from AdditionalExtension field and populate them using custom transformation.

#CEF via AMA Installation Overview

At a high level, configuring CEF collection via the AMA agent has two mains steps:
1. Creation of an DCR (Data Collection Rule). This can be done using one of the following:

   -  Using the Sentinel portal/data connector

   -  Using the Azure monitor API

2. Running the installation script on the Log forwarder

For details on these steps, see the [Stream CEF logs with the AMA connector](https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-ama) documentation.

## Basic configuration diagram

::: mermaid
flowchart LR
  subgraph VM[Virtual Machine]
    direction LR
    subgraph RSyslogService[RSyslog service]
      direction LR
        RSyslogListening[Port 514] -- Conf: /etc/rsyslog.d/10-azuremonitoragent-omfwd.conf --> RSyslogForward[Forward]
    end
    subgraph AMA[Azure Monitor Agent]
      direction LR
      AMAListening[Port 28330]
      subgraph DCR[Data Collection Rule]
        direction LR
        AMAProcessing
        AMAForward
      end
    end
  end
  subgraph AzureLA[Azure / LogAnalytics]
    LogAnalytics
  end
  Source -- Syslog, CEF, ASA logs --> RSyslogListening
  RSyslogForward --> AMAListening
  AMAListening --> AMAProcessing
  AMAProcessing --> AMAForward
  AMAForward --> LogAnalytics
:::

# Steps to troubleshoot AMA ingestion issue for ASA and CEF logs

The following steps can be used as a guideline on what to check and in what order to get a better picture on where a problem might be.
These steps are also presented every time the customer tries to raise a case about similar issues.

## Check logs are being received

It might take up to 20 minutes for the CEF or ASA logs to show up in Sentinel.

Assuming you waited enough you need to make sure the logs are arriving into the log collector VM.

A default configuration should send the logs to port 514.
To check if they are being sent to the log forwarder machine you can execute a tcpdump using: 

    sudo tcpdump -i any port 514 -A -vv

Make sure the log source is correctly configured to send the messages to the log forwarder machine you are checking.

Keep in mind also the infrastructure you might have in between: firewalls, load balancers, network rules, etc can play a role in these scenarios.

## Check AMA extension status in Azure

Open the Azure Portal and navigate to the log collector machine of your choice.
Open the **Extensions + applications** blade and select the **AMA (AzureMonitorLinuxAgent)** extension.

A correct deployment of the extension should show **StatusProvisioning** equal to **succeeded**.

## Check AMA extension version in Azure

Open the Azure Portal and navigate to the log collector machine of your choice.

Open the **Extensions + applications** blade and select the **AzureMonitorLinuxAgent** extension.

Check the current agent version in the **Version** field.
The Version value should be one of the 2/3 most recent one available.

You can check the list of available versions in [AMA version details](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-extension-versions#version-details).

A version is not automatically roll out until it meets a high quality bar which can take as long as 5 weeks after the initial release.

### AMA Linux basic troubleshooting steps

Follow the [AMA Linux basic troubleshooting steps](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-linux-vm#basic-troubleshooting-steps) to try and fix any underlying issue with the agent.

## Check AMA service status locally

Log into the log collector machine to check the status of the *azuremonitoragent.service*.

This can be run by using the command 

    sudo systemctl status azuremonitoragent.service

or any equivalent one depending on your Linux environment.

## Check the rsyslog status locally

Log into the log collector machine to check the status of the *rsyslog.service*.

This can be run by using the command 

    sudo systemctl status rsyslog.service

or any equivalent one depending on your Linux environment.

The same can be done if you are using *syslog-ng*.

### Fix rsyslog config

Correct or fix the *rsyslog/syslog-ng* configuration and/or service on the log collector machine.

## Check the rsyslog configuration

The rsyslog configuration is usually composed from the */etc/rsyslog.conf* file plus the */etc/rsyslog.d/* folder.

You should have already run the script from the connector page.
As per [Run the "installation" script](https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-syslog-ama?tabs=portal#run-the-installation-script):

*The script configures the rsyslog or syslog-ng daemon to use the required protocol and restarts the daemon. The script opens port 514 to listen to incoming messages in both UDP and TCP protocols. To change this setting, refer to the syslog daemon configuration file according to the daemon type running on the machine:*

- *Rsyslog: /etc/rsyslog.conf*
- *Syslog-ng: /etc/syslog-ng/syslog-ng.conf*

*If you're using Python 3, and it's not set as the default command on the machine, substitute python3 for python in the pasted command. See Log forwarder prerequisites.*

You can run 

    grep -E 'imudp|imtcp' /ect/rsyslog.conf

to check the port configuration of rsyslog.
The output should look similar to the following lines:

- *module(load="imudp")*
- *input(type="imudp" port="514")*
- *module(load="imtcp")*
- *input(type="imtcp" port="514")*

This is the out of the box configuration that allows rsyslog to receive logs on port 514 for both TCP and UDP protocols.
It can be changed based on your specific needs. Starting with the default option will make it easier to troubleshoot the issue.

After checking */etc/rsyslog.conf* we also need to verify the presence of */etc/rsyslog.d/10-azuremonitoragent-omfwd.conf*.

You can execute 

    cat /etc/rsyslog.d/10-azuremonitoragent-omfwd.conf

The output should start with the message 

    # Azure Monitor Agent configuration: forward logs to azuremonitoragent

This instruct *rsyslog* to send the messages to the AMA service listening on an Unix socket or a network port.

Follow also:

1) *Troubleshooting steps* in [Issues collecting Syslog](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-linux-vm#issues-collecting-syslog)

2) [Syslog troubleshooting guide for Azure Monitor Agent for Linux](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-linux-vm-rsyslog).

These pages talk about Syslog but, to ingest CEF and ASA logs, the configuration used is the same.

## Check port status

Let's verify the ports status.

By running 

    sudo ss -lnp | grep -E "28330|514"

 you should get a similar output:

    udp UNCONN 0 0 0.0.0.0:514 0.0.0.0:* users:(("rsyslogd",pid=12289,fd=5))
    udp UNCONN 0 0 514 [::]:* users:(("rsyslogd",pid=12289,fd=6))
    tcp LISTEN 0 10 127.0.0.1:28330 0.0.0.0:* users:(("mdsd",pid=1424,fd=1363))
    tcp LISTEN 0 25 0.0.0.0:514 0.0.0.0:* users:(("rsyslogd",pid=12289,fd=7))
    tcp LISTEN 0 25 514 [::]:* users:(("rsyslogd",pid=12289,fd=8))

In a correct, and default, configuration this allows you to check:
- *rsyslog* is listening on port 514 for both TCP and UDP
- *mdsd* (a component of AMA) is listening on port 28330 using TCP

## Check firewall rules

The ports might be open but a firewall might be blocking all communications.
Based on the customer environment and setup make sure the appropriate firewall rules are in place to allow the communication to occurs between:

- *log source* and *rsyslog*
- *rsyslog* and *AMA*
- *AMA* and the *Azure Cloud*

## Check CEF ASA DCR configuration in Azure

Based on the [Linux AMA Basic troubleshooting steps](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-linux-vm#basic-troubleshooting-steps) you can check if the CEF DCR is available locally.

Depending on the log the customer is trying to collect you can execute:

To verify the CEF DCR exists:

    sudo grep -i -r "SECURITY_CEF_BLOB" /etc/opt/microsoft/azuremonitoragent/config-cache/configchunks

To verify the ASA DCR exists:

    sudo grep -i -r "SECURITY_CISCO_ASA_BLOB" /etc/opt/microsoft/azuremonitoragent/config-cache/configchunks


The output should be a JSON string of the CEF or ASA DCR.

For more information about the content of these files you can refer to [Structure of a data collection rule in Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-rule-structure).

### Fix firewall rules

Based on the environment and architecture the customer will need to make the appropriate changes and fix the firewalls rules.

## Enable all CEF ASA DCR facilities

For troubleshooting purposes we strongly suggest enabling all syslog facilities in the CEF or ASA DCR.
Make sure to also select, if available, the checkbox to collect messages with no facility and no severity.

For further help visit [select facilities and severities](https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-syslog-ama?tabs=portal#select-facilities-and-severities).

### Enable all DCR options

Enable all DCR options, restart the agent and test again.

## Send CEF ASA test message while running tcpdump
It's possible to send test messages to verify the ingestion https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-syslog-ama?tabs=portal#test-the-connector. You can follow step 5 of [test the connector](https://learn.microsoft.com/en-us/azure/sentinel/connect-cef-syslog-ama?tabs=portal#test-the-connector) or executing one of these commands:

For CEF:

    echo -n "<164>CEF:0|Mock-test|MOCK|common=event-format-test|end|TRAFFIC|1|rt=$common=event-formatted-receive_time" | nc -u -w0 localhost 514

For ASA:

    echo -n "<164>%ASA-7-106010: Deny inbound TCP src inet:1.1.1.1 dst inet:2.2.2.2" | nc -u -w0 localhost 514

At the same time, if you have *tcpdump* running by executing 

    sudo tcpdump -i any port 514 or 28330 -A -vv

you should also see the message arriving into the port 514 and being forwarded to port 28330 (in the default configuration).

In the Log Analytics workspace you should see the MOCK message using this KQL query:

For CEF:

    CommonSecurityLog | where TimeGenerated > ago(1d) | where DeviceProduct == "MOCK"

For ASA:

    CommonSecurityLog | where TimeGenerated > ago(1d) | where DeviceVendor == "Cisco" | where DeviceProduct == "ASA"

## Check CEF ASA log format

Make sure the source system that is sending the logs is correctly configure for sending CEF or ASA messages in the correct format.

A document explaining the CEF standard can be found by searching in Internet for the ArcSight/Microfocus Common Event Format specification.

### Send compliant CEF ASA logs

Make sure the source system that is sending the logs is correctly configure for sending CEF or ASA messages in the correct format.

A document explaining the CEF standard can be found by searching in Internet for the ArcSight/Microfocus Common Event Format specification: [Implementing ArcSight Common Event Format (CEF) - Version 26](https://www.microfocus.com/documentation/arcsight/arcsight-smartconnectors-8.4/pdfdoc/cef-implementation-standard/cef-implementation-standard.pdf).

Below a list of common CEF issues:

**Incorrect HEADER**

CEF uses Syslog as a transport mechanism. It uses the following format that contains a Syslog prefix, a header, and an extension:

    Jan 18 11:07:53 host CEF:Version|Device Vendor|Device Product|Device Version|Device Event Class ID|Name|Severity|[Extension]

 In which:
 
1) *CEF:Version* is a mandatory header. The rest of the message is formatted using fields delimited by a pipe ("|") character. **All the fields must be present and defined**.
2) *[Extension]* is a placeholder for additional fields, but is not mandatory. Any additional fields are logged as key-value pairs.
3) *Pipe "|"* used in a value part of a CEF header field must be escaped. The pipe delimiter must not be escaped.

**Incorrect escaping of special characters**

1) If a backslash (\\) is used in the header or the extension, it must be escaped with another backslash (\\).
2) If an equal sign (=) is used in the extensions, it has to be escaped with a backslash (\\).  Equal signs in the header need no escaping.

**Missing values**

make sure the expected value is available in the log sent by the source.
Keep also in mind if a value can't be mapped to an appropriate key as per [CEF and CommonSecurityLog field mapping](https://learn.microsoft.com/en-us/azure/sentinel/cef-name-mapping) then the value will be logged to the [AdditionalExtensions column](https://learn.microsoft.com/en-us/azure/azure-monitor/reference/tables/commonsecuritylog#columns) as a key-value pair together with other fields if there are any.


## Collect logs

Before proceeding with a potential escalation case make sure to:

- Save and include in the case all the steps, screenshots, data dumps and validations done so far.
- Execute the AMA troubleshooter script: 

      sudo wget -O Sentinel_AMA_troubleshoot.py https://raw.githubusercontent.com/Azure/Azure-Sentinel/master/DataConnectors/Syslog/Sentinel_AMA_troubleshoot.py&&sudo python3 Sentinel_AMA_troubleshoot.py

  The output is usually save into */tmp/troubleshooter_output_file.log*. Make sure to include this file on the case.

- Send the test message again but with the AMA advance tracing logs enabled. To do so you can follow [Troubleshooting steps 4 and 5](https://learn.microsoft.com/en-us/azure/azure-monitor/agents/azure-monitor-agent-troubleshoot-linux-vm#issues-collecting-syslog) or execute the following steps:
  1) Append the trace flag *-T 0x2002* at the end of *MDSD_OPTIONS* in the file* /etc/default/azuremonitoragent*, and restart the agent.
  Example:
  
         export MDSD_OPTIONS="-A -c /etc/opt/microsoft/azuremonitoragent/mdsd.xml -d -r $MDSD_ROLE_PREFIX -S $MDSD_SPOOL_DIRECTORY/eh -L $MDSD_SPOOL_DIRECTORY/events -e $MDSD_LOG_DIR/mdsd.err -w $MDSD_LOG_DIR/mdsd.warn -o $MDSD_LOG_DIR/mdsd.info -T 0x2002"

   2) Reproduce the issue. To do so you can use the previous steps to send some test messages.

   3) After the issue is reproduced with the trace flag on wait a few minutes, remove the flag from the file and restart the agent.

   4) You'll find more debug information in */var/opt/microsoft/azuremonitoragent/log/mdsd.info*. Create an archive of the folder */var/opt/microsoft/azuremonitoragent/log/* and upload the file together with the case to speed up the analysis of the issue.

   5) ***Warning: Ensure to remove trace flag setting -T 0x2002 after the debugging session, since it generates many trace statements that could fill up the disk more quickly or make visually parsing the log file difficult.***
  
# Debugging the Azure Monitoring Agent

## Enable Trace flags in MDSD process

- The trace flags value is **0x1002**, you can access all available trace events by running ```/opt/microsoft/azuremonitoragent/bin/mdsd --help```

  We will be enabling both **EventIngest** and **QueryPipe** tracing flags for this investigation.

  ```
    -T --trace             Enable tracing for modules selected by flags:
                             To enable 'EventIngest' and 'Local' events use this : -T 0x2002 :
                             List of available flags:
                             ConfigLoad=1, EventIngest=2, CanonicalEvent=4,
                             Batching=8, XTable=0x10, Scheduler=0x20, Default=0x40, Credentials=0x80,
                             Daemon = 0x100, ConfigUse=0x200, SignalHandlers=0x400, EntityName=0x800,
                             QueryPipe = 0x1000, Local = 0x2000, DerivedEvent = 0x4000,
                             Extensions = 0x8000, AppInsights = 0x10000, MdsCmd = 0x20000,
                             Bond = 0x40000, SchemaCache = 0x80000, BondDetails = 0x100000,
                             IngestContents = 0x200000, JsonBlob = 0x400000, BloomFilter = 0x800000, 
                             OMSHomingService = 0x1000000, FileMonitors = 0x2000000,
                             LocalPersistenceInternal = 0x4000000, CGroups = 0x8000000, ConfigINI = 0x10000000,
                             MSI = 0x20000000, BackPressure = 0x40000000, ManagedCert = 0x80000000, CtfTrace = 0x100000000

  ```

- Open file /etc/default/azuremonitoragent in edit mode with VIM

  ```
  sudo vim /etc/default/azuremonitoragent
  ```

- Option 1: Add the trace flags as argument to the MDSD_OPTIONS:

  ```bash
  export MDSD_OPTIONS="-A -c /etc/opt/microsoft/azuremonitoragent/mdsd.xml -d -r $MDSD_ROLE_PREFIX -S $MDSD_SPOOL_DIRECTORY/eh -L $MDSD_SPOOL_DIRECTORY/events -T 0x1002"
  ```

- Option 2 [**Recommended**]: Add a new env variable called MDSD_TRACE_FLAGS:

  ```
  export MDSD_TRACE_FLAGS="0x1002"
  ```
- Restart the agent

  ```bash
  systemctl restart azuremonitoragent
  ```

- Tail the `mdsd.info` file for incoming logs:

  ```bash
  tail -f -n 100 /var/opt/microsoft/azuremonitoragent/log/mdsd.info
  ```


## Review of facility collection and Log Types

Send logs to the Syslog Collector

- To review each event in the log based on facility run the following enter the facility.severity as needed.

  `
  grep local0.info /var/opt/microsoft/azuremonitoragent/log/mdsd.info
  ` 

- To watch the incoming process as they arrive in run the following

  `
  tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.info
  `

- To view the stream of data into the files in realtime and filter by a specific keyword use the following command

  `
  sudo tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.*| grep -a "CEF"
  `

<mark>Important: Don't forget to disabled Tracing Flags when you are done with the investigation</mark>

## Test Results for ASA log ingestion
2022-01-18T22:00:14.8650520Z: virtual bool Pipe::SyslogCiscoASAPipeStage::PreProcess(std::shared_ptr<CanonicalEntity>) (.../mdsd/PipeStages.cc +604) [PipeStage] **Processing CiscoASA event '%ASA-1-105003: (Primary) Monitoring on 123'**

2022-01-18T22:00:14.8651330Z: virtual void ODSUploader::execute(const MdsTime&) (.../mdsd/ODSUploader.cc +325) **Uploading 1 SECURITY_CISCO_ASA_BLOB rows to ODS.**

2022-01-18T22:00:14.8653090Z: int ODSUploader::UploadFixedTypeLogs(const string&, const string&, const std::function<void(bool, long unsigned int, int, long unsigned int)>&, int, uint64_t) (.../mdsd/ODSUploader.cc +691) **Uploading to ODS** with request 2a350138-7390-4fa5-8e37-a09c801b65ac Host https://9fc995ee-5997-4737-b912-5fda1845b565.ods.opinsights.azure.com for datatype SECURITY_CISCO_ASA_BLOB. Payload: {"DataType":"**SECURITY_CISCO_ASA_BLOB**","IPName":"SecurityInsights","ManagementGroupId":"00000000-0000-0000-0000-000000000002","sourceHealthServiceId":"505ea527-3875-4f97-a787-422512d7db5d","type":"JsonData","DataItems":[{"Facility":"**local0**","**SeverityNumber**":"**6**","Timestamp":"2022-01-14T23:28:49.775619Z","HostIP":"127.0.0.1","Message":" (Primary) Monitoring on 123","ProcessId":"","Severity":"info","Host":"localhost","ident":"**%ASA-1-105003**"}]}. Uncompressed size: 443. Request size: 322

## Test Results for CEF log ingestion
2022-01-14T23:09:13.9087860Z: int ODSUploader::UploadFixedTypeLogs(const string&, const string&, const std::function<void(bool, long unsigned int, int, long unsigned int)>&, int, uint64_t) (.../mdsd/ODSUploader.cc +691) **Uploading to ODS** with request 6ca17f8a-f46e-42d6-8d39-7c67132605c1 Host https://9fc995ee-5997-4737-b912-5fda1845b565.ods.opinsights.azure.com for datatype SECURITY_CEF_BLOB. Payload: {"DataType":"**SECURITY_CEF_BLOB**","IPName":"SecurityInsights","ManagementGroupId":"00000000-0000-0000-0000-000000000002","sourceHealthServiceId":"505ea527-3875-4f97-a787-422512d7db5d","type":"JsonData","DataItems":[{"Facility":"**local0**","**SeverityNumber**":"**6**","Timestamp":"2022-01-14T23:08:49.731862Z","HostIP":"127.0.0.1","Message":"0|device1|PAN-OS|8.0.0|general|SYSTEM|3|rt=Nov 04 2018 07:15:46 GMTcs3Label=Virtual","ProcessId":"","Severity":"info","Host":"localhost","ident":"**CEF**"}]}. Uncompressed size: 482. Request size: 350

<mark>Important: Don't forget to disabled Tracing Flags when you are done with the investigation</mark>

## Test commands to generate logs

CEF

```
echo -n "<164>CEF:0|Mock-test|MOCK|common=event-format-test|end|TRAFFIC|1|rt=$common=event-formatted-receive_time" | nc -u -w0 localhost 514
```
```
echo "<134>$(date +"%b %d %T") localhost CEF: 0|device1|PAN-OS|8.0.0|general|SYSTEM|3|rt=Nov 04 2018 07:15:46 GMTcs3Label=Virtual" | nc -v -u -w 0 localhost 514
```

ASA

For ASA logs it works in a similar way to CEF. Keep in mind there is a dedicated connector and a dedicated type of DCR.

```
echo "<134>$(date +"%b %d %T") localhost : %ASA-1-105003: (Primary) Monitoring on 123" | nc -v -u -w 0 localhost 514
```

```
echo "<134>$(date +"%b %d %T") HOSTNAMEHERE : %ASA-6-302013: Built inbound TCP connection 6529754 for Outside:10.10.10.10/53674 (10.10.10.10/53674)(LOCAL\tdgreen) to Inside:10.10.10.10/2910 (10.10.10.10/2910) (tdgreen)"| nc -v localhost 514
```

# Logs dump

Using Rsyslog we can also save the logs that are going through for further checks offline.

To do so we can create the file /etc/rsyslog.d/11-test.conf with the following content:


```
#if ( $msg contains "test" ) then
#  *.* action(type="omfwd" target="127.0.0.1" port="1337" protocol="udp"
#             action.resumeRetryCount="100"
#             template="AMA_RSYSLOG_TraditionalForwardFormat")

if ( $msg contains "test" ) then
  *.* action(type="omfile" File="/tmp/tmp-ama-template.log"
             action.resumeRetryCount="100"
             template="AMA_RSYSLOG_TraditionalForwardFormat")

if ( $msg contains "test" ) then
  *.* action(type="omfile" File="/tmp/tmp-default-format.log"
             action.resumeRetryCount="100"
             template="RSYSLOG_FileFormat")
```

And then restart the rsyslog service.

You are free to change the `test` keyword in order to filter only the logs you need.

This config file will be loaded after the AMA config and will dump the logs in `/tmp/tmp-ama-template.log` with the AMA template in `/tmp/tmp-default-format.log` with the default rsyslog template.

The two files can be looked at in real-time by using:
- `tail -f tmp-ama-template.log`
- `tail -f /tmp/tmp-default-format.log`

## Network forwarding

You can also activate a network destination, if you would like to do so, by removing the `#` from the first few lines of `11-test.conf`.

To listen and dump the traffic in this case you will need to use `while true; do nc -ulp 1337; done`.

# Example of DCR

Do not striclty rely on this template but instead try to create a new one from the connector and review the template directly from the Azure Portal.

For details about the DCR JSON structure read [Structure of a data collection rule in Azure Monitor](https://learn.microsoft.com/en-us/azure/azure-monitor/essentials/data-collection-rule-structure)

```
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "dataCollectionRules_CEF_Rule_name": {
            "defaultValue": "CEF_Rule",
            "type": "String"
        },
        "workspaces_SecureScoreData_ropcp3iyqhmwm_externalid": {
            "defaultValue": "/subscriptions/0a177a01-8b95-42cd-963a-a363c0e1e52b/resourceGroups/LabNSG/providers/microsoft.operationalinsights/workspaces/SecureScoreData-ropcp3iyqhmwm",
            "type": "String"
        }
    },
    "variables": {},
    "resources": [
        {
            "type": "Microsoft.Insights/dataCollectionRules",
            "apiVersion": "2021-04-01",
            "name": "[parameters('dataCollectionRules_CEF_Rule_name')]",
            "location": "centralus",
            "kind": "Linux",
            "properties": {
                "dataSources": {
                    "syslog": [
                        {
                            "streams": [
                                "Microsoft-CommonSecurityLog",
                                "Microsoft-CiscoAsa"
                            ],
                            "facilityNames": [
                                "local0"
                            ],
                            "logLevels": [
                                "Info"
                            ],
                            "name": "sysLogsDataSource-1688419672"
                        }
                    ]
                },
                "destinations": {
                    "logAnalytics": [
                        {
                            "workspaceResourceId": "[parameters('workspaces_SecureScoreData_ropcp3iyqhmwm_externalid')]",
                            "name": "la--1908599500"
                        }
                    ]
                },
                "dataFlows": [
                    {
                        "streams": [
                            "Microsoft-CommonSecurityLog",
                            "Microsoft-CiscoAsa"
                        ],
                        "destinations": [
                            "la--1908599500"
                        ]
                    }
                ]
            }
        }
    ]
}
```

# Reference Materials
Syslog Priorities, Facilities, and Log Severities
https://success.trendmicro.com/solution/TP000086250-What-are-Syslog-Facilities-and-Levels

![image.png](/.attachments/CEF_SevFacilities.png)
---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
