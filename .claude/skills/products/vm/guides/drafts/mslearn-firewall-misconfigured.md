# Azure VM Guest OS Firewall Misconfiguration Troubleshooting

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/guest-os-firewall-misconfigured

## When to Use

VM is fully loaded (Welcome screen visible in boot diagnostics) but some or all network traffic blocked due to firewall misconfiguration. General-purpose firewall troubleshooting guide.

## Key Firewall Rules to Check

| Rule | Purpose |
|------|---------|
| Remote Desktop (TCP-In) | Primary RDP access |
| Windows Remote Management (HTTP-In) | PowerShell remoting |
| File and Printer Sharing (SMB-In) | Network share access |
| File and Printer Sharing (Echo Request - ICMPv4-In) | Ping |

## Serial Console Diagnostic Commands

```powershell
# Query by rule display name
netsh advfirewall firewall show rule dir=in name=all | select-string -pattern "(DisplayName.*<RULE NAME>)" -context 9,4 | more

# Query by port
netsh advfirewall firewall show rule dir=in name=all | select-string -pattern "(LocalPort.*<PORT>)" -context 9,4 | more

# Query by IP
netsh advfirewall firewall show rule dir=in name=all | select-string -pattern "(LocalIP.*<IP>)" -context 9,4 | more

# Enable a disabled rule
netsh advfirewall firewall set rule name="<RULE NAME>" new enable=yes

# Temporarily disable all firewall profiles (for troubleshooting only)
netsh advfirewall set allprofiles state off
```

## Troubleshooting Decision Tree

1. Can you reach VM via Serial Console? → Yes → Use online mitigations
2. Is specific rule disabled? → Enable it
3. Is firewall blocking all inbound? → See guest-os-firewall-blocking-inbound-traffic
4. Need to disable entire firewall? → See disable-guest-os-firewall-windows
5. Cannot access by any method? → Offline repair: attach disk to recovery VM

## Related Articles
- [Disable Guest OS Firewall](./mslearn-disable-guest-os-firewall.md)
- [Enable/Disable Firewall Rule](./mslearn-enable-disable-firewall-rule.md)
