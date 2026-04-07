# Azure VM RDP Connection Troubleshooting Guide

> Source: [Troubleshoot RDP connections](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/troubleshoot-rdp-connection) + [Detailed troubleshoot RDP](https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/windows/detailed-troubleshoot-rdp)

## Quick Steps (Try in Order)

1. **Reset RDP configuration** — Portal > VM > Help > Reset password > Reset configuration only
2. **Verify NSG rules** — Ensure inbound Allow rule exists for TCP 3389 (use IP flow verify)
3. **Review VM boot diagnostics** — Check console logs for boot issues
4. **Reset NIC** — Portal > VM > Networking > IP configurations > change IP
5. **Check VM Resource Health** — Portal > VM > Help > Resource health (should show Available)
6. **Reset user credentials** — Portal > VM > Help > Reset password
7. **Restart VM** — Portal > VM > Overview > Restart
8. **Redeploy VM** — Portal > VM > Help > Redeploy (moves to new host, ephemeral disk data lost)
9. **Verify routing** — Network Watcher > Next hop
10. **Check local firewall** — Ensure outbound TCP 3389 to Azure is allowed

## RDP Connection Components (Detailed Diagnosis)

### Source 1: Remote Desktop Client Computer
- Test RDP to another on-premises Windows machine
- Check: local firewall, proxy software, network monitoring software, security software
- Temporarily disable suspected software to isolate

### Source 2: Organization Intranet Edge Device
- Test from a machine directly connected to Internet
- Check: internal firewall blocking HTTPS, proxy server, IDS/network monitoring on edge devices

### Source 3: Network Security Groups
- Use IP flow verify to check if NSG rule blocks traffic
- Review effective security group rules
- Default RDP port: TCP 3389

### Source 4: Windows-based Azure VM
- Check Remote Desktop service is running
- Verify RDP listening on TCP 3389
- Check Windows Firewall rules
- Check for IDS/monitoring software blocking RDP
- Reset via PowerShell: `Set-AzVMAccessExtension`
- Check/fix RDP port: registry `HKLM\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp\PortNumber`

## PowerShell Quick Reference

```powershell
# Reset RDP configuration
Set-AzVMAccessExtension -ResourceGroupName "myRG" -VMName "myVM" -Location WestUS -Name "myVMAccessExtension"

# Reset credentials
Set-AzVMAccessExtension -ResourceGroupName "myRG" -VMName "myVM" -Location WestUS -Name "myVMAccessExtension" -UserName $cred.GetNetworkCredential().Username -Password $cred.GetNetworkCredential().Password

# Redeploy
Set-AzVM -Redeploy -ResourceGroupName "myRG" -Name "myVM"
```
