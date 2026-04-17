# Detailed SSH Troubleshooting for Azure Linux VM

Source: https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/linux/detailed-troubleshoot-ssh-connection

## Failure Source Isolation (4 Sources)

### Source 1: SSH Client Computer
- Check local firewall blocking TCP 22
- Check proxy software, network monitoring software, other security software
- Verify SSH key file permissions:
  - `chmod 700 ~/.ssh`
  - `chmod 644 ~/.ssh/*.pub`
  - `chmod 600 ~/.ssh/id_rsa`
  - `chmod 644 ~/.ssh/known_hosts`

### Source 2: Organization Edge Device
- Test from a directly internet-connected computer
- Check internal firewall, proxy server, IDS/network monitoring on edge network
- Skip if connecting via site-to-site VPN or ExpressRoute

### Source 3: Network Security Groups
- Verify NSG rules allow SSH inbound/outbound to internet
- Use IP Flow Verify (Network Watcher) to validate NSG config
- Check rules are applied to subnet

### Source 4: Linux-based Azure VM
- SSH service not running
- SSH service not listening on expected port (default TCP 22)
- Local firewall blocking SSH traffic
- IDS/network monitoring on VM preventing SSH
- Test with: `telnet cloudServiceName.cloudapp.net 22`

## Preliminary Checks
1. VM status = Running in portal
2. SSH endpoint defined in Endpoints or NSG
3. NSG rules applied and referenced in subnet
4. Try connecting via another protocol (HTTP) to verify network path
