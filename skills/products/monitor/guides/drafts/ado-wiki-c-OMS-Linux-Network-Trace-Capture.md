---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How To: Capture a Linux Network Trace for the OMS agent for Linux"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FOMS%20Agent%20for%20Linux%20(omsagent)%2FHow-To%2FHow%20To%3A%20Capture%20a%20Linux%20Network%20Trace%20for%20the%20OMS%20agent%20for%20Linux"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To: Capture a Linux Network Trace for the OMS Agent for Linux

Applies To: OMS Agent for Linux - All versions

## Scenario
When troubleshooting agent connectivity issues, a network trace helps identify the problem. Correlating trace activity with log file events provides the most diagnostic value. This process requires multiple SSH sessions.

## Prerequisites: Install tcpdump
- RHEL/CentOS: `yum install tcpdump`
- Ubuntu: `apt-get install tcpdump`
- SUSE: `zypper -n install tcpdump`
- Debian: `apt-get install tcpdump`

## Capture Steps

### 1. Start the Trace (SSH Session 1)
```bash
sudo tcpdump -w '/tmp/capture.pcap' &
```
**Note:** Record the process number displayed - needed to stop the trace later.

### 2. Restart OMS Agent (SSH Session 2)
```bash
sudo /opt/microsoft/omsagent/bin/service_control restart
```
This re-establishes connections to endpoints. The restart command does not return status output.

### 3. Stop the Trace
Wait 4-5 minutes after restart, or wait until connection errors appear in `omsconfig.log` or `omsagent.log`.
```bash
sudo kill <process_id>
```
Verify the packet capture stops in the initial SSH session.

### 4. Collect Artifacts
- Network trace file from `/tmp/capture.pcap`
- Fresh troubleshooting logs from the OMS agent troubleshooter

## Troubleshooting: No Packets Captured
If no packets are captured, specify the network interface explicitly:

1. Find interface names:
```bash
sudo ifconfig -s
```
Common interfaces: eth0, eth1 (ignore `lo` loopback)

2. Restart trace with interface specified:
```bash
sudo tcpdump -i eth0 -w '/tmp/capture.pcap' &
```
Then repeat the full capture process from Step 2.
