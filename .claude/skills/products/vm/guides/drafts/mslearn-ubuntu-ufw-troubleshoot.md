# Ubuntu UFW Firewall Troubleshooting Guide

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/ubuntu-ufw-guide

## Key Facts

- UFW is **not enabled by default** on Azure Marketplace Ubuntu VMs
- Enabling UFW **closes all ports** including SSH (port 22)
- UFW processes rules in order — first match wins

## Diagnostic Steps

### 1. Check UFW Status
```bash
sudo ufw status           # active or inactive
sudo ufw status numbered  # list all rules with numbers
```

### 2. Check Specific Port
```bash
sudo ufw status | grep '22'
# ALLOW = open, DENY = blocked, no output = denied by default
```

### 3. Verify Port Listening
```bash
sudo ss -tuln | grep ':22'
# LISTEN state means service is running (but may still be firewalled)
```

### 4. Test Connectivity
```bash
sudo nc -zv <server-ip> 22
# Fails + port listening = firewall blocking
```

## Common Scenarios

### Allow SSH for All
```bash
sudo ufw allow ssh
```

### Allow SSH for Specific IP
```bash
sudo ufw allow from 10.0.10.10 to any port 22 proto tcp
```

### Allow SSH for Subnet
```bash
sudo ufw allow from 10.1.0.0/24 to any port 22 proto tcp
```

### Deny SSH
```bash
sudo ufw deny ssh
```

### Delete a Rule
```bash
sudo ufw status numbered
sudo ufw delete <rule_number>
```

## Important Notes

- Rule order matters — place more specific rules before general ones
- If locked out, use Azure Serial Console to fix UFW rules
- Consider NSG rules at Azure level in addition to guest-level UFW
