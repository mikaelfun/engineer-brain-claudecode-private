---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Concepts/AMA Linux: Concepts: Syslog Daemon (Syslog-ng)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/Learning Resources/Concepts/AMA Linux: Concepts: Syslog Daemon (Syslog-ng)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AMA Linux: Concepts: Syslog Daemon (Syslog-ng)

## Overview
Technical concepts of the syslog-ng daemon. Two mainstream syslog daemons: Rsyslog and Syslog-ng. Syslog-ng is less common but still widely used.

## Configuration
Syslog-ng configurations use inline objects:
- **source** — where the daemon listens for events
- **filter** — message matching criteria
- **destination** — where the daemon sends the event
- **log** — combines source, filter, destination to execute

Objects defined as: `<object-type>{<object-definition>};`

Default config: `/etc/syslog-ng/syslog-ng.conf`
Additional configs: `/etc/syslog-ng/conf.d/*.conf`

### Key source example
```
source s_sys {system(); internal();};
```

### Key filter examples
```
filter f_kernel { facility(kern); };
filter f_default { level(info..emerg) and not (facility(mail) or facility(authpriv) or facility(cron)); };
```

### Key destination examples
```
destination d_mesg { file("/var/log/messages"); };
destination d_auth { file("/var/log/secure"); };
```

### Log statement (combines source+filter+destination)
```
log { source(s_sys); filter(f_kernel); destination(d_kern); };
```

## AMA Default Configuration File
AMA creates `/etc/syslog-ng/conf.d/azuremonitoragent-tcp.conf` when:
1. A DCR with valid syslog data source is associated
2. The syslog-ng package is installed

```
options {};

destination d_azure_mdsd {
    network("127.0.0.1"
    port(28330)
    flags(no_multi_line)
    log-fifo-size(25000));
};

log {
    source(s_sys);
    destination(d_azure_mdsd);
    flags(flow-control);
};
```

## Troubleshooting

### Scenario: Invalid configuration
1. Check status: `systemctl status syslog-ng`
2. If failed with INVALIDARGUMENT: `journalctl -u syslog-ng`
3. Common errors:
   - "Multiple internal() sources were detected" — duplicate source definition in custom config
   - "Error initializing message pipeline" — identifies offending config file and line
4. Fix: rename offending config to .bak, reload syslog-ng, or fix the syntax
