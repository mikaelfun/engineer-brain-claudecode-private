---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Microsoft Monitoring Agent (MMA)/Linux OMS and auoms TSG/[Product Knowledge] What is auoms?"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FMicrosoft%20Monitoring%20Agent%20%28MMA%29%2FLinux%20OMS%20and%20auoms%20TSG%2F%5BProduct%20Knowledge%5D%20What%20is%20auoms%3F"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# What is "auoms"?
The auoms package is deployed as part of the OMS Agent for Linux. For security monitoring on Linux, auoms interacts with the audit subsystem to collect security events.

## Without AuditD Installed
When auditd is not installed, the audit consumer is auomscollect (spawned as a child process of auoms) and auomscollect connects directly to the AUDIT NETLINK socket.

## With AuditD Installed
When auditd is installed, auditd launches audispd as a child process and feeds events to it via STDIN. The audispd process reads its /etc/audisp/plugins.d dir for configurations and launches the configured child processes. When auoms is installed, auomscollect is added as an audisp plugin. Audispd launches auomscollect as a child process and feeds event records to it via STDIN.

## auoms Rules
The default rules that ASC configures for auoms are stored in the following file:
```
/etc/opt/Microsoft/auoms/rules.d/oms-security-audit.rules
```

## Additional Information
AUOMS is used by us to collect data for alerting purposes and we don't expose the raw data to customers, as the volume of data is too high and would create huge ingestion costs. This data is only sent to our own backend for analysis (7 days retention).

# Requirements
- The auoms package is deployed as part of the "OMS Agent for Linux"
- The auoms package is activated by having ASC Security solution installed on the workspace that the "OMS Agent for Linux" is connected to

## Supported Platforms
The auoms package is supported on any Linux OS supported by the "OMS Agent for Linux".

# Special Considerations
- Always make sure the customer has the latest release of the auoms binaries
- If there is automated process running of the platform which is activating the auditd process to create high cpu, the customer may consider creating a audit rule to exclude the function from being audited by the auoms process.
- Editing `/etc/opt/microsoft/auoms/rules.d/oms-security-audit.rules` is **NOT** supported. The contents of that file are controlled by the OMSAuditdPlugin DSC module and any changes will be overwritten the next time the OMSConsistencyInvoker runs (every 15 minutes by cron job).
  - If the customer wants to block/disable auditing of execve sysall for certain users, they need to create a separate rules file in `/etc/audit/rules.d` (and restart auditd).
  - To ensure that their rule is evaluated before the auoms execve rule, they need to use `-A` instead of `-a`.
- The auoms service **cannot be stopped**. The service watchdog (part of the OMS extension) automatically restarts the auoms service if it is turned off. The only way to stop the service would be to remove the OMS extension.

# What to Check

- Get the version of the auoms process:
```bash
sudo /opt/microsoft/auoms/bin/auomsctl status
```
```bash
journalctl | grep auoms >> /var/log/journalctl_auoms.txt
journalctl | grep auditd >> /var/log/journalctl_auditd.txt
```

- Is the auoms running at 100% of the available CPU?
- Is the auoms core dumping?
- Is the auoms not installing?
- Is the auoms not starting?

# Kusto Queries
Confirm that auoms data is being collected on the backend:

**AuditD logs:**
```kusto
cluster('rome.kusto.windows.net').database('ProdRawEvents').LinuxAuditD
| where Computer has "VMName"
| where TimeCreatedUtc > ago(1h)
```

**auoms logs:**
```kusto
union
cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics,
cluster('https://romeeus.eastus.kusto.windows.net').database('ProdRawEvents').LinuxAuditMetrics
| where AgentId == "{agentId}"
```
> Can also query by `AzureResourceSubscriptionId`, `Computer` or `AzureResourceId`

# Updating the auoms Agent
```bash
wget https://github.com/microsoft/auoms-kits/blob/master/release/2.3.4-31/auoms-2.3.4-31.universal.x64.sh
chmod +x auoms-2.3.4-31.universal.x64.sh
sudo ./auoms-2.3.4-31.universal.x64.sh --upgrade
```

# IcM Data Collection Requirements
Collect on the VM with the agent installed:
- OS Distribution: `lsb_release -a`
- Linux Kernel Version: `uname -a`
- Logs as described in the auoms TSG
