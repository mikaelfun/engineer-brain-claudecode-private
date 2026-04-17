---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/Azure Monitor Agent (AMA) for Linux/How-To/How To: Capture a Linux Network Trace for the Azure Monitor Agent"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FAzure%20Monitor%20Agent%20(AMA)%20for%20Linux%2FHow-To%2FHow%20To%3A%20Capture%20a%20Linux%20Network%20Trace%20for%20the%20Azure%20Monitor%20Agent"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How To: Capture a Linux Network Trace for the Azure Monitor Agent

## Scenario
When troubleshooting AMA connectivity issues, capture a network trace correlated with agent log events. Requires multiple SSH sessions.

Applies To: Azure Monitor Agent for Linux - All versions.

## Install tcpdump (if needed)
- RHEL/CentOS: `yum install tcpdump`
- Ubuntu: `apt-get install tcpdump`
- SUSE: `zypper -n install tcpdump`
- Debian: `apt-get install tcpdump`

## Taking the Trace

### Step 1: Start tcpdump (SSH session 1)
```bash
sudo tcpdump -w '/tmp/capture.pcap' &
```
Note the process ID for stopping later.

> If no packets captured, specify the interface:
> ```bash
> sudo ifconfig -s  # Find interface names (e.g., eth0)
> sudo tcpdump -i eth0 -w '/tmp/capture.pcap' &
> ```

### Step 2: Restart AMA (SSH session 2)
Restart the Azure Monitor Agent to initiate agent activity and re-establish connections.

Reference: [How to restart the Azure Monitor Agent - Linux](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/766334/How-to-restart-the-Azure-Monitor-Agent-Linux)

### Step 3: Stop the Trace
Wait 4-5 minutes (or until connection errors appear in `mdsd.err` / `mdsd.info`), then:
```bash
sudo kill {process_id}
```

### Step 4: Collect Output
- Retrieve `/tmp/capture.pcap`
- Also collect a fresh set of AMA troubleshooter logs for correlation
