---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Archive/Data Ingestion - Connectors/Deprecated/Syslog-Custom-API-Connector-Cisco-Stealthwatch"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FArchive%2FData%20Ingestion%20-%20Connectors%2FDeprecated%2FSyslog-Custom-API-Connector-Cisco-Stealthwatch"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

#Custom Log format sent to custom table in Log analytics (No log format filter)
Created a conf file StealthWatchCloud.conf in the following directory
/etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsagent.d

Create the custom listener

`
cd /etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsagent.d
`

`vi StealthWatchCloud.conf
`

##Contents of StealthWatchCloud.conf if you have another custom API Log collector make sure to define each port differently

```
<source>
  type tcp
  format none
  port 22034
  bind 127.0.0.1
  delimiter "\n"
  tag oms.api.StealthWatchCloud
</source>

<match oms.api.StealthWatchCloud>
  type out_oms_api
  log_level info
  num_threads 5
  omsadmin_conf_path /etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsadmin.conf
  cert_path /etc/opt/microsoft/omsagent/<WorkspaceId>/certs/oms.crt
  key_path /etc/opt/microsoft/omsagent/<WorkspaceId>/certs/oms.key
  buffer_chunk_limit 10m
  buffer_type file
  buffer_path /var/opt/microsoft/omsagent/<WorkspaceId>/state/out_oms_api_StealthWatchCloud*.buffer
  buffer_queue_limit 10
  buffer_queue_full_action drop_oldest_chunk
  flush_interval 30s
  retry_limit 10
  retry_wait 30s
  max_retry_wait 9m
</match>
```

Need to change ownership of the file

`
chown omsagent:omiusers StealthWatchCloud.conf
`

**Restart agent**
`
sudo /opt/microsoft/omsagent/bin/service_control restart
`

- It creates the StealthWatchCloud_cl custom log and populates the log data (20 minutes)




#modify /etc/rsyslog.conf file

## Create a filter to pull something that is unique for the log source in this case "OBSRVBL"
you can have multiple conditions

edit /etc/rsyslog.conf and add the template

```
$template StealthWatchCloud,"%timestamp% %hostname% %msg%\n"
```


You can create a custom conf file in /etc/rsyslog.d for example 10-StealthWatchCloud.conf

If you put the proper filters you can filter out the logs from the syslog ingestion

you can do multiple conditions
if $rawmsg contains "OBSRVBL" then @@127.0.0.1:22034;StealthWatchCloud

- Example
```
if $rawmsg contains "FTD" then @@127.0.0.1:22034;StealthWatchCloud 
& stop

```


**Restart rsyslog**

`
systemctl restart rsyslog
`


## Test Logs change target IP

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

