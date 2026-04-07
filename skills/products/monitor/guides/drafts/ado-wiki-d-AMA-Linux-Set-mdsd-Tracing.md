---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Set mdsd tracing options"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Set%20mdsd%20tracing%20options"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
Mdsd is the main process that runs Azure Monitor Agent for Linux. By default, mdsd logs info, warn, and error. In some scenarios, we need additional logging. Mdsd has the capacity to enable trace logging. Because trace logs can be so verbose, trace flags are utilized to specify which "area" of the mdsd code we're interested in observing trace logs for. All trace logs will appear in the mdsd.info log file.

# Preventing disk space exhaustion
Application tracing can consume a large amount of disk space. We can bound this to a specific limit (e.g. 2GB in the below example) using logrotate:

```
# Set new limit
sudo sed -i '/mdsd.info/,/}/ {s/size 10M/size 2G/; /daily/d}' /etc/logrotate.d/azuremonitoragent

# Revert previous limit (uncomment the sed line as needed)
# sudo sed -i '/mdsd.info/,/}/ s/size 2G/daily\n    size 10M/' /etc/logrotate.d/azuremonitoragent
```

By default, logrotate only runs once a day. We'll need a cronjob to run it more frequently (e.g. 30 minutes in the below example).

```
# Set logrotate schedule
(crontab -l 2>/dev/null; echo "*/30 * * * * /usr/sbin/logrotate /etc/logrotate.d/azuremonitoragent") | crontab -

# Remove logrotate schedule (uncomment the crontab line as needed)
# Crontab is user specific. To remove this later, you need to run the command as the same user.
# crontab -l | grep -v "azuremonitoragent" | crontab -
```
<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:**
If you find that the manual cron job isn't triggering as expected, check if **SELinux** is throwing any denials in `/var/log/audit/audit.log`. Occasionally, custom cron jobs calling `logrotate` on specific paths can be blocked if the security context isn't just right.
</div>

# Enable mdsd tracing
## Interactive method
In this example, the trace flag of 0x2001 (ConfigLoad + Local) will be used, see the scenarios below for a common trace flags used in particular scenarios.

- Set mdsd tracing option

<div style="border=0px;margin-bottom:20px;padding:10px;min-width:500px;width:75%;border-radius:10px;color:black;background-color:#d7eaf8">

**Note:**
There are many articles and videos that explain how to use [vi](https://www.man7.org/linux/man-pages/man1/vi.1p.html). If you are not familiar, you should familiarize yourself in a lab environment.
</div>

```
vi /etc/default/azuremonitoragent
```

![image.png](/.attachments/image-3fe98b68-f19c-4cd8-beab-0b971a4a619c.png)

Add the ```-T 0x2001``` parameter and trace flag to the end of the **MDSD_OPTIONS** line (inside of the double quotes) and save the changes.

![image.png](/.attachments/image-5bdd4c93-e234-4e73-93eb-59ed1bf03c91.png)

- Restart AMA service for changes to take effect

```
systemctl restart azuremonitoragent
```

- Verify trace logging

```tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.info```

- Reproduce issue

Reproduce the issue you are trying to capture logs for.

- Disable mdsd tracing option

```
vi /etc/default/azuremonitoragent
```

Remove the -T parameter and tracing flags.

- Restart AMA service for changes to take effect

```
systemctl restart azuremonitoragent
```

## Scripted method
- Use the following script to enable tracing

```
# Make a copy of current config
yes | cp -rf /etc/default/azuremonitoragent /tmp/azuremonitoragent

# Output current config to console
cat /etc/default/azuremonitoragent

sed -i 's|^export MDSD_OPTIONS=.*|export MDSD_OPTIONS="-A -R -c /etc/opt/microsoft/azuremonitoragent/mdsd.xml -d -r $MDSD_ROLE_PREFIX -S $MDSD_SPOOL_DIRECTORY/eh -L $MDSD_SPOOL_DIRECTORY/events -T 0x2"|' /etc/default/azuremonitoragent

# Output current config to console
cat /etc/default/azuremonitoragent

# Restart AMA for changes to take effect
systemctl restart azuremonitoragent
```

- Use the following command to verify that trace level events are being written to the mdsd.info log file

```
tail -f /var/opt/microsoft/azuremonitoragent/log/mdsd.info
```

- Use the following command to clean up

```
yes | cp -rf /tmp/azuremonitoragent /etc/default/azuremonitoragent
systemctl restart azuremonitoragent
rm -rf /tmp/azuremonitoragent
```

# Trace flags
Trace flags are defined in [this](https://msazure.visualstudio.com/One/_git/Compute-Runtime-Tux?path=/mdsdlog/Trace.hh&version=GBdevelop&line=51&lineEnd=64&lineStartColumn=1&lineEndColumn=3&lineStyle=plain&_a=contents) class.

```
enum class Trace : uint64_t
{
	None=0, ConfigLoad=1, EventIngest=2, CanonicalEvent=4,
	Batching=8, XTable=0x10, Scheduler=0x20, Default=0x40, Credentials=0x80,
	Daemon = 0x100, ConfigUse=0x200, SignalHandlers=0x400, EntityName=0x800,
	QueryPipe = 0x1000, Local = 0x2000, DerivedEvent = 0x4000,
	Extensions = 0x8000, AppInsights = 0x10000, MdsCmd = 0x20000,
	Bond = 0x40000, SchemaCache = 0x80000, BondDetails = 0x100000,
	IngestContents = 0x200000, JsonBlob = 0x400000, BloomFilter = 0x800000, 
	OMSHomingService = 0x1000000, FileMonitors = 0x2000000,
	LocalPersistenceInternal = 0x4000000, CGroups = 0x8000000, MdsdMgr = 0x10000000,
	MSI = 0x20000000, BackPressure = 0x40000000, ManagedCert = 0x80000000, CtfTrace = 0x100000000,
	ForwardToAMACoreAgent = 0x200000000, GigLAConnector = 0x400000000, MonMon = 0x800000000
}
```
# Scenario: Configuration & IMDS
In most configuration and/or IMDS scenarios, we are interested in the Event Ingest trace flag (-T 0x1).

Once we enable this trace flag, we should see messages like this in the mdsd.info log in a HEALTHY scenario - if your scenario is NOT healthy, you will likely see errors here instead:

```
2025-03-11T16:20:29.5436130Z: Lock '/run/azuremonitoragent/default.lock'  was taken successfully.
2025-03-11T16:20:29.5584540Z: ImdsMetadataPtr MdsdUtil::GetInstanceMetadata(unsigned int) (.../mdsdutil/Utility.cc +2071) Found region "westus2", environment "AzurePublicCloud", subscriptionId "<SUBID>", resourceId "/subscriptions/<SUBID>/resourceGroups/rg-azmon-dev-westus2-001/providers/Microsoft.Compute/virtualMachines/vm-rhel87ama-dev-westus2-001"
2025-03-11T16:20:29.5584770Z: Detected cloud region "westus2" via IMDS
2025-03-11T16:20:29.5585050Z: Detected cloud environment "azurepubliccloud" via IMDS; the domain ".com" will be used
```

# Scenario: Syslog
In most syslog scenarios, we are interested in the Event Ingest trace flag (-T 0x2). 

![image.png](/.attachments/image-eeaf9521-2f07-4956-9021-4edc72c31c81.png)

Once we enable this trace flag, we should see messages like this in the mdsd.info log:

```
2025-01-09T20:20:43.8745910Z: void ProtocolHandlerSyslog::Run() (.../mdsd/ProtocolHandlerSyslog.cc +1077) Parsed Syslog Event: pri=189 facility=local7 severity=notice time_mds=2025-01-09T20:20:43.8745360Z time_tm=2025-1-9 20:20:43 hostname='10.0.1.31' procname='1' procid='' msgid='' sd='' msg='2025-01-09T20:20:43.875205+00:00 ama-rhel10 labadmin - - [timeQuality tzKnown="1" isSynced="1" syncAccuracy="202234"] Test syslog message from ama-rhel10 Thu Jan 9 20:20:43 UTC 2025'
```

# Scenario: Text Logs
In this scenario, we need to enable mdsd tracing option -T 0x400000002 for GigLAConnector(0x400000000) and EventIngest(0x2)

![image.png](/.attachments/image-eff24821-06e7-412d-a9cf-7ac08b1b66ef.png)

# Scenario: JSON Logs
In this scenario, we need to enable mdsd tracing option -T 0x400000002 for GigLAConnector(0x400000000) and EventIngest(0x2)

![image.png](/.attachments/image-eff24821-06e7-412d-a9cf-7ac08b1b66ef.png)