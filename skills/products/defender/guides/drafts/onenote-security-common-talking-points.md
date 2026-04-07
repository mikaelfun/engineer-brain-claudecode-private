# Security Incident Handling — Common Talking Points

> Source: MCVKB/VM+SCIM/22.1 common talking points
> Status: draft (pending SYNTHESIZE review)

## Shared Responsibility Model

- Customer-only security compromise (IaaS VM side) is NOT an Azure security incident
- Reference: [Shared responsibility in the cloud](https://docs.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility)
- Azure PaaS/SaaS breaches → involve MSRC security team

## When to Involve Security Team (IR Ticket)

IR case scopes:
1. Investigation and analysis of malware on an environment
2. Investigation and analysis of alerts and events reported by security products
3. Investigation on Determined Human Adversary (DHA) compromises
4. Security Bulletins (SSIRPs), Vulnerability Events

**Out of scope** (set customer expectation):
- Data recovery from ransomware encryption
- VM disk decryption after hack
- Full vulnerability scan solution

**How to involve**: Ask CSAM/customer to raise a new case with SAP: Security Incident Response

## Handling Infected VMs

### Can I start my infected VM to copy data?
- **No** — ransomware can scan virtual network and infect other VMs
- Safe approach:
  1. Shutdown infected VM immediately
  2. Create snapshots of OS/Data disks
  3. Create VM in isolated VNet (NSG restricted)
  4. Attach copied disk, extract user data

### Can I restore backup of infected VM?
- **Not recommended** — infection start time hard to determine
- Safe approach: Restore in isolated VNet, extract data, provision new VM

### Can Microsoft recover encrypted data?
- No guarantee for customer-only compromise
- Can assist with Azure Backup recovery
- Can involve security team (IR ticket) for investigation

## Required Logs for Security Investigation

- OS/Data disks of infected VMs (keep snapshots)
- Azure Security Center / Defender for Cloud (if enabled)
- Log Analytics (if OMS agent provisioned with security log/syslog)
- Azure Network Watcher logs
- Azure WAF logs
- Azure Firewall logs
- Azure Activity logs (90-day limit without LA)
- Azure Audit/Sign-in logs (90-day limit without LA)

## Sample Security Queries (Log Analytics)

```kql
// SSH brute force detection
Syslog
| where Computer =~ '<VM_name>' and TimeGenerated > ago(60d)
| where SyslogMessage contains "Failed password for"
| where ProcessName =~ "sshd"
| parse kind=relaxed SyslogMessage with * "Failed password for " user " from " ip " port" port " ssh2"
| summarize PerHourCount = count() by ip, bin(TimeGenerated, 1h), user, Computer
| where PerHourCount > 10
```

Query pack template: [sentinel-like-queries-for-mooncake](https://raw.githubusercontent.com/simonxin/sentinel-like-queries-for-mooncake/master/template/securityquerypack.json)

## Best Practice for Internet-Facing VMs

- Do not open direct internet access to VM
- Use Application Gateway (WAF enabled) for web applications
- Use Azure Firewall for outbound traffic management
- SSH access options: ER/VPN, AVD jump host, Azure Bastion

## Mooncake Notes

- Azure China has NO Qualys-based vulnerability assessment in MDC
- Need 3rd party vulnerability scanning solution
