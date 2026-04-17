# Troubleshoot Application Connectivity on Azure VMs

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-app-connection

## 4-Step Diagnostic Approach

### Step 1: Test from the VM itself
- Use `netstat -a` to verify the app is listening on expected ports
- Access the app via localhost/127.0.0.1
- If fails: app not running or not listening on correct port

### Step 2: Test from another VM in the same VNet
- Use VM hostname or private IP
- If fails: check host firewall, intrusion detection software, NSG rules, Cloud Service endpoints

### Step 3: Test from outside the VNet
- If fails (Resource Manager): check inbound NAT rules, NSG rules
- If fails (Classic): check endpoint configuration, ACLs
- For load-balanced VMs: verify probe protocol/port

### Step 4: Use IP Verify / Network Watcher
- Azure Network Watcher for advanced diagnostics

## Common Causes
1. Application not running or not listening on expected ports
2. Host firewall blocking traffic
3. NSG rules not allowing traffic on required ports
4. Load balancer probe misconfigured
5. Internet edge device firewall rules

## Quick Fix Checklist
- [ ] Restart the VM
- [ ] Recreate endpoint / firewall rules / NSG rules
- [ ] Connect from different location (different VNet)
- [ ] Redeploy the VM
- [ ] Recreate the VM (last resort)
