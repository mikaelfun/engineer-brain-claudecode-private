# Linux auditd/auoms Troubleshooting (OMS Agent)

> Source: OneNote — OMS Agent / Linux - auditd/auoms
> Quality: draft | Needs: review, update for AMA migration context

## Overview

The auoms package is deployed as part of the OMS Agent for Linux. For security monitoring on Linux, auoms interacts with the audit subsystem to collect security events.

## AuditD Reference

| Item | Path/Command |
|------|-------------|
| Rules file | `/etc/audit/audit.rules` |
| List all rules | `auditctl -l` |
| Output log | `/var/log/audit/audit.log` |

## AUOMS Reference

AUOMS is responsible for collecting auditd events.

### DSC Activity Logs (nxOMSAuditdPlugin)

```bash
grep -B 2 -A 2 'nxOMSAuditdPlugin' /var/opt/microsoft/omsconfig/omsconfig.log
grep -B 2 -A 2 'nxOMSAuditdPlugin' /var/opt/microsoft/omsconfig/omsconfigdetailed.log
grep -B 2 -A 2 'Auditd' /var/opt/microsoft/omsconfig/omsconfig.log
```

### Debug auoms Output (listen to queue directly)

```bash
sudo service omsagent-* stop
rm /var/opt/microsoft/omsagent/*/run/auoms.socket
# Install nc if not available: yum install nc
nc -lU /var/opt/microsoft/omsagent/*/run/auoms.socket

# Restore omsagent
rm /var/opt/microsoft/omsagent/*/run/auoms.socket
sudo service omsagent-* start
```

### Key Config Files

| File | Purpose |
|------|---------|
| `/etc/opt/omi/conf/omsconfig/configuration/Current.mof` | DSC state file (desired state of each OMS agent module) |
| `/etc/audisp/plugins.d/auoms.conf` | Auoms audisp plugin config |
| `/etc/opt/microsoft/auoms/auoms.conf` | Auoms main config |
