---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/SME Topics/Agents & Extensions (AGEX)/TSGs/GA/Proxy Issues_AGEX"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FSME%20Topics%2FAgents%20%26%20Extensions%20(AGEX)%2FTSGs%2FGA%2FProxy%20Issues_AGEX"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Summary
The Troubleshooting Guide (TSG) below explains how to fix Proxy issues and how you can use LabBox lab to deploy a VM with the scenario.

While troubleshooting the Guest Agent being down, you notice that it is failing due to not having network connectivity to the wireserver (168.63.129.16). There are numerous ways for customers to set up a proxy, some with built-in Windows tools and others with third-party software. Due to this, the exact errors can vary, but here are some common examples that point towards a proxy causing the issue:

**TransparentInstaller.log:**
```
[00000017] [06/19/2017 15:28:19.81] [WARN]  Getting LastModified header value caused an error: System.Net.WebException: Unable to connect to the remote server ---> 
System.Net.Sockets.SocketException: A connection attempt failed because the connected party did not properly respond after a period of time,
 or established connection failed because connected host has failed to respond 145.254.22.10:8000
```

**WaAppAgent.log:**
```
[00000006] 2024-12-18T15:34:54.328Z [ERROR] GetVersions() failed with exception: System.Net.Http.HttpRequestException: Response status code does not indicate success: 502 (cannotconnect).
    at System.Net.Http.HttpResponseMessage.EnsureSuccessStatusCode()
    at Microsoft.WindowsAzure.RoleContainer.Protocol.WireServerClient.GetResult[T](Uri uri, X509Certificate transportCertificate)
    at Microsoft.WindowsAzure.RoleContainer.Protocol.ControlSystem.SelectProtocolVersion().
```

# Analysis

1. **WireServer not reachable:** Access the VM through RDP and try to access the following URL from an IE browser: http://168.63.129.16/?comp=versions
2. If not able to reach this URL, check that the Network Interface is set for **DHCP enabled** and has **DNS**. Check for any **firewall, proxy, or other issue that could be blocking access** to this Fabric IP address.

# Common proxy configurations

1. Most likely a proxy configured on the VM. The customer must check with their Network/Security team to investigate.
2. There can be multiple ways to install/configure a proxy on the VM. Below is a list of the most common places to check:
     1. Opening IE with `PSEXEC -s -I "c:\program files (x86)\internet explorer\iexplore.exe"` to check the proxy for Local System
     2. `NETSH WINHTTP SHOW PROXY`
     3. Open regedit and search for the IP address mentioned in the error message, or check in `Software\Microsoft\Windows\CurrentVersion\Internet Settings\Connections` or `HKLM\SYSTEM\CurrentControlSet\Services\iphlpsvc\Parameters\ProxyMgr\` or `HKLM\SYSTEM\CurrentControlSet\Services\NlaSvc\Parameters\Internet\ManualProxies`
     4. Also check for a System.Net PROXY configured in .Net:
          * Open file `C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\machine.config`
          ```xml 
          <system.net>
          <defaultProxy enabled="true" useDefaultCredentials="true">
          <proxy usesystemdefault="false" proxyaddress="http://172.26.3.10:8080" bypassonlocal="true" />
          </defaultProxy>
          </system.net>
          ```
     5. You can also take a Fiddler trace to see where the HTTP requests are routed.

# Other known proxies

## Squid proxy
Squid proxy is another third-party proxy that can block connectivity to the wireserver. WireServer GET requests return HTTP 503 from Squid. Customer should ensure Squid proxy is not blocking access to WireServer 168.63.129.16.

## 502 (cannotconnect)
The "normal" error for HTTP 502 is 'Bad Gateway', not 'cannotconnect'. This indicates a third-party proxy is interfering. Repeat offenders: **McAfee Client Proxy** and **Skyhigh Client Proxy**. Check installed software via WinGuestAnalyzer 'Software' tab. Customer must disable or configure proxies to not interfere with traffic to 168.63.129.16.

# Further proxy investigation
If proxy mitigations didn't help, go through the Guest Agent workflow and collect a network trace for further analysis.
