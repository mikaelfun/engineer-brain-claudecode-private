# AVD AVD Session Host (Part 2) - Quick Reference

**Entries**: 15 | **21V**: all applicable
**Keywords**: 0x3000046, 169.254.169.254, aadds, agent-reinstall, authentication, delete, deployment, diffdiskplacement
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | New AAD DS user login to AVD session host fails with wrong user name and passwor... | AAD DS security hardening sets NTLM authentication to accept NTLMv2 response onl... | Force session host to use NTLMv2 only: set registry HKLM\SYSTEM\CurrentControlSe... | 🟢 8.5 | OneNote |
| 2 📋 | Session host fails UrlsAccessibleCheck health check - stuck in Needs Assistance ... | Firewall blocking outbound traffic to required URLs, or local hosts file blockin... | Add firewall rule allowing outbound TCP 80/443 to required URLs. Check Hosts fil... | 🟢 8.0 | MS Learn |
| 3 📋 | Session host VMs going in Unavailable status. Reinstalling agents with new regis... | RDAgentBootLoader registry missing default agent entry under HKLM\SOFTWARE\Micro... | Check registry HKLM\SOFTWARE\Microsoft\RDAgentBootLoader. Create the missing age... | 🔵 7.5 | KB |
| 4 📋 | Cannot delete session host from host pool after VM deleted | Session host record must be deleted before VM | Drain mode then sign out users then delete session host then delete VM | 🔵 7.0 | MS Learn |
| 5 📋 | Sxs not getting auto installed post registering the machine to hostpool this mak... | The following registry was causing the issue.  HKEY_LOCAL_MACHINE\SOFTWARE\Micro... | On      the affected machine navigate to following registry path.   HKEY_LOCAL_M... | 🔵 6.5 | KB |
| 6 📋 | Customers are getting&nbsp;protocol error  (code: 0x112F) due to which the remot... | This is happening only when customer is  using Nvidia GPU enabled VMs and enable... | We need to Disable the AVC HW in the  session hosts which has Nvidia GPU enabled... | 🔵 6.5 | KB |
| 7 📋 | Intermittently unable to access Azure Virtual Desktop(AVD) session host using RD... | When affected host is in Needs Assistance state, we accessed it through the Azur... | Global Secure Access Client was used on the AVD multi-session host which is not ... | 🔵 6.5 | KB |
| 8 📋 | The session hosts appear in a 'Shutdown' state under hostpool blade, even though... | After reviewing the VNET configuration, it was identified that VNET encryption w... | Once VNet encryption was disabled, the session host was able to successfully con... | 🔵 6.5 | KB |
| 9 📋 | When you connect through the&nbsp;Windows App web client&nbsp;to an AVD session ... | According to the product groups formal statement, this behavior is caused by a&n... | Resolution 1: Connect using the Windows App desktop version Instead of connectin... | 🔵 6.5 | KB |
| 10 📋 | AVD VM status becomes unavailable with health check status 'DomainTrustCheck' fa... | Wrong DNS setting which cannot resolve the domain controller, resulting in domai... | Check DNS settings and modify to a proper DNS which can resolve the Domain Contr... | 🔵 6.5 | KB |
| 11 📋 | WVD Classic: All session host status changed to 'Shutdown' after OS upgrade (21H... | After OS upgrade, session host failed to register automatically to the host pool... | Uninstall all agent/boot loader/stack programs. Remove session host from host po... | 🔵 6.5 | KB |
| 12 📋 | Session host fails MetaDataServiceCheck health check - can't access IMDS endpoin... | Networking/firewall/proxy blocking IMDS endpoint 169.254.169.254 | Unblock IP 169.254.169.254; ensure HTTP clients bypass web proxy for IMDS; add p... | 🔵 6.5 | MS Learn |
| 13 📋 | AVD connection fails: session host is unhealthy. Zombie/orphan session exists on... | Zombie session not cleaned up after host shutdown. Stale session records in AVD ... | 1) Start host and Log off users in Azure Portal. 2) PowerShell: Remove-AzWvdUser... | 🔵 6.5 | OneNote |
| 14 📋 | Session host config fails during host pool creation - VmSkuNotAvailableInRegion ... | Incompatible VM SKU/region/zone/disk/image/VNet combination | Use Get-AzComputeResourceSku; use PowerShell cmdlet or recreate host pool | 🔵 6.0 | MS Learn |
| 15 📋 | Ephemeral OS disk deployment fails with incorrect DiffDiskPlacement (e.g. NVMe s... | Selecting unsupported placement option such as NVMe causes deployment issues dur... | For AVD session hosts, select Temp Disk placement during deployment; avoid NVMe ... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: AAD DS security hardening sets NTLM authentication `[Source: OneNote]`
2. Check: Firewall blocking outbound traffic to required URL `[Source: MS Learn]`
3. Check: RDAgentBootLoader registry missing default agent e `[Source: KB]`
4. Check: Session host record must be deleted before VM `[Source: MS Learn]`
5. Check: The following registry was causing the issue.  HKE `[Source: KB]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-session-host-2.md#troubleshooting-flow)
