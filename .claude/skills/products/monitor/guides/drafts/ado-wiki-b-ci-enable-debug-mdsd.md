---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Insights, Workbooks and Managed Products/Container Insights/How-To/Enable Debug Mode for MDSD"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Insights%2C%20Workbooks%20and%20Managed%20Products/Container%20Insights/How-To/Enable%20Debug%20Mode%20for%20MDSD"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Enable Debug Mode for MDSD

## Overview
MDSD is the Container Insights agent component that collects and sends data to Log Analytics - the "last stop" before data leaves the cluster. Enabling debug mode reveals issues with this component.

## Steps

1. **Connect to the cluster** via Azure Cloud Shell or local CLI.

2. **Exec into an ama-logs pod**:
   ```bash
   kubectl get pods -A | grep ama-logs
   kubectl exec -it ama-logs-xxxxx -c ama-logs -n kube-system -- /bin/bash
   ```

3. **Get the current MDSD process info**:
   ```bash
   ps aux | grep [m]dsd
   ```
   Note the PID (first number) and copy the full command (last column). Default command:
   ```
   mdsd -a -A -r /var/run/mdsd-ci/default -e /var/opt/microsoft/linuxmonagent/log/mdsd.err -w /var/opt/microsoft/linuxmonagent/log/mdsd.warn -o /var/opt/microsoft/linuxmonagent/log/mdsd.info -q /var/opt/microsoft/linuxmonagent/log/mdsd.qos
   ```

4. **Kill the MDSD process**: `kill -9 PID`

5. **Enable Debug Mode** (very verbose, only leave on while collecting data):
   ```bash
   mdsd -a -A -r /var/run/mdsd-ci/default -e /var/opt/microsoft/linuxmonagent/log/mdsd.err -w /var/opt/microsoft/linuxmonagent/log/mdsd.warn -o /var/opt/microsoft/linuxmonagent/log/mdsd.info -q /var/opt/microsoft/linuxmonagent/log/mdsd.qos -T 0xFFFF &
   ```

6. **Disable Debug Mode**: Kill the MDSD process again (step 4) then restart with the original command (step 3) with `&` at the end.

7. **Collect debug data**: Either run the [Log Collection Script](https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/614028/How-to-collect-logs-for-Container-Insights) or have the user provide the MDSD logs from `/var/opt/microsoft/linuxmonagent/log/`.
