---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Known Issues/Syslogs are dropped during ingestion"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FOMS%20Agent%20for%20Linux%20%28omsagent%29%2FKnown%20Issues%2FSyslogs%20are%20dropped%20during%20ingestion"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Symptom

Syslogs were being dropped by the ingestion pipeline after being sent into Log Analytics by the OMS agent.

Roughly 10% of Syslogs were getting dropped. There are no errors or warnings on the agent during this issue.
There is no pattern to what Syslogs are dropped, however we can confirm that in each case, the missing Syslogs are located in /var/log/messages, so they should have been ingested.

# Cause

There was a bug in the ingestion pipeline that was causing a percentage of Syslogs to be discarded during ingestion.
To prove this, we needed a way to manually test/confirm that all syslogs parsed by the agent are arriving in the workspace with no loss.

# Steps to test for dropped Syslogs

**High Level Steps:**
1. Generate heavy load of Syslogs on the agent using a load generator.
2. Measure the Syslogs generated at the agent, and at the workspace during the same time.
3. If these counts match, then there is no loss. If there are more logs at the agent then workspace, then we have detected drops.

**Actual Steps:**

Download the following scripts onto the machine:

**OMS Agent Log Counter:**
```bash
wget https://gist.githubusercontent.com/abenbachir/ac8c0982ff34666a1b76574f8a188156/raw/d9103d315729f63076410b5921589b84b48248b9/omsagent-compute-metrics-from-log.sh
```

**Load testing script:**
```bash
wget https://raw.githubusercontent.com/microsoft/OMS-Agent-for-Linux/master/test/perf/omsagent-loadtest.py
```

1. **Edit OMS agent config** to set logging level to "debug" in `/etc/opt/microsoft/omsagent/conf/omsagent.conf`. Restart agent: `sudo /opt/microsoft/omsagent/bin/service_control restart`

2. **Stop the Syslog Daemon**: `service rsyslog stop`

3. **Open workspace and detect gap** in Syslogs:
   ```kusto
   Syslogs | where TimeGenerated > datetime("2020-MM-dd hh:mm:ss") | summarize count()
   ```

4. **Start Syslog Daemon**: `service rsyslog start`

5. **Start load generator**:
   ```bash
   python omsagent-loadtest.py --run-time 360 --eps 5000 --no-profiling --plugins syslog --syslog-protocol udp &
   ```

6. **Run log detection script periodically**: `sh ./omsagent-compute-metrics-from-log.sh`

7. **Refresh results over time** — counts from script and workspace should match.

8. **Confirm totals match** after load generator completes.

**Results:** If numbers grow apart, drops detected in ingestion. If they match, no drops.

# Clean Up
1. Stop the load generator.
2. Revert omsagent.conf logging back to "info".
3. Restart OMS agent.
