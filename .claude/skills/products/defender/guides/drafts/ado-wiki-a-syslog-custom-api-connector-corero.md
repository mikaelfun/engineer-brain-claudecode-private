---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Archive/Data Ingestion - Connectors/Deprecated/Syslog Custom API Connector - Corero Security Watch"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FArchive%2FData%20Ingestion%20-%20Connectors%2FDeprecated%2FSyslog%20Custom%20API%20Connector%20-%20Corero%20Security%20Watch"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

#Custom Log format sent to custom table in Log analytics (No log format filter)
Created a conf file corero.conf in the following directory
/etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsagent.d

Create the custom listener

`
cd /etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsagent.d
`

`vi corero.conf
`

##Contents of corero.conf if you have another custom API Log collector make sure to define each port differently

```
<source>
  type tcp
  format none
  port 22035
  bind 127.0.0.1
  delimiter "\n"
  tag oms.api.corero
</source>

<match oms.api.corero>
  type out_oms_api
  log_level info
  num_threads 5
  omsadmin_conf_path /etc/opt/microsoft/omsagent/<WorkspaceId>/conf/omsadmin.conf
  cert_path /etc/opt/microsoft/omsagent/<WorkspaceId>/certs/oms.crt
  key_path /etc/opt/microsoft/omsagent/<WorkspaceId>/certs/oms.key
  buffer_chunk_limit 10m
  buffer_type file
  buffer_path /var/opt/microsoft/omsagent/<WorkspaceId>/state/out_oms_api_corero*.buffer
  buffer_queue_limit 10
  buffer_queue_full_action drop_oldest_chunk
  flush_interval 30s
  retry_limit 10
  retry_wait 30s
  max_retry_wait 9m
</match>
```
- Change ownership of the file

`
chown omsagent:omiusers corero.conf
`


**Restart agent**

- It creates the corero_cl custom log and populates the log data (20 minutes)


`
sudo /opt/microsoft/omsagent/bin/service_control restart
`

#modify /etc/rsyslog.conf file

## Creatre a filter to pull something that is unique for the log source in this case "flows"
you can have multiple conditions

edit /etc/rsyslog.conf and add the template

```
$template corero, %timestamp% %hostname% %msg%\n"
```


You can create a custom conf file in /etc/rsyslog.d for example 10-corero.conf

If you put the proper filters you can filter out the logs from the syslog ingestion

you can do multiple conditions
if $rawmsg contains "Unique_Value1" or $rawmsg contains "Unique_Value2" or $rawmsg contains "Unique_Value3" then @@127.0.0.1:22033;cerero


**Remove** the /etc/rsyslog.d/security-omsagent-confg.conf

```
if $rawmsg contains "cerero" then @@127.0.0.1:22035;corero & stop
```


**Restart rsyslog**

`
systemctl restart rsyslog
`


## Test Logs change target IP

```
logger -p local4.warn "cat=network,type=sflow,v=1,cl=default,device=corero,profile=default,sc=27,sfn=22,dir=inbound,time=1627662038596000,mp=xe-1/1,issr=1999,isr=1,px=10,lb=0,ipv=4,dip=195.188.195.198,dprt=35675,iplen=1470,prot=6,tos=0,sip=142.250.200.4,sprt=443,ttl=58,bp=0,ep=0,icn=5,scl=0,fp=0,flags=16,flags-decode=ACK,plen=14843"
```

#Log analytics Workspace query

##meraki Parser:
Title:           Corero Security Watch

USAGE:
1. Open Log Analytics/Azure Sentinel Logs blade. Copy the query below and paste into the Logs query window. 
2. In the query window, on the second line of the query, enter the hostname(s) of your Corero Security Watch device(s) and any other unique identifiers for the logstream. 
3. Click the Save button above the query. A pane will appear on the right, select "as Function" from the drop down. Enter a Function Name.
It is recommended to name the Function Alias, as CoreroSecuityWatch
4. Kusto Functions can typically take up to 15 minutes to activate. You can then use Function Alias for other queries.

REFERENCES: 
Using functions in Azure monitor log queries: https://docs.microsoft.com/azure/azure-monitor/log-query/functions
 


```
corero_CL
| extend Parser = extract_all(@"(\w+\s+\d+\s\d+:\d+:\d+)\s(\S+)\s(.*)",dynamic([1,2,3]),Message)
| mv-expand Parser
| extend Date = tostring(Parser[0]),
        DeviceName = tostring(Parser[1]),
        Substring = tostring(Parser[2])
| extend cat = tostring(extract(@"cat=(\w+),",1,Substring)),
        type = tostring(extract(@"type=(\w+),",1,Substring)),
        v = tostring(extract(@"v=(\w+),",1,Substring)),
        cl = tostring(extract(@"cl=(\w+),",1,Substring)),
        device = tostring(extract(@"device=(\w+),",1,Substring)),
        profile = tostring(extract(@"profile=(\w+),",1,Substring)),
        sc = tostring(extract(@"sc=(\w+),",1,Substring)),
        sfn = tostring(extract(@"sfn=(\w+),",1,Substring)),
        dir = tostring(extract(@"dir=(\w+),",1,Substring)),
        timestamp = tostring(extract(@"time=(\w+),",1,Substring)),
        issr = tostring(extract(@"issr=(\w+),",1,Substring)),
        isr = tostring(extract(@"isr=(\w+),",1,Substring)),
        px = tostring(extract(@"px=(\w+),",1,Substring)),
        lb = tostring(extract(@"lb=(\w+),",1,Substring)),
        ipv = tostring(extract(@"ipv=(\w+),",1,Substring)),
        dip = tostring(extract(@"dip=(\w+),",1,Substring)),
        dprt = tostring(extract(@"dprt=(\w+),",1,Substring)),
        iplen = tostring(extract(@"iplen=(\w+),",1,Substring)),
        prot = tostring(extract(@"prot=(\w+),",1,Substring)),
        tos = tostring(extract(@"tos=(\w+),",1,Substring)),
        sip = tostring(extract(@"sip=(\w+),",1,Substring)),
        sprt = tostring(extract(@"sprt=(\w+),",1,Substring)),
        ttl = tostring(extract(@"ttl=(\w+),",1,Substring)),
        bp = tostring(extract(@"bp=(\w+),",1,Substring)),
        ep = tostring(extract(@"ep=(\w+),",1,Substring)),
        icn = tostring(extract(@"icn=(\w+),",1,Substring)),
        scl = tostring(extract(@"scl=(\w+),",1,Substring)),
        fp = tostring(extract(@"fp=(\w+),",1,Substring)),
        pflags = tostring(extract(@"flags=(\w+),",1,Substring)),
        pflagsdecode = tostring(extract(@"flags-decode=(\w+),",1,Substring)),
        plen = tostring(extract(@"plen=(\w+),",1,Substring))
| extend data = split(Substring,",")
| extend mpdata = split(data[10],"=")
| extend mp =mpdata[1]
| project-away Parser,Message,mpdata,data
```

##Test Results

![image.png](/.attachments/image-7d4d1608-77ac-46ca-a977-d6e8fb787b55.png)

# Corero Security Watch Workbook




```


```

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::

