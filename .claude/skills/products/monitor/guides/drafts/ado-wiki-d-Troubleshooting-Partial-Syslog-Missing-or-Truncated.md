---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/Troubleshooting Guides/Troubleshooting Partial Syslog is missing or truncated"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAgents%2FOMS%20Agent%20for%20Linux%20(omsagent)%2FTroubleshooting%20Guides%2FTroubleshooting%20Partial%20Syslog%20is%20missing%20or%20truncated"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario

Customer report one or more following issues:
- Some syslog are missing in workspace while others report to workspace well;
- Some syslog are truncated in workspace;

# Troubleshooting

1. Check and confirm the relevant facilities are added to syslog configuration:
   - The configuration file for rsyslog is located at /etc/rsyslog.d/95-omsagent.conf
   - The configuration file for syslog-ng is location at /etc/syslog-ng/syslog-ng.conf
   - If the configuration is missed, follow the [doc](https://docs.microsoft.com/azure/azure-monitor/agents/data-sources-syslog#configure-syslog-on-linux-agent) to add required facilities and restart syslog daemon.
   - If customer configured syslog forwarder, follow [this wiki](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki/605547/How-to-deploy-log-forwarder-to-ingest-syslog-to-log-analytics-workspace) to check facilities configuration.

2. Enable debug mode in /etc/opt/microsoft/omsagent/conf/omsagent.conf, check and confirm if there is any log dropped during ingestion, see known issue of syslog drop during ingestion for details.

3. Captured network traffic with tcpdump command:
   - tcpdump -A -i lo port 25224 -vv

   where **lo** is default network adapter and **25224** is the default syslog listening port (users can change it in /etc/opt/microsoft/omsagent/conf/omsagent.d/syslog.conf)

4. Check output in step 3 and confirm if missed/truncated syslog can be found locally, if syslog isn't streaming via tcpdump, you need check syslog configuration again as they are not sending out successfully yet.

5. Modify the syslog.conf (/etc/opt/microsoft/omsagent/conf/omsagent.d/syslog.conf) to dump a local copy of syslog output, then check whether the missing syslog messages are getting to the output stage in the agent, below are detailed steps:

   5.1. Add below part to the syslog.conf by replacing <workspace id>, at the bottom of syslog.conf.
   - Note: this will store all syslog in local file (/tmp/syslog_check.log.*) for further investigation

   5.2. Restart agent: /opt/microsoft/omsagent/bin/service_control restart.

   5.3. After restarted the agent, wait for a while to check new syslog ingested, then check /tmp/syslog_check.log.* to look for the logs that are missing.

syslog.conf:
```
<match oms.syslog.**>
  type copy
  <store>
    type file
    path /tmp/syslog_check.log
  </store>
  <store>
    type out_oms
    log_level info
    num_threads 5
    run_in_background false

    omsadmin_conf_path /etc/opt/microsoft/omsagent/<workspace id>/conf/omsadmin.conf
    cert_path /etc/opt/microsoft/omsagent/<workspace id>/certs/oms.crt
    key_path /etc/opt/microsoft/omsagent/<workspace id>/certs/oms.key

    buffer_chunk_limit 15m
    buffer_type file
    buffer_path /var/opt/microsoft/omsagent/<workspace id>/state/out_oms_common_syslog*.buffer

    buffer_queue_limit 10
    buffer_queue_full_action drop_oldest_chunk
    flush_interval 20s
    retry_limit 6
    retry_wait 30s
    max_retry_wait 30m
  </store>
</match>
```

6. Check syslog_check.log.* in step 5, if you cannot find the missing syslog messages in the logs and all configurations are good as previous check, you can then escalate the issue to linux agent PG team; if you can find the missing syslog messages in the logs or they are truncated, then move to next step to check regex parser.
   - For example, below syslog is truncated due to regex parser:
   - RAW data:

   <182>Jun  6 08:57:04 qingteng-v-szzb qtAlert[450] datatype="web_command_win" ...

   - Truncated data in the output file (syslog_check.log.*): it skipped everything before https://10.0.51.132

7. To verify regex parser, you can use [regex tester tool](https://rubular.com/r/LaOapuiRIbiiLe), our default regex parser can be found from [github](https://github.com/fluent/fluentd/blob/d5e0a61e06a7cfeb7266b018e77ac74f85c0c06d/lib/fluent/parser.rb#L542). If it's indeed regex parser issue, you can manually create regex that matches customer's raw data and add to /etc/opt/omsagent/conf/omsagent.d/syslog.conf:
for example, modify syslog.conf to allow for no colon after process+pid:
```
<source>
  type syslog
  port 25224
  bind 127.0.0.1
  protocol_type udp
  format /^\<(?<pri>[0-9]+)\>(?<time>[^ ]* {1,2}[^ ]* [^ ]*) (?<host>[^ ]*) (?<ident>[^ :\[]*)(?:\[(?<pid>[0-9]+)\])?(?:[^\: ]*\:)? *(?<message>.*)$/
  tag oms.syslog
</source>

<filter oms.syslog.**>
  type filter_syslog
</filter>
```

8. If you have difficulty to modify regex, kindly reach to SME or PG for help, below are some common suggestions that customer can work around this:
   - ensure no syslogs have colon character in them
   - ensure that upstream emitter will place a colon after the process+pid

# Reference

https://portal.microsofticm.com/imp/v3/incidents/details/311467123/home
