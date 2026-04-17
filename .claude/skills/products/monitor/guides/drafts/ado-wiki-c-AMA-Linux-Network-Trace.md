---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/AMA Linux/How-To/AMA Linux: HT: Network Trace"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Azure%20Monitor%20Agent%20%28AMA%29%20-%20NEW%20STRUCTURE/AMA%20Linux/How-To/AMA%20Linux%3A%20HT%3A%20Network%20Trace"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Getting started
- Elevate to root in bash
- Paste in one of the following scripts

# Scenario: AMA
Verified on: RHEL 8.7, Ubuntu 22.04, SUSE 15 SP5, Debian 12, CentOS 8.2

```
# Last modified: 2025-06-18
# Get current date-time
amaDate=$(date +"%Y%m%d_%H%M%S")

# Create directory to store netTrace
mkdir -p /tmp/ama_netTrace
cd /tmp/ama_netTrace

# Start a network trace
nohup tcpdump -s 0 -i any -w /tmp/ama_netTrace/AMA_NetworkCapture_$amaDate.pcap &

# Flush DNS
if command -v systemd-resolve > /dev/null; then
  systemd-resolve --flush-caches
elif command -v resolvectl > /dev/null; then
  resolvectl flush-caches
elif command -v service > /dev/null; then
  if service network-manager status > /dev/null; then
    service network-manager restart
  elif service dnsmasq status > /dev/null; then
    service dnsmasq restart
  elif service named status > /dev/null; then
    service named restart
  fi
fi

# Restart the Azure Monitor Agent service
systemctl restart azuremonitoragent

# Wait for 5 minutes
sleep 300

# Stop network trace
kill $(pidof tcpdump)
```

You may see some output in the terminal that can be ignored, for instance:

```
# This is the standard output
nohup: ignoring input and appending output to 'nohup.out'
```

```
# This output is expected, since we had to loop through different DNS services
nohup: ignoring input and appending output to 'nohup.out'
Redirecting to /bin/systemctl status network-manager.service
Unit network-manager.service could not be found.
Redirecting to /bin/systemctl status dnsmasq.service
Unit dnsmasq.service could not be found.
Redirecting to /bin/systemctl status named.service
Unit named.service could not be found.
```

```
# This output is expected, since this system does not cache DNS
nohup: appending output to 'nohup.out'
Failed to flush caches: Unit dbus-org.freedesktop.resolve1.service not found.
```

# Scenario: Syslog
After you've been able to reproduce the problematic syslog message, stop the trace using CTRL + C and then collect the output trace file.

```
# Get current date-time
amaDate=$(date +"%Y%m%d_%H%M%S")

# Create directory to store netTrace
mkdir -p /tmp/ama_netTrace
cd /tmp/ama_netTrace

# Start a network trace (press CTRL + C when done reproducing)
tcpdump -s 0 -i any -w /tmp/ama_netTrace/AMA_NetworkCapture-Syslog_$amaDate.pcap
```

Alternatively, you can review this interactively:
`tcpdump -A -i any port 514 -vv`
`tcpdump -A -i any port 28330 -vv`


# Scenario: Text Logs
After you've been able to observe a change in the problematic text file, stop the trace using CTRL + C and then collect the output trace file.

```
# Get current date-time
amaDate=$(date +"%Y%m%d_%H%M%S")

# Create directory to store netTrace
mkdir -p /tmp/ama_netTrace
cd /tmp/ama_netTrace

# Start a network trace (press CTRL + C when done reproducing)
tcpdump -s 0 -i any -w /tmp/ama_netTrace/AMA_NetworkCapture-Syslog_$amaDate.pcap
```

Alternatively, you can review this interactively:

```tcpdump -A -i any port 28230 -vv```

Here is an example of what fluentbit will send to mdsd:

![image.png](/.attachments/image-7cef6f35-7a74-4cbd-a4e0-b76d4e068a2b.png)

```tcpdump -A -i any port 13005 -vv```

Here is an example of what mdsd will send to ama coreagent:

![image.png](/.attachments/image-42ccc298-7f34-43ef-8fd9-b018d9d77356.png)

# Scenario: Wait for an event
In this scenario, we'll start a network trace and it will run until the condition we define occurs, which is a defined string written into a defined log file. Then it will collect an additional 300 seconds and stop the trace.

Be sure to define the **LOG_FILE** and **TRIGGER** values for your scenario before sending to the customer. For instance, in the example below, we're running a trace until we see a "Failed to upload to ODS" line written to the "/var/opt/microsoft/azuremonitoragent/log/mdsd.err" log file. 

```
nohup bash -c '
    LOG_FILE="/var/opt/microsoft/azuremonitoragent/log/mdsd.err"
    TRIGGER="Failed to upload to ODS"
    amaDate=$(date +"%Y%m%d_%H%M%S")
    OUTDIR="/tmp/ama_netTrace-trigger_$amaDate"

    echo "[$(date)] Creating $OUTDIR"
    mkdir -p "$OUTDIR" && cd "$OUTDIR"
    sudo chown tcpdump:tcpdump "$OUTDIR"
    sudo chmod 755 "$OUTDIR"

    echo "[$(date)] Starting tcpdump ..."
    nohup tcpdump -s 0 -C 500 -W 3 -i any -w "AMA_NetworkCapture_$amaDate.pcap" < /dev/null &
    TCPDUMP_PID=$!
    disown

    echo "[$(date)] Monitoring $LOG_FILE for: \"$TRIGGER\""

    # Heartbeat + trigger monitoring in the same loop
        echo "[$(date)] Monitoring $LOG_FILE for: \"$TRIGGER\" (only new lines)"

    while true; do
        # Heartbeat
        TCPDUMP_CUR=$(pgrep -u tcpdump -x tcpdump | head -1)
        echo "[$(date +"%Y-%m-%d %H:%M:%S34")] HEARTBEAT | tcpdump (pid: ${TCPDUMP_CUR:-"NOT FOUND"}) still running"

        # Non-blocking check for the trigger in the next ~55 seconds
        if tail -F -n 0 "$LOG_FILE" 2>/dev/null | timeout 55 grep --line-buffered -m1 -q "$TRIGGER"; then
            echo "[$(date)] TRIGGER FOUND! Capturing 300 more seconds of traffic..."
            sleep 300
            kill $TCPDUMP_PID 2>/dev/null || pkill -9 -u tcpdump tcpdump
            break
        fi

        # If timeout reached without trigger  loop again (heartbeat every 60s)
    done

    wait $TCPDUMP_PID 2>/dev/null || true
    echo "[$(date)] Done. Capture files are in $OUTDIR"
' > "/tmp/ama_netTrace_$(date +%Y%m%d_%H%M%S).log" 2>&1 < /dev/null &
```

The following command will show the log file for this process:
```
cat "$(ls -t /tmp/ama_netTrace_*.log | head -n1)"
```

Here's an example of what that looks like:
![image.png](/.attachments/image-c2f2a959-20dc-4af3-bf8d-42bb6ec490d2.png)

Collect the following files:
```/tmp/ama_netTrace_*.log```
```/tmp/ama_netTrace-trigger_*/*.pcap*```

TO DO: compress these files to a .tgz and then clean up the disk and output the file to send to Microsoft.
TO DO: run the AMA troubleshooter after trace ends
TO DO: enable the ability to add trace flags before and remove trace flags after troubleshooter.

