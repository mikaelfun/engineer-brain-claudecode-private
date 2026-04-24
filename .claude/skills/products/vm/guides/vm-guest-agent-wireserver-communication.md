# VM WireServer 通信与 GoalState — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 20 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Guest Agent fails with 503 Server Unavailable. GetVersions() failed, System.Net.WebException. | WireServer (168.63.129.16) not reachable due to firewall, proxy, or network misc | Test http://168.63.129.16/?comp=versions. Check DHCP/DNS, firewall/proxy rules.  | 🟢 8 | ON |
| 2 | Windows Guest Agent status not reported. TransparentInstaller.log shows TimeoutException on http://1 | Third-party antivirus or web filter (e.g., Symantec, Blue Coat Web Filter/Unifie | 1) Check for 3rd party antivirus/web filter (Symantec, Blue Coat). 2) Confirm wi | 🔵 7.5 | AW |
| 3 | BFEToolWin8.exe logs appearing in WaAppAgent.log showing filter rules for 168.63.129.16 on ports 80/ | BFEToolWin8.exe is a built-in Guest Agent component that manages Base Filtering  | No action needed. BFE logs are normal Guest Agent behavior and NOT a sign of con | 🔵 7.5 | AW |
| 4 | Linux VM Agent Not Ready; WireServer unreachable; iptables empty but nft list ruleset shows blocking | nftables (used by firewalld on RHEL/SUSE or ufw on Ubuntu/Debian) has default bl | Disable guest OS firewall: RHEL/SUSE: sudo systemctl stop firewalld && sudo syst | 🔵 7.5 | AW |
| 5 | Guest Agent Not Ready; VM status blob is found but not yet populated; TransparentInstaller.log shows | DHCP disabled on the VM network interface, causing IP configuration out of sync  | For single-IP NIC: enable DHCP. For multi-IP NIC: statically assign all IPs. If  | 🔵 7.5 | AW |
| 6 | BFEToolWin8.exe log entries in WaAppAgent.log showing Permit/Block filter rules for WireServer 168.6 | BFEToolWin8.exe is a built-in Guest Agent component managing Base Filtering Engi | No action needed. BFEToolWin8 logs are expected behavior. The tool limits WireSe | 🔵 7.5 | AW |
| 7 | VM Agent Not Ready, status blob not yet populated. TransparentInstaller.log: GetVersions() failed -  | DHCP disabled on VM network adapter. Without DHCP, VM cannot route to WireServer | Re-enable DHCP on NIC for single-IP scenarios. For multiple IPs, statically assi | 🔵 7.5 | AW |
| 8 | Linux VM Agent Not Ready, nc to 168.63.129.16 times out. iptables -L empty but nft -a list ruleset s | nftables rules (managed by firewalld on RHEL/SUSE or UFW on Ubuntu/Debian) block | Disable OS firewall: RHEL/SUSE: systemctl stop/disable firewalld. Ubuntu/Debian: | 🔵 7.5 | AW |
| 9 | Guest Agent Not Ready, VM status blob not populated. TransparentInstaller.log: GetVersions() failed  | DHCP disabled on guest NIC causes loss of connectivity to WireServer 168.63.129. | Single IP: enable DHCP. Multiple IPs: statically assign. If DHCP correct, contin | 🔵 7.5 | AW |
| 10 | Windows Guest Agent: Goal state processing exception System.NullReferenceException and IMDS connecti | 3rd party software (anti-virus etc.) on the VM intercepting and closing connecti | Collect Host Analyzer to verify WireServer communication. Collect WinGuestAnalyz | 🔵 7.5 | AW |
| 11 | VM Agent status Not Ready in ASC/Portal. Extensions stuck Transitioning/Failed. WaAppAgent.log: Unab | Windows Firewall or 3rd party security software blocking outbound TCP access to  | Check firewall: Get-NetFirewallRule -Enabled True -Direction Outbound -Action Bl | 🔵 7.5 | AW |
| 12 | Azure VM guest agent reports 503 Server Unavailable or socket connection refused to 168.63.129.16:80 | A proxy or firewall is intercepting/blocking traffic from the VM to WireServer I | Disable the proxy or exclude traffic to 168.63.129.16 from the proxy. Verify acc | 🔵 7.5 | AW |
| 13 | Cannot RDP to Azure VM. No connectivity on VIP/DIP. Guest agent logs show EndpointNotFoundException: | MAC preservation feature bug: RNM team enabled MAC preservation on subset of sub | Stop and start the VM to get a new MAC/IP assignment. Alternatively, delete the  | 🔵 7.5 | AW |
| 14 | Cannot RDP to Windows VM. WinGuestAnalyzer Health Signal shows EnableDHCP=FALSE on primary NIC. ipco | Static IP configured on Windows NIC inside Guest OS differs from Azure platform- | Online via Serial Console: netsh interface ip set address Ethernet dhcp. Or Powe | 🔵 7.5 | AW |
| 15 | Azure VM has no RDP connectivity. VM screenshot shows OS fully loaded at credentials screen. WinHTTP | WinHttpAutoProxySvc service is not running due to: (1) service set to disabled,  | OFFLINE: Attach OS disk to rescue VM. Fix 1 (disabled): Enable service via regis | 🔵 7.5 | AW |
| 16 | Guest Agent: Unable to connect to remote server. SocketException: target machine actively refused it | machine.config has proxy settings overriding GuestAgent WebClient, redirecting t | Remove proxy config from machine.config, or upgrade WinGA to >= 2.7.41491.992 wh | 🔵 7 | ON |
| 17 | VM Agent status Not Ready, extensions stuck in Transitioning/Failed. WaAppAgent.log shows Unable to  | Windows Firewall or 3rd party guest software blocking outbound access to WireSer | 1) Check: Get-NetFirewallRule -Enabled True -Direction Outbound -Action Block; 2 | 🔵 6.5 | AW |
| 18 | Windows Guest Agent failing with Goal state processing encountered an exception: System.NullReferenc | Third-party software (anti-virus etc.) on the VM intercepting and closing WireSe | 1) Collect Host Analyzer to verify WireServer responded correctly; 2) Collect Wi | 🔵 6.5 | AW |
| 19 | Squid proxy on VM causes HTTP 503 when Guest Agent tries to reach WireServer 168.63.129.16; wasetup. | Squid proxy intercepts and blocks HTTP requests to WireServer 168.63.129.16, ret | Configure Squid proxy to allow direct access to WireServer 168.63.129.16 without | 🔵 6.5 | AW |
| 20 | WaAppAgent.log shows repeated Response status code does not indicate success: 502 (cannotconnect) fo | Third-party proxy (McAfee Client Proxy or Skyhigh Client Proxy) intercepts traff | Check WinGuestAnalyzer Software tab for installed proxies. Disable McAfee/Skyhig | 🔵 6.5 | AW |

## 快速排查路径

1. **Guest Agent fails with 503 Server Unavailable. GetVersions() failed, System.Net.**
   - 根因: WireServer (168.63.129.16) not reachable due to firewall, proxy, or network misconfiguration.
   - 方案: Test http://168.63.129.16/?comp=versions. Check DHCP/DNS, firewall/proxy rules. Collect network trace.
   - `[🟢 8 | ON]`

2. **Windows Guest Agent status not reported. TransparentInstaller.log shows TimeoutE**
   - 根因: Third-party antivirus or web filter (e.g., Symantec, Blue Coat Web Filter/Unified Agent) is blocking Guest Agent communi
   - 方案: 1) Check for 3rd party antivirus/web filter (Symantec, Blue Coat). 2) Confirm with Fiddler/Procmon trace if interference exists. 3) Disable antivirus/
   - `[🔵 7.5 | AW]`

3. **BFEToolWin8.exe logs appearing in WaAppAgent.log showing filter rules for 168.63**
   - 根因: BFEToolWin8.exe is a built-in Guest Agent component that manages Base Filtering Engine rules to restrict WireServer comm
   - 方案: No action needed. BFE logs are normal Guest Agent behavior and NOT a sign of connectivity issues. The Guest Agent runs under System account and is una
   - `[🔵 7.5 | AW]`

4. **Linux VM Agent Not Ready; WireServer unreachable; iptables empty but nft list ru**
   - 根因: nftables (used by firewalld on RHEL/SUSE or ufw on Ubuntu/Debian) has default blocking rules preventing outbound to Wire
   - 方案: Disable guest OS firewall: RHEL/SUSE: sudo systemctl stop firewalld && sudo systemctl disable firewalld. Ubuntu/Debian: sudo ufw disable. If persists,
   - `[🔵 7.5 | AW]`

5. **Guest Agent Not Ready; VM status blob is found but not yet populated; Transparen**
   - 根因: DHCP disabled on the VM network interface, causing IP configuration out of sync with Azure, breaking connectivity to Wir
   - 方案: For single-IP NIC: enable DHCP. For multi-IP NIC: statically assign all IPs. If DHCP correct, continue with WireServer Troubleshooting guide. Ref: htt
   - `[🔵 7.5 | AW]`

