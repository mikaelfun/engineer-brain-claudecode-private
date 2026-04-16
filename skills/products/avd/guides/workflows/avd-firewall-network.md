# AVD 防火墙与网络 — 排查工作流

**来源草稿**: ado-wiki-a-provisioned-with-warnings-policy-firewall.md, ado-wiki-a-use-network-trace-to-determine-disconnection.md, ado-wiki-a-wan-flaps-moby-dc-mapping.md, ado-wiki-azure-firewall-health-availability.md, ado-wiki-b-outbound-connection-issue.md, ado-wiki-b-wan-flaps-server-side-disconnects.md, ado-wiki-b-whitelist-ips.md
**Kusto 引用**: url-access-check.md
**场景数**: 28
**生成日期**: 2026-04-07

---

## Scenario 1: Provisioned with warnings - Policy caused, Firewall caused
> 来源: ado-wiki-a-provisioned-with-warnings-policy-firewall.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Check if the Customer is allowing the required endpoints in their firewall.
For LP installation you need `*.download.microsoft.com` and `*.software-download.microsoft.com`.
2. If the customer is using Palo Alto, this Firewall solution also has the possibility to block the traffic with App Categories. So even though the endpoints based on FQDN and ports are opened, the firewall might block the traffic message as app detected.
In this case, they need to check if the firewall policy in Palo Alto also has App Category configured. This may cause issues with the provisioning itself as well — not only Language and Region, but also: activation, WNS — so it's worth checking if Firewall is OK but the customer is still getting errors.
3. Check for the ASR policy blocking process creation from psexec and WMI.
4. Check for Application Control Policy/WDAC.
5. **Keyboard language list is not applied and keyboard language bar is not visible:**
Customer is reporting that even though the custom LP is installed and Windows Display language is correctly applied, the language list and thus the keyboard language bar is not available.
This is because this setting must be configured in user context.
The customer can use the following script in user context to configure this, and do a logoff/logon or reboot:
```powershell
   $languageCode = "en-GB"  # language code set based on the prov policy configuration
   $LanguageList = New-WinUserLanguageList -Language $languageCode  # setting the language list based on the prov policy code
   $LanguageList.Add("en-US")  # adding the default US as well
   Set-WinUserLanguageList $LanguageList -force
```
6. **Provisioned with warnings — WinRM Policy conflict:**
Another policy (GPO/SettingsCatalog or Custom OMA) that can break the LP installation is:
**Allow remote server management through WinRM**
If this policy is set to **Disabled**, it will cause a conflict in DSC installation and the LP installation to fail.
Kusto and ASC will show the following message:
```
   Cannot complete the request due to a conflicting Group Policy setting. Modify
   the GP setting "Allow remote server management through WinRM" to either "Not Configured" or "Enabled"
```
Make sure you **DO NOT** configure this policy at all (set to Not Configured or Enabled).

## Scenario 2: Summary
> 来源: ado-wiki-a-use-network-trace-to-determine-disconnection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - User experiences frequent disconnections on Cloud PC, every 90 minutes or so.
   - The user is able to sign into the Cloud PC immediately after the disconnection, and pick up where they left off, so there is no logoff or restart happening during the issue.
   - Due to the frequency of the issue, a circular trace is required to catch the culprit.

## Scenario 3: Collecting network capture
> 来源: ado-wiki-a-use-network-trace-to-determine-disconnection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Collect the netsh trace simultaneously from both client and Cloud PC
Starting circular trace with additional logging:
1. Create temp folder (if one does not exist): `mkdir c:\temp`
1. Start trace: `netsh trace start capture=yes level=5 tracefile=c:\temp\%computername%_nettrace.etl maxsize=2048 scenario=netconnection filemode=circular overwrite=yes persistent=yes`
1. Continue running the circular trace until the issue is reproduced. Ensure that the customer collects the exact timestamp of the disconnection.
1. End netsh trace: `netsh trace stop`
1. Run: `Tasklist /svc /fi "imagename eq svchost.exe"  > C:\temp\tasklistsvchost.txt`
1. Provide these details for the repro:
a. Private IP:
b. Public IP:
c. Timestamp:
d. Name of affected Cloud PC:

## Scenario 4: Using Kusto to find the gateway used for the connection
> 来源: ado-wiki-a-use-network-trace-to-determine-disconnection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Using the timestamp and information of the affected Cloud PC and timestamp, identify the activity ID of the connection that experienced the issue.
```
DiagActivity  
| where TIMESTAMP >= ago(3d)
| where SessionHostName contains "CPC-facun-02CF1" // CPC name
| where Type == "Connection"
| join kind=leftouter DiagError on ActivityId
| project TIMESTAMP, ActivityId, StartDate, Duration = datetime_diff('minute', EndDate, StartDate), Type, Outcome, UserName, UserObjectId, AadDeviceId, SessionHostJoinType, SessionHostName, GatewayCluster, GatewayRegion , ClientOS, ClientType, ClientVersion, ClientIPAddress, AgentOSVersion, AgentSxsStackVersion, AgentVersion, SessionHostAzureVmLocation, SessionHostIPAddress, UdpType, UdpUse, ErrorInternal, ErrorCodeSymbolic, ErrorSource, ErrorOperation, ErrorMessage
```
Once you have the activityID, check AVD Orchestration logs to identify which Gateway was used during the connection.
```
RDInfraTrace
| where ActivityId == "065e8921-49ec-4c1b-8ef2-025efbd90000" // Activity ID
| where Msg contains "Use client address"
| project TIMESTAMP, Msg
```
The result would look something like this:
```
Msg
Use client address 'rdgateway-host-green-c104-eus-r1.wvd.microsoft.com'
```
Run: `nslookup rdgateway-host-green-c104-eus-r1.wvd.microsoft.com`, to find the target address the client and Cloud PC communicate to when talking to the AVD gateway. In this example, the **destination IP address** is **20.232.123.155.**

## Scenario 5: Identify the name associated with the PID
> 来源: ado-wiki-a-use-network-trace-to-determine-disconnection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Cross-reference the PID from the network trace with the taskinfo.txt and tasklistsvchost.txt output.
If the PID is associated with svchost.exe, check `Tasklist /svc /fi "imagename eq svchost.exe"` output to determine the specific service.

## Scenario 6: Resolution
> 来源: ado-wiki-a-use-network-trace-to-determine-disconnection.md | 适用: \u901a\u7528 \u2705

### 排查步骤
In this example, the issue was resolved by modifying session timeout connectivity Terminal Services policies.
In other scenarios, this might be helpful if we can confirm and identify other services, including third-party, initiating the disconnection from the Cloud PC.

## Scenario 7: Moby / WAN Datacenter Mapping
> 来源: ado-wiki-a-wan-flaps-moby-dc-mapping.md | 适用: Mooncake \u2705

### 排查步骤
Datacenter | City | Country | Continent | Cloud
|--|--|--|--|--|
AKL | Auckland | New Zealand | Australia Pacific | public
AM | Schiphol-Rijk | Netherlands | Europe | public
AMB | Amsterdam | Netherlands | Europe | public
AMS | Amsterdam | Netherlands | Europe | public
ASH | Ashburn VA | United States | North America | public
ATA | Atlanta GA | United States | North America | public
ATH | Koropi | Greece | Europe | public
ATL | Atlanta GA | United States | North America | public
AUH | Abu Dhabi | United Arab Emirates | Middle East | public
BCN | Barcelona | Spain | Europe | public
BER | Berlin | Germany | Europe | public
BIO | Sopela | Spain | Europe | public
BJ | Beijing | China | Asia | public
BJS | Beijing | China | Asia | mooncake
BKK | Khlong Nueng | Thailand | Asia | public
BL | Sterling VA | United States | North America | public
BLU | Bristow VA | United States | North America | public
BN | Boydton VA | United States | North America | public
BNA | Nashville TN | United States | North America | public
BNE | Brisbane City | Australia | Australia Pacific | public
BOG | Bogota D.C. | Colombia | Latin America | public
BOM | Mumbai | India | Asia | public
BOS | Boston MA | United States | North America | public
BRU | Zaventem | Belgium | Europe | public
BUD | Budapest | Hungary | Europe | public
BUE | Boulogne Sur Mer | Argentina | Latin America | public
BUH | Bucharest | Romania | Europe | public
BY | Santa Clara CA | United States | North America | public
CAI | Desert of Giza Governorate | Egypt | Africa | public
CBR | Fyshwick | Australia | Australia Pacific | public
CH | Northlake IL | United States | North America | public
CHG | Chicage IL | United States | North America | public
CHI | Chicago IL | United States | North America | public
CLE | Cleveland OH | United States | North America | public
CLT | Charlotte NC | United States | North America | public
CO | Quincy WA | United States | North America | public
CPH | Ballerup | Denmark | Europe | public
CPQ | Campinas | Brazil | Latin America | public
CPT | Cape Town | South Africa | Africa | public
CVG | Cincinnati OH | United States | North America | public
CWL | Coedkernew | United Kingdom | Europe | public
CYS | Cheyenne WY | United States | North America | public
DAL | Dallas TX | United States | North America | public
DB | Dublin | Ireland | Europe | public
DBA | South Dublin | Ireland | Europe | public
DBB | South Dublin | Ireland | Europe | public
DEL | New Delhi | India | Asia | public
DEN | Denver CO | United States | North America | public
DFW | Dallas TX | United States | North America | public
DM | West Des Moines IA | United States | North America | public
DNA | Denver CO | United States | North America | public
DOH | Doha | Qatar | Middle East | public
DSM | Des Moines IA | United States | North America | public
DTT | Southfield MI | United States | North America | public
DUB | Dublin | Ireland | Europe | public
DUS | Dsseldorf | Germany | Europe | public
DXB | Dubai | United Arab Emirates | Middle East | public
EWR | Newark NJ | United States | North America | public
FLL | Fort Lauderdale FL | United States | North America | public
FOR | Maracana | Brazil | Latin America | public
FRA | Frankfurt | Germany | Europe | public
GOT | Gothenburg | Sweden | Europe | public
GRU | Barueri | Brazil | Latin America | public
GVA | Gland | Switzerland | Europe | public
GVX | Gvle | Sweden | Europe | public
HAM | Hamburg | Germany | Europe | public
HEL | Helsinki | Finland | Europe | public
HK | Tseung Kwan | Hong Kong SAR | Asia | public
HKB | Tsuen Wan District | Hong Kong SAR | Asia | public
HKG | Tseung Kwan | Hong Kong SAR | Asia | public
HNL | Honolulu HI | United States | North America | public
HOU | Houston TX | United States | North America | public
HYD | Serilingampalli | India | Asia | public
IST | Umraniye | Turkey | Middle East | public
JAX | Jacjsonville FL | United States | North America | public
JGA | Jamnagar Taluka | India | Asia | public
JHB | Bukit Batu | Malaysia | Asia | public
JKT | Jakarta | Indonesia | Asia | public
JNB | Johannesburg | South Africa | Africa | public
KUL | Kuala Lumpur | Malaysia | Asia | public
LAD | Kifica | Angola | Africa | public
LAS | Las Vegas | United States | North America | public
LAX | Los Angeles | United States | North America | public
LIS | Sacavm | Portugal | Europe | public
LON | London | United Kingdom | Europe | public
LOS | Lagos | Nigeria | Africa | public
LTS | Docklands | United Kingdom | Europe | public
MAA | Ambattur | India | Asia | public
MAD | Madrid | Spain | Europe | public
MAN | Manchester Science Park | United Kingdom | Europe | public
MEL | Melbourne | Australia | Australia Pacific | public
MEM | Memphis TN | United States | North America | public
MEX | La Caada | Mexico | Latin America | public
MEX | Quertaro | Mexico | Latin America | public
MIA | Miami FL | United States | North America | public
MIL | Milan | Italy | Europe | public
MMA | Staffanstorp | Sweden | Europe | public
MNL | Pasig | Philippines | Asia | public
MRS | Marseille | France | Europe | public
MSP | Minneapolis MI | United States | North America | public
MUC | Munich | Germany | Europe | public
MWH | Quincy WA | United States | North America | public
NAG | Mouda | India | Asia | public
NBO | Nairobi | Kenya | Africa | public
NTG | Chongchuan District | China | Asia | mooncake
NYC | Chelsea NY | United States | North America | public
ORF | Virginia Beach VA | United States | North America | public
OSA | Osaka City Chuo Ward | Japan | Asia | public
OSL | Oslo | Norway | Europe | public
PAO | Palo Alto CA | United States | North America | public
PAR | Paris | France | Europe | public
PDX | Hillsboro OR | United States | North America | public
PER | Perth | Australia | Australia Pacific | public
PHL | Philadelphia PA | United States | North America | public
PHX | Goodyear AZ | United States | North America | public
PNQ | Maharashtra | India | Asia | public
PR | Humacao | Puerto Rico | Latin America | public
PRA | St.-Denis | France | Europe | public
PRG | Prague | Czech Republic | Europe | public
PUS | Busan | Korea | Asia | public
RBA | Sal El Jadida | Morocco | Africa | public
RIO | Rio de Janeiro | Brazil | Latin America | public
ROM | Rome | Italy | Europe | public
SAN | San Diego CA | United States | North America | public
SAO | So Paulo | Brazil | Latin America | public
SCL | Colina | Chile | Latin America | public
SEA | Redmond WA | United States | North America | public
SEL | Seoul | Korea | Asia | public
SG | Singapore | Singapore | Asia | public
SGE | Singapore | Singapore | Asia | public
SGN | Phng 12 | Vietnam | Asia | public
SHA | Shanghai | China | Asia | mooncake
SIN | Singapore | Singapore | Asia | public
SJC | San Jose CA | United States | North America | public
SLA | Seoul | Korea | Asia | public
SN | San Antonio TX | United States | North America | public
SOF | Rayon Vazrazhdane | Bulgaria | Europe | public
STB | Seattle WA | United States | North America | public
STO | Stockholm | Sweden | Europe | public
SVG | Stavanger | Norway | Europe | public
SXL | County Mayo | Ireland | Europe | public
SYD | New South Wales | Australia | Australia Pacific | public
TEB | Secaucus NJ | United States | North America | public
TLH | Tallahassee FL | United States | North America | public
TLV | Modiin-Maccabim-Reut | Israel | Middle East | public
TPA | Tampa FL | United States | North America | public
TPE | Taipei | Taiwan | Asia | public
TYA | Chiyoda Ward | Japan | Asia | public
TYB | Chuo Ward | Japan | Asia | public
TYO | Tokyo | Japan | Asia | public
VIE | Vienna | Austria | Europe | public
WAW | Warsaw | Poland | Europe | public
YMQ | Montreal | Canada | North America | public
YQB | Qubec | Canada | North America | public
YTO | Toronto | Canada | North America | public
YVR | Vancouver | Canada | North America | public
ZAG | Zagreb | Croatia | Europe | public
ZQZ | Huailai | China | Asia | mooncake
ZRH | Zurich | Switzerland | Europe | public

## Scenario 8: Azure Firewall Health and Availability Check
> 来源: ado-wiki-azure-firewall-health-availability.md | 适用: \u901a\u7528 \u2705

### 排查步骤
> Note: This content was marked as "in development / not ready for consumption" in the source wiki. Use with caution.

## Scenario 9: Firewall Health and Availability
> 来源: ado-wiki-azure-firewall-health-availability.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. In ASC go to AzFw and get resource ID and location
2. Go to https://portal.microsoftgeneva.com/dashboard/AzureFirewallShoebox
3. Click Widget Settings
4. Enter resource ID of AzFW
5. Click Dataplane Metric > enter time frame > rest of options should automatically filter based on resource ID entered in step 3. Select each one and select.
6. Look for any anomalies: Firewall health, number of healthy instances, SNAT port utilization, datapath availability, etc.

## Scenario 10: Upgrade Logs
> 来源: ado-wiki-azure-firewall-health-availability.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Check upgrade logs via Geneva dashboard for any recent upgrades that may have caused issues.

## Scenario 11: Traffic Flows
> 来源: ado-wiki-azure-firewall-health-availability.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Go to https://portal.microsoftgeneva.com/s/301A275F
2. Enter time frame to search > Under Tenant enter resource ID of AzFW > Click Search

## Scenario 12: Reference
> 来源: ado-wiki-azure-firewall-health-availability.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - ANP AzFw Wiki: https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/24331/Azure-Firewall

## Scenario 13: Outbound Connection Issue for Cloud PC
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Covers scenarios where Cloud PC cannot access internet, reach specific ports, websites, or IP addresses.

## Scenario 14: Root Cause Categories
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Customer's Virtual Network environment (NSG, Routes, DNS)
2. Customer's proxy/VPN/Windows Firewall/3rd party anti-virus inside guest OS
3. Server end's restrictions
4. Azure Host Networking service issue
---

## Scenario 15: Getting VM Network Interface
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Get Cloud PC VM resource ID
2. Call Geneva Action [Get NRP Subscription Details](https://portal.microsoftgeneva.com/92656165) with Subscription ID and NRP region
3. Use VM resource ID as filter to find `allocatedNetworkInterfaces`
4. Network interface resource ID enables NSG/routing diagnostics

## Scenario 16: Network Security Group (NSG)
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use Geneva Action [Get Nic Effective Security Groups](https://portal.microsoftgeneva.com/E221C040) to get effective NSG for the specific network interface. Review rules for any blocking inbound/outbound connections.
Reference: [NSG Overview](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)

## Scenario 17: Routes
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Use Geneva Action [Get Nic Effective Routes](https://portal.microsoftgeneva.com/9ABF9CF0) to get effective routes. Check for traffic directed to Azure Firewall/NVA/null, or forced tunneling via ExpressRoute/S2S VPN.
Reference: [UDR Overview](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-udr-overview#next-hop-types-across-azure-tools)

## Scenario 18: DNS
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - **AADJ CloudPC on MHN**: DNS error indicates W365 Networking backend or Azure DNS issue. Engage SaaF team.
   - **CloudPC on customer VNet**: Follow steps:
1. Get Subnet Resource ID (from customer or SaaF CPC reporting kusto)
2. Use [Virtual SAW](https://tdc.azure.net/Welcome) to [Get NRP Subscription Details](https://portal.microsoftgeneva.com/11A0DA80)
3. Check `dhcpOptions` / `dnsServers`:
   - `168.63.129.16` = Azure DNS (may still have DNS proxy via GPO)
   - Custom IPs = customer DNS servers (Azure VM, on-prem via VPN/ER)
4. Use ASC Diagnostic - Test Traffic to test connectivity to DNS server IP:53 UDP

## Scenario 19: Diagnostic - Test Traffic (ASC)
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Find VM in ASC > Diagnostic tab
2. Under Test Traffic, input destination IP and port
3. Result shows VFP rule simulation (no real traffic generated)
4. Download Process-Tuples for detailed VFP analysis
5. Reference: [Process-Tuples in VFP](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/423267/Virtual-Filtering-Platform)
---

## Scenario 20: 2. Proxy/VPN/Windows Firewall/3rd Party Software
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Check these items in PowerShell on the Cloud PC:
1. **DNS Check**: `nslookup <url> <DNS_server_IP>`
2. **TCP Connection**: `Test-NetConnection -ComputerName <URL> -InformationLevel Detailed -Port <Port>`
3. **Web Request**: `Invoke-WebRequest -Uri <URL>`
4. **Route Check**: `route print` (verify no VPN routes redirecting all traffic)
5. **Proxy Check**: `netsh winhttp show proxy` (note: proxy may be at software/browser layer only)
If all checks pass, suggest customer:
   - Run long tcp-ping using [tcpping](https://www.elifulkerson.com/projects/tcping.php) or [psping](https://learn.microsoft.com/en-us/sysinternals/downloads/psping)
   - Capture network trace per [guide](https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/770584/Networking?anchor=network-traces)
   - Use [List-Unified-Flow](https://jarvis-west.dc.ad.msft.net/E1B294F4) Geneva Action to check if outgoing packet leaves guest OS
---

## Scenario 21: Possibility 1: SNAT Port Range Blocking
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Azure VMs without public IP use Default Outbound Access with SNAT starting from port range 1024-1087. Some websites block this range.
   - **Diagnosis**: Exclude VNet and guest OS issues first, then use [List-NAT-Range](https://jarvis-west.dc.ad.msft.net/3F8F408C) Geneva Action to confirm allocated port range
   - **Workaround**: Configure proxy in guest OS, or create Azure NAT Gateway on same subnet
   - **Long-term**: Request website owner to unblock ports 1024-1087 (valid per RFC 6056)
   - Reference ICMs: 308307556, 275435045

## Scenario 22: Possibility 2: IP Range Blocking
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Websites block specific Azure public IP ranges. Test access from different networks (Azure VM, Corpnet, Home) to confirm pattern.
---

## Scenario 23: 4. Azure Host Networking Service Issue
> 来源: ado-wiki-b-outbound-connection-issue.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Least likely scenario - packet dropped in Azure backbone network.
   - Use [NetVMA](https://netvma.azure.net/) to check uplink status and network path (search by VMID/Container ID)
   - Kusto query to check WAN Edge router traffic:
```kql
cluster('netcapplan').database('NetCapPlan').RealTimeIpfixWithMetadata
| where TimeStamp >= ago(1d)
| where SrcIpAddress == "<src_ip>" or DstIpAddress == "<dst_ip>"
| project TimeStamp, RouterName, IngressIfName, EgressIfName, SrcIpAddress, DstIpAddress, DstTransportPort, SrcAs, DstAs, NextHop
| order by TimeStamp desc
| order by RouterName
```
`[来源: ado-wiki-b-outbound-connection-issue.md]`

## Scenario 24: Example Error Messages
> 来源: ado-wiki-b-wan-flaps-server-side-disconnects.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Error Signature | Path Segment | Description | Probable Cause |
|--|--|--|--|
| RDStack:UnexpectedNetworkDisconnect | VM -> RD Gateway | The VM lost connectivity suddenly | TCP Reset |
| RDStack:ReverseConnectResponseTimeout | VM -> RD Gateway | The VM hit a retransmit timeout | Data flow stopped |
| RDGateway:ConnectionFailedServerDisconnect | VM -> RD Gateway | The VM connection the AVD gateway to disconnected suddenly | TCP Reset most likely, but not it's only reason |
| RDGateway:ConnectionFailedReverseUngracefulClose | VM -> RD Gateway | The AVD gateway tried to close its connection to VM and discovered the connection was lost already | Anything, the gateway is just noticing the connection was down |
| ConnectionFailedServerDisconnect | VM -> RD Gateway | The VM lost connectivity suddenly | TCP Reset most likely, but not it's only reason |
| Client:ConnectionBrokenMissedHeartbeatThresholdExceeded | Client/User -> RD Gateway or VM -> RD Gateway | The AVD client detected that no heartbeats where delivered for 16s from the VM. Can happen on either segment, most of the time correlated errors help understand the specific one that hit it. | Data flow stopped |

## Scenario 25: Action Plan
> 来源: ado-wiki-b-wan-flaps-server-side-disconnects.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. AVD Engineer will collect 2-sided network trace when disconnect occurs and get the activity id of connection.
1. AVD Engineer will get the gateway cluster in diagactivity table and provide gateway ip to anp engineer.
1. ANP engineer will filter on gateway ip in network trace - most likely will see the retransmits, dupes, out-of-order packets, etc.. and document timestamp of last packet vm sent to avd gw but didnt get ack.
1. AVD engineer will follow https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464440/Basic-Queries?anchor=timestamp-of-last-packets and get timestamp of reverse last incoming packet which is timestamp of last packet that was received by the gateway from the stack.
1. If the timestamp of the last packet received by gateway from stack happened BEFORE timestamp of last packet vm sent to gw but didnt get ack → the packet never got to gw (which is the case for every one of these we have seen).
1. If packet didn't get to AVD GW then need to look at what devices traffic goes through like NSG. AVD engineer can run queries from https://www.osgwiki.com/wiki/Cowbell/RDPWANFlaps to check for wan flaps. CloudNet fixed convergence bug so we are not seeing these as much as we used to. However ANP can use information from query results about the gateway region, VM region and the timestamp info and put in EagleEye https://eagleeye.trafficmanager.net/view/services/EagleEye/pages/Home to find correlated CloudNet events and escalate to the product team.

## Scenario 26: Case Example
> 来源: ado-wiki-b-wan-flaps-server-side-disconnects.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Take client IP and filter in client trace
   - Look at when traffic ended
   - When connection explicitly terminates they either terminate with FIN or RST
   - FIN is graceful close (typically see FIN going in both directions)
   - RST is generally unidirectional (someone got sick of trying so it sends a reset and closes the connection)
   - In this scenario the client initiated a termination gracefully and gw acknowledged
   - The timestamp of disconnect in client nettrace should match Kusto

## Scenario 27: Whitelist AVD IP Addresses
> 来源: ado-wiki-b-whitelist-ips.md | 适用: \u901a\u7528 \u2705

### 排查步骤
There are a few ways of leveraging the list of Azure Virtual Desktop IP datacenter ranges:
1. **Download the JSON** from the download site: [Download Azure IP Ranges and Service Tags - Public Cloud](https://www.microsoft.com/en-us/download/details.aspx?id=56519)
   - Challenge: The list is updated weekly and Virtual Desktop addresses can change.
1. **Use Azure native services with Service Tags** — always current with the list of underlying IP addresses. [Azure service tags overview](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview)
   - Service tags can be used in Azure Firewall, for example.
1. **Recommended for 3rd party products (e.g., ZScaler): use the Service Tag Discovery API** [Azure service tags overview - API](https://docs.microsoft.com/en-us/azure/virtual-network/service-tags-overview#use-the-service-tag-discovery-api-public-preview)
   - REST API and command line tools available for retrieving IP address ranges
   - Can automate updates via 3rd party product automation
   - Ideally 3rd parties will integrate with the Azure API
**Note**: In the JSON list of IP Addresses, the section to use is: `"WindowsVirtualDesktop"`

## Scenario 28: Retrieve AVD IP Addresses via REST API
> 来源: ado-wiki-b-whitelist-ips.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  https://management.azure.com/subscriptions/<subscription-id>/providers/Microsoft.Network/locations/eastus/serviceTags?api-version=2021-02-01 \
  | jq '[.values[] | select(.name == "WindowsVirtualDesktop") .properties .addressPrefixes]'
```

---

## 关联 Kusto 查询参考

```kql
cluster('https://rdskmc.chinaeast2.kusto.chinacloudapi.cn').database('WVD').ShoeboxAgentHealth
| where PreciseTimeStamp > ago(1d)
| where resourceId contains "{SessionHostName}"
| extend x = parse_json(properties)
| extend HostName = tostring(x.SessionHostName)
| where HostName contains "{SessionHostName}"
| extend HealthCheckResult = tostring(x.SessionHostHealthCheckResult)
| extend UrlsAccessibleCheck = parse_json(HealthCheckResult)
| where UrlsAccessibleCheck.ErrorCode != "0"
| project PreciseTimeStamp, HostName, HealthCheckResult
| order by PreciseTimeStamp desc
```
`[来源: url-access-check.md]`
