---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Common/Understanding basic DNS query Tools"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FCommon%2FUnderstanding%20basic%20DNS%20query%20Tools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

Overview: 

#What DNS Resolution? 

The Domain Name System (DNS) is the phonebook of the Internet. When users type domain names such as "www.microsoft.com" or "azure.microsoft.com" into web browsers, DNS is responsible for finding the correct IP address for those sites. Browsers then use those addresses to communicate with origin servers or CDN edge servers to access website information. This all happens thanks to DNS servers, the machines dedicated to answering DNS queries.   

When DNS is not working devices cannot communicate. You will be unable to browse websites, send an email, chat online, stream videos, and so on. Every VM OS depends on DNS Servers and if they have issues, you are going to be able to troubleshoot accordingly if you need quickly resolve these kind of issues.   

That is why it's important to know how to use two different commands to determine the possible DNS issue, depending on the Operating System. Both commands are part of the default installation for Windows and Linux Operating Systems.   

Adding to what we have mentioned, we need to troubleshoot on our daily basis different DNS issues outside of a simple VM DNS query that can affect a Service on the Internet to be accessed, besides any other issues with delegation or external resolution issues.    

#Tools for troubleshooting DNS Issues with CLI tools: 

##How to determine the DNS Servers on Windows and Linux Operating Systems: 

### Windows Machines: 

1. Open the Command Prompt and run the following command: ***ipconfig /all***
```
Windows IP Configuration 

   Host Name . . . . . . . . . . . . : TDC1788805516 
   Primary Dns Suffix  . . . . . . . : 
   Node Type . . . . . . . . . . . . : Hybrid 
   IP Routing Enabled. . . . . . . . : No 
   WINS Proxy Enabled. . . . . . . . : No 
   DNS Suffix Search List. . . . . . : obb5shgm5gku3og1ihya5iskad.jx.internal.cloudapp.net 
Ethernet adapter Ethernet: 
   Connection-specific DNS Suffix  . : obb5shgm5gku3og1ihya5iskad.jx.internal.cloudapp.net 
   Description . . . . . . . . . . . : Microsoft Hyper-V Network Adapter 
   Physical Address. . . . . . . . . : 00-0D-3A-70-D3-37 
   DHCP Enabled. . . . . . . . . . . : Yes 
   Autoconfiguration Enabled . . . . : Yes 
   Link-local IPv6 Address . . . . . : fe80::d19a:d51b:554:dca4%6(Preferred) 
   IPv4 Address. . . . . . . . . . . : 10.0.4.14(Preferred) 
   Subnet Mask . . . . . . . . . . . : 255.255.252.0 
   Default Gateway . . . . . . . . . : 10.0.4.1 
   DHCP Server . . . . . . . . . . . : 168.63.129.16 
   DNS Servers . . . . . . . . . . . : 168.63.129.16 
   NetBIOS over Tcpip. . . . . . . . : Enabled 
```

### Linux Machines: 

On a SSH Session to the CLI, run the following command to obtain the DNS Server obtained by DHCP: ***sudo systemd-resolve --status***.  

One of the last lines should reflect the DNS servers pushed by the DHCP. 
```
Link 2 (eth0) 
      Current Scopes: DNS 
       LLMNR setting: yes 
MulticastDNS setting: no 
      DNSSEC setting: no 
    DNSSEC supported: no 
         DNS Servers: 168.63.129.16 
          DNS Domain: t2cas11nhuye3loexiwkyufwph.gx.internal.cloudapp.net 
```

***To exit the command please press "q"*** 

If the command is throwing an error, you can run: `sudo cat /etc/resolv.conf` and look for the nameserver section.

Linux machines on Azure by default install a Daemon called ***systemd-resolve***, used as a DNS Forwarder service.

You can check if the Linux Machine is bypassing the default configuration:
```
nameserver 10.15.10.20 
options edns0 
search t2cas11nhuye3loexiwkyufwph.gx.internal.cloudapp.net 
```

##Useful DNS Queries to troubleshoot: 

**Note:** See also: [QTYPES and RCODES](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/471483/QTYPES-and-RCODES)

###A Records: 

#### Windows Command
```
nslookup <fully qualified domain name>
```

#### Linux Command
```
dig <fully qualified domain name>
```

###Using an alternative DNS Server: 

#### Windows Command: 
```
nslookup <fully qualified domain name> <alternate dns server>
```
Example: `nslookup www.microsoft.com 4.2.2.2`

#### Linux command: 
```
dig @<alternate dns server> <fully qualified domain name>
```
Example: `dig @4.2.2.2 www.microsoft.com`

###Canonical Names (Aliases): 

#### Windows Command: 
```
nslookup -type=cname <fully qualified domain name>
```

#### Linux Command: 
```
dig cname <fully qualified domain name>
```

###Name Server Records: 

#### Windows command: 
```
nslookup -type=ns <domain name>
```

#### Linux command: 
```
dig ns <domain name>
```

### SOA Record Lookup: 

#### Windows command: 
```
nslookup -type=soa <domain name>
```

#### Linux command: 
```
dig soa <domain name>
```

### MX Lookup: 

#### Windows Command: 
```
nslookup -query=mx <domain name>
```

#### Linux Command: 
```
dig mx <domain name>
```

### Reverse DNS Lookups (IP to Domain Name): 

#### Windows command: 
```
nslookup <IP address>
```

#### Linux command: 
```
dig -x <IP address>
```

### PTR Records: 

#### Windows Command: 
```
nslookup -type=ptr <reverseip>.in-addr.arpa
```

#### Linux command: 
```
dig PTR <reverseip>.in-addr.arpa
```

### Displaying all the available records for a specific domain: 

#### Windows Command: 
```
nslookup -type=any <domain name>
```
**Note:** On Windows/Azure, use an external DNS server to avoid large-scope blocks: `nslookup -type=any microsoft.com 4.2.2.2`

#### Linux Command: 
```
dig <domain name> ANY @<external dns server IP>
```

### NSLOOKUP Using Verbose: 

#### Windows Command: 
```
nslookup -debug <domain name or fqdn>
```

#### Linux command: 
By default `dig` is verbose — no additional flags needed.

### TXT Records: 

#### Windows Command: 
```
nslookup -type=txt <domain/hostname>
```

#### Linux Command: 
```
dig TXT <domain/hostname>
```

## Contributors:
- Luis Gonzalez Briones
