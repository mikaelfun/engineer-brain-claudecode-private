---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Additional features/Kerberos: KDC Proxy/KDC PROXY advisory health-check and troubleshooting playbook"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Additional%20features/Kerberos%3A%20KDC%20Proxy/KDC%20PROXY%20advisory%20health-check%20and%20troubleshooting%20playbook"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Summary

This document provides a comprehensive, production-grade health-check and troubleshooting playbook for your KDC Proxy setup  tailored to your environment (VPN  KDC Proxy  KDC) and designed to proactively ensure everything keeps working smoothly:  

[[_TOC_]]


##Overview:  
![==image_0==.jpeg](/.attachments/==image_0==-4a37a018-199a-4bd6-8fff-1423a637e4d2.jpeg) 

[[MS-KKDCP]: Overview | Microsoft Learn](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kkdcp/d688ea3a-04b0-45ea-8226-82a74cb6289e)  

KDC Proxy: Uses TLS and HTTP to transport Kerberos AS and TGS requests to and from a computer residing on the Internet. The KDC Proxy consists of two components: the Kerberos proxy client (KPC) and the KDC proxy server (KPS).
*   Kerberos Proxy Client (KPC): Implemented within the Kerberos client (Kerberos.dll). KPC uses WinHttp APIs (winhttp.dll) to support TLS communication to the KPS. The client receives the KDC proxy URL from the DirectAccess or Remote Desktop client. For application use, configure GPO:Computer Configuration\Policies\Administrative Templates\System\Kerberos\Specific KDC proxy servers for Kerberos clients. Registry:HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Kerberos\KDCProxy.
*   KDC Proxy Server Service (KPS): Implemented as a separate service in new Kpssvc.dll, uses server-side HTTP APIs (http.sys), running on any Windows Server strating 2012 in the context of Network Service, and may be placed in a DMZ. Server configuration settings are stored in the Registry atHKLM\System\CurrentControlSet\Services\KPSSVC. Default URI:https://fqdn_computer_name/KdcProxy.

* * *

##  1. Service & Certificate Health
1.  Verify the KDC Proxy service is running (kpssvc / Kerberos Key Distribution Center Proxy Service).
    *   On Windows, check via Services, PowerShell, or Get-Service kpssvc.
    *   If it stops unexpectedly, it should auto-restart  if not, investigate service crashes or dependency failures. [[Troubleshoot DC and Kerberos for DirectAccess troubleshooting - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/troubleshoot-directaccess-server-console-dc-kerberos)]
2.  Confirm HTTPS listener and certificate binding
    *   Use netsh http show urlacl to ensure https://+:443/KdcProxy is reserved for NT AUTHORITY\Network Service.
    *   Use netsh http show sslcert to verify the correct cert thumbprint is bound to port 443. [[](https://syfuhs.net/kdc-proxy-for-remote-access)[KDC Proxy for Remote Access](https://syfuhs.net/kdc-proxy-for-remote-access)[]](https://syfuhs.net/kdc-proxy-for-remote-access)
3.  Validate TLS certificate validity
    *   Ensure the cert is trusted by clients, not expired, includes the correct SAN/EKU, and matches the public DNS name used by VPN clients.[[](https://syfuhs.net/kdc-proxy-for-remote-access)[KDC Proxy for Remote Access](https://syfuhs.net/kdc-proxy-for-remote-access)[]](https://syfuhs.net/kdc-proxy-for-remote-access)

* * *

## 2. Network & DNS Connectivity
1.  Ensure clients can reach the proxy endpoint
    *   From a VPN-connected client, test https://<kdcproxy-FQDN>/KdcProxy  expect a 404 or 405 (not a connection error).
    *   If unreachable, check firewall rules, VPN split-tunnel settings, and DNS resolution.
2.  Confirm proxy  KDC connectivity
    *   The proxy must reach internal DCs on Kerberos ports (TCP/UDP 88).
    *   Use Test-NetConnection or telnet from the proxy server to each DC on port 88.

* * *

##  3. Client-Side Functional Testing
1.  Force Kerberos via proxy and validate ticket acquisition
    *   On a VPN client, run:

       ```
       klist purge
       klist get krbtgt
       ```
    this forces a TGT request through the proxy.
2.  Enable Kerberos debug logging
    *   On Windows clients, enable Kerberos/LSA event logs to confirm requests are hitting the proxy.  
        [Enable Kerberos event logging - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/enable-kerberos-event-logging)
    *   [Kerberos Authentication Troubleshooting Guidance - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/kerberos-authentication-troubleshooting-guidance)
    *   If no logs appear, the client may not be aware of the proxy  check your Group Policy Specify KDC proxy servers for Kerberos clients (internal domain = key, value = proxy FQDN).
    *   There is no dedicated event log for Key Distribution Center (KDC) proxy events on the client side. All activity is written into the existingMicrosoft-Windows-Kerberos/Operationallog. (108/108)
3.  Capture and analyze traffic
    *   Use Wireshark or Packet Monitor on the client to verify HTTPS traffic to the proxy and subsequent Kerberos traffic to the DC.
    *   On the proxy, capture traffic to ensure its forwarding correctly. [[](https://www.reddit.com/r/sysadmin/comments/174e242/need_some_help_with_kdc_proxy/)

* * *

##  4. Server-Side Logging & Event Monitoring
1.  Inspect Event Viewer on the proxy and DCs
    *   KDC Proxy service events  
        The KDC Proxy Service (KPS) writes in its own event log: Microsoft-Windows-Kerberos-KdcProxy/Operational
    *   Watch for errors like kpssvc not available, KRB_AP_ERR_SKEW, KRB_AP_ERR_MODIFIED, or SPN-related issues. [Kerberos Authentication Troubleshooting Guidance - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/windows-security/kerberos-authentication-troubleshooting-guidance)
2.  Monitor for clock skew
    *   Kerberos is sensitive to time drift  ensure all systems (clients, proxy, DCs) sync via NTP.
3.  Track service restarts or failures
    *   If kpssvc stops, check for crash dumps or Windows Error Reporting entries to identify root causes.
4.  performance counters  
    KPS provides few perf counters

| Name<br> | Desc<br> |
| --- | --- |
| Incoming Requests<br> | Incoming Requests records the number of incoming Kerberos request messages being processed per second.<br> |
| Incoming Armored Requests<br> | Incoming Armored Requests records the number of incoming armored Kerberos request messages being processed per second.<br> |
| Incoming Password Change Requests<br> | Incoming Password Change Requests records the number of incoming Kerberos password change requests being processed per second.<br> |
| Failed Requests<br> | Failed Requests records the number of failed Kerberos request messages per second.<br> |

* * *

##  5. Synthetic & Automated Health Checks
1.  Scheduled synthetic authentication tests
    *   Automate a script (e.g., PowerShell) that runs klist purge + klist get via VPN and logs success/failure.
2.  HTTP(S) endpoint monitoring
    *   Use tools to probe https://<proxy>/KdcProxy and alert on connectivity or certificate issues.

* * *

## 6. Troubleshooting Workflow (When Issues Arise)
| Step<br> | Action<br> | Purpose<br> |
| --- | --- | --- |
| 1<br> | Client-side: klist purge  klist get  Wireshark<br> | Confirm if client is reaching proxy and getting a ticket<br> |
| 2<br> | Proxy-side: Check kpssvc status, Event Viewer, netsh http show sslcert/urlacl<br> | Ensure service is up, cert is bound, listener is configured<br> |
| 3<br> | DC-side: Inspect Kerberos/KDC logs for errors<br> | Detect ticket decryption issues, SPN mismatches, or replication problems<br> |
| 4<br> | Network: Test connectivity (VPN  proxy  DC), DNS resolution, firewall rules<br> | Rule out routing or name resolution issues<br> |
| 5<br> | Policy: Validate Group Policy Specify KDC proxy servers is applied correctly<br> | Ensure clients know which proxy to use [[reddit.com]](https://www.reddit.com/r/sysadmin/comments/174e242/need_some_help_with_kdc_proxy/)<br> |

* * *

By implementing this layered approach  service checks, network validation, client testing, log monitoring, and synthetic probes  youll have full visibility into the health of your KDC Proxy infrastructure. Youll catch issues early, ensure seamless Kerberos authentication over VPN, and maintain confidence in your setup.  

More deep dive details: [[MS-KKDCP]: Kerberos Key Distribution Center (KDC) Proxy Protocol | Microsoft Learn](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kkdcp/5bcebb8d-b747-4ee5-9453-428aec1c5c38).