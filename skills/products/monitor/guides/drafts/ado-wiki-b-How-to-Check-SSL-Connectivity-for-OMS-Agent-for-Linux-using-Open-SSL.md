---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Agents/OMS Agent for Linux (omsagent)/How-To/How-to: Check SSL Connectivity for OMS Agent for Linux using Open SSL"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Monitor%20Agents/Agents/OMS%20Agent%20for%20Linux%20%28omsagent%29/How-To/How-to%3A%20Check%20SSL%20Connectivity%20for%20OMS%20Agent%20for%20Linux%20using%20Open%20SSL"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::
---
Applies To:
- Oms Agent For Linux :- All versions
---

# Note
 - The screenshot and output provided are from test labs there is no pii data present.

# Scenario
---
Whenever customers are facing difficulties with endpoint connectivity and the Microsoft monitoring agents, while we can run the �Test Cloud Connection� utility to see if the Physical Network Connections are open, there are times when we need to check for specific SSL connectivity to determine if there is any filtering in place.



# Linux Commands

_**Open up a console window and run the following commands:**_



```
To test network connectivity the following should be used.   It includes some basic SSL healthiness including the Issuer.   If the Issuer is not from Microsoft then customer needs to enable "Bypass HTTPS Inspection".
 
where ########-####-####-####-############ is the workspace id
echo | openssl s_client -connect ########-####-####-####-############.ods.opinsights.azure.com:443 -servername ########-####-####-####-############.ods.opinsights.azure.com
echo | openssl s_client -connect ########-####-####-####-############.oms.opinsights.azure.com:443 -servername ########-####-####-####-############.oms.opinsights.azure.com
echo | openssl s_client -connect ########-####-####-####-############.agentsvc.azure-automation.net:443 -servername ########-####-####-####-############.agentsvc.azure-automation.net
echo | openssl s_client -connect scadvisorcontent.blob.core.windows.net:443 -servername scadvisorcontent.blob.core.windows.net

 
where ########-####-####-####-############ is the automation account id (found on the Azure portal under "Automation Account | Keys" on the URL field.
echo | openssl s_client -connect ########-####-####-####-############.jrds.eus2.azure-automation.net:443 -servername ########-####-####-####-############.jrds.eus2.azure-automation.net
echo | openssl s_client -connect ########-####-####-####-############.agentsvc.eus2.azure-automation.net:443 -servername ########-####-####-####-############..agentsvc.eus2.azure-automation.net

```
 - When checking the Automation account endpoints you will need to modify, not only the automation account id, but also the regional code inside the target endpoints path.

Example: ########-####-####-####-############.agentsvc.**eus2**.azure-automation.net, points to an automation account in East US 2. For a complete list of DNS regional codes refer to the chart at the bottom of this page

# Linux Commands (Using Private Links)

_**Open up a console window and run the following commands:**_



```
To test network connectivity the following should be used.   It includes some basic SSL healthiness including the Issuer.   If the Issuer is not from Microsoft then customer needs to enable "Bypass HTTPS Inspection".
 
where ########-####-####-####-############ is the workspace id
echo | openssl s_client -connect ########-####-####-####-############.privatelink.oms.opinsights.azure.com:443     
echo | openssl s_client -connect ########-####-####-####-############.privatelink.ods.opinsights.azure.com:443
echo | openssl s_client -connect ########-####-####-####-############.privatelink.agentsvc.azure-automation.net:443
echo | openssl s_client -connect api.privatelink.monitor.azure.com                                             
echo | openssl s_client -connect global.in.ai.privatelink.monitor.azure.com                                    
echo | openssl s_client -connect profiler.privatelink.monitor.azure.com                                        
echo | openssl s_client -connect live.privatelink.monitor.azure.com                                            
echo | openssl s_client -connect snapshot.privatelink.monitor.azure.com 
 
where ########-####-####-####-############ is the Automation Account ID (found on the Azure portal under "Automation Account | Keys" on the URL field.
echo | openssl s_client -connect ########-####-####-####-############.jrds.eus2.privatelink.azure-automation.net    
echo | openssl s_client -connect ########-####-####-####-############.agentsvc.eus2.privatelink.azure-automation.net

```
**== Sample Linux Output:**

```

#echo | openssl s_client -connect ########-####-####-####-############.privatelink.oms.opinsights.azure.com:443
CONNECTED(00000003)
depth=2 C = IE, O = Baltimore, OU = CyberTrust, CN = Baltimore CyberTrust Root
verify return:1
depth=1 C = US, O = Microsoft Corporation, CN = Microsoft RSA TLS CA 02
verify return:1
depth=0 CN = OMS-SSL201712EUS.azure.com
verify return:1
---
Certificate chain
0 s:CN = OMS-SSL201712EUS.azure.com
   i:C = US, O = Microsoft Corporation, CN = Microsoft RSA TLS CA 02
1 s:C = US, O = Microsoft Corporation, CN = Microsoft RSA TLS CA 02
   i:C = IE, O = Baltimore, OU = CyberTrust, CN = Baltimore CyberTrust Root
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIHEzCCBP ... v97oZ0
-----END CERTIFICATE-----
subject=CN = OMS-SSL201712EUS.azure.com

issuer=C = US, O = Microsoft Corporation, CN = Microsoft RSA TLS CA 02

---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: RSA
Server Temp Key: ECDH, P-384, 384 bits
---
SSL handshake has read 3712 bytes and written 539 bytes
Verification: OK
---
New, TLSv1.2, Cipher is ECDHE-RSA-AES256-GCM-SHA384
Server public key is 2048 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES256-GCM-SHA384
    Session-ID: C51F0000AAC78D80AEC020A97D1559A79D17605CE125193A1241347F75ABA79F
    Session-ID-ctx:
    Master-Key: 641FEB787791693F0219D57DC13FC0606D19439603040B46AA3A6ADAEE87D9A39638E916CC9C8CE34FE961A6C1C6436A
    PSK identity: None
    PSK identity hint: None
    SRP username: None
    Start Time: 1633974629
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
    Extended master secret: yes
---
DONE
```

Each one will result with an Issuer tag if this tag does not show Microsoft as in the following examples:

**OpenSSL: issuer=C = US, O = Microsoft Corporation, _CN = Microsoft RSA_ TLS CA 02**

If the Issuer does not contain Microsoft, there is a strong chance customer has some type of SSL traffic inspection.  You can confirm the issuer by running the exact same commands/endpoints from your system to see if your Issuer is the same or not.   SSL Inspection may not be on the firewall customer could have some other network device that is doing the SSL inspection.

Note:  if you do not get any SSL information return you should check if the TCP connection is successful. If you cannot establish a TCP connection then customer should check Network firewall.

                Using Linux
                nc -zv global.in.ai.monitor.azure.com 443


![image.png](/.attachments/image-23384bb3-d72a-4586-9f0b-7ded408036e3.png)
